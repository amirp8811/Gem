@echo off
echo 🔒 Setting up Gravity Jewelry Marketplace with Security Fixes...
echo.

echo 📁 Creating necessary directories...
if not exist "server\logs" mkdir "server\logs"
if not exist "server\uploads" mkdir "server\uploads"
if not exist "server\uploads\products" mkdir "server\uploads\products"

echo 📦 Installing server dependencies...
cd server
call npm install

echo 🗄️ Setting up database...
call npm run setup-db

echo 🌱 Seeding database with initial data...
call npm run seed-db

echo ✅ Setup complete!
echo.
echo 🚀 To start the server:
echo    cd server
echo    npm run dev
echo.
echo 🌐 Access points:
echo    Main Site: http://localhost:5000
echo    Admin Panel: http://localhost:5000/admin
echo    API Health: http://localhost:5000/api/health
echo.
echo 🔐 Default Admin Credentials:
echo    Email: admin@gravity-jewelry.com
echo    Password: Gravity2024!@#
echo.
echo ⚠️  IMPORTANT: Change the admin password before production deployment!
echo.
pause
