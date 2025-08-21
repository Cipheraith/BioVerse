# ------------------------------------------------------------------------------
# BioVerse Infrastructure Outputs
# Everything you need to connect and deploy
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Network Outputs
# ------------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.bioverse_vpc.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.bioverse_vpc.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "database_subnet_ids" {
  description = "IDs of the database subnets"
  value       = aws_subnet.database_subnets[*].id
}

# ------------------------------------------------------------------------------
# Load Balancer Outputs
# ------------------------------------------------------------------------------

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.bioverse_alb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.bioverse_alb.zone_id
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.bioverse_alb.arn
}

output "application_url" {
  description = "URL to access the BioVerse application"
  value       = "https://${aws_lb.bioverse_alb.dns_name}"
}

output "api_url" {
  description = "URL to access the BioVerse API"
  value       = "https://${aws_lb.bioverse_alb.dns_name}/api"
}

# ------------------------------------------------------------------------------
# ECS Cluster Outputs
# ------------------------------------------------------------------------------

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.bioverse_cluster.id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.bioverse_cluster.name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.bioverse_cluster.arn
}

# ------------------------------------------------------------------------------
# Database Outputs
# ------------------------------------------------------------------------------

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.bioverse_db.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = aws_db_instance.bioverse_db.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.bioverse_db.db_name
}

output "database_username" {
  description = "Database master username"
  value       = aws_db_instance.bioverse_db.username
  sensitive   = true
}

output "database_replica_endpoint" {
  description = "RDS read replica endpoint (if enabled)"
  value       = var.environment == "production" ? aws_db_instance.bioverse_db_replica[0].endpoint : null
  sensitive   = true
}

# ------------------------------------------------------------------------------
# Redis Outputs
# ------------------------------------------------------------------------------

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.bioverse_redis.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.bioverse_redis.port
}

output "redis_reader_endpoint" {
  description = "ElastiCache Redis reader endpoint"
  value       = aws_elasticache_replication_group.bioverse_redis.reader_endpoint_address
  sensitive   = true
}

# ------------------------------------------------------------------------------
# S3 Bucket Outputs
# ------------------------------------------------------------------------------

output "app_bucket_name" {
  description = "Name of the application S3 bucket"
  value       = aws_s3_bucket.bioverse_app_bucket.bucket
}

output "app_bucket_arn" {
  description = "ARN of the application S3 bucket"
  value       = aws_s3_bucket.bioverse_app_bucket.arn
}

output "logs_bucket_name" {
  description = "Name of the logs S3 bucket"
  value       = aws_s3_bucket.bioverse_logs_bucket.bucket
}

output "backups_bucket_name" {
  description = "Name of the backups S3 bucket"
  value       = aws_s3_bucket.bioverse_backups_bucket.bucket
}

# ------------------------------------------------------------------------------
# Security Outputs
# ------------------------------------------------------------------------------

output "kms_key_id" {
  description = "ID of the KMS key"
  value       = aws_kms_key.bioverse_key.key_id
}

output "kms_key_arn" {
  description = "ARN of the KMS key"
  value       = aws_kms_key.bioverse_key.arn
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = aws_wafv2_web_acl.bioverse_waf.arn
}

# ------------------------------------------------------------------------------
# IAM Role Outputs
# ------------------------------------------------------------------------------

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

# ------------------------------------------------------------------------------
# Target Group Outputs
# ------------------------------------------------------------------------------

output "api_target_group_arn" {
  description = "ARN of the API target group"
  value       = aws_lb_target_group.bioverse_api_tg.arn
}

output "web_target_group_arn" {
  description = "ARN of the web target group"
  value       = aws_lb_target_group.bioverse_web_tg.arn
}

output "ai_target_group_arn" {
  description = "ARN of the AI target group"
  value       = aws_lb_target_group.bioverse_ai_tg.arn
}

# ------------------------------------------------------------------------------
# CloudWatch Outputs
# ------------------------------------------------------------------------------

output "api_log_group_name" {
  description = "Name of the API CloudWatch log group"
  value       = aws_cloudwatch_log_group.bioverse_api_logs.name
}

output "web_log_group_name" {
  description = "Name of the web CloudWatch log group"
  value       = aws_cloudwatch_log_group.bioverse_web_logs.name
}

output "ai_log_group_name" {
  description = "Name of the AI CloudWatch log group"
  value       = aws_cloudwatch_log_group.bioverse_ai_logs.name
}

# ------------------------------------------------------------------------------
# SNS Outputs
# ------------------------------------------------------------------------------

output "alerts_topic_arn" {
  description = "ARN of the alerts SNS topic"
  value       = aws_sns_topic.alerts.arn
}

# ------------------------------------------------------------------------------
# Environment Information
# ------------------------------------------------------------------------------

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

# ------------------------------------------------------------------------------
# Connection Strings (for application configuration)
# ------------------------------------------------------------------------------

output "database_connection_string" {
  description = "Database connection string (without password)"
  value       = "postgresql://${aws_db_instance.bioverse_db.username}@${aws_db_instance.bioverse_db.endpoint}:${aws_db_instance.bioverse_db.port}/${aws_db_instance.bioverse_db.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${aws_elasticache_replication_group.bioverse_redis.primary_endpoint_address}:${aws_elasticache_replication_group.bioverse_redis.port}"
  sensitive   = true
}

# ------------------------------------------------------------------------------
# Deployment Information
# ------------------------------------------------------------------------------

output "deployment_instructions" {
  description = "Instructions for deploying applications"
  value = <<-EOT
    BioVerse Infrastructure Deployed Successfully! 🚀
    
    Next Steps:
    1. Update your DNS to point to: ${aws_lb.bioverse_alb.dns_name}
    2. Deploy your applications using the ECS cluster: ${aws_ecs_cluster.bioverse_cluster.name}
    3. Configure your applications with the database endpoint (check sensitive outputs)
    4. Set up your CI/CD pipeline to deploy to this infrastructure
    
    Monitoring:
    - CloudWatch dashboards are available in the AWS console
    - Alerts will be sent to the configured email addresses
    - WAF is protecting your application from common attacks
    
    Security:
    - All data is encrypted at rest and in transit
    - Network is segmented with proper security groups
    - KMS key is available for additional encryption needs
    
    Your BioVerse platform is ready to change the world! 🌍
  EOT
}

# ------------------------------------------------------------------------------
# Cost Optimization Tips
# ------------------------------------------------------------------------------

output "cost_optimization_tips" {
  description = "Tips for optimizing costs"
  value = <<-EOT
    Cost Optimization Tips:
    
    1. Enable S3 Intelligent Tiering (already configured)
    2. Use Spot instances for non-production workloads
    3. Set up CloudWatch billing alerts
    4. Review and right-size your instances regularly
    5. Use Reserved Instances for production workloads
    6. Enable AWS Cost Explorer for detailed cost analysis
    
    Current Configuration:
    - Environment: ${var.environment}
    - Multi-AZ: ${var.enable_multi_az ? "Enabled" : "Disabled"}
    - Auto Scaling: ${var.enable_auto_scaling ? "Enabled" : "Disabled"}
  EOT
}

# ------------------------------------------------------------------------------
# Security Checklist
# ------------------------------------------------------------------------------

output "security_checklist" {
  description = "Security features enabled"
  value = <<-EOT
    Security Features Enabled:
    
    ✅ VPC with private subnets
    ✅ Security groups with least privilege access
    ✅ WAF protection against common attacks
    ✅ Encryption at rest (KMS)
    ✅ Encryption in transit (TLS/SSL)
    ✅ CloudWatch monitoring and alerting
    ✅ IAM roles with minimal permissions
    ✅ S3 bucket public access blocked
    ✅ Database in private subnets
    ✅ Redis authentication enabled
    
    Additional Recommendations:
    - Enable GuardDuty for threat detection
    - Set up AWS Config for compliance monitoring
    - Enable CloudTrail for audit logging
    - Implement backup and disaster recovery procedures
  EOT
}