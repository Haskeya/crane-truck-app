@echo off
echo ========================================
echo Vinç ^& Kamyon Operasyon Yonetim Sistemi
echo ========================================
echo.

REM Backend bağımlılıklarını kontrol et
if not exist "backend\node_modules" (
    echo Backend bagimliliklari kuruluyor...
    cd backend
    call npm install
    cd ..
)

REM Frontend bağımlılıklarını kontrol et
if not exist "frontend\node_modules" (
    echo Frontend bagimliliklari kuruluyor...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Backend baslatiliyor...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Frontend baslatiliyor...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Uygulama baslatildi!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Tarayicida otomatik acilacak...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
pause




