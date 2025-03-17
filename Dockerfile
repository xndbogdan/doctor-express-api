FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm install

# Copy tsconfig to ensure proper build configuration
COPY tsconfig.json ./

# Copy prisma schema (only what's needed for generation)
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpx prisma generate

# Now copy the source code
COPY src ./src/

# Display the source directory structure for debugging
RUN echo "Source directory structure:" && ls -la src/

# Try building with TypeScript directly as a fallback method
RUN echo "Installing typescript globally" && npm install -g typescript
RUN echo "Running tsc build" && npx tsc --outDir dist

# Now try the regular build
RUN echo "Running pnpm build" && pnpm build

# Debug - check the build output
RUN echo "Dist directory contents:" && ls -la dist/ || echo "dist directory not created"
RUN echo "Finding index.js:" && find . -name "index.js" || echo "index.js not found"
RUN echo "Project structure:" && find . -type f | grep -v "node_modules" | sort

# Copy any other project files
COPY . .

EXPOSE 3000

# Create startup script with extensive debugging
RUN printf '#!/bin/sh\necho "Starting migration..."\nnpx prisma migrate deploy\necho "Migration complete"\necho "Checking dist directory:"\nls -la dist/ || echo "dist directory missing"\necho "Starting application..."\nif [ -f "dist/index.js" ]; then\n  node dist/index.js\nelse\n  echo "ERROR: dist/index.js not found. Building again..."\n  pnpm build\n  ls -la dist/\n  if [ -f "dist/index.js" ]; then\n    node dist/index.js\n  else\n    echo "Build failed again. Cannot start application."\n    exit 1\n  fi\nfi\n' > /app/start.sh
RUN chmod +x /app/start.sh

# Verify script is created correctly
RUN cat /app/start.sh

# Use the startup script as the entry point
CMD ["/app/start.sh"]