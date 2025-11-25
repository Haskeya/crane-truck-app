@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Veritabani Hazirlama
echo ========================================
echo.

REM PostgreSQL bin klasörüne git
cd /d "C:\Program Files\PostgreSQL\18\bin"

if not exist "psql.exe" (
    echo HATA: PostgreSQL bulunamadi!
    echo Lutfen PostgreSQL'in C:\Program Files\PostgreSQL\18\bin konumunda oldugundan emin olun.
    pause
    exit /b 1
)

echo PostgreSQL bulundu.
echo.

REM Parola iste
echo PostgreSQL parolanizi girin.
echo Eger parola belirlemediyseniz, Enter'a basin (bos birakin).
set /p DB_PASSWORD="Parola: "

echo.
echo Veritabani olusturuluyor...
if "!DB_PASSWORD!"=="" (
    psql.exe -U postgres -c "CREATE DATABASE crane_truck_db;" 2>nul
) else (
    set PGPASSWORD=!DB_PASSWORD!
    psql.exe -U postgres -c "CREATE DATABASE crane_truck_db;" 2>nul
)
if %errorlevel% equ 0 (
    echo [OK] Veritabani olusturuldu: crane_truck_db
) else (
    echo [UYARI] Veritabani zaten var veya olusturulamadi.
)

echo.
echo Tablolari olusturuyor...
cd /d "%~dp0"
if "!DB_PASSWORD!"=="" (
    psql.exe -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
) else (
    set PGPASSWORD=!DB_PASSWORD!
    psql.exe -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
)
if %errorlevel% equ 0 (
    echo [OK] Tablolar olusturuldu.
) else (
    echo [HATA] Tablolar olusturulamadi!
    echo.
    echo Sorun cozumu:
    echo 1. PostgreSQL servisinin calistigindan emin olun
    echo 2. Parolanizi dogru girdiginizden emin olun
    echo 3. Manuel olarak deneyin: psql -U postgres -d crane_truck_db -f database\migrations\001_create_tables.sql
    pause
    exit /b 1
)

echo.
echo Test verilerini yukluyor...
if "!DB_PASSWORD!"=="" (
    psql.exe -U postgres -d crane_truck_db -f "database\seed.sql" 2>nul
) else (
    set PGPASSWORD=!DB_PASSWORD!
    psql.exe -U postgres -d crane_truck_db -f "database\seed.sql" 2>nul
)
if %errorlevel% equ 0 (
    echo [OK] Test verileri yuklendi.
) else (
    echo [UYARI] Test verileri yuklenemedi (opsiyonel).
)

REM Parolayı temizle (güvenlik için)
set DB_PASSWORD=
set PGPASSWORD=

echo.
echo ========================================
echo Veritabani hazir!
echo ========================================
echo.
pause

