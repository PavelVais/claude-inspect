# Deploy

Deploy the application to the specified environment.

## Usage
```
/deploy              # Deploy to staging
/deploy production   # Deploy to production (requires confirmation)
/deploy rollback     # Rollback to previous version
```

## What it does
1. Runs the full test suite to verify build integrity
2. Builds Docker images with the current git SHA tag
3. Pushes images to the container registry
4. Updates Kubernetes deployment manifests
5. Applies rolling update to the target cluster
6. Runs post-deployment health checks
7. Notifies the team via Slack on success or failure
