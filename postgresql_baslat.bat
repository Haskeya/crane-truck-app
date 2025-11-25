@echo off
echo ========================================
echo PostgreSQL Servisini Baslatma
echo ========================================
echo.

REM PostgreSQL servis adını bul
for /f "tokens=*" %%i in ('sc query type^= service state^= all ^| findstr /i "postgresql"') do (
    echo Servis bulundu: %%i
)

echo.
echo PostgreSQL servisini baslatmak icin:
echo 1. Win+R tuslarina basin
echo 2. services.msc yazin
echo 3. postgresql servisini bulun ve baslatin
echo.
echo VEYA
echo.
echo PowerShell'i Yonetici olarak acin ve su komutu calistirin:
echo Get-Service -Name postgresql* ^| Start-Service
echo.
pause




