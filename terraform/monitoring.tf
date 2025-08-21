# ------------------------------------------------------------------------------
# BioVerse Monitoring and Observability
# Complete visibility into your revolutionary platform
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# CloudWatch Dashboard
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_dashboard" "bioverse_dashboard" {
  dashboard_name = "BioVerse-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.bioverse_alb.arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "bioverse-api-${var.environment}", "ClusterName", aws_ecs_cluster.bioverse_cluster.name],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "CPUUtilization", "ServiceName", "bioverse-web-${var.environment}", "ClusterName", aws_ecs_cluster.bioverse_cluster.name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ECS Service Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", aws_db_instance.bioverse_db.id],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "RDS Database Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "${aws_elasticache_replication_group.bioverse_redis.replication_group_id}-001"],
            [".", "NetworkBytesIn", ".", "."],
            [".", "NetworkBytesOut", ".", "."],
            [".", "CurrConnections", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ElastiCache Redis Metrics"
          period  = 300
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-dashboard-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Custom Metrics and Alarms
# ------------------------------------------------------------------------------

# Application Performance Monitoring
resource "aws_cloudwatch_metric_alarm" "api_response_time" {
  alarm_name          = "bioverse-api-response-time-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = "2"
  alarm_description   = "API response time is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.bioverse_alb.arn_suffix
    TargetGroup  = aws_lb_target_group.bioverse_api_tg.arn_suffix
  }

  tags = {
    Name = "bioverse-api-response-time-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_error_rate" {
  alarm_name          = "bioverse-api-error-rate-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "API error rate is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.bioverse_alb.arn_suffix
    TargetGroup  = aws_lb_target_group.bioverse_api_tg.arn_suffix
  }

  tags = {
    Name = "bioverse-api-error-rate-${var.environment}"
  }
}

# Database Performance Monitoring
resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "bioverse-database-connections-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Database connection count is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.bioverse_db.id
  }

  tags = {
    Name = "bioverse-database-connections-${var.environment}"
  }
}

resource "aws_cloudwatch_metric_alarm" "database_read_latency" {
  alarm_name          = "bioverse-database-read-latency-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ReadLatency"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "0.2"
  alarm_description   = "Database read latency is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.bioverse_db.id
  }

  tags = {
    Name = "bioverse-database-read-latency-${var.environment}"
  }
}

# Cache Performance Monitoring
resource "aws_cloudwatch_metric_alarm" "redis_cpu_utilization" {
  alarm_name          = "bioverse-redis-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "Redis CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    CacheClusterId = "${aws_elasticache_replication_group.bioverse_redis.replication_group_id}-001"
  }

  tags = {
    Name = "bioverse-redis-cpu-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Log Insights Queries
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_query_definition" "api_errors" {
  name = "BioVerse API Errors - ${var.environment}"

  log_group_names = [
    aws_cloudwatch_log_group.bioverse_api_logs.name
  ]

  query_string = <<EOF
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100
EOF
}

resource "aws_cloudwatch_query_definition" "slow_requests" {
  name = "BioVerse Slow Requests - ${var.environment}"

  log_group_names = [
    aws_cloudwatch_log_group.bioverse_api_logs.name
  ]

  query_string = <<EOF
fields @timestamp, @message, @duration
| filter @message like /duration/
| filter @duration > 1000
| sort @timestamp desc
| limit 50
EOF
}

resource "aws_cloudwatch_query_definition" "user_activity" {
  name = "BioVerse User Activity - ${var.environment}"

  log_group_names = [
    aws_cloudwatch_log_group.bioverse_api_logs.name
  ]

  query_string = <<EOF
fields @timestamp, @message, userId, action
| filter @message like /user_action/
| stats count() by action
| sort count desc
EOF
}

# ------------------------------------------------------------------------------
# Application Insights
# ------------------------------------------------------------------------------

resource "aws_applicationinsights_application" "bioverse_app" {
  resource_group_name = aws_resourcegroups_group.bioverse_resources.name
  auto_config_enabled = true
  auto_create         = true

  log_pattern {
    pattern_name = "BioVerseAPILogs"
    pattern      = "[timestamp, request_id, level, message]"
    rank         = 1
  }

  tags = {
    Name = "bioverse-app-insights-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Resource Groups for Monitoring
# ------------------------------------------------------------------------------

resource "aws_resourcegroups_group" "bioverse_resources" {
  name = "bioverse-resources-${var.environment}"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = [
        "AWS::ECS::Service",
        "AWS::RDS::DBInstance",
        "AWS::ElastiCache::ReplicationGroup",
        "AWS::ElasticLoadBalancingV2::LoadBalancer"
      ]
      TagFilters = [
        {
          Key    = "Project"
          Values = ["BioVerse"]
        },
        {
          Key    = "Environment"
          Values = [var.environment]
        }
      ]
    })
  }

  tags = {
    Name = "bioverse-resources-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# X-Ray Tracing
# ------------------------------------------------------------------------------

resource "aws_xray_sampling_rule" "bioverse_sampling" {
  rule_name      = "BioVerseSampling-${var.environment}"
  priority       = 9000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.1
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  tags = {
    Name = "bioverse-xray-sampling-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Enhanced Monitoring for Production
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_composite_alarm" "bioverse_health_check" {
  count = var.environment == "production" ? 1 : 0
  
  alarm_name        = "bioverse-overall-health-${var.environment}"
  alarm_description = "Overall health check for BioVerse platform"

  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.high_cpu.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.high_memory.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.database_cpu.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.api_response_time.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.api_error_rate.alarm_name})"
  ])

  alarm_actions = [aws_sns_topic.critical_alerts[0].arn]
  ok_actions    = [aws_sns_topic.critical_alerts[0].arn]

  tags = {
    Name = "bioverse-overall-health-${var.environment}"
  }
}

# Critical alerts topic for production
resource "aws_sns_topic" "critical_alerts" {
  count = var.environment == "production" ? 1 : 0
  
  name              = "bioverse-critical-alerts-${var.environment}"
  kms_master_key_id = aws_kms_key.bioverse_key.arn

  tags = {
    Name = "bioverse-critical-alerts-${var.environment}"
  }
}

resource "aws_sns_topic_subscription" "critical_email_alerts" {
  count = var.environment == "production" ? length(var.alert_email_addresses) : 0
  
  topic_arn = aws_sns_topic.critical_alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

# ------------------------------------------------------------------------------
# Cost Monitoring
# ------------------------------------------------------------------------------

resource "aws_budgets_budget" "bioverse_cost_budget" {
  count = var.environment == "production" ? 1 : 0
  
  name         = "bioverse-monthly-budget-${var.environment}"
  budget_type  = "COST"
  limit_amount = "1000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  
  time_period_start = "2024-01-01_00:00"

  cost_filters = {
    Tag = [
      "Project:BioVerse",
      "Environment:${var.environment}"
    ]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.alert_email_addresses
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.alert_email_addresses
  }

  tags = {
    Name = "bioverse-cost-budget-${var.environment}"
  }
}

# ------------------------------------------------------------------------------
# Performance Insights Dashboard
# ------------------------------------------------------------------------------

resource "aws_cloudwatch_dashboard" "bioverse_performance_dashboard" {
  dashboard_name = "BioVerse-Performance-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 24
        height = 6

        properties = {
          metrics = [
            ["AWS/RDS", "ReadThroughput", "DBInstanceIdentifier", aws_db_instance.bioverse_db.id],
            [".", "WriteThroughput", ".", "."],
            [".", "ReadIOPS", ".", "."],
            [".", "WriteIOPS", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "Database Performance Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 6
        width  = 24
        height = 6

        properties = {
          query   = "SOURCE '${aws_cloudwatch_log_group.bioverse_api_logs.name}' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent API Errors"
          view    = "table"
        }
      }
    ]
  })

  tags = {
    Name = "bioverse-performance-dashboard-${var.environment}"
  }
}