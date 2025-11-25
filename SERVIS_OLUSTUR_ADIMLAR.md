# 🔧 PostgreSQL Servisini Manuel Oluşturma

## Sorun: PostgreSQL servisi görünmüyor

PostgreSQL kurulu ama servis olarak kurulmamış. Servisi manuel oluşturalım.

## ✅ Çözüm: Servisi Manuel Oluşturma

### Yöntem 1: Batch Dosyası ile (Kolay)

1. **`servis_olustur.bat`** dosyasına **sağ tıklayın**
2. **"Run as administrator"** (Yönetici olarak çalıştır) seçin
3. Komut penceresi açılacak ve servis oluşturulacak

### Yöntem 2: PowerShell ile (Manuel)

1. **PowerShell'i Yönetici olarak açın:**
   - Başlat menüsünde "PowerShell" arayın
   - **"Windows PowerShell"** üzerine **sağ tıklayın**
   - **"Run as administrator"** seçin

2. Şu komutları sırayla çalıştırın:

```powershell
# PostgreSQL bin klasörüne git
cd "C:\Program Files\PostgreSQL\18\bin"

# Servisi oluştur
.\pg_ctl.exe register -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data"

# Servisi başlat
Start-Service -Name "postgresql-x64-18"
```

### Yöntem 3: PostgreSQL'i Yeniden Kurma (En Garantili)

Eğer yukarıdaki yöntemler işe yaramazsa:

1. **PostgreSQL'i kaldırın:**
   - Control Panel > Programs > Uninstall a program
   - PostgreSQL 18'i bulun ve kaldırın

2. **PostgreSQL'i yeniden indirin ve kurun:**
   - https://www.postgresql.org/download/windows/
   - Kurulum sırasında:
     - ✅ **"Install as Windows Service"** seçeneğinin işaretli olduğundan emin olun
     - Service name: `postgresql-x64-18` (varsayılan)
     - Port: `5432`
     - Şifre belirleyin (unutmayın!)

3. Kurulumdan sonra servis otomatik başlamalı

## 🧪 Servisin Oluşturulduğunu Kontrol Etme

### Windows Servisleri ile:
1. `Windows + R` > `services.msc`
2. **"postgresql-x64-18"** servisini arayın
3. Durum **"Running"** (Çalışıyor) olmalı

### PowerShell ile:
```powershell
Get-Service -Name "postgresql-x64-18"
```

### Bağlantı Testi:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "SELECT version();"
```

## 📝 Notlar

- Servis oluşturulduktan sonra **her zaman çalışır durumda** olmalı
- Bilgisayarı her açtığınızda otomatik başlamalı
- Servis durdurulursa, pgAdmin bağlanamaz

## 🆘 Hata Alırsanız

### "Access Denied" hatası:
- PowerShell'i **Yönetici olarak** açtığınızdan emin olun

### "Service already exists" hatası:
- Servis zaten var, sadece başlatmanız gerekiyor:
```powershell
Start-Service -Name "postgresql-x64-18"
```

### "The service did not start" hatası:
- Data klasöründe sorun olabilir
- PostgreSQL'i yeniden kurmayı deneyin





