# HIPAA Readiness Checklist (high-level)

This checklist outlines steps and artifacts needed to move the BioVerse backend toward HIPAA readiness.

## Administrative Safeguards
- [ ] Designate a HIPAA Security Officer and Privacy Officer.
- [ ] Document policies for access control, incident response, and data retention.
- [ ] Maintain Business Associate Agreements (BAAs) with vendors (e.g., cloud providers).

## Physical Safeguards
- [ ] Secure data center / cloud region geo-location controls.
- [ ] Device management policies for mobile devices and endpoints.

## Technical Safeguards
- [ ] Encrypt PHI at rest (database encryption) and in transit (TLS everywhere).
- [ ] Implement role-based access control (RBAC) and least privilege.
- [ ] Maintain detailed audit logs (who accessed what and when).
- [ ] Use secure key management (KMS / Vault) for secrets.
- [ ] Regular vulnerability scanning and penetration testing.

## Policies & Procedures
- [ ] Incident response plan and breach notification procedures.
- [ ] Employee training on PHI handling and security best practices.
- [ ] Data retention and deletion policy (e.g., how long PHI is stored).

## Documentation & Evidence
- [ ] System inventory and data flow diagrams.
- [ ] Risk assessments and remediation plans.
- [ ] Audit logs and access reports for a defined period.

## Next Steps (practical)
1. Replace any hardcoded secrets in code with env variables and move them to a secrets store.
2. Ensure non-production environments do not contain real PHI.
3. Configure DB encryption and enable TLS in production.
4. Schedule a third-party penetration test and act on findings.

