# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.0+ (optional)
- Docker registry access

## Quick Start

### 1. Apply Base Manifests

```bash
kubectl apply -f k8s/base/ -n creditblocks-prod
```

### 2. Apply Environment Overlay

```bash
kubectl apply -k k8s/overlays/prod/ -n creditblocks-prod
```

### 3. Verify Deployment

```bash
kubectl get all -n creditblocks-prod
```

## Manual Deployment

### 1. Create Namespace

```bash
kubectl create namespace creditblocks-prod
```

### 2. Create Secrets

```bash
# Database
kubectl create secret generic postgres-secret \
  --from-literal=username=creditblocks \
  --from-literal=password=<password> \
  -n creditblocks-prod

# Redis
kubectl create secret generic redis-secret \
  --from-literal=password=<password> \
  -n creditblocks-prod

# API
kubectl create secret generic api-secrets \
  --from-literal=jwt-secret=<secret> \
  --from-literal=sentry-dsn=<dsn> \
  -n creditblocks-prod
```

### 3. Create ConfigMap

```bash
kubectl apply -f k8s/base/configmap.yaml -n creditblocks-prod
```

### 4. Deploy Applications

```bash
# Backend
kubectl apply -f k8s/base/backend-deployment.yaml -n creditblocks-prod
kubectl apply -f k8s/base/backend-service.yaml -n creditblocks-prod

# Frontend
kubectl apply -f k8s/base/frontend-deployment.yaml -n creditblocks-prod
kubectl apply -f k8s/base/frontend-service.yaml -n creditblocks-prod

# Workers
kubectl apply -f k8s/base/worker-deployment.yaml -n creditblocks-prod
```

### 5. Deploy Ingress

```bash
kubectl apply -f k8s/base/ingress.yaml -n creditblocks-prod
```

## Using Kustomize

### 1. Base Configuration

```bash
kubectl apply -k k8s/base/
```

### 2. Environment-Specific

```bash
# Development
kubectl apply -k k8s/overlays/dev/

# Staging
kubectl apply -k k8s/overlays/staging/

# Production
kubectl apply -k k8s/overlays/prod/
```

## Resource Management

### Resource Requests and Limits

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

### Horizontal Pod Autoscaling

```bash
kubectl apply -f k8s/base/hpa.yaml -n creditblocks-prod
```

## Database Setup

### External Database

If using managed PostgreSQL:

```yaml
# Update ConfigMap with external database URL
DATABASE_URL: postgresql://user:pass@host:5432/creditblocks
```

### Internal Database (StatefulSet)

```bash
kubectl apply -f k8s/base/postgres-statefulset.yaml -n creditblocks-prod
```

## Monitoring

### ServiceMonitor (Prometheus)

```bash
kubectl apply -f k8s/monitoring/servicemonitor.yaml -n creditblocks-prod
```

### Grafana Dashboards

```bash
kubectl apply -f k8s/monitoring/grafana-dashboard.yaml -n creditblocks-prod
```

## SSL/TLS

### Cert-Manager

```bash
# Install Cert-Manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/base/cluster-issuer.yaml

# Certificate is automatically created by ingress
```

## Updates and Rollouts

### Rolling Update

```bash
# Update image
kubectl set image deployment/backend backend=creditblocks/backend:v1.1.0 -n creditblocks-prod

# Monitor rollout
kubectl rollout status deployment/backend -n creditblocks-prod
```

### Rollback

```bash
kubectl rollout undo deployment/backend -n creditblocks-prod
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n creditblocks-prod
kubectl describe pod <pod-name> -n creditblocks-prod
```

### View Logs

```bash
kubectl logs -f deployment/backend -n creditblocks-prod
kubectl logs -f deployment/frontend -n creditblocks-prod
```

### Debug Container

```bash
kubectl exec -it deployment/backend -n creditblocks-prod -- bash
```

### Check Events

```bash
kubectl get events -n creditblocks-prod --sort-by='.lastTimestamp'
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment/backend --replicas=5 -n creditblocks-prod
```

### Auto-scaling

```bash
# Apply HPA
kubectl apply -f k8s/base/hpa.yaml -n creditblocks-prod

# Check HPA status
kubectl get hpa -n creditblocks-prod
```

## Backup and Restore

### Database Backup

```bash
# Create backup job
kubectl apply -f k8s/base/backup-job.yaml -n creditblocks-prod

# Manual backup
kubectl exec -it <postgres-pod> -n creditblocks-prod -- \
  pg_dump -U creditblocks creditblocks > backup.sql
```

### Restore Database

```bash
kubectl exec -i <postgres-pod> -n creditblocks-prod -- \
  psql -U creditblocks creditblocks < backup.sql
```

