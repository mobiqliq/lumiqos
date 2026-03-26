# LumiqOS

LumiqOS — an AI-powered operating system for modern schools that manages operations, learning analytics, finance, communication, and academic intelligence.

## Architecture

This is a multi-tenant SaaS platform built on a modular microservices architecture with a mobile-first user experience.

### Core Structure

- \`backend/\` - Node.js (NestJS) microservices for business logic and data access
  - \`api-gateway\` - Main entry point for client requests
  - \`auth-service\` - Authentication and authorization (RBAC)
  - \`school-service\` - Tenant Management and basic school operations
  - \`user-service\` - User profiles and directories
- \`frontend/\` - Next.js + React web applications
  - \`admin-dashboard\`
  - \`teacher-app-web\`
- \`mobile/\` - React Native applications
  - \`parent-app\`
  - \`teacher-app\`
- \`ai-services/\` - Python (FastAPI) services for AI capabilities
  - \`analytics-engine\`
  - \`curriculum-engine\`
- \`infrastructure/\` - Docker and Kubernetes configurations for deployment
- \`docs/\` - Project documentation

## Technologies
- **Backend**: Node.js with NestJS
- **Database**: PostgreSQL
- **Queue System**: Redis with BullMQ
- **Web Frontend**: Next.js + React
- **Mobile Apps**: React Native
- **AI Services**: Python microservices (FastAPI)
- **Infrastructure**: Docker & Kubernetes
