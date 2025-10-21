# 🚀 COMPLETE SETUP GUIDE - GRAVITY JEWELRY

## 📋 **WHAT YOU NEED TO INSTALL:**

### **1. Node.js (Required for the server)**
### **2. ngrok (For public tunneling)**

---

## 🟢 **STEP 1: INSTALL NODE.JS**

### **Download & Install:**
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer with default settings
4. Restart your command prompt/terminal

### **Verify Installation:**
```bash
node --version
npm --version
```

---

## 🌐 **STEP 2: INSTALL NGROK**

### **Method A: Direct Download (Recommended)**
1. Go to https://ngrok.com/download
2. Click "Download for Windows"
3. Extract `ngrok.exe` to `C:\ngrok\`
4. Add `C:\ngrok` to your system PATH

### **Method B: Use the Install Script**
1. Run `install-ngrok.bat` (already created for you)
2. Follow the prompts

### **Verify Installation:**
```bash
ngrok version
```

---

## 🔑 **STEP 3: SETUP NGROK ACCOUNT**

### **Get Auth Token:**
1. Sign up at https://ngrok.com/signup (FREE)
2. Go to your dashboard
3. Copy your auth token
4. Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

---

## 🚀 **STEP 4: START YOUR SITE**

### **Option A: Automatic Setup**
```bash
# Run the complete setup
setup-secure.bat
```

### **Option B: Manual Steps**
```bash
# 1. Install dependencies
cd server
npm install

# 2. Setup database
npm run setup-db
npm run seed-db

# 3. Start server
npm run dev
```

### **Option C: With Tunnel (After ngrok setup)**
```bash
# Start server + ngrok tunnel together
cd server
npm run dev:tunnel
```

---

## 🌍 **STEP 5: ACCESS YOUR SITE**

After running ngrok, you'll get:
- **Local:** http://localhost:5000
- **Public:** https://abc123.ngrok.io
- **Admin:** https://abc123.ngrok.io/admin
- **Monitor:** http://localhost:4040

---

## 🔧 **TROUBLESHOOTING**

### **Node.js Issues:**
```bash
# Check if Node.js is installed
node --version

# If not found, restart terminal after installation
# Or add to PATH: C:\Program Files\nodejs\
```

### **ngrok Issues:**
```bash
# Check if ngrok is installed
ngrok version

# If not found, add to PATH: C:\ngrok\
# Or run directly: C:\ngrok\ngrok.exe http 5000
```

### **Server Issues:**
```bash
# Check if dependencies are installed
cd server
npm install

# Check if database is setup
npm run setup-db
```

---

## 📞 **QUICK HELP COMMANDS**

### **Check Everything:**
```bash
# Check Node.js
node --version
npm --version

# Check ngrok
ngrok version

# Check server dependencies
cd server
npm list --depth=0
```

### **Start Everything:**
```bash
# Method 1: Use batch file
start-tunnel.bat

# Method 2: Manual
cd server
npm run dev
# In new terminal:
ngrok http 5000
```

---

## 🎯 **WHAT EACH FILE DOES:**

- **`install-ngrok.bat`** - Helps install ngrok
- **`start-tunnel.bat`** - Starts server + ngrok
- **`setup-secure.bat`** - Complete database setup
- **`ngrok.yml`** - ngrok configuration
- **`server/package.json`** - Contains tunnel scripts

---

## ✅ **SUCCESS CHECKLIST:**

- [ ] Node.js installed (`node --version` works)
- [ ] npm installed (`npm --version` works)  
- [ ] ngrok installed (`ngrok version` works)
- [ ] ngrok auth token configured
- [ ] Server dependencies installed (`npm install` in server folder)
- [ ] Database setup (`npm run setup-db`)
- [ ] Server starts (`npm run dev`)
- [ ] ngrok tunnel works (`ngrok http 5000`)

---

## 🚨 **IF YOU GET STUCK:**

1. **Restart your terminal** after installing Node.js/ngrok
2. **Check PATH variables** - Node.js and ngrok should be in PATH
3. **Run as Administrator** if you get permission errors
4. **Check firewall** - Allow Node.js and ngrok through firewall

---

**Once everything is installed, just run `start-tunnel.bat` and your site will be live! 🌍**
