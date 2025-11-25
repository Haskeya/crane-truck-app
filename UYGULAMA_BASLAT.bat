@echo off
echo ========================================
echo Vinç ^& Kamyon Operasyon Yonetim Sistemi
echo ========================================
echo.

REM Backend başlat
echo Backend baslatiliyor...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

REM Frontend başlat
echo Frontend baslatiliyor...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Uygulama baslatildi!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Tarayicida otomatik acilacak...
start http://localhost:3000
echo.
echo Her iki pencereyi de kapatmayin!
echo Kapatmak icin pencereyi kapatin veya Ctrl+C basin.
echo.
pause




