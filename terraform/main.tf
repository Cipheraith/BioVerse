# ------------------------------------------------------------------------------
# BioVerse Production Infrastructure
# The future of healthcare starts here - Built by a champion who never gives up
# ------------------------------------------------------------------------------

terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "bioverse-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ------------------------------------------------------------------------------
# Provider Configuration
# ------------------------------------------------------------------------------

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "BioVerse"
      Environment = var.environment
      Owner       = "BioVerse Team"
      ManagedBy   = "Terraform"
      Vision      = "Revolutionary Healthcare Platform"
    }
  }
}

# ------------------------------------------------------------------------------
# Data Sources
# ------------------------------------------------------------------------------

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ------------------------------------------------------------------------------
# VPC and Networking - Enterprise Grade
# ------------------------------------------------------------------------------

resource "aws_vpc" "bioverse_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "bioverse-vpc-${var.environment}"
  }
}

resource "aws_internet_gateway" "bioverse_igw" {
  vpc_id = aws_vpc.bioverse_vpc.id

  tags = {
    Name = "bioverse-igw-${var.environment}"
  }
}

# Public Subnets for Load Balancers
resource "aws_subnet" "public_subnets" {
  count             = 3
  vpc_id            = aws_vpc.bioverse_vpc.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "bioverse-public-subnet-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets for Applications
resource "aws_subnet" "private_subnets" {
  count             = 3
  vpc_id            = aws_vpc.bioverse_vpc.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "bioverse-private-subnet-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# Database Subnets
resource "aws_subnet" "database_subnets" {
  count             = 3
  vpc_id            = aws_vpc.bioverse_vpc.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 20)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "bioverse-database-subnet-${count.index + 1}-${var.environment}"
    Type = "Database"
  }
}

# NAT Gateways for Private Subnet Internet Access
resource "aws_eip" "nat_eips" {
  count  = 3
  domain = "vpc"

  tags = {
    Name = "bioverse-nat-eip-${count.index + 1}-${var.environment}"
  }
}

resource "aws_nat_gateway" "nat_gateways" {
  count         = 3
  allocation_id = aws_eip.nat_eips[count.index].id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = "bioverse-nat-gateway-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.bioverse_igw]
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.bioverse_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.bioverse_igw.id
  }

  tags = {
    Name = "bioverse-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private_rts" {
  count  = 3
  vpc_id = aws_vpc.bioverse_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateways[count.index].id
  }

  tags = {
    Name = "bioverse-private-rt-${count.index + 1}-${var.environment}"
  }
}

resource "aws_route_table_association" "public_rta" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_rta" {
  count          = length(aws_subnet.private_subnets)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rts[count.index].id
}

# ------------------------------------------------------------------------------
# Security Groups - Military Grade Security
# ------------------------------------------------------------------------------

resource "aws_security_group" "alb_sg" {
  name_prefix = "bioverse-alb-sg-"
  vpc_id      = aws_vpc.bioverse_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "bioverse-alb-sg-${var.environment}"
  }
}

resource "aws_security_group" "ecs_sg" {
  name_prefix = "bioverse-ecs-sg-"
  vpc_id      = aws_vpc.bioverse_vpc.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "API Server"
  }

  ingress {
    from_port       = 5173
    to_port         = 5173
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Web Client"
  }

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "AI Service"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "bioverse-ecs-sg-${var.environment}"
  }
}

resource "aws_security_group" "rds_sg" {
  name_prefix = "bioverse-rds-sg-"
  vpc_id      = aws_vpc.bioverse_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
    description     = "PostgreSQL"
  }

  tags = {
    Name = "bioverse-rds-sg-${var.environment}"
  }
}

resource "aws_security_group" "redis_sg" {
  name_prefix = "bioverse-redis-sg-"
  vpc_id      = aws_vpc.bioverse_vpc.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
    description     = "Redis"
  }

  tags = {
    Name = "bioverse-redis-sg-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Application Load Balancer - High Performance
# ------------------------------------------------------------------------------

resource "aws_lb" "bioverse_alb" {
  name               = "bioverse-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = var.environment == "production" ? true : false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  access_logs {
    bucket  = aws_s3_bucket.bioverse_logs_bucket.bucket
    prefix  = "alb-logs"
    enabled = true
  }

  tags = {
    Name = "bioverse-alb-${var.environment}"
  }

  depends_on = [aws_s3_bucket_policy.alb_logs_policy]
}

# SSL Certificate
resource "aws_acm_certificate" "bioverse_cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.domain_name}",
    "api.${var.domain_name}",
    "app.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "bioverse-cert-${var.environment}"
  }
}

# Target Groups
resource "aws_lb_target_group" "bioverse_api_tg" {
  name     = "bioverse-api-tg-${var.environment}"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.bioverse_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "bioverse-api-tg-${var.environment}"
  }
}

resource "aws_lb_target_group" "bioverse_web_tg" {
  name     = "bioverse-web-tg-${var.environment}"
  port     = 5173
  protocol = "HTTP"
  vpc_id   = aws_vpc.bioverse_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "bioverse-web-tg-${var.environment}"
  }
}

resource "aws_lb_target_group" "bioverse_ai_tg" {
  name     = "bioverse-ai-tg-${var.environment}"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.bioverse_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name = "bioverse-ai-tg-${var.environment}"
  }
}

# HTTPS Listener
resource "aws_lb_listener" "bioverse_https_listener" {
  load_balancer_arn = aws_lb.bioverse_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.bioverse_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.bioverse_web_tg.arn
  }
}

# HTTP to HTTPS Redirect
resource "aws_lb_listener" "bioverse_http_listener" {
  load_balancer_arn = aws_lb.bioverse_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Listener Rules
resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.bioverse_https_listener.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.bioverse_api_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "ai_rule" {
  listener_arn = aws_lb_listener.bioverse_https_listener.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.bioverse_ai_tg.arn
  }

  condition {
    path_pattern {
      values = ["/ai/*"]
    }
  }
}

# ------------------------------------------------------------------------------
# ECS Cluster - Scalable Container Platform
# ------------------------------------------------------------------------------

resource "aws_ecs_cluster" "bioverse_cluster" {
  name = "bioverse-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs_exec_logs.name
      }
    }
  }

  tags = {
    Name = "bioverse-cluster-${var.environment}"
  }
}

resource "aws_ecs_cluster_capacity_providers" "bioverse_capacity_providers" {
  cluster_name = aws_ecs_cluster.bioverse_cluster.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# ------------------------------------------------------------------------------
# RDS Database - Enterprise PostgreSQL
# ------------------------------------------------------------------------------

resource "aws_db_subnet_group" "bioverse_db_subnet_group" {
  name       = "bioverse-db-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.database_subnets[*].id

  tags = {
    Name = "bioverse-db-subnet-group-${var.environment}"
  }
}

resource "aws_db_parameter_group" "bioverse_db_params" {
  family = "postgres15"
  name   = "bioverse-db-params-${var.environment}"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = {
    Name = "bioverse-db-params-${var.environment}"
  }
}

resource "aws_db_instance" "bioverse_db" {
  identifier = "bioverse-db-${var.environment}"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.bioverse_key.arn

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.bioverse_db_subnet_group.name
  parameter_group_name   = aws_db_parameter_group.bioverse_db_params.name

  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"

  performance_insights_enabled          = true
  performance_insights_kms_key_id      = aws_kms_key.bioverse_key.arn
  performance_insights_retention_period = var.environment == "production" ? 731 : 7

  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_enhanced_monitoring.arn

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "bioverse-db-${var.environment}"
  }
}

# Read Replica for Production
resource "aws_db_instance" "bioverse_db_replica" {
  count = var.environment == "production" ? 1 : 0
  
  identifier = "bioverse-db-replica-${var.environment}"
  
  replicate_source_db = aws_db_instance.bioverse_db.identifier
  instance_class      = var.db_instance_class
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = {
    Name = "bioverse-db-replica-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# ElastiCache Redis - High Performance Caching
# ------------------------------------------------------------------------------

resource "aws_elasticache_subnet_group" "bioverse_cache_subnet_group" {
  name       = "bioverse-cache-subnet-group-${var.environment}"
  subnet_ids = aws_subnet.private_subnets[*].id
}

resource "aws_elasticache_parameter_group" "bioverse_redis_params" {
  family = "redis7.x"
  name   = "bioverse-redis-params-${var.environment}"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}

resource "aws_elasticache_replication_group" "bioverse_redis" {
  replication_group_id       = "bioverse-redis-${var.environment}"
  description                = "BioVerse Redis cluster for caching and sessions"
  
  node_type                  = var.redis_node_type
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.bioverse_redis_params.name
  
  num_cache_clusters         = var.environment == "production" ? 3 : 2
  automatic_failover_enabled = true
  multi_az_enabled          = var.environment == "production"
  
  subnet_group_name = aws_elasticache_subnet_group.bioverse_cache_subnet_group.name
  security_group_ids = [aws_security_group.redis_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
  kms_key_id                = aws_kms_key.bioverse_key.arn
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_logs.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
  
  tags = {
    Name = "bioverse-redis-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# S3 Buckets - Secure Storage
# ------------------------------------------------------------------------------

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "bioverse_app_bucket" {
  bucket = "${var.s3_bucket_name}-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "BioVerse App Bucket"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "bioverse_logs_bucket" {
  bucket = "${var.s3_bucket_name}-logs-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "BioVerse Logs Bucket"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "bioverse_backups_bucket" {
  bucket = "${var.s3_bucket_name}-backups-${var.environment}-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "BioVerse Backups Bucket"
    Environment = var.environment
  }
}

# S3 Bucket Configurations
resource "aws_s3_bucket_versioning" "bioverse_app_bucket_versioning" {
  bucket = aws_s3_bucket.bioverse_app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "bioverse_app_bucket_encryption" {
  bucket = aws_s3_bucket.bioverse_app_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.bioverse_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "bioverse_app_bucket_pab" {
  bucket = aws_s3_bucket.bioverse_app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "bioverse_app_bucket_lifecycle" {
  bucket = aws_s3_bucket.bioverse_app_bucket.id

  rule {
    id     = "transition_to_ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }
}

# ALB Logs Policy
resource "aws_s3_bucket_policy" "alb_logs_policy" {
  bucket = aws_s3_bucket.bioverse_logs_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.bioverse_logs_bucket.arn}/alb-logs/*"
      }
    ]
  })
}

data "aws_elb_service_account" "main" {}

# ------------------------------------------------------------------------------
# KMS Key for Encryption
# ------------------------------------------------------------------------------

resource "aws_kms_key" "bioverse_key" {
  description             = "BioVerse encryption key"
  deletion_window_in_days = var.environment == "production" ? 30 : 7
  enable_key_rotation     = true

  tags = {
    Name = "bioverse-key-${var.environment}"
  }
}

resource "aws_kms_alias" "bioverse_key_alias" {
  name          = "alias/bioverse-${var.environment}"
  target_key_id = aws_kms_key.bioverse_key.key_id
}

# ------------------------------------------------------------------------------
# CloudWatch Log Groups
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "bioverse_api_logs" {
  name              = "/ecs/bioverse-api-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-api-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "bioverse_web_logs" {
  name              = "/ecs/bioverse-web-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-web-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "bioverse_ai_logs" {
  name              = "/ecs/bioverse-ai-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-ai-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "ecs_exec_logs" {
  name              = "/aws/ecs/exec/${var.environment}"
  retention_in_days = 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "ecs-exec-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "redis_slow_logs" {
  name              = "/aws/elasticache/redis/slow-log-${var.environment}"
  retention_in_days = 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "redis-slow-logs-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# IAM Roles and Policies
# ------------------------------------------------------------------------------

# ECS Execution Role
resource "aws_iam_role" "ecs_execution_role" {
  name = "bioverse-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-ecs-execution-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_custom_policy" {
  name = "bioverse-ecs-execution-custom-policy-${var.environment}"
  role = aws_iam_role.ecs_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.bioverse_key.arn
      }
    ]
  })
}

# ECS Task Role
resource "aws_iam_role" "ecs_task_role" {
  name = "bioverse-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-ecs-task-role-${var.environment}"
  }
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "bioverse-ecs-task-policy-${var.environment}"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.bioverse_app_bucket.arn}/*",
          "${aws_s3_bucket.bioverse_backups_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.bioverse_app_bucket.arn,
          aws_s3_bucket.bioverse_backups_bucket.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.bioverse_key.arn
      }
    ]
  })
}

# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_enhanced_monitoring" {
  name = "bioverse-rds-enhanced-monitoring-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-rds-enhanced-monitoring-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ------------------------------------------------------------------------------
# CloudWatch Alarms - Proactive Monitoring
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "bioverse-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.bioverse_cluster.name
  }

  tags = {
    Name = "bioverse-high-cpu-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "bioverse-high-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.bioverse_cluster.name
  }

  tags = {
    Name = "bioverse-high-memory-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "bioverse-database-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors RDS cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.bioverse_db.id
  }

  tags = {
    Name = "bioverse-database-cpu-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# SNS Topic for Alerts
# ------------------------------------------------------------------------------

resource "aws_sns_topic" "alerts" {
  name              = "bioverse-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-alerts-${var.environment}"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  count     = length(var.alert_email_addresses)
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

# ------------------------------------------------------------------------------
# WAF for Application Security
# ------------------------------------------------------------------------------

resource "aws_wafv2_web_acl" "bioverse_waf" {
  name  = "bioverse-waf-${var.environment}"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "RateLimitRule"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "bioverse-waf-${var.environment}"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "bioverse-waf-${var.environment}"
  }
}

resource "aws_wafv2_web_acl_association" "bioverse_waf_association" {
  resource_arn = aws_lb.bioverse_alb.arn
  web_acl_arn  = aws_wafv2_web_acl.bioverse_waf.arn
}