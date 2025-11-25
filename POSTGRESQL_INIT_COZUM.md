# 🔧 PostgreSQL Data Klasörü Başlatma

## Sorun: "directory is not a database cluster directory"

PostgreSQL data klasörü düzgün başlatılmamış. Data klasörünü init etmemiz gerekiyor.

## ✅ Çözüm: PostgreSQL Data Klasörünü Başlatma

### Yöntem 1: initdb ile Başlatma (Önerilen)

**PowerShell'i Yönetici olarak açın** ve şu komutları çalıştırın:

```powershell
# Mevcut data klasörünü yedekleyin (içinde önemli bir şey varsa)
# Rename-Item "C:\Program Files\PostgreSQL\18\data" "C:\Program Files\PostgreSQL\18\data_backup"

# Data klasörünü silin (içinde önemli bir şey yoksa)
Remove-Item "C:\Program Files\PostgreSQL\18\data" -Recurse -Force

# Yeni data klasörü oluşturun
New-Item -ItemType Directory -Path "C:\Program Files\PostgreSQL\18\data"

# PostgreSQL data klasörünü başlatın
& "C:\Program Files\PostgreSQL\18\bin\initdb.exe" -D "C:\Program Files\PostgreSQL\18\data" -U postgres -A password -E UTF8 --locale=Turkish_Turkey.1254

# Servisi yeniden oluşturun
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" register -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data"

# Servisi başlatın
Start-Service -Name "postgresql-x64-18"
```

### Yöntem 2: PostgreSQL'i Yeniden Kurma (En Garantili)

Eğer yukarıdaki yöntem işe yaramazsa:

1. **PostgreSQL'i kaldırın:**
   - Control Panel > Programs > Uninstall a program
   - PostgreSQL 18'i bulun ve kaldırın
   - Data klasörünü de silin: `C:\Program Files\PostgreSQL\18\data`

2. **PostgreSQL'i yeniden indirin ve kurun:**
   - https://www.postgresql.org/download/windows/
   - Kurulum sırasında:
     - ✅ **"Install as Windows Service"** seçeneğinin işaretli olduğundan emin olun
     - Service name: `postgresql-x64-18`
     - Port: `5432`
     - **Şifre belirleyin** (unutmayın!)
     - Data directory: `C:\Program Files\PostgreSQL\18\data` (varsayılan)

3. Kurulumdan sonra servis otomatik başlamalı

## 🧪 Kontrol

Servis başlatıldıktan sonra:

```powershell
# Servis durumunu kontrol edin
Get-Service -Name "postgresql-x64-18"

# Port kontrolü
Test-NetConnection -ComputerName localhost -Port 5432

# PostgreSQL'e bağlanmayı deneyin
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "SELECT version();"
```

## 📝 Notlar

- Data klasörünü silmek, tüm veritabanlarınızı silecektir
- Eğer önemli verileriniz varsa, önce yedek alın
- initdb komutu data klasörünü sıfırdan oluşturur





