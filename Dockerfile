# Stage 1: Build contract and Nuxt application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native modules if needed
RUN apk add --no-cache python3 make g++ git

# Copy package configuration
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy codebase
COPY . .

# Compile Solidity contracts to generate ABIs & Bytecode
RUN npm run compile

# Build the Nuxt 3 SPA/Universal Application
RUN npm run build

# Stage 2: Production release
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/db ./db
COPY --from=builder /app/artifacts_contract ./artifacts_contract

# Install only production dependencies
RUN npm ci --only=production

# Expose Nuxt application port
EXPOSE 3000

# Start Nuxt Nitro Production Server
CMD ["node", ".output/server/index.mjs"]
