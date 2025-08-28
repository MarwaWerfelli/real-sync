# Docker Setup for Real-Sync

This guide explains how to use Docker with your Real-Sync application.

## 🚀 Quick Start

### Development

```bash
# Start development environment
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production

```bash
# Build and start production
docker-compose -f docker-compose.prod.yml up --build -d

# Scale to multiple instances
docker-compose -f docker-compose.prod.yml up --scale app=3 -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## 🐳 Docker Commands

### Build Images

```bash
# Development image
docker build -f Dockerfile.dev -t real-sync:dev .

# Production image
docker build -f Dockerfile -t real-sync:prod .
```

### Run Containers

```bash
# Development
docker run -p 3000:3000 -v $(pwd):/app real-sync:dev

# Production
docker run -p 3000:3000 real-sync:prod
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Health Checks

The Docker setup includes health checks that use your health endpoints:

- **Development**: `/api/health/ping` (basic liveness)
- **Production**: `/api/health/ready` (comprehensive readiness)

## 📊 Monitoring

### Container Health

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# View health check logs
docker inspect --format='{{json .State.Health}}' container_name
```

### Resource Usage

```bash
# Monitor resource usage
docker stats

# View container details
docker inspect container_name
```

## 🚀 Deployment

### Single Server

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Load Balancer

```bash
# Scale horizontally
docker-compose -f docker-compose.prod.yml up --scale app=3 -d

# Use with nginx or traefik for load balancing
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Change port mapping in docker-compose.yml
2. **Build failures**: Check Dockerfile and .dockerignore
3. **Health check failures**: Verify health endpoints are working

### Debug Commands

```bash
# Enter running container
docker exec -it container_name sh

# View container logs
docker logs container_name

# Check container health
docker inspect container_name | grep Health -A 10
```

## 🔒 Security

### Best Practices

- Use non-root user (already configured)
- Keep base images updated
- Scan images for vulnerabilities
- Use secrets management for sensitive data

### Production Security

```bash
# Run security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image real-sync:prod
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Reference](https://docs.docker.com/compose/)
