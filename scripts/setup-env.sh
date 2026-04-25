#!/bin/bash
# XceliQOS — First-time secrets setup
# Run once per environment: bash scripts/setup-env.sh
# Safe to re-run — will not overwrite existing .env files.

set -e

SERVICES=(
  "backend/auth-service"
  "backend/school-service"
  "backend/ai-service"
  "backend/api-gateway"
)

echo "XceliQOS — Environment Setup"
echo "=============================="

for dir in "${SERVICES[@]}"; do
  src="$dir/.env.example"
  dst="$dir/.env"
  if [ -f "$dst" ]; then
    echo "SKIP: $dst already exists"
  else
    cp "$src" "$dst"
    echo "CREATED: $dst (fill in CHANGE_ME values before starting)"
  fi
done

echo ""
echo "Next steps:"
echo "  1. Fill in all CHANGE_ME values in each .env file"
echo "  2. Generate JWT_SECRET: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo "  3. JWT_SECRET must be identical in: auth-service, school-service, api-gateway"
echo "  4. NEVER commit .env files — they are in .gitignore"
echo "  5. Run: docker compose up -d"
