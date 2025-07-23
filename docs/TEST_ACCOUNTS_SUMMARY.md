# BioVerse Test Accounts Summary

## 🔐 Test Accounts for Role-Based Dashboard Testing

All accounts use the password: **demo123**

### Admin Account
- **Email:** admin@test.com
- **Password:** demo123
- **Role:** admin
- **Name:** Admin User
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTMxNzY5NjEsImV4cCI6MTc1MzI2MzM2MX0.01w990Xn07zOEwL4aQrJz2qXycKB7eGFrVgJdEwRk2Y`
- **Access:** Full system access, all dashboards, revenue analytics, user management

### Patient Account
- **Email:** patient@bioverse.demo
- **Password:** demo123
- **Role:** patient
- **Name:** Sarah Johnson
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInVzZXJuYW1lIjoicGF0aWVudEBiaW92ZXJzZS5kZW1vIiwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTMxNzczNjAsImV4cCI6MTc1MzI2Mzc2MH0.wiqBNwMBx1BZ1TmrBnpQduqbnrvnkGC7EjcMDtizCe8`
- **Access:** Personal health twin, own medical records, appointment booking

### Health Worker Account
- **Email:** healthworker@bioverse.demo
- **Password:** demo123
- **Role:** health_worker
- **Name:** Dr. Michael Chen
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInVzZXJuYW1lIjoiaGVhbHRod29ya2VyQGJpb3ZlcnNlLmRlbW8iLCJyb2xlIjoiaGVhbHRoX3dvcmtlciIsImlhdCI6MTc1MzE3NzM5NywiZXhwIjoxNzUzMjYzNzk3fQ.gzzDkHwXgXk_YW_W30siyEd-SvvTqBxhGMi7yVAFoco`
- **Access:** Patient management, health twins, appointments, telemedicine

### Ministry of Health Account
- **Email:** moh@bioverse.demo
- **Password:** demo123
- **Role:** moh
- **Name:** Dr. Amina Hassan
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInVzZXJuYW1lIjoibW9oQGJpb3ZlcnNlLmRlbW8iLCJyb2xlIjoibW9oIiwiaWF0IjoxNzUzMTc3NDIyLCJleHAiOjE3NTMyNjM4MjJ9.HTGaM3JBOfoIQsrs4pZw_5muGMbJcYq8cbwznXg1KVM`
- **Access:** National health overview, system performance, policy management

### Compliance Officer Account
- **Email:** compliance@bioverse.demo
- **Password:** demo123
- **Role:** compliance_officer
- **Name:** James Wilson
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsInVzZXJuYW1lIjoiY29tcGxpYW5jZUBiaW92ZXJzZS5kZW1vIiwicm9sZSI6ImNvbXBsaWFuY2Vfb2ZmaWNlciIsImlhdCI6MTc1MzE3NzQzNywiZXhwIjoxNzUzMjYzODM3fQ.xnEcogCMzk0-HQf0Dap3dVMQoX4U26qr_fzf_gUG4do`
- **Access:** Compliance overview, audit logs, privacy management

### Ambulance Driver Account
- **Email:** ambulance@bioverse.demo
- **Password:** demo123
- **Role:** ambulance_driver
- **Name:** Robert Martinez
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsInVzZXJuYW1lIjoiYW1idWxhbmNlQGJpb3ZlcnNlLmRlbW8iLCJyb2xlIjoiYW1idWxhbmNlX2RyaXZlciIsImlhdCI6MTc1MzE3NzQ1MCwiZXhwIjoxNzUzMjYzODUwfQ.cLAQmGdzXX-ppl6Be9fM3e11SS9W1UyFV0M3DOmEsT4`
- **Access:** Location services, emergency calls, patient transport

### Security Officer Account
- **Email:** security@bioverse.demo
- **Password:** demo123
- **Role:** security_officer
- **Name:** Lisa Parker
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInVzZXJuYW1lIjoic2VjdXJpdHlAYmlvdmVyc2UuZGVtbyIsInJvbGUiOiJzZWN1cml0eV9vZmZpY2VyIiwiaWF0IjoxNzUzMTc3NDYzLCJleHAiOjE3NTMyNjM4NjN9.dwaxTQ0S_AHN7QK855vwFKeSuNAxZFsfrKQgbEb1Vo0`
- **Access:** Security assessments, incident management, threat monitoring

### Enterprise Account
- **Email:** enterprise@bioverse.demo
- **Password:** demo123
- **Role:** enterprise
- **Name:** David Kim
- **Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoiZW50ZXJwcmlzZUBiaW92ZXJzZS5kZW1vIiwicm9sZSI6ImVudGVycHJpc2UiLCJpYXQiOjE3NTMxNzc0NzYsImV4cCI6MTc1MzI2Mzg3Nn0.TasyL5CVatAwGhODnMSdKewwFJbtiSQHbHsZgsYAAoU`
- **Access:** White-label solutions, API marketplace, enterprise integrations

## 🧪 Testing Dashboard Endpoints

### Revenue Analytics (Admin only)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
http://localhost:3000/api/billing/revenue/analytics
```

### User Feedback Analytics (Admin only)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
http://localhost:3000/api/feedback/analytics
```

### API Marketplace Analytics (Admin only)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
http://localhost:3000/api/marketplace/analytics/usage
```

### Mobile App Analytics (Admin only)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
http://localhost:3000/api/mobile/analytics
```

### Compliance Overview (Admin/Compliance Officer)
```bash
curl -H "Authorization: Bearer COMPLIANCE_TOKEN" \
http://localhost:3000/api/compliance/overview
```

### Patient Health Twin (All roles for their patients)
```bash
curl -H "Authorization: Bearer HEALTH_WORKER_TOKEN" \
http://localhost:3000/api/patients/1/health-twin
```

## 🎯 Digital Twin Testing

For comprehensive digital twin testing, create patient records using the Health Worker account, then test health twin generation for different scenarios:

1. **Chronic Disease Management** - Diabetes, Hypertension patients
2. **Pregnancy Monitoring** - Maternal health tracking
3. **Emergency Care** - Acute condition analysis
4. **Preventive Care** - Risk assessment and predictions

## 📊 Dashboard Access Matrix

| Role | Billing | Feedback | Marketplace | Mobile | Compliance | Health Twins | Patients |
|------|---------|----------|-------------|---------|------------|--------------|----------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Health Worker | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| MOH | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Patient | ❌ | Own only | ❌ | Own only | ❌ | Own only | Own only |
| Compliance Officer | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Security Officer | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Enterprise | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🔑 Login Endpoints

### Login (Get fresh token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "demo123"}'
```

### User Profile
```bash
curl -H "Authorization: Bearer TOKEN" \
http://localhost:3000/api/auth/me
```

All tokens are valid for 24 hours. Use these accounts to test role-based access control and dashboard functionality comprehensively.
