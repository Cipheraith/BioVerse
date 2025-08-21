# ------------------------------------------------------------------------------
# BioVerse Infrastructure Variables
# Built for success, designed for scale
# ------------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "bioverse.com"
}

# ------------------------------------------------------------------------------
# Network Configuration
# ------------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ------------------------------------------------------------------------------
# Database Configuration
# ------------------------------------------------------------------------------

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
  
  validation {
    condition = can(regex("^db\\.", var.db_instance_class))
    error_message = "DB instance class must start with 'db.'."
  }
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS instance (GB)"
  type        = number
  default     = 20
  
  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 65536
    error_message = "DB allocated storage must be between 20 and 65536 GB."
  }
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS instance (GB)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.db_max_allocated_storage >= 20 && var.db_max_allocated_storage <= 65536
    error_message = "DB max allocated storage must be between 20 and 65536 GB."
  }
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "bioverse_db"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_name))
    error_message = "Database name must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "bioverse_admin"
  sensitive   = true
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.db_username))
    error_message = "Database username must start with a letter and contain only letters, numbers, and underscores."
  }
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

# ------------------------------------------------------------------------------
# Redis Configuration
# ------------------------------------------------------------------------------

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
  
  validation {
    condition = can(regex("^cache\\.", var.redis_node_type))
    error_message = "Redis node type must start with 'cache.'."
  }
}

variable "redis_auth_token" {
  description = "Redis AUTH token for security"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.redis_auth_token) >= 16
    error_message = "Redis auth token must be at least 16 characters long."
  }
}

# ------------------------------------------------------------------------------
# S3 Configuration
# ------------------------------------------------------------------------------

variable "s3_bucket_name" {
  description = "Base name for S3 buckets (will be suffixed with environment and random string)"
  type        = string
  default     = "bioverse"
  
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.s3_bucket_name))
    error_message = "S3 bucket name must contain only lowercase letters, numbers, and hyphens."
  }
}

# ------------------------------------------------------------------------------
# Container Configuration
# ------------------------------------------------------------------------------

variable "api_cpu" {
  description = "CPU units for API service (1024 = 1 vCPU)"
  type        = number
  default     = 512
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.api_cpu)
    error_message = "API CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "api_memory" {
  description = "Memory for API service (MB)"
  type        = number
  default     = 1024
  
  validation {
    condition     = var.api_memory >= 512 && var.api_memory <= 30720
    error_message = "API memory must be between 512 and 30720 MB."
  }
}

variable "web_cpu" {
  description = "CPU units for Web service (1024 = 1 vCPU)"
  type        = number
  default     = 256
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.web_cpu)
    error_message = "Web CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "web_memory" {
  description = "Memory for Web service (MB)"
  type        = number
  default     = 512
  
  validation {
    condition     = var.web_memory >= 512 && var.web_memory <= 30720
    error_message = "Web memory must be between 512 and 30720 MB."
  }
}

variable "ai_cpu" {
  description = "CPU units for AI service (1024 = 1 vCPU)"
  type        = number
  default     = 1024
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.ai_cpu)
    error_message = "AI CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "ai_memory" {
  description = "Memory for AI service (MB)"
  type        = number
  default     = 2048
  
  validation {
    condition     = var.ai_memory >= 512 && var.ai_memory <= 30720
    error_message = "AI memory must be between 512 and 30720 MB."
  }
}

# ------------------------------------------------------------------------------
# Scaling Configuration
# ------------------------------------------------------------------------------

variable "api_min_capacity" {
  description = "Minimum number of API service tasks"
  type        = number
  default     = 1
  
  validation {
    condition     = var.api_min_capacity >= 1 && var.api_min_capacity <= 100
    error_message = "API min capacity must be between 1 and 100."
  }
}

variable "api_max_capacity" {
  description = "Maximum number of API service tasks"
  type        = number
  default     = 10
  
  validation {
    condition     = var.api_max_capacity >= 1 && var.api_max_capacity <= 100
    error_message = "API max capacity must be between 1 and 100."
  }
}

variable "web_min_capacity" {
  description = "Minimum number of Web service tasks"
  type        = number
  default     = 1
  
  validation {
    condition     = var.web_min_capacity >= 1 && var.web_min_capacity <= 100
    error_message = "Web min capacity must be between 1 and 100."
  }
}

variable "web_max_capacity" {
  description = "Maximum number of Web service tasks"
  type        = number
  default     = 5
  
  validation {
    condition     = var.web_max_capacity >= 1 && var.web_max_capacity <= 100
    error_message = "Web max capacity must be between 1 and 100."
  }
}

variable "ai_min_capacity" {
  description = "Minimum number of AI service tasks"
  type        = number
  default     = 1
  
  validation {
    condition     = var.ai_min_capacity >= 1 && var.ai_min_capacity <= 100
    error_message = "AI min capacity must be between 1 and 100."
  }
}

variable "ai_max_capacity" {
  description = "Maximum number of AI service tasks"
  type        = number
  default     = 5
  
  validation {
    condition     = var.ai_max_capacity >= 1 && var.ai_max_capacity <= 100
    error_message = "AI max capacity must be between 1 and 100."
  }
}

# ------------------------------------------------------------------------------
# Monitoring and Alerting
# ------------------------------------------------------------------------------

variable "alert_email_addresses" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = []
  
  validation {
    condition = alltrue([
      for email in var.alert_email_addresses : can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", email))
    ])
    error_message = "All email addresses must be valid."
  }
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = true
}

# ------------------------------------------------------------------------------
# Security Configuration
# ------------------------------------------------------------------------------

variable "enable_waf" {
  description = "Enable AWS WAF for application protection"
  type        = bool
  default     = true
}

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all services"
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit for all services"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
  
  validation {
    condition     = var.backup_retention_days >= 1 && var.backup_retention_days <= 35
    error_message = "Backup retention days must be between 1 and 35."
  }
}

# ------------------------------------------------------------------------------
# Feature Flags
# ------------------------------------------------------------------------------

variable "enable_multi_az" {
  description = "Enable Multi-AZ deployment for RDS and ElastiCache"
  type        = bool
  default     = false
}

variable "enable_read_replica" {
  description = "Enable RDS read replica"
  type        = bool
  default     = false
}

variable "enable_auto_scaling" {
  description = "Enable auto scaling for ECS services"
  type        = bool
  default     = true
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

# ------------------------------------------------------------------------------
# Cost Optimization
# ------------------------------------------------------------------------------

variable "use_spot_instances" {
  description = "Use Spot instances for cost optimization (non-production only)"
  type        = bool
  default     = false
}

variable "enable_s3_intelligent_tiering" {
  description = "Enable S3 Intelligent Tiering for cost optimization"
  type        = bool
  default     = true
}

# ------------------------------------------------------------------------------
# Development Configuration
# ------------------------------------------------------------------------------

variable "enable_debug_mode" {
  description = "Enable debug mode for development"
  type        = bool
  default     = false
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"
  
  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be one of: debug, info, warn, error."
  }
}

# ------------------------------------------------------------------------------
# Tags
# ------------------------------------------------------------------------------

variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "BioVerse"
}

variable "team_name" {
  description = "Name of the team managing this infrastructure"
  type        = string
  default     = "BioVerse Engineering"
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "Engineering"
}