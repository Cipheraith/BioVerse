# CI/CD Pipeline Documentation

Comprehensive documentation for BioVerse's Continuous Integration and Continuous Deployment pipelines.

## Overview

BioVerse uses GitHub Actions for automated CI/CD with four main workflow pipelines:

1. **CI (Continuous Integration)** - Build, test, and validate code
2. **Security** - Security scanning and vulnerability detection
3. **Quality** - Code quality metrics and analysis
4. **Deploy** - Automated deployment to staging and production

---

## Workflow Files

### 1. CI Pipeline (`ci.yml`)

**Purpose**: Automated testing, linting, and building for every push and pull request

**Triggers**:
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop`
- Manual workflow dispatch

**Jobs**:

#### Linting Jobs
- **lint-client**: ESLint + TypeScript type checking for React frontend
- **lint-server**: ESLint for Node.js backend
- **lint-python**: Black, isort, Flake8, and Bandit for Python AI service

#### Build Jobs
- **build-client**: Build React app with Vite, upload artifacts
- **build-server**: Run Node.js tests with PostgreSQL service
- **test-python**: Run Python tests with pytest

#### Integration
- **docker-build**: Build Docker images for all services
- **integration-test**: Test Docker Compose integration
- **ci-summary**: Generate comprehensive status report

**Key Features**:
- Parallel job execution for speed
- npm/pip/Docker layer caching
- PostgreSQL test database service
- Artifact uploading for debugging
- Comprehensive test coverage reports

**Example Run**:
```bash
# Triggered automatically on push, or manually:
gh workflow run ci.yml
```

---

### 2. Security Pipeline (`security.yml`)

**Purpose**: Comprehensive security scanning and vulnerability detection

**Triggers**:
- Push to `main`, `master`, or `develop` branches
- Pull requests to these branches
- Daily schedule (2 AM UTC)
- Manual workflow dispatch

**Jobs**:

#### CodeQL Analysis
- **codeql-analysis**: SAST for JavaScript and Python
  - Security and quality queries
  - Automatic vulnerability detection
  - Results uploaded to GitHub Security tab

#### Dependency Scanning
- **dependency-scan**: Vulnerability scanning for all dependencies
  - npm audit for JavaScript packages
  - Safety check for Python packages
  - Moderate severity threshold

#### Secret Scanning
- **secret-scan**: Detect exposed secrets in codebase
  - TruffleHog for secret detection
  - Scans entire git history
  - Only reports verified secrets

#### Container Scanning
- **container-scan**: Docker image vulnerability scanning
  - Trivy scanner for all service images
  - SARIF output to Security tab
  - Critical/High/Medium vulnerability detection

#### License Compliance
- **license-scan**: Open source license compliance
  - license-checker for npm packages
  - Summary reports for all services

**Security Scanning Schedule**:
```yaml
# Runs daily at 2 AM UTC
schedule:
  - cron: '0 2 * * *'
```

---

### 3. Code Quality Pipeline (`quality.yml`)

**Purpose**: Code quality metrics, coverage, and technical debt tracking

**Triggers**:
- Push to `main`, `master`, or `develop`
- Pull requests
- Manual dispatch

**Jobs**:

#### Code Coverage
- **code-coverage**: Test coverage analysis
  - Jest coverage for server
  - Upload to Codecov
  - Coverage thresholds enforcement

#### Code Complexity
- **code-complexity**: Cyclomatic complexity analysis
  - Identifies overly complex functions
  - Suggests refactoring opportunities

#### Dead Code Detection
- **dead-code-detection**: Unused code identification
  - ts-prune for TypeScript
  - Find TODO/FIXME comments
  - Identify unused exports

#### Documentation Check
- **documentation-check**: Documentation quality
  - Verify essential docs exist
  - Check API documentation
  - Ensure completeness

#### Performance Benchmarks
- **performance-check**: Performance testing
  - Quick performance test suite
  - Response time benchmarks
  - Resource usage monitoring

#### Dependency Health
- **dependency-health**: Package health monitoring
  - Check for outdated packages
  - Analyze package sizes
  - Dependency tree analysis

**Example Output**:
```
Code Coverage: 72%
Code Complexity: Acceptable
Dead Code: 3 unused exports found
Documentation: 95% complete
Performance: 99th percentile < 200ms
Dependencies: 5 outdated packages
```

---

### 4. Deployment Pipeline (`deploy.yml`)

**Purpose**: Automated deployment to staging and production environments

**Triggers**:
- Push to `main` or `master` (triggers staging)
- Git tags matching `v*.*.*` (triggers production)
- Manual workflow dispatch with environment selection

**Jobs**:

#### Build and Push
- **build-and-push**: Build Docker images and push to GHCR
  - Multi-platform builds
  - Layer caching for speed
  - Semantic versioning tags
  - Pushes to GitHub Container Registry

#### Staging Deployment
- **deploy-staging**: Deploy to staging environment
  - Triggered on push to main
  - Smoke tests after deployment
  - Environment URL: https://staging.bioverse.health

#### Production Deployment
- **deploy-production**: Deploy to production
  - Triggered on version tags (v1.0.0)
  - Requires manual approval (GitHub environment protection)
  - Production smoke tests
  - Deployment record creation
  - Environment URL: https://bioverse.health

#### Post-Deployment
- **post-deployment**: Post-deployment checks
  - Verify deployment status
  - Send notifications (Slack, email)
  - Health check monitoring

**Rollback**:
- **rollback**: Automatic rollback on failure
  - Reverts to previous version
  - Notifies team

**Example Deployment**:
```bash
# Deploy to staging (automatic on push to main)
git push origin main

# Deploy to production (create version tag)
git tag v1.0.0
git push origin v1.0.0

# Manual deployment
gh workflow run deploy.yml -f environment=staging
```

---

## Environment Configuration

### GitHub Secrets

Required secrets in GitHub repository settings:

```bash
# Container Registry (automatic)
GITHUB_TOKEN  # Automatically provided

# Optional: External Services
SLACK_WEBHOOK_URL      # For deployment notifications
CODECOV_TOKEN          # For code coverage reports
DOCKER_USERNAME        # If using Docker Hub
DOCKER_PASSWORD        # If using Docker Hub
AWS_ACCESS_KEY_ID      # If deploying to AWS
AWS_SECRET_ACCESS_KEY  # If deploying to AWS
```

### Environment Protection Rules

#### Staging Environment
- **Auto-deploy**: Yes
- **Required reviewers**: None
- **Wait timer**: 0 minutes
- **Deployment branches**: `main`, `develop`

#### Production Environment
- **Auto-deploy**: No
- **Required reviewers**: 2+ team members
- **Wait timer**: 0 minutes
- **Deployment branches**: Tags only (`v*.*.*`)

---

## Workflow Best Practices

### 1. Branching Strategy

```
main (production)
  └── develop (staging)
      └── feature/* (development)
      └── bugfix/* (bug fixes)
      └── hotfix/* (urgent fixes)
```

### 2. Commit Messages

Follow conventional commits:
```bash
feat: Add new health twin creation API
fix: Resolve authentication token expiry issue
docs: Update setup guide
test: Add integration tests for AI service
ci: Update security scanning workflow
```

### 3. Pull Request Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 3. Push and create PR
git push origin feature/new-feature

# 4. CI runs automatically
# - All checks must pass
# - Code review required
# - Merge when approved
```

### 4. Version Tagging

```bash
# Semantic Versioning: MAJOR.MINOR.PATCH
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# This triggers production deployment
```

---

## Monitoring and Alerts

### GitHub Actions Status

View workflow runs:
```bash
# Via CLI
gh run list --workflow=ci.yml
gh run view <run-id>

# Via GitHub UI
https://github.com/Cipheraith/BioVerse/actions
```

### Status Badges

Add to README:
```markdown
![CI](https://github.com/Cipheraith/BioVerse/workflows/CI%20-%20Test%20and%20Build/badge.svg)
![Security](https://github.com/Cipheraith/BioVerse/workflows/Security%20Scanning/badge.svg)
```

### Notifications

Configure in `.github/workflows/`:
```yaml
- name: Send Slack notification
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
    -H 'Content-Type: application/json' \
    -d '{"text":"Build failed: ${{ github.repository }}"}'
```

---

## Troubleshooting

### Common Issues

#### Issue: Workflow fails with "JWT_SECRET not set"
**Solution**: Tests need JWT_SECRET environment variable
```yaml
env:
  JWT_SECRET: test_jwt_secret_for_ci_only
```

#### Issue: Docker build runs out of memory
**Solution**: Increase Docker memory or optimize builds
```yaml
- name: Free disk space
  run: |
    docker system prune -af
    df -h
```

#### Issue: Tests fail intermittently
**Solution**: Add retries or increase timeouts
```yaml
- name: Run tests
  run: npm test
  timeout-minutes: 10
  continue-on-error: false
```

#### Issue: Cache not working
**Solution**: Verify cache keys are correct
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

---

## Performance Optimization

### 1. Caching

```yaml
# npm cache
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'

# pip cache
- uses: actions/setup-python@v4
  with:
    cache: 'pip'

# Docker layer cache
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### 2. Parallel Execution

```yaml
strategy:
  matrix:
    service: [client, server, python-ai]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test ${{ matrix.service }}
        run: cd ${{ matrix.service }} && npm test
```

### 3. Conditional Execution

```yaml
# Only run on specific paths
on:
  push:
    paths:
      - 'server/**'
      - '.github/workflows/ci.yml'

# Skip CI with commit message
if: "!contains(github.event.head_commit.message, '[skip ci]')"
```

---

## Security Best Practices

### 1. Secret Management

```yaml
# Use secrets, never hardcode
env:
  API_KEY: ${{ secrets.API_KEY }}

# Mask sensitive output
- name: Deploy
  run: |
    echo "::add-mask::$SECRET_VALUE"
```

### 2. Least Privilege

```yaml
permissions:
  contents: read      # Read-only by default
  packages: write     # Only when needed
  security-events: write  # For CodeQL
```

### 3. Dependency Pinning

```yaml
# Pin to specific versions
- uses: actions/checkout@v4.1.0  # Not @v4
- uses: docker/build-push-action@v5.1.0
```

---

## Metrics and KPIs

### CI/CD Metrics to Track

1. **Build Time**: Target < 10 minutes
2. **Test Coverage**: Target > 70%
3. **Security Vulnerabilities**: Zero critical
4. **Deployment Frequency**: Daily to staging
5. **Change Failure Rate**: < 15%
6. **Mean Time to Recovery**: < 1 hour
7. **Code Quality Score**: > 80/100

### Viewing Metrics

```bash
# GitHub CLI
gh run list --workflow=ci.yml --limit 10

# API
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/Cipheraith/BioVerse/actions/runs
```

---

## Maintenance

### Regular Tasks

#### Weekly
- [ ] Review failed workflows
- [ ] Update dependencies
- [ ] Check security scan results

#### Monthly
- [ ] Review and optimize workflows
- [ ] Update action versions
- [ ] Analyze build performance
- [ ] Review test coverage trends

#### Quarterly
- [ ] Security audit
- [ ] Performance benchmarking
- [ ] Workflow efficiency review
- [ ] Update CI/CD documentation

---

## Resources

### GitHub Actions Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### Tools Used
- [CodeQL](https://codeql.github.com/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [Codecov](https://codecov.io/)

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Maintained By**: BioVerse DevOps Team
