# Veritabanı Oluşturma Scripti
# PowerShell'de çalıştırın

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Veritabani Olusturma" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL bin klasörü
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "HATA: PostgreSQL bulunamadi!" -ForegroundColor Red
    Write-Host "Lutfen PostgreSQL'in kurulu oldugundan emin olun." -ForegroundColor Yellow
    pause
    exit 1
}

# Parola iste
Write-Host "PostgreSQL parolanizi girin." -ForegroundColor Yellow
Write-Host "Eger parola belirlemediyseniz, Enter'a basin (bos birakin)." -ForegroundColor Yellow
$password = Read-Host "Parola" -AsSecureString

# Parolayı düz metne çevir
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Eğer parola varsa, PGPASSWORD environment variable'ını ayarla
if ($plainPassword -ne "") {
    $env:PGPASSWORD = $plainPassword
    Write-Host "Parola ayarlandi." -ForegroundColor Green
} else {
    Write-Host "Parola yok, trust authentication kullaniliyor." -ForegroundColor Green
}

Write-Host ""
Write-Host "Veritabani olusturuluyor..." -ForegroundColor Cyan
& $psqlPath -U postgres -c "CREATE DATABASE crane_truck_db;" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Veritabani olusturuldu: crane_truck_db" -ForegroundColor Green
} else {
    Write-Host "[UYARI] Veritabani zaten var veya olusturulamadi." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tablolari olusturuyor..." -ForegroundColor Cyan
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationFile = Join-Path $scriptPath "database\migrations\001_create_tables.sql"

& $psqlPath -U postgres -d crane_truck_db -f $migrationFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Tablolar olusturuldu." -ForegroundColor Green
} else {
    Write-Host "[HATA] Tablolar olusturulamadi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Sorun cozumu:" -ForegroundColor Yellow
    Write-Host "1. PostgreSQL servisinin calistigindan emin olun" -ForegroundColor White
    Write-Host "2. Parolanizi dogru girdiginizden emin olun" -ForegroundColor White
    $env:PGPASSWORD = ""
    pause
    exit 1
}

Write-Host ""
Write-Host "Test verilerini yukluyor..." -ForegroundColor Cyan
$seedFile = Join-Path $scriptPath "database\seed.sql"
& $psqlPath -U postgres -d crane_truck_db -f $seedFile 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Test verileri yuklendi." -ForegroundColor Green
} else {
    Write-Host "[UYARI] Test verileri yuklenemedi (opsiyonel)." -ForegroundColor Yellow
}

# Parolayı temizle
$env:PGPASSWORD = ""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Veritabani hazir!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
pause




