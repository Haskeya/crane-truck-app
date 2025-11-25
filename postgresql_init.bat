@echo off
chcp 65001 >nul
title PostgreSQL Data Klasoru Baslatma
color 0A

echo ========================================
echo PostgreSQL Data Klasoru Baslatma
echo ========================================
echo.
echo NOT: Bu dosyayi YONETICI OLARAK CALISTIRMANIZ GEREKIYOR!
echo.
echo UYARI: Bu islem mevcut data klasorunu yedekleyecek!
echo.
pause

echo.
echo [1/6] Mevcut data klasorunu kontrol ediliyor...
if exist "C:\Program Files\PostgreSQL\18\data" (
    echo Mevcut data klasoru bulundu, yedekleniyor...
    if not exist "C:\Program Files\PostgreSQL\18\data_backup" (
        move "C:\Program Files\PostgreSQL\18\data" "C:\Program Files\PostgreSQL\18\data_backup" >nul 2>&1
        echo Yedek olusturuldu: data_backup
    ) else (
        echo Yedek klasor zaten var, mevcut data klasoru siliniyor...
        rmdir /s /q "C:\Program Files\PostgreSQL\18\data" >nul 2>&1
    )
) else (
    echo Mevcut data klasoru bulunamadi, yeni olusturulacak.
)

echo.
echo [2/6] Yeni data klasoru olusturuluyor...
if not exist "C:\Program Files\PostgreSQL\18\data" (
    mkdir "C:\Program Files\PostgreSQL\18\data" >nul 2>&1
    echo Data klasoru olusturuldu.
) else (
    echo Data klasoru zaten mevcut.
)

echo.
echo [3/6] PostgreSQL data klasoru baslatiliyor...
echo Bu islem bir kac dakika surebilir, lutfen bekleyin...
cd /d "C:\Program Files\PostgreSQL\18\bin"
if exist "initdb.exe" (
    initdb.exe -D "C:\Program Files\PostgreSQL\18\data" -U postgres -A password -E UTF8 --locale=Turkish_Turkey.1254
    if errorlevel 1 (
        echo.
        echo HATA: PostgreSQL data klasoru baslatilamadi!
        echo.
        pause
        exit /b 1
    )
    echo PostgreSQL data klasoru basariyla baslatildi.
) else (
    echo HATA: initdb.exe bulunamadi!
    echo PostgreSQL kurulumunu kontrol edin.
    pause
    exit /b 1
)

echo.
echo [4/6] Servis kayit ediliyor...
if exist "pg_ctl.exe" (
    pg_ctl.exe register -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data" >nul 2>&1
    echo Servis kayit edildi.
) else (
    echo HATA: pg_ctl.exe bulunamadi!
    pause
    exit /b 1
)

echo.
echo [5/6] Servis baslatiliyor...
net start postgresql-x64-18 >nul 2>&1
if errorlevel 1 (
    echo Servis baslatilamadi, manuel olarak baslatmayi deneyin.
    echo Windows Servisleri'nden (services.msc) baslatabilirsiniz.
) else (
    echo Servis basariyla baslatildi.
)

echo.
echo [6/6] Kontrol ediliyor...
timeout /t 2 >nul
sc query postgresql-x64-18 | find "RUNNING" >nul
if errorlevel 1 (
    echo UYARI: Servis calisiyor gibi gorunmuyor.
) else (
    echo Servis calisiyor!
)

echo.
echo ========================================
echo TAMAMLANDI!
echo ========================================
echo.
echo PostgreSQL hazir!
echo.
echo ONEMLI: PostgreSQL varsayilan olarak sifre gerektirmez.
echo Sifre belirlemek icin pgAdmin'den veya su komutla yapabilirsiniz:
echo.
echo psql -U postgres -c "ALTER USER postgres PASSWORD 'sifreniz';"
echo.
echo pgAdmin'den baglanirken sifre sorulursa bos birakin veya
echo yukaridaki komutla belirlediginiz sifreyi girin.
echo.
pause

