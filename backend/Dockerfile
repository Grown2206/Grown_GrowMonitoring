# Grow Monitoring System - Backend Dockerfile

FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm ci --only=production

# Source-Code kopieren
COPY . .

# Build (TypeScript kompilieren)
RUN npm run build

# Port freigeben
EXPOSE 3001

# Health-Check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start
CMD ["npm", "run", "start:prod"]
