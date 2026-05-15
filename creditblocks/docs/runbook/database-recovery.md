# Database Recovery Runbook

## Backup Procedures

### Automated Backups

Backups are automatically created via Kubernetes CronJob:

```yaml
# Runs daily at 2 AM
schedule: "0 2 * * *"
```

### Manual Backup

```bash
# Create backup
kubectl exec -it postgres-pod -- pg_dump -U creditblocks creditblocks > backup-$(date +%Y%m%d).sql

# Compress backup
gzip backup-$(date +%Y%m%d).sql
```

### Backup Verification

```bash
# Verify backup file
pg_restore --list backup.sql | head -20

# Test restore (to temporary database)
createdb creditblocks_test
psql creditblocks_test < backup.sql
```

## Restore Procedures

### Full Database Restore

```bash
# Stop application
kubectl scale deployment/backend --replicas=0 -n creditblocks-prod

# Restore database
kubectl exec -i postgres-pod -- psql -U creditblocks creditblocks < backup.sql

# Verify restore
kubectl exec -it postgres-pod -- psql -U creditblocks -c "
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM scores;
"

# Restart application
kubectl scale deployment/backend --replicas=3 -n creditblocks-prod
```

### Point-in-Time Recovery (PITR)

If WAL archiving is enabled:

```bash
# Identify recovery point
RECOVERY_TIME="2024-01-15 14:30:00"

# Create recovery.conf
cat > recovery.conf << EOF
restore_command = 'cp /wal_archive/%f %p'
recovery_target_time = '$RECOVERY_TIME'
EOF

# Copy to postgres pod
kubectl cp recovery.conf postgres-pod:/var/lib/postgresql/data/

# Restart postgres (will enter recovery mode)
kubectl delete pod postgres-pod -n creditblocks-prod
```

### Table-Level Restore

```bash
# Restore specific table
kubectl exec -i postgres-pod -- psql -U creditblocks creditblocks << EOF
DROP TABLE IF EXISTS scores CASCADE;
\i backup-scores-only.sql
EOF
```

## Disaster Recovery

### Complete Database Loss

**Scenario**: Database pod deleted, volumes lost

**Recovery Steps:**

1. **Restore from S3 Backup**
   ```bash
   # Download latest backup from S3
   aws s3 cp s3://creditblocks-backups/latest/backup.sql.gz .
   gunzip backup.sql.gz
   
   # Create new database
   kubectl apply -f k8s/base/postgres-statefulset.yaml
   
   # Wait for pod to be ready
   kubectl wait --for=condition=ready pod/postgres-0 -n creditblocks-prod
   
   # Restore database
   kubectl exec -i postgres-0 -- psql -U creditblocks creditblocks < backup.sql
   ```

2. **Run Migrations**
   ```bash
   kubectl run alembic-migration \
     --image=creditblocks/backend:latest \
     --restart=Never \
     --command -- alembic upgrade head
   ```

3. **Verify Data**
   ```bash
   kubectl exec -it postgres-0 -- psql -U creditblocks -c "
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM scores;
   SELECT MAX(created_at) FROM transactions;
   "
   ```

### Data Corruption

**Symptoms:**
- Checksum errors
- Inconsistent data
- Query failures

**Recovery:**

1. **Identify Corrupted Tables**
   ```bash
   kubectl exec -it postgres-pod -- psql -U creditblocks -c "
   SELECT schemaname, tablename
   FROM pg_tables
   WHERE schemaname = 'public';
   "
   ```

2. **Restore from Backup**
   ```bash
   # Restore specific table
   pg_restore -t scores backup.sql | \
     kubectl exec -i postgres-pod -- psql -U creditblocks creditblocks
   ```

3. **Verify Integrity**
   ```bash
   kubectl exec -it postgres-pod -- psql -U creditblocks -c "
   REINDEX DATABASE creditblocks;
   VACUUM ANALYZE;
   "
   ```

## Migration Rollback

### Rollback Database Migration

```bash
# List migration history
kubectl exec -it backend-pod -- alembic history

# Rollback to previous version
kubectl exec -it backend-pod -- alembic downgrade -1

# Rollback to specific version
kubectl exec -it backend-pod -- alembic downgrade <revision>
```

### Verify Rollback

```bash
# Check current version
kubectl exec -it backend-pod -- alembic current

# Verify schema
kubectl exec -it postgres-pod -- psql -U creditblocks -c "\d"
```

## Maintenance Procedures

### Vacuum and Analyze

```bash
# Run VACUUM
kubectl exec -it postgres-pod -- psql -U creditblocks -c "VACUUM ANALYZE;"

# Vacuum specific table
kubectl exec -it postgres-pod -- psql -U creditblocks -c "VACUUM ANALYZE scores;"
```

### Reindex Database

```bash
# Reindex all
kubectl exec -it postgres-pod -- psql -U creditblocks -c "REINDEX DATABASE creditblocks;"

# Reindex specific table
kubectl exec -it postgres-pod -- psql -U creditblocks -c "REINDEX TABLE scores;"
```

### Check Database Health

```bash
# Check database size
kubectl exec -it postgres-pod -- psql -U creditblocks -c "
SELECT pg_size_pretty(pg_database_size('creditblocks'));
"

# Check table bloat
kubectl exec -it postgres-pod -- psql -U creditblocks -c "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## Backup Retention

### Retention Policy

- **Daily backups**: Kept for 30 days
- **Weekly backups**: Kept for 12 weeks
- **Monthly backups**: Kept for 12 months
- **Yearly backups**: Kept indefinitely

### Backup Locations

- **Primary**: S3 bucket `creditblocks-backups`
- **Secondary**: Local storage (if configured)
- **Archive**: Glacier for long-term storage

## Testing Recovery

### Regular Testing

Test restore procedures monthly:

1. Create test database
2. Restore from backup
3. Verify data integrity
4. Test application connectivity
5. Document any issues

### Test Script

```bash
#!/bin/bash
# Test database restore

BACKUP_FILE="backup-$(date +%Y%m%d).sql"
TEST_DB="creditblocks_test"

# Create test database
createdb $TEST_DB

# Restore backup
psql $TEST_DB < $BACKUP_FILE

# Verify
psql $TEST_DB -c "SELECT COUNT(*) FROM users;"
psql $TEST_DB -c "SELECT COUNT(*) FROM scores;"

# Cleanup
dropdb $TEST_DB
```

