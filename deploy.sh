#!/bin/bash

# Automated Deployment Script for Assets in Control
# This script handles 100% automatic deployment

set -e  # Exit on any error

echo "🚀 Starting automated deployment for Assets in Control..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd client
npm install --legacy-peer-deps
cd ..
print_success "Frontend dependencies installed"

# Build frontend
print_info "Building frontend..."
cd client
npm run build
cd ..
print_success "Frontend built successfully"

# Run database initialization
print_info "Initializing database..."
node -e "const db = require('./server/database'); db.initDatabase(); console.log('Database initialized');"
print_success "Database initialized"

# Check if port 5000 is available
print_info "Checking port availability..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    print_info "Port 5000 is in use. Stopping existing process..."
    kill $(lsof -t -i:5000) 2>/dev/null || true
    sleep 2
fi
print_success "Port 5000 is available"

# Create a startup script
cat > start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
node server/index.js
EOF

chmod +x start.sh

print_success "Startup script created"

# Create systemd service file (for Linux systems)
if command -v systemctl &> /dev/null; then
    print_info "Creating systemd service..."
    
    cat > assets-in-control.service << EOF
[Unit]
Description=Assets in Control - Crypto Wallet Manager
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/start.sh
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=assets-in-control
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    print_success "Systemd service file created"
    print_info "To install the service, run: sudo cp assets-in-control.service /etc/systemd/system/ && sudo systemctl enable assets-in-control && sudo systemctl start assets-in-control"
fi

# Create pm2 ecosystem file (alternative process manager)
if command -v pm2 &> /dev/null; then
    print_info "Creating PM2 ecosystem file..."
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'assets-in-control',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF
    
    print_success "PM2 ecosystem file created"
    print_info "To start with PM2, run: pm2 start ecosystem.config.js"
fi

# Create Docker files
print_info "Creating Docker configuration..."

# Dockerfile for backend
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build frontend
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "server/index.js"]
EOF

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET:-your-secret-key-change-in-production}
    volumes:
      - ./server/assets.db:/app/server/assets.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

print_success "Docker configuration created"

# Create .dockerignore
cat > .dockerignore << 'EOF'
node_modules
client/node_modules
client/build
npm-debug.log
.git
.gitignore
*.md
.env
.DS_Store
EOF

# Create nginx configuration for reverse proxy
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static files directly
    location /static {
        alias /path/to/Assets-in-control-/client/build/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

print_success "Nginx configuration created"

# Print deployment summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 Deployment Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Available deployment options:"
echo ""
echo "1. 🔹 Direct Node.js:"
echo "   ./start.sh"
echo ""
echo "2. 🔹 With PM2 (recommended for production):"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "3. 🔹 With Docker:"
echo "   docker-compose up -d"
echo ""
echo "4. 🔹 With Systemd (Linux):"
echo "   sudo cp assets-in-control.service /etc/systemd/system/"
echo "   sudo systemctl enable assets-in-control"
echo "   sudo systemctl start assets-in-control"
echo ""
echo "Access the application at: http://localhost:5000"
echo ""
echo "📝 Don't forget to:"
echo "   - Update .env file with your configuration"
echo "   - Set JWT_SECRET in production"
echo "   - Configure RPC endpoints"
echo "   - Set up SSL/TLS for production"
echo ""
echo "═══════════════════════════════════════════════════════════"

print_success "Automated deployment setup completed!"
