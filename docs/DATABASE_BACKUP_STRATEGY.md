# Database Backup & Recovery Strategy

Comprehensive backup and recovery strategy for BioVerse PostgreSQL database.

## Table of Contents

- [Overview](#overview)
- [Backup Strategy](#backup-strategy)
- [Backup Types](#backup-types)
- [Implementation](#implementation)
- [Recovery Procedures](#recovery-procedures)
- [Monitoring & Testing](#monitoring--testing)
- [Best Practices](#best-practices)

---

## Overview

### Backup Objectives

- **RPO (Recovery Point Objective)**: Maximum 1 hour data loss
- **RTO (Recovery Time Objective)**: Maximum 4 hours downtime
- **Retention**: 30 days for daily backups, 90 days for monthly
- **Storage**: Multi-region with encryption at rest

### Critical Data

- Patient health records
- Digital twin states
- Medical images and reports
- Audit logs
- User authentication data
- Appointment and consultation history

---

## Backup Strategy

### Three-Tier Backup Approach

1. **Continuous Backups** (Point-in-Time Recovery)
   - PostgreSQL WAL (Write-Ahead Logging)
   - Every transaction logged
   - Retention: 7 days

2. **Automated Daily Backups**
   - Full database dumps
   - Scheduled at 2 AM UTC (low traffic)
   - Retention: 30 days

3. **Weekly/Monthly Archives**
   - Complete system snapshots
   - Retention: Weekly (90 days), Monthly (1 year)
   - Compliance and long-term recovery

---

## Backup Types

### 1. Logical Backups (pg_dump)

**Use Case**: Full database backup, migrations, version upgrades

**Advantages**:
- Human-readable SQL format
- Portable across PostgreSQL versions
- Selective restore (tables, schemas)

**Script**: `scripts/backup-logical.sh`

```bash
#!/bin/bash
# Logical backup using pg_dump

BACKUP_DIR="/var/backups/bioverse/logical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${DB_NAME:-bioverse_zambia_db}"
DB_USER="${DB_USER:-bioverse_admin}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
pg_dump -U "$DB_USER" \
        -h "$DB_HOST" \
        -d "$DB_NAME" \
        --format=custom \
        --compress=9 \
        --file="$BACKUP_DIR/bioverse_${TIMESTAMP}.dump"

# Verify backup
pg_restore --list "$BACKUP_DIR/bioverse_${TIMESTAMP}.dump" > /dev/null
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Backup successful: bioverse_${TIMESTAMP}.dump"
    
    # Upload to S3 or cloud storage
    aws s3 cp "$BACKUP_DIR/bioverse_${TIMESTAMP}.dump" \
              "s3://bioverse-backups/logical/${TIMESTAMP}/" \
              --storage-class STANDARD_IA
    
    # Clean up old backups (keep 30 days)
    find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
else
    echo "Backup failed!" >&2
    exit 1
fi
```

### 2. Physical Backups (pg_basebackup)

**Use Case**: Disaster recovery, standby server setup

**Advantages**:
- Faster backup and restore
- Exact copy of data directory
- Suitable for large databases

**Script**: `scripts/backup-physical.sh`

```bash
#!/bin/bash
# Physical backup using pg_basebackup

BACKUP_DIR="/var/backups/bioverse/physical"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

pg_basebackup -U "$DB_USER" \
              -h "$DB_HOST" \
              -D "$BACKUP_DIR/base_${TIMESTAMP}" \
              --format=tar \
              --gzip \
              --progress \
              --checkpoint=fast

if [ $? -eq 0 ]; then
    echo "Physical backup successful"
    
    # Upload to cloud storage
    aws s3 sync "$BACKUP_DIR/base_${TIMESTAMP}" \
                "s3://bioverse-backups/physical/${TIMESTAMP}/"
else
    echo "Physical backup failed!" >&2
    exit 1
fi
```

### 3. Continuous Archiving (WAL)

**Setup**: Configure PostgreSQL for continuous archiving

**postgresql.conf**:
```conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://bioverse-backups/wal/%f'
archive_timeout = 300  # 5 minutes
```

**Benefits**:
- Point-in-Time Recovery (PITR)
- Minimal data loss (RPO < 5 minutes)
- Continuous protection

---

## Implementation

### Docker Environment

**docker-compose.yml** backup service:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bioverse_zambia_db
      POSTGRES_USER: bioverse_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  backup:
    image: postgres:15-alpine
    depends_on:
      - postgres
    environment:
      DB_HOST: postgres
      DB_NAME: bioverse_zambia_db
      DB_USER: bioverse_admin
      PGPASSWORD: ${DB_PASSWORD}
    volumes:
      - ./scripts:/scripts
      - ./backups:/backups
    command: |
      sh -c '
        while true; do
          echo "Running backup at $(date)"
          /scripts/backup-logical.sh
          sleep 86400  # Daily
        done
      '
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: bioverse-db-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: host
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
            volumeMounts:
            - name: backup-scripts
              mountPath: /scripts
            command: ["/scripts/backup-logical.sh"]
          volumes:
          - name: backup-scripts
            configMap:
              name: backup-scripts
          restartPolicy: OnFailure
```

### Automated Scheduling

**Cron job** (Linux/Unix):

```cron
# Daily backup at 2 AM
0 2 * * * /opt/bioverse/scripts/backup-logical.sh >> /var/log/bioverse/backup.log 2>&1

# Weekly physical backup on Sundays at 3 AM
0 3 * * 0 /opt/bioverse/scripts/backup-physical.sh >> /var/log/bioverse/backup.log 2>&1

# Monthly archive on 1st day at 4 AM
0 4 1 * * /opt/bioverse/scripts/backup-archive.sh >> /var/log/bioverse/backup.log 2>&1
```

---

## Recovery Procedures

### Full Database Restore

```bash
#!/bin/bash
# Restore from logical backup

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.dump>"
    exit 1
fi

# Stop application servers
echo "Stopping application..."
# docker-compose stop server

# Drop existing database (CAUTION!)
psql -U postgres -c "DROP DATABASE IF EXISTS bioverse_zambia_db;"
psql -U postgres -c "CREATE DATABASE bioverse_zambia_db OWNER bioverse_admin;"

# Restore backup
pg_restore -U bioverse_admin \
           -d bioverse_zambia_db \
           --verbose \
           --no-owner \
           --no-acl \
           "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Database restored successfully"
    # Restart application
    # docker-compose up -d server
else
    echo "Restore failed!" >&2
    exit 1
fi
```

### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# PITR to specific timestamp

TARGET_TIME="2026-01-31 12:00:00"  # Target recovery point
BACKUP_FILE="base_20260131_020000.tar.gz"

# Stop PostgreSQL
systemctl stop postgresql

# Clear data directory
rm -rf /var/lib/postgresql/15/main/*

# Extract base backup
tar -xzf "$BACKUP_FILE" -C /var/lib/postgresql/15/main/

# Create recovery.conf
cat > /var/lib/postgresql/15/main/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://bioverse-backups/wal/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL in recovery mode
systemctl start postgresql

# Monitor recovery
tail -f /var/log/postgresql/postgresql-15-main.log
```

### Selective Table Restore

```bash
#!/bin/bash
# Restore specific tables

BACKUP_FILE="bioverse_20260131.dump"
TABLE_NAME="users"

pg_restore -U bioverse_admin \
           -d bioverse_zambia_db \
           --table="$TABLE_NAME" \
           --data-only \
           --verbose \
           "$BACKUP_FILE"
```

---

## Monitoring & Testing

### Backup Verification

**Automated verification script**:

```bash
#!/bin/bash
# Verify backup integrity

BACKUP_FILE="$1"

echo "Verifying backup: $BACKUP_FILE"

# Test restore to temporary database
createdb -U postgres bioverse_test
pg_restore -U postgres -d bioverse_test "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Backup verified successfully"
    
    # Count records
    RECORD_COUNT=$(psql -U postgres -d bioverse_test -t -c "SELECT COUNT(*) FROM users;")
    echo "User records: $RECORD_COUNT"
    
    # Drop test database
    dropdb -U postgres bioverse_test
    
    exit 0
else
    echo "❌ Backup verification failed!"
    exit 1
fi
```

### Monitoring Dashboard Metrics

- Backup success/failure rate
- Backup size trends
- Backup duration
- Storage usage
- Last successful backup timestamp
- Recovery drill test results

### Monthly Recovery Drills

**Schedule**: First Sunday of every month

**Procedure**:
1. Select random backup from previous month
2. Restore to test environment
3. Verify data integrity
4. Test application functionality
5. Document results and issues
6. Update procedures as needed

---

## Best Practices

### Security

- ✅ Encrypt backups at rest (AES-256)
- ✅ Encrypt backups in transit (TLS)
- ✅ Use separate credentials for backups
- ✅ Implement access controls on backup storage
- ✅ Audit backup access logs

### Storage

- ✅ Multi-region replication (AWS S3, Azure Blob, GCP Cloud Storage)
- ✅ Geographic distribution (primary + 2 secondary regions)
- ✅ Use appropriate storage classes:
  - Recent backups: Standard
  - 7-30 days: Standard-IA
  - 30-90 days: Glacier
  - 90+ days: Glacier Deep Archive

### Compliance

- ✅ HIPAA compliance for healthcare data
- ✅ 7-year retention for medical records
- ✅ Audit trail of all backup/restore operations
- ✅ Data sovereignty requirements
- ✅ Privacy regulations (GDPR, local laws)

### Documentation

- ✅ Maintain runbooks for recovery procedures
- ✅ Document backup schedules and retention
- ✅ Keep contact list for emergency escalation
- ✅ Regular training for operations team

### Automation

- ✅ Automate all backup procedures
- ✅ Automated backup verification
- ✅ Automatic alerting on failures
- ✅ Automated cleanup of old backups
- ✅ Self-healing where possible

---

## Disaster Recovery Scenarios

### Scenario 1: Database Corruption

**Impact**: Database becomes unreadable
**RTO**: 2-4 hours
**Procedure**: Full restore from most recent backup

### Scenario 2: Accidental Data Deletion

**Impact**: Critical records deleted
**RTO**: 1-2 hours
**Procedure**: Selective table restore or PITR

### Scenario 3: Complete Infrastructure Loss

**Impact**: Entire datacenter unavailable
**RTO**: 4-8 hours
**Procedure**: 
1. Provision new infrastructure
2. Restore from cloud backups
3. Update DNS
4. Verify data integrity

### Scenario 4: Ransomware Attack

**Impact**: Data encrypted by malware
**RTO**: 2-4 hours
**Procedure**:
1. Isolate affected systems
2. Restore from offline/immutable backups
3. Verify no compromise of backup systems
4. Security audit before resuming operations

---

## Cost Optimization

### Storage Lifecycle

```
0-7 days:    S3 Standard          ($0.023/GB/month)
7-30 days:   S3 Standard-IA       ($0.0125/GB/month)
30-90 days:  S3 Glacier           ($0.004/GB/month)
90+ days:    S3 Glacier Deep      ($0.00099/GB/month)
```

### Estimated Costs (100GB database)

- Daily backups (30 days): ~$50/month
- Monthly archives (12 months): ~$15/month
- WAL archiving (7 days): ~$20/month
- **Total**: ~$85/month

### Optimization Tips

- Compress backups (9x compression typical)
- Incremental backups where possible
- Automated lifecycle policies
- Regular cleanup of old backups
- Monitor storage usage trends

---

## Emergency Contacts

### Escalation Chain

1. **Database Admin** (Primary)
2. **DevOps Lead** (Secondary)
3. **CTO** (Emergency)
4. **Third-party Support** (Critical)

### 24/7 Support

- On-call rotation schedule
- PagerDuty integration
- Slack alerts (#alerts-critical)
- Email notifications

---

**Last Updated**: January 31, 2026  
**Version**: 1.0  
**Review Frequency**: Quarterly  
**Next Review**: April 30, 2026  
**Maintained By**: BioVerse DevOps Team
