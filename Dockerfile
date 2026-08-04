# ==========================================
# Stage 1: Build Frontend (React + Vite/TS)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Backend (Go Web Server)
# ==========================================
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app

# Install git and build essentials if needed
RUN apk add --no-cache git

COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Build lightweight Go binary with embedded static files
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o git-workspace-explorer .

# ==========================================
# Stage 3: Final Lightweight Runtime Image
# ==========================================
FROM alpine:latest

# Install Git & CA Certificates in runtime container
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

COPY --from=backend-builder /app/git-workspace-explorer /app/git-workspace-explorer

# Default workspace directory inside container (mount host path here)
ENV WORKSPACE_DIR=/workspaces
ENV PORT=8080

EXPOSE 8080

CMD ["/app/git-workspace-explorer"]
