# 🔧 PostgreSQL Servisini Başlatma

## Sorun: Connection Timeout - PostgreSQL servisi çalışmıyor

### ✅ Çözüm 1: Windows Servisleri ile Başlatma (Kolay Yol)

1. **Windows + R** tuşlarına basın
2. `services.msc` yazın ve **Enter**'a basın
3. Açılan pencerede **"postgresql"** veya **"PostgreSQL"** arayın
4. Şunlardan birini bulabilirsiniz:
   - `postgresql-x64-18`
   - `PostgreSQL 18`
   - `postgresql-x64-18 - PostgreSQL Server 18`
5. Bulduğunuz servise **sağ tıklayın**
6. **"Start"** (Başlat) seçin
7. Durum **"Running"** (Çalışıyor) olmalı

### ✅ Çözüm 2: PowerShell ile Başlatma

**PowerShell'i Yönetici olarak açın** (önemli!):

1. Başlat menüsünde "PowerShell" arayın
2. **"Windows PowerShell"** üzerine **sağ tıklayın**
3. **"Run as administrator"** (Yönetici olarak çalıştır) seçin

Sonra şu komutları çalıştırın:

```powershell
# Tüm servisleri listele ve PostgreSQL'i bul
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*" -or $_.Name -like "*postgres*"}

# Servis adını bulduktan sonra başlat (örnek: postgresql-x64-18)
Start-Service -Name "postgresql-x64-18"
```

### ✅ Çözüm 3: PostgreSQL'i Manuel Başlatma

Eğer servis yoksa, PostgreSQL'i manuel başlatabilirsiniz:

**PowerShell'i Yönetici olarak açın:**

```powershell
# PostgreSQL data klasörüne git
cd "C:\Program Files\PostgreSQL\18\data"

# PostgreSQL'i başlat
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
```

### ✅ Çözüm 4: PostgreSQL Servisini Oluşturma

Eğer servis hiç yoksa, oluşturmanız gerekebilir:

**PowerShell'i Yönetici olarak açın:**

```powershell
# PostgreSQL servisini oluştur
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" register -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data"

# Servisi başlat
Start-Service -Name "postgresql-x64-18"
```

### ✅ Çözüm 5: PostgreSQL'i Yeniden Kurma

Eğer hiçbiri işe yaramazsa, PostgreSQL'i yeniden kurun:

1. **Control Panel** > **Programs** > **Uninstall a program**
2. **PostgreSQL 18** bulun ve **kaldırın**
3. PostgreSQL'i yeniden indirip kurun
4. Kurulum sırasında **"Install as Windows Service"** seçeneğinin işaretli olduğundan emin olun
5. Servis adı: `postgresql-x64-18` (varsayılan)
6. Kurulumdan sonra servis otomatik başlamalı

## 🧪 Servisin Çalıştığını Kontrol Etme

### Windows Servisleri ile:
1. `services.msc` açın
2. PostgreSQL servisini bulun
3. Durum **"Running"** (Çalışıyor) olmalı

### PowerShell ile:
```powershell
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
```

### Komut Satırı ile:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "SELECT version();"
```

Başarılı olursa PostgreSQL versiyonunu göreceksiniz.

## 📝 Notlar

- PostgreSQL servisi **her zaman çalışır durumda** olmalı
- Bilgisayarı her açtığınızda otomatik başlamalı
- Servis durdurulursa, pgAdmin ve uygulamalar bağlanamaz

## 🆘 Hala Çalışmıyorsa

1. **Windows Event Viewer'ı kontrol edin:**
   - Windows + R > `eventvwr.msc`
   - Windows Logs > Application
   - PostgreSQL hatalarını arayın

2. **PostgreSQL log dosyasını kontrol edin:**
   - `C:\Program Files\PostgreSQL\18\data\log\` klasörüne bakın

3. **Firewall'u kontrol edin:**
   - Windows Firewall PostgreSQL'i engelliyor olabilir





