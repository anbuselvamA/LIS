# Freelancerz Enterprise LIS

## Purpose
The Freelancerz Enterprise Laboratory Information System (LIS) is a production-grade healthcare application designed for hospitals and diagnostic laboratories. It manages patient records, laboratory samples, billing, and report generation using scalable enterprise patterns.

## Technology Stack
- **Monorepo**: pnpm workspaces
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Desktop**: Electron (planned)
- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Cloud/Auth/Storage**: Supabase
- **ORM**: Prisma
- **Containerization**: Docker

## Folder Structure
- `apps/`: Contains deployable applications (e.g., `frontend`, `backend`).
- `packages/`: Contains shared libraries, configurations, and API contracts.
- `docs/`: System documentation and architecture decision records (ADRs).
- `docker/`: Dockerfiles and docker-compose configurations for multi-environment deployments.
- `scripts/`: Custom CI/CD and utility scripts.
- `.github/`: GitHub Actions workflows and templates.
