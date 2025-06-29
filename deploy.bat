@echo off
echo 🎨 Theme You - Building for deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Type check
echo 🔍 Running TypeScript type check...
npm run type-check

REM Build the project
echo 🏗️ Building the project...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
    echo 📁 Build files are in the 'dist' directory
    echo.
    echo 🚀 To deploy to GitHub Pages:
    echo 1. Push your changes to the main branch
    echo 2. GitHub Actions will automatically deploy to gh-pages
    echo 3. Your site will be available at: https://[your-username].github.io/BOT/
    echo.
    echo 🔧 To preview locally: npm run preview
) else (
    echo ❌ Build failed. Please check the error messages above.
    pause
    exit /b 1
)

pause 