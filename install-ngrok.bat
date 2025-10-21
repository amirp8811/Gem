@echo off
echo 🌐 Installing ngrok for Gravity Jewelry...
echo.

REM Create ngrok directory
if not exist "C:\ngrok" mkdir "C:\ngrok"

echo 📥 Please follow these steps:
echo.
echo 1. Go to https://ngrok.com/download
echo 2. Download ngrok for Windows
echo 3. Extract ngrok.exe to C:\ngrok\
echo 4. Press any key when done...
echo.
pause

REM Check if ngrok.exe exists
if exist "C:\ngrok\ngrok.exe" (
    echo ✅ Found ngrok.exe
    
    REM Add to PATH for current session
    set PATH=%PATH%;C:\ngrok
    
    REM Add to system PATH permanently
    echo 🔧 Adding ngrok to system PATH...
    setx PATH "%PATH%;C:\ngrok" /M 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ ngrok added to system PATH
    ) else (
        echo ⚠️  Could not add to system PATH automatically
        echo Please add C:\ngrok to your PATH manually
    )
    
    echo.
    echo 🎯 Testing ngrok installation...
    C:\ngrok\ngrok.exe version
    
    echo.
    echo ✅ ngrok installed successfully!
    echo.
    echo 📋 Next steps:
    echo 1. Sign up at https://ngrok.com/signup
    echo 2. Get your auth token
    echo 3. Run: ngrok config add-authtoken YOUR_TOKEN
    echo 4. Run: start-tunnel.bat
    echo.
) else (
    echo ❌ ngrok.exe not found in C:\ngrok\
    echo Please download and extract ngrok.exe to C:\ngrok\
    echo.
)

pause
