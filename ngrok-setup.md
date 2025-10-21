# 🌐 NGROK SETUP FOR GRAVITY JEWELRY

## 📋 **Quick Setup Guide**

### **1. Install ngrok**
```bash
# Download from https://ngrok.com/download
# Or install via package manager:

# Windows (Chocolatey)
choco install ngrok

# Windows (Scoop)
scoop install ngrok

# macOS (Homebrew)
brew install ngrok/ngrok/ngrok

# Or download directly and add to PATH
```

### **2. Sign up and Get Auth Token**
1. Go to https://ngrok.com/signup
2. Sign up for free account
3. Get your auth token from dashboard
4. Configure ngrok:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### **3. Start Your Server**
```bash
# Start the Gravity Jewelry server
cd server
npm run dev
# Server should be running on http://localhost:5000
```

### **4. Expose with ngrok**
```bash
# In a new terminal, expose port 5000
ngrok http 5000

# Or with custom subdomain (paid plan)
ngrok http 5000 --subdomain=gravity-jewelry

# Or with custom domain (paid plan)
ngrok http 5000 --hostname=gravity-jewelry.yourdomain.com
```

## 🚀 **Quick Start Commands**

### **Basic Exposure**
```bash
# Expose local server on port 5000
ngrok http 5000
```

### **With Custom Configuration**
```bash
# Expose with custom region and inspect
ngrok http 5000 --region=us --inspect=true

# Expose with basic auth
ngrok http 5000 --basic-auth="admin:password123"

# Expose with custom headers
ngrok http 5000 --host-header="gravity-jewelry.local"
```

## ⚙️ **Configuration File**

Create `ngrok.yml` in your project root:

```yaml
# ngrok.yml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE

tunnels:
  gravity-web:
    proto: http
    addr: 5000
    subdomain: gravity-jewelry
    host_header: "gravity-jewelry.local"
    inspect: true
    bind_tls: true
    
  gravity-admin:
    proto: http
    addr: 5000
    subdomain: gravity-admin
    basic_auth:
      - "admin:secure_password_123"
    host_header: "gravity-admin.local"
    
  gravity-api:
    proto: http
    addr: 5000
    subdomain: gravity-api
    host_header: "gravity-api.local"
    inspect: true

regions:
  - us
  - eu
  - ap

web_addr: localhost:4040
log_level: info
log_format: logfmt
log: ./logs/ngrok.log
```

### **Start with Configuration**
```bash
# Start specific tunnel
ngrok start gravity-web

# Start multiple tunnels
ngrok start gravity-web gravity-admin

# Start all tunnels
ngrok start --all
```

## 🔧 **Development Scripts**

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "dev:tunnel": "concurrently \"npm run dev\" \"ngrok http 5000\"",
    "dev:secure": "concurrently \"npm run dev\" \"ngrok http 5000 --basic-auth=admin:gravity123\"",
    "tunnel": "ngrok http 5000",
    "tunnel:subdomain": "ngrok http 5000 --subdomain=gravity-jewelry",
    "tunnel:inspect": "ngrok http 5000 --inspect=true --log=stdout"
  }
}
```

### **Install Dependencies**
```bash
# Install concurrently to run multiple commands
npm install --save-dev concurrently

# Then use the scripts
npm run dev:tunnel
```

## 🌍 **Sharing Your Site**

### **Public URL Examples**
After running ngrok, you'll get URLs like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5000
Forwarding    http://abc123.ngrok.io -> http://localhost:5000
```

### **Share These URLs:**
- **Main Site:** `https://abc123.ngrok.io`
- **Admin Panel:** `https://abc123.ngrok.io/admin`
- **API Health:** `https://abc123.ngrok.io/api/health`
- **Products API:** `https://abc123.ngrok.io/api/products`

## 🔍 **Ngrok Web Interface**

Access the ngrok web interface at: `http://localhost:4040`

**Features:**
- **Request Inspector** - See all HTTP requests
- **Replay Requests** - Test API endpoints
- **Request/Response Details** - Debug issues
- **Traffic Statistics** - Monitor usage

## 🛡️ **Security Considerations**

### **Basic Authentication**
```bash
# Protect your tunnel with basic auth
ngrok http 5000 --basic-auth="username:password"
```

### **IP Restrictions (Paid Plans)**
```yaml
# In ngrok.yml
tunnels:
  gravity-secure:
    proto: http
    addr: 5000
    cidr_allow:
      - "192.168.1.0/24"
      - "10.0.0.0/8"
```

### **Custom Headers**
```bash
# Add custom headers for security
ngrok http 5000 --request-header-add="X-Custom-Auth: secret123"
```

## 📱 **Mobile Testing**

### **Test on Mobile Devices**
1. Start ngrok tunnel
2. Get the HTTPS URL (e.g., `https://abc123.ngrok.io`)
3. Open on mobile browser
4. Test responsive design and touch interactions

### **QR Code Generation**
```bash
# Generate QR code for easy mobile access
echo "https://abc123.ngrok.io" | qr
# Or use online QR generator with your ngrok URL
```

## 🔄 **Webhook Testing**

### **For Payment Integration (Stripe)**
```bash
# Expose webhook endpoint
ngrok http 5000 --subdomain=gravity-webhooks

# Use in Stripe dashboard:
# https://gravity-webhooks.ngrok.io/api/webhooks/stripe
```

### **For API Testing**
```bash
# Test API endpoints externally
curl https://abc123.ngrok.io/api/products
curl https://abc123.ngrok.io/api/categories
```

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Port Already in Use**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F

# Or use different port
ngrok http 3000
```

#### **Tunnel Not Working**
```bash
# Check ngrok status
ngrok diagnose

# Restart ngrok
ngrok kill
ngrok http 5000
```

#### **CORS Issues**
Update your server CORS configuration:
```javascript
// In server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    /\.ngrok\.io$/  // Allow all ngrok subdomains
  ],
  credentials: true
}));
```

## 📊 **Monitoring & Analytics**

### **Ngrok Dashboard**
- Visit https://dashboard.ngrok.com
- View tunnel usage statistics
- Monitor request logs
- Manage domains and certificates

### **Request Logging**
```bash
# Log all requests to file
ngrok http 5000 --log=./logs/ngrok-requests.log --log-level=info
```

## 🎯 **Use Cases**

### **1. Client Demos**
```bash
# Secure tunnel for client presentations
ngrok http 5000 --basic-auth="client:demo123" --subdomain=gravity-demo
```

### **2. Mobile Testing**
```bash
# Quick mobile testing
ngrok http 5000 --region=us
```

### **3. API Development**
```bash
# API testing with external tools
ngrok http 5000 --inspect=true --log=stdout
```

### **4. Webhook Development**
```bash
# Webhook testing for payments
ngrok http 5000 --subdomain=gravity-webhooks
```

## 🔗 **Useful Commands**

```bash
# Check ngrok version
ngrok version

# List active tunnels
ngrok tunnel list

# Kill all tunnels
ngrok kill

# Update ngrok
ngrok update

# Get help
ngrok help
ngrok help http
```

---

## 🚀 **Quick Start Summary**

1. **Install ngrok** and get auth token
2. **Start your server:** `npm run dev` (port 5000)
3. **Expose with ngrok:** `ngrok http 5000`
4. **Share the HTTPS URL** with others
5. **Monitor requests** at `http://localhost:4040`

**Your Gravity Jewelry site is now accessible worldwide! 🌍**
