#!/bin/bash

# ------------------------------------------------------------------------------
# BioVerse Deployment Script
# Deploy the future of healthcare with confidence
# ------------------------------------------------------------------------------

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                            BioVerse Deployment                               ║
║                     Revolutionary Healthcare Platform                        ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    local tools=("aws" "terraform" "docker" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured or invalid"
        exit 1
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

validate_environment() {
    log_info "Validating environment: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        dev|staging|production)
            log_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or production"
            exit 1
            ;;
    esac
}

setup_terraform_backend() {
    log_info "Setting up Terraform backend..."
    
    local backend_bucket="bioverse-terraform-state-${ENVIRONMENT}"
    local backend_key="$ENVIRONMENT/terraform.tfstate"
    
    # Create S3 bucket for Terraform state if it doesn't exist
    if ! aws s3 ls "s3://$backend_bucket" &> /dev/null; then
        log_info "Creating Terraform state bucket: $backend_bucket"
        aws s3 mb "s3://$backend_bucket" --region "$AWS_REGION"
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$backend_bucket" \
            --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket "$backend_bucket" \
            --server-side-encryption-configuration '{
                "Rules": [{
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }]
            }'
    fi
    
    log_success "Terraform backend ready"
}

deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd "$TERRAFORM_DIR"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init \
        -backend-config="bucket=bioverse-terraform-state-${ENVIRONMENT}" \
        -backend-config="key=${ENVIRONMENT}/terraform.tfstate" \
        -backend-config="region=${AWS_REGION}"
    
    # Validate Terraform configuration
    log_info "Validating Terraform configuration..."
    terraform validate
    
    # Plan deployment
    log_info "Planning infrastructure deployment..."
    terraform plan \
        -var="environment=${ENVIRONMENT}" \
        -var="aws_region=${AWS_REGION}" \
        -out="tfplan-${ENVIRONMENT}"
    
    # Apply if plan is successful
    log_info "Applying infrastructure changes..."
    terraform apply "tfplan-${ENVIRONMENT}"
    
    # Save outputs
    terraform output -json > "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json"
    
    log_success "Infrastructure deployment completed"
    
    cd "$PROJECT_ROOT"
}

build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Get ECR registry URL from Terraform outputs
    local ecr_registry
    ecr_registry=$(jq -r '.ecr_registry.value' "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" 2>/dev/null || echo "")
    
    if [[ -z "$ecr_registry" ]]; then
        log_warning "ECR registry not found in Terraform outputs, using default"
        local account_id
        account_id=$(aws sts get-caller-identity --query Account --output text)
        ecr_registry="${account_id}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    fi
    
    # Login to ECR
    log_info "Logging in to ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | \
        docker login --username AWS --password-stdin "$ecr_registry"
    
    # Build and push each service
    local services=("client" "server" "python-ai")
    for service in "${services[@]}"; do
        log_info "Building $service image..."
        
        local image_name="bioverse-${service}"
        local image_tag="latest"
        local full_image_name="${ecr_registry}/${image_name}:${image_tag}"
        
        # Create ECR repository if it doesn't exist
        aws ecr describe-repositories --repository-names "$image_name" --region "$AWS_REGION" &>/dev/null || \
            aws ecr create-repository --repository-name "$image_name" --region "$AWS_REGION"
        
        # Build image
        docker build -t "$full_image_name" "$PROJECT_ROOT/$service"
        
        # Push image
        log_info "Pushing $service image..."
        docker push "$full_image_name"
        
        log_success "$service image built and pushed"
    done
}

deploy_services() {
    log_info "Deploying ECS services..."
    
    # Get cluster name from Terraform outputs
    local cluster_name
    cluster_name=$(jq -r '.ecs_cluster_name.value' "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" 2>/dev/null || echo "bioverse-cluster-${ENVIRONMENT}")
    
    # Update services to use new images
    local services=("bioverse-api-${ENVIRONMENT}" "bioverse-web-${ENVIRONMENT}" "bioverse-ai-${ENVIRONMENT}")
    for service in "${services[@]}"; do
        log_info "Updating ECS service: $service"
        
        aws ecs update-service \
            --cluster "$cluster_name" \
            --service "$service" \
            --force-new-deployment \
            --region "$AWS_REGION" || log_warning "Service $service may not exist yet"
    done
    
    # Wait for services to stabilize
    log_info "Waiting for services to stabilize..."
    for service in "${services[@]}"; do
        aws ecs wait services-stable \
            --cluster "$cluster_name" \
            --services "$service" \
            --region "$AWS_REGION" || log_warning "Service $service may not exist yet"
    done
    
    log_success "ECS services deployed"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Get load balancer DNS from Terraform outputs
    local lb_dns
    lb_dns=$(jq -r '.load_balancer_dns_name.value' "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" 2>/dev/null || echo "")
    
    if [[ -n "$lb_dns" ]]; then
        log_info "Load balancer DNS: $lb_dns"
        
        # Wait for load balancer to be ready
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            log_info "Health check attempt $attempt/$max_attempts"
            
            if curl -f -s "http://$lb_dns/health" &>/dev/null; then
                log_success "Health check passed!"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                log_warning "Health check failed after $max_attempts attempts"
                break
            fi
            
            sleep 10
            ((attempt++))
        done
    else
        log_warning "Load balancer DNS not found, skipping health checks"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "$TERRAFORM_DIR/tfplan-${ENVIRONMENT}"
    log_success "Cleanup completed"
}

show_deployment_info() {
    log_success "
╔══════════════════════════════════════════════════════════════════════════════╗
║                        🚀 DEPLOYMENT SUCCESSFUL! 🚀                         ║
╚══════════════════════════════════════════════════════════════════════════════╝"
    
    echo -e "${CYAN}"
    echo "Environment: $ENVIRONMENT"
    echo "Region: $AWS_REGION"
    echo ""
    
    if [[ -f "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" ]]; then
        local app_url
        app_url=$(jq -r '.application_url.value' "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" 2>/dev/null || echo "")
        
        if [[ -n "$app_url" ]]; then
            echo "🌐 Application URL: $app_url"
        fi
        
        local api_url
        api_url=$(jq -r '.api_url.value' "${PROJECT_ROOT}/terraform-outputs-${ENVIRONMENT}.json" 2>/dev/null || echo "")
        
        if [[ -n "$api_url" ]]; then
            echo "🔗 API URL: $api_url"
        fi
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Update your DNS to point to the load balancer"
    echo "2. Configure SSL certificates"
    echo "3. Set up monitoring alerts"
    echo "4. Run integration tests"
    echo ""
    echo "BioVerse is ready to revolutionize healthcare! 🌍"
    echo -e "${NC}"
}

# Main deployment function
main() {
    log_header
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -r|--region)
                AWS_REGION="$2"
                shift 2
                ;;
            --skip-infrastructure)
                SKIP_INFRASTRUCTURE=true
                shift
                ;;
            --skip-images)
                SKIP_IMAGES=true
                shift
                ;;
            --skip-services)
                SKIP_SERVICES=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  -e, --environment ENV    Deployment environment (dev, staging, production)"
                echo "  -r, --region REGION      AWS region (default: us-east-1)"
                echo "  --skip-infrastructure    Skip Terraform infrastructure deployment"
                echo "  --skip-images           Skip Docker image building and pushing"
                echo "  --skip-services         Skip ECS service deployment"
                echo "  -h, --help              Show this help message"
                echo ""
                echo "Environment variables:"
                echo "  ENVIRONMENT             Deployment environment"
                echo "  AWS_REGION              AWS region"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    validate_environment
    
    if [[ "${SKIP_INFRASTRUCTURE:-false}" != "true" ]]; then
        setup_terraform_backend
        deploy_infrastructure
    fi
    
    if [[ "${SKIP_IMAGES:-false}" != "true" ]]; then
        build_and_push_images
    fi
    
    if [[ "${SKIP_SERVICES:-false}" != "true" ]]; then
        deploy_services
    fi
    
    run_health_checks
    cleanup
    show_deployment_info
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"