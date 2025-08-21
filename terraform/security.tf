# ------------------------------------------------------------------------------
# BioVerse Security Configuration
# Military-grade security for healthcare data
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# AWS Config for Compliance Monitoring
# ------------------------------------------------------------------------------

resource "aws_config_configuration_recorder" "bioverse_recorder" {
  count = var.environment == "production" ? 1 : 0
  
  name     = "bioverse-config-recorder-${var.environment}"
  role_arn = aws_iam_role.config_role[0].arn

  recording_group {
    all_supported                 = true
    include_global_resource_types = true
  }

  depends_on = [aws_config_delivery_channel.bioverse_delivery_channel]
}

resource "aws_config_delivery_channel" "bioverse_delivery_channel" {
  count = var.environment == "production" ? 1 : 0
  
  name           = "bioverse-config-delivery-${var.environment}"
  s3_bucket_name = aws_s3_bucket.config_bucket[0].bucket
  
  depends_on = [aws_s3_bucket_policy.config_bucket_policy]
}

resource "aws_s3_bucket" "config_bucket" {
  count = var.environment == "production" ? 1 : 0
  
  bucket        = "bioverse-config-${var.environment}-${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "bioverse-config-bucket-${var.environment}"
  }
}

resource "aws_s3_bucket_policy" "config_bucket_policy" {
  count = var.environment == "production" ? 1 : 0
  
  bucket = aws_s3_bucket.config_bucket[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSConfigBucketPermissionsCheck"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.config_bucket[0].arn
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      },
      {
        Sid    = "AWSConfigBucketExistenceCheck"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:ListBucket"
        Resource = aws_s3_bucket.config_bucket[0].arn
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      },
      {
        Sid    = "AWSConfigBucketDelivery"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.config_bucket[0].arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
            "AWS:SourceAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

# Config IAM Role
resource "aws_iam_role" "config_role" {
  count = var.environment == "production" ? 1 : 0
  
  name = "bioverse-config-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "config.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-config-role-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "config_role_policy" {
  count = var.environment == "production" ? 1 : 0
  
  role       = aws_iam_role.config_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/ConfigRole"
}

# ------------------------------------------------------------------------------
# AWS Config Rules for Compliance
# ------------------------------------------------------------------------------

resource "aws_config_config_rule" "s3_bucket_public_access_prohibited" {
  count = var.environment == "production" ? 1 : 0
  
  name = "s3-bucket-public-access-prohibited"

  source {
    owner             = "AWS"
    source_identifier = "S3_BUCKET_PUBLIC_ACCESS_PROHIBITED"
  }

  depends_on = [aws_config_configuration_recorder.bioverse_recorder]
}

resource "aws_config_config_rule" "encrypted_volumes" {
  count = var.environment == "production" ? 1 : 0
  
  name = "encrypted-volumes"

  source {
    owner             = "AWS"
    source_identifier = "ENCRYPTED_VOLUMES"
  }

  depends_on = [aws_config_configuration_recorder.bioverse_recorder]
}

resource "aws_config_config_rule" "rds_storage_encrypted" {
  count = var.environment == "production" ? 1 : 0
  
  name = "rds-storage-encrypted"

  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }

  depends_on = [aws_config_configuration_recorder.bioverse_recorder]
}

resource "aws_config_config_rule" "root_access_key_check" {
  count = var.environment == "production" ? 1 : 0
  
  name = "root-access-key-check"

  source {
    owner             = "AWS"
    source_identifier = "ROOT_ACCESS_KEY_CHECK"
  }

  depends_on = [aws_config_configuration_recorder.bioverse_recorder]
}

# ------------------------------------------------------------------------------
# GuardDuty for Threat Detection
# ------------------------------------------------------------------------------

resource "aws_guardduty_detector" "bioverse_guardduty" {
  count = var.environment == "production" ? 1 : 0
  
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = false
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }

  tags = {
    Name = "bioverse-guardduty-${var.environment}"
  }
}

# GuardDuty findings to SNS
resource "aws_cloudwatch_event_rule" "guardduty_findings" {
  count = var.environment == "production" ? 1 : 0
  
  name        = "bioverse-guardduty-findings-${var.environment}"
  description = "Capture GuardDuty findings"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Finding"]
  })

  tags = {
    Name = "bioverse-guardduty-findings-${var.environment}"
  }
}

resource "aws_cloudwatch_event_target" "guardduty_sns" {
  count = var.environment == "production" ? 1 : 0
  
  rule      = aws_cloudwatch_event_rule.guardduty_findings[0].name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.security_alerts[0].arn
}

# ------------------------------------------------------------------------------
# Security Hub
# ------------------------------------------------------------------------------

resource "aws_securityhub_account" "bioverse_security_hub" {
  count = var.environment == "production" ? 1 : 0
  
  enable_default_standards = true

  control_finding_generator = "SECURITY_CONTROL"
  auto_enable_controls      = true

  tags = {
    Name = "bioverse-security-hub-${var.environment}"
  }
}

# Enable AWS Foundational Security Standard
resource "aws_securityhub_standards_subscription" "aws_foundational" {
  count = var.environment == "production" ? 1 : 0
  
  standards_arn = "arn:aws:securityhub:::ruleset/finding-format/aws-foundational-security-standard/v/1.0.0"
  
  depends_on = [aws_securityhub_account.bioverse_security_hub]
}

# Enable CIS AWS Foundations Benchmark
resource "aws_securityhub_standards_subscription" "cis" {
  count = var.environment == "production" ? 1 : 0
  
  standards_arn = "arn:aws:securityhub:::ruleset/finding-format/cis-aws-foundations-benchmark/v/1.2.0"
  
  depends_on = [aws_securityhub_account.bioverse_security_hub]
}

# ------------------------------------------------------------------------------
# CloudTrail for Audit Logging
# ------------------------------------------------------------------------------

resource "aws_cloudtrail" "bioverse_cloudtrail" {
  name           = "bioverse-cloudtrail-${var.environment}"
  s3_bucket_name = aws_s3_bucket.cloudtrail_bucket.bucket

  event_selector {
    read_write_type                 = "All"
    include_management_events       = true
    exclude_management_event_sources = []

    data_resource {
      type   = "AWS::S3::Object"
      values = ["${aws_s3_bucket.bioverse_app_bucket.arn}/*"]
    }

    data_resource {
      type   = "AWS::S3::Bucket"
      values = [aws_s3_bucket.bioverse_app_bucket.arn]
    }
  }

  insight_selector {
    insight_type = "ApiCallRateInsight"
  }

  enable_logging                = true
  include_global_service_events = true
  is_multi_region_trail        = true
  enable_log_file_validation   = true
  kms_key_id                   = aws_kms_key.bioverse_key.arn

  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.cloudtrail_logs.arn}:*"
  cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail_logs_role.arn

  tags = {
    Name = "bioverse-cloudtrail-${var.environment}"
  }
}

# CloudTrail S3 Bucket
resource "aws_s3_bucket" "cloudtrail_bucket" {
  bucket        = "bioverse-cloudtrail-${var.environment}-${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "bioverse-cloudtrail-bucket-${var.environment}"
  }
}

resource "aws_s3_bucket_policy" "cloudtrail_bucket_policy" {
  bucket = aws_s3_bucket.cloudtrail_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail_bucket.arn
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.aws_region}:${data.aws_caller_identity.current.account_id}:trail/bioverse-cloudtrail-${var.environment}"
          }
        }
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
            "AWS:SourceArn" = "arn:aws:cloudtrail:${var.aws_region}:${data.aws_caller_identity.current.account_id}:trail/bioverse-cloudtrail-${var.environment}"
          }
        }
      }
    ]
  })
}

# CloudTrail CloudWatch Logs
resource "aws_cloudwatch_log_group" "cloudtrail_logs" {
  name              = "/aws/cloudtrail/bioverse-${var.environment}"
  retention_in_days = var.environment == "production" ? 90 : 30
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-cloudtrail-logs-${var.environment}"
  }
}

resource "aws_iam_role" "cloudtrail_logs_role" {
  name = "bioverse-cloudtrail-logs-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-cloudtrail-logs-role-${var.environment}"
  }
}

resource "aws_iam_role_policy" "cloudtrail_logs_policy" {
  name = "bioverse-cloudtrail-logs-policy-${var.environment}"
  role = aws_iam_role.cloudtrail_logs_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.cloudtrail_logs.arn}:*"
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# VPC Flow Logs
# ------------------------------------------------------------------------------

resource "aws_flow_log" "bioverse_vpc_flow_log" {
  iam_role_arn    = aws_iam_role.flow_log_role.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.bioverse_vpc.id

  tags = {
    Name = "bioverse-vpc-flow-log-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/bioverse-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
  kms_key_id       = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-vpc-flow-logs-${var.environment}"
  }
}

resource "aws_iam_role" "flow_log_role" {
  name = "bioverse-flow-log-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-flow-log-role-${var.environment}"
  }
}

resource "aws_iam_role_policy" "flow_log_policy" {
  name = "bioverse-flow-log-policy-${var.environment}"
  role = aws_iam_role.flow_log_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# ------------------------------------------------------------------------------
# Security Alerts SNS Topic
# ------------------------------------------------------------------------------

resource "aws_sns_topic" "security_alerts" {
  count = var.environment == "production" ? 1 : 0
  
  name              = "bioverse-security-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-security-alerts-${var.environment}"
  }
}

resource "aws_sns_topic_subscription" "security_email_alerts" {
  count = var.environment == "production" ? length(var.alert_email_addresses) : 0
  
  topic_arn = aws_sns_topic.security_alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

# ------------------------------------------------------------------------------
# Secrets Manager for Sensitive Data
# ------------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "database_credentials" {
  name                    = "bioverse/database/${var.environment}"
  description             = "Database credentials for BioVerse ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0
  kms_key_id             = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-database-credentials-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "database_credentials" {
  secret_id = aws_secretsmanager_secret.database_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_db_instance.bioverse_db.endpoint
    port     = aws_db_instance.bioverse_db.port
    dbname   = aws_db_instance.bioverse_db.db_name
  })
}

resource "aws_secretsmanager_secret" "redis_credentials" {
  name                    = "bioverse/redis/${var.environment}"
  description             = "Redis credentials for BioVerse ${var.environment}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0
  kms_key_id             = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-redis-credentials-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = aws_secretsmanager_secret.redis_credentials.id
  secret_string = jsonencode({
    host      = aws_elasticache_replication_group.bioverse_redis.primary_endpoint_address
    port      = aws_elasticache_replication_group.bioverse_redis.port
    auth_token = var.redis_auth_token
  })
}

# ------------------------------------------------------------------------------
# Parameter Store for Configuration
# ------------------------------------------------------------------------------

resource "aws_ssm_parameter" "app_config" {
  for_each = {
    "/bioverse/${var.environment}/app/log_level"    = var.log_level
    "/bioverse/${var.environment}/app/environment"  = var.environment
    "/bioverse/${var.environment}/app/region"       = var.aws_region
    "/bioverse/${var.environment}/app/kms_key_id"   = aws_kms_key.bioverse_key.key_id
  }

  name  = each.key
  type  = "String"
  value = each.value

  tags = {
    Name = "bioverse-config-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Network ACLs for Additional Security
# ------------------------------------------------------------------------------

resource "aws_network_acl" "private_nacl" {
  vpc_id     = aws_vpc.bioverse_vpc.id
  subnet_ids = aws_subnet.private_subnets[*].id

  # Allow inbound HTTP/HTTPS from public subnets
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 80
    to_port    = 80
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 443
    to_port    = 443
  }

  # Allow inbound application ports
  ingress {
    protocol   = "tcp"
    rule_no    = 120
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 3000
    to_port    = 3000
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 130
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 5173
    to_port    = 5173
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 140
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 8000
    to_port    = 8000
  }

  # Allow ephemeral ports for responses
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 1024
    to_port    = 65535
  }

  # Allow all outbound traffic
  egress {
    protocol   = "-1"
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }

  tags = {
    Name = "bioverse-private-nacl-${var.environment}"
  }
}

resource "aws_network_acl" "database_nacl" {
  vpc_id     = aws_vpc.bioverse_vpc.id
  subnet_ids = aws_subnet.database_subnets[*].id

  # Allow inbound PostgreSQL from private subnets only
  ingress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "10.0.10.0/24"
    from_port  = 5432
    to_port    = 5432
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 110
    action     = "allow"
    cidr_block = "10.0.11.0/24"
    from_port  = 5432
    to_port    = 5432
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 120
    action     = "allow"
    cidr_block = "10.0.12.0/24"
    from_port  = 5432
    to_port    = 5432
  }

  # Allow Redis from private subnets only
  ingress {
    protocol   = "tcp"
    rule_no    = 130
    action     = "allow"
    cidr_block = "10.0.10.0/24"
    from_port  = 6379
    to_port    = 6379
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 140
    action     = "allow"
    cidr_block = "10.0.11.0/24"
    from_port  = 6379
    to_port    = 6379
  }

  ingress {
    protocol   = "tcp"
    rule_no    = 150
    action     = "allow"
    cidr_block = "10.0.12.0/24"
    from_port  = 6379
    to_port    = 6379
  }

  # Allow ephemeral ports for responses
  ingress {
    protocol   = "tcp"
    rule_no    = 200
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 1024
    to_port    = 65535
  }

  # Allow outbound to private subnets only
  egress {
    protocol   = "tcp"
    rule_no    = 100
    action     = "allow"
    cidr_block = "10.0.0.0/16"
    from_port  = 0
    to_port    = 65535
  }

  tags = {
    Name = "bioverse-database-nacl-${var.environment}"
  }
}