@echo off
echo 🌐 Starting Gravity Jewelry with ngrok tunnel...
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok is not installed or not in PATH
    echo Please install ngrok from https://ngrok.com/download
    echo.
    pause
    exit /b 1
)

REM Check if server directory exists
if not exist "server" (
    echo ❌ Server directory not found
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
cd server
call npm install

echo.
echo 🚀 Starting development server and ngrok tunnel...
echo.

REM Start server and ngrok in parallel
start "Gravity Server" cmd /k "npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start ngrok tunnel
echo 🌍 Creating public tunnel...
echo.
echo Your Gravity Jewelry site will be available at:
echo https://[random].ngrok.io
echo.
echo 📊 Ngrok web interface: http://localhost:4040
echo.

ngrok http 5000

echo.
echo 🛑 Tunnel stopped. Press any key to exit...
pause >nul
