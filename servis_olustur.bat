@echo off
echo PostgreSQL servisini olusturuyor...
echo.
echo NOT: Bu dosyayi YONETICI OLARAK CALISTIRMANIZ GEREKIYOR!
echo.
pause

cd "C:\Program Files\PostgreSQL\18\bin"

echo Servis olusturuluyor...
pg_ctl.exe register -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data"

echo.
echo Servis baslatiliyor...
net start postgresql-x64-18

echo.
echo Tamamlandi!
pause





