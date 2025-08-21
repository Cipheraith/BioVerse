# DevOps & Infrastructure

## Docker Compose (dev)
- `docker-compose.dev.yml` brings up Postgres, Redis, Mongo, server, client.
- Ports: 5432, 6379, 27017, 3000 (API), 5173 (web)

## Docker Compose (full)
- `docker-compose.yml` adds `python-ai` and production-like env vars.
- Healthchecks for Postgres, Redis, Node API, and AI service.
- Environment variables include `PYTHON_AI_URL`, `OLLAMA_BASE_URL`, DB and Redis settings.

## Terraform (AWS)
- VPC with public/private/database subnets
- ALB with listeners and path-based routing: `/api/*` -> API, `/ai/*` -> AI
- ECS Fargate cluster/services (API, Web, AI)
- RDS PostgreSQL 15 with KMS encryption
- ElastiCache Redis cluster
- S3 buckets: app, logs, backups
- WAF (managed rules + rate limit)
- ACM TLS certificates
- CloudWatch log groups and alarms (CPU/memory/DB)
- KMS key and aliases
- SNS alerts subscriptions

## Variables
See `terraform/variables.tf` for adjustable params (CPU/memory, scaling, env, domains, emails, etc.).

## CI/CD
- Recommend GitHub Actions for build/test/deploy; not included in repo.

## Environments
- `environment` variable controls `dev|staging|production` behaviors.
