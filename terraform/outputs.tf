# ------------------------------------------------------------------------------
# S3 Bucket Outputs
# ------------------------------------------------------------------------------

output "s3_bucket_id" {
  description = "The ID of the S3 bucket."
  value       = aws_s3_bucket.app_bucket.id
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket."
  value       = aws_s3_bucket.app_bucket.arn
}
