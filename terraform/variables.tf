# ------------------------------------------------------------------------------
# General Variables
# ------------------------------------------------------------------------------

variable "aws_region" {
  description = "The AWS region to create resources in."
  type        = string
  default     = "us-east-1"
}

# ------------------------------------------------------------------------------
# S3 Bucket Variables
# ------------------------------------------------------------------------------

variable "s3_bucket_name" {
  description = "The name of the S3 bucket to create."
  type        = string
  default     = "bioverse-app-bucket-dev"
}
