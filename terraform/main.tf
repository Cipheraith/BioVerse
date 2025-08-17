# ------------------------------------------------------------------------------
# Terraform Configuration
# ------------------------------------------------------------------------------

terraform {
  required_version = ">= 1.0"

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
}

# ------------------------------------------------------------------------------
# Resources
# ------------------------------------------------------------------------------

# Example resource: An S3 bucket for storing application data
resource "aws_s3_bucket" "app_bucket" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "BioVerse App Bucket"
    Environment = "Dev"
  }
}
