FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install

# Copy prisma schema (only what's needed for generation)
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpx prisma generate

# Now copy the rest of the application
COPY . .

EXPOSE 3000

# Create startup script - with explicit content
RUN printf '#!/bin/sh\nnpx prisma migrate deploy\npnpm start\n' > /app/start.sh
RUN chmod +x /app/start.sh
# Verify script is created correctly
RUN ls -la /app/start.sh && cat /app/start.sh

# Use the startup script as the entry point
CMD ["/app/start.sh"]