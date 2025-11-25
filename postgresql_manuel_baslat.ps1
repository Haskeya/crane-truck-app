# PostgreSQL Data Klasoru Baslatma Scripti
# Bu scripti YONETICI OLARAK CALISTIRIN

Write-Host "========================================" -ForegroundColor Green
Write-Host "PostgreSQL Data Klasoru Baslatma" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Yonetici kontrolu
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "HATA: Bu scripti YONETICI OLARAK calistirmaniz gerekiyor!" -ForegroundColor Red
    Write-Host "PowerShell'i sag tiklayip 'Run as administrator' secin." -ForegroundColor Yellow
    pause
    exit 1
}

$dataDir = "C:\Program Files\PostgreSQL\18\data"
$backupDir = "C:\Program Files\PostgreSQL\18\data_backup"
$binDir = "C:\Program Files\PostgreSQL\18\bin"

Write-Host "[1/5] Mevcut data klasorunu kontrol ediliyor..." -ForegroundColor Cyan
if (Test-Path $dataDir) {
    Write-Host "Mevcut data klasoru bulundu, yedekleniyor..." -ForegroundColor Yellow
    if (-not (Test-Path $backupDir)) {
        Move-Item $dataDir $backupDir -Force
        Write-Host "Yedek olusturuldu: data_backup" -ForegroundColor Green
    } else {
        Write-Host "Yedek zaten var, mevcut klasor siliniyor..." -ForegroundColor Yellow
        Remove-Item $dataDir -Recurse -Force
    }
} else {
    Write-Host "Mevcut data klasoru bulunamadi." -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Yeni data klasoru olusturuluyor..." -ForegroundColor Cyan
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "Data klasoru olusturuldu." -ForegroundColor Green
} else {
    Write-Host "Data klasoru zaten mevcut." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/5] PostgreSQL data klasoru baslatiliyor..." -ForegroundColor Cyan
Write-Host "Bu islem bir kac dakika surebilir, lutfen bekleyin..." -ForegroundColor Yellow

Set-Location $binDir

if (Test-Path "initdb.exe") {
    $initResult = & .\initdb.exe -D $dataDir -U postgres -A password -E UTF8 --locale=Turkish_Turkey.1254 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL data klasoru basariyla baslatildi!" -ForegroundColor Green
    } else {
        Write-Host "HATA: PostgreSQL data klasoru baslatilamadi!" -ForegroundColor Red
        Write-Host $initResult -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "HATA: initdb.exe bulunamadi!" -ForegroundColor Red
    Write-Host "PostgreSQL kurulumunu kontrol edin." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "[4/5] Servis kayit ediliyor..." -ForegroundColor Cyan
if (Test-Path "pg_ctl.exe") {
    $registerResult = & .\pg_ctl.exe register -N "postgresql-x64-18" -D $dataDir 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Servis kayit edildi." -ForegroundColor Green
    } else {
        Write-Host "Servis zaten kayitli olabilir, devam ediliyor..." -ForegroundColor Yellow
    }
} else {
    Write-Host "HATA: pg_ctl.exe bulunamadi!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[5/5] Servis baslatiliyor..." -ForegroundColor Cyan
try {
    Start-Service -Name "postgresql-x64-18" -ErrorAction Stop
    Start-Sleep -Seconds 3
    
    $service = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
    if ($service.Status -eq "Running") {
        Write-Host "Servis basariyla baslatildi!" -ForegroundColor Green
    } else {
        Write-Host "UYARI: Servis baslatildi ama calisiyor gibi gorunmuyor." -ForegroundColor Yellow
    }
} catch {
    Write-Host "HATA: Servis baslatilamadi!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Manuel olarak baslatmayi deneyin:" -ForegroundColor Yellow
    Write-Host "  Start-Service -Name 'postgresql-x64-18'" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL hazir!" -ForegroundColor Green
Write-Host ""
Write-Host "ONEMLI: PostgreSQL varsayilan olarak sifre gerektirmez." -ForegroundColor Yellow
Write-Host "pgAdmin'den baglanirken sifre sorulursa bos birakin." -ForegroundColor Yellow
Write-Host ""
Write-Host "Sifre belirlemek icin:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -c `"ALTER USER postgres PASSWORD 'sifreniz';`"" -ForegroundColor White
Write-Host ""
pause





