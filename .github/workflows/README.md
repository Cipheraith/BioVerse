# GitHub Actions Workflows

This directory contains all CI/CD workflows for the BioVerse project.

## Workflows Overview

### 🔄 [ci.yml](./ci.yml) - Continuous Integration
**Purpose**: Automated testing, linting, and building  
**Triggers**: Push, Pull Request, Manual  
**Key Jobs**:
- Lint (Client, Server, Python)
- Build (Client, Server)
- Test (All services)
- Docker Build
- Integration Tests

**Status**: ✅ Active  
**Frequency**: On every push/PR

---

### 🔒 [security.yml](./security.yml) - Security Scanning
**Purpose**: Comprehensive security vulnerability detection  
**Triggers**: Push, Pull Request, Daily (2 AM UTC), Manual  
**Key Jobs**:
- CodeQL Analysis (JavaScript, Python)
- Dependency Scanning (npm audit, Safety)
- Secret Scanning (TruffleHog)
- Container Scanning (Trivy)
- License Compliance

**Status**: ✅ Active  
**Frequency**: Daily + On push/PR

---

### 📊 [quality.yml](./quality.yml) - Code Quality
**Purpose**: Code quality metrics and analysis  
**Triggers**: Push, Pull Request, Manual  
**Key Jobs**:
- Code Coverage
- Code Complexity Analysis
- Dead Code Detection
- Documentation Quality
- Performance Benchmarks
- Dependency Health

**Status**: ✅ Active  
**Frequency**: On every push/PR

---

### 🚀 [deploy.yml](./deploy.yml) - Deployment
**Purpose**: Automated deployment to environments  
**Triggers**: Push to main, Version tags, Manual  
**Key Jobs**:
- Build and Push Docker Images
- Deploy to Staging
- Deploy to Production
- Post-Deployment Checks
- Rollback (on failure)

**Status**: ✅ Active  
**Frequency**: On push to main (staging) / On version tags (production)

---

### 📝 [main.yml](./main.yml) - Legacy Validation
**Purpose**: Basic project structure validation  
**Status**: ⚠️ Legacy (being replaced by ci.yml)

---

## Quick Reference

### Running Workflows Manually

```bash
# Via GitHub CLI
gh workflow run ci.yml
gh workflow run security.yml
gh workflow run quality.yml
gh workflow run deploy.yml

# View runs
gh run list
gh run view <run-id>
```

### Status Badges

```markdown
![CI](https://github.com/Cipheraith/BioVerse/workflows/CI%20-%20Test%20and%20Build/badge.svg)
![Security](https://github.com/Cipheraith/BioVerse/workflows/Security%20Scanning/badge.svg)
![Quality](https://github.com/Cipheraith/BioVerse/workflows/Code%20Quality/badge.svg)
![Deploy](https://github.com/Cipheraith/BioVerse/workflows/CD%20-%20Deploy/badge.svg)
```

---

## Workflow Triggers Summary

| Workflow | Push | PR | Schedule | Manual |
|----------|------|-----|----------|--------|
| CI | ✅ | ✅ | ❌ | ✅ |
| Security | ✅ | ✅ | ✅ Daily | ✅ |
| Quality | ✅ | ✅ | ❌ | ✅ |
| Deploy | ✅ main | ❌ | ❌ | ✅ |

---

## Required Secrets

Configure in GitHub repository settings:

### Automatic
- `GITHUB_TOKEN` - Provided automatically

### Optional
- `SLACK_WEBHOOK_URL` - Deployment notifications
- `CODECOV_TOKEN` - Code coverage reporting
- `DOCKER_USERNAME` - Docker Hub (if used)
- `DOCKER_PASSWORD` - Docker Hub (if used)

---

## Environment Configuration

### Staging
- **URL**: https://staging.bioverse.health
- **Branch**: `main`
- **Auto-deploy**: Yes
- **Approval**: Not required

### Production
- **URL**: https://bioverse.health
- **Branch**: Tags (`v*.*.*`)
- **Auto-deploy**: No
- **Approval**: Required (2+ reviewers)

---

## Workflow Files Structure

```
.github/workflows/
├── ci.yml              # Continuous Integration
├── security.yml        # Security Scanning
├── quality.yml         # Code Quality
├── deploy.yml          # Deployment
├── main.yml           # Legacy validation
└── README.md          # This file
```

---

## Common Commands

### Check Workflow Status
```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

### Re-run Failed Workflows
```bash
# Re-run latest run
gh run rerun <run-id>

# Re-run only failed jobs
gh run rerun <run-id> --failed
```

### Cancel Running Workflow
```bash
gh run cancel <run-id>
```

---

## Performance Metrics

### Average Run Times
- **CI Pipeline**: ~8 minutes
- **Security Scan**: ~12 minutes
- **Quality Check**: ~6 minutes
- **Deployment**: ~5 minutes

### Success Rates (Target)
- **CI**: >95%
- **Security**: >90%
- **Quality**: >85%
- **Deploy**: >98%

---

## Troubleshooting

### CI Failures
1. Check logs: `gh run view <run-id> --log`
2. Verify tests pass locally: `npm test`
3. Check environment variables
4. Verify dependencies are up to date

### Security Scan Issues
1. Review CodeQL results in Security tab
2. Check dependency vulnerabilities: `npm audit`
3. Fix reported issues or create exceptions

### Deployment Failures
1. Check deployment logs
2. Verify Docker images built successfully
3. Check environment configuration
4. Run rollback if needed

---

## Documentation

- **Complete CI/CD Guide**: [docs/CI_CD.md](../docs/CI_CD.md)
- **Setup Guide**: [SETUP.md](../SETUP.md)
- **Security Policy**: [SECURITY.md](../SECURITY.md)
- **Issues Tracking**: [docs/ISSUES.md](../docs/ISSUES.md)

---

## Maintenance Schedule

### Weekly
- [ ] Review failed workflows
- [ ] Update dependencies
- [ ] Check security alerts

### Monthly
- [ ] Optimize workflow performance
- [ ] Update action versions
- [ ] Review and update this README

---

**Last Updated**: January 2026  
**Maintained By**: BioVerse DevOps Team  
**Questions?**: Create an issue or contact devops@bioverse.com
