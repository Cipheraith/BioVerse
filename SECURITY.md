# Security Policy

## Reporting Security Vulnerabilities

**IMPORTANT**: Do not open public issues for security vulnerabilities.

- **Email**: security@bioverse.com
- **Response Time**: We aim to respond within 48 hours
- **Disclosure**: Coordinated disclosure after patch is available

## Supported Versions

Security fixes target the `main` and `develop` branches.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures

### Authentication & Authorization
- ✅ JWT-based authentication with required secret validation
- ✅ Rate limiting on authentication endpoints (5 requests per 15 minutes)
- ✅ Input validation on all auth routes
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt

### API Security
- ✅ Helmet.js for security headers
- ✅ Content Security Policy (CSP) without unsafe directives
- ✅ CORS configuration with whitelisted origins
- ✅ Request size limits (10MB)
- ✅ API key validation for Python AI service

### Data Protection
- ✅ Environment variables for sensitive configuration
- ✅ PostgreSQL parameterized queries (SQL injection prevention)
- ✅ TLS/HTTPS encryption in transit
- ⚠️ Encryption at rest (configure in production)

### Infrastructure Security
- ✅ Docker container isolation
- ✅ Principle of least privilege
- ✅ Regular dependency scanning
- ✅ CodeQL security analysis
- ✅ Container image scanning with Trivy

## Security Checklist

### Before Deployment
- [ ] Rotate all default passwords and secrets
- [ ] Generate strong JWT_SECRET (256-bit minimum)
- [ ] Configure environment-specific API keys
- [ ] Enable HTTPS/TLS certificates
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure database connection encryption
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting
- [ ] Review and update CORS whitelist
- [ ] Disable debug mode in production
- [ ] Complete HIPAA compliance checklist (healthcare data)

### Secrets Management
- **NEVER** commit secrets to git
- Use `.env` files (gitignored)
- Rotate credentials immediately if exposed
- Use secrets management systems:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Secret Manager

### Known Security Fixes Applied
1. ✅ Removed `unsafe-inline` and `unsafe-eval` from CSP
2. ✅ JWT_SECRET validation enforced (server fails without it)
3. ✅ API key validation in Python AI service
4. ✅ Auth route input validation and rate limiting
5. ✅ Parameterized database queries throughout

### Ongoing Security Tasks
- Regular dependency updates (`npm audit`, `safety check`)
- Security scanning in CI/CD pipeline
- Penetration testing (recommended quarterly)
- Security training for development team
- Incident response plan maintenance

## HIPAA Compliance Notes

As a healthcare application, BioVerse must comply with HIPAA regulations:

### Technical Safeguards Required
- [ ] Unique user identification
- [ ] Emergency access procedure
- [ ] Automatic logoff
- [ ] Encryption and decryption
- [ ] Audit controls
- [ ] Integrity controls
- [ ] Person or entity authentication
- [ ] Transmission security

### Administrative Safeguards Required
- [ ] Security management process
- [ ] Assigned security responsibility
- [ ] Workforce security
- [ ] Information access management
- [ ] Security awareness and training
- [ ] Security incident procedures
- [ ] Contingency plan
- [ ] Business associate contracts

### Physical Safeguards Required
- [ ] Facility access controls
- [ ] Workstation use
- [ ] Workstation security
- [ ] Device and media controls

**Note**: Complete HIPAA compliance documentation in `server/docs/HIPAA_CHECKLIST.md`

## Security Best Practices

### For Developers
1. **Never** hardcode credentials or API keys
2. Always use parameterized queries
3. Validate and sanitize all user inputs
4. Follow principle of least privilege
5. Keep dependencies up to date
6. Review code for security issues before committing
7. Use security linters (ESLint security plugin, Bandit)
8. Write security tests for critical paths

### For DevOps
1. Enable automatic security updates
2. Use container image scanning
3. Implement network segmentation
4. Set up intrusion detection systems
5. Regular backup and disaster recovery testing
6. Monitor security logs and alerts
7. Implement rate limiting and DDoS protection
8. Use secure defaults for all configurations

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Initial response and triage
3. **Day 3-7**: Develop and test fix
4. **Day 8-14**: Deploy fix to production
5. **Day 15+**: Public disclosure (coordinated with reporter)

## Security Tools in Use

- **Static Analysis**: CodeQL, ESLint, Bandit
- **Dependency Scanning**: npm audit, Safety, Dependabot
- **Container Scanning**: Trivy
- **Secret Scanning**: TruffleHog
- **Runtime Protection**: Helmet.js, express-rate-limit
- **Authentication**: JWT, bcrypt

## Contact

For security concerns: security@bioverse.com

---

Last updated: January 2026

