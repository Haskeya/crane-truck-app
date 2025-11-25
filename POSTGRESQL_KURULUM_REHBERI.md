# 🐘 PostgreSQL Kurulum ve Çalıştırma Rehberi

## 📋 Adım 1: PostgreSQL Servisini Kontrol Et

PowerShell'de çalıştırın:
```powershell
Get-Service -Name postgresql*
```

Eğer servis görünmüyorsa veya çalışmıyorsa, aşağıdaki adımları izleyin.

## 🔧 Adım 2: PostgreSQL Servisini Başlat

### Yöntem 1: Servis Yöneticisi ile
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. "postgresql" servisini bulun
4. Sağ tıklayıp "Start" seçin

### Yöntem 2: PowerShell ile (Yönetici olarak)
```powershell
# Servis adını bulun (genellikle postgresql-x64-XX şeklinde)
Get-Service -Name postgresql*

# Servisi başlatın (servis adını kendi adınızla değiştirin)
Start-Service -Name "postgresql-x64-18"
```

### Yöntem 3: Manuel Başlatma
Eğer servis yoksa, PostgreSQL'in bin klasöründen:
```powershell
cd "C:\Program Files\PostgreSQL\18\bin"
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\18\data" start
```

## 🗄️ Adım 3: Veritabanını Oluştur

PowerShell'de:
```powershell
# PostgreSQL bin klasörüne git
cd "C:\Program Files\PostgreSQL\18\bin"

# Veritabanı oluştur (şifre sorarsa, kurulum sırasında belirlediğiniz şifreyi girin)
.\createdb.exe -U postgres crane_truck_db
```

Alternatif olarak psql ile:
```powershell
.\psql.exe -U postgres
# psql içinde:
CREATE DATABASE crane_truck_db;
\q
```

## 📊 Adım 4: Tabloları Oluştur

```powershell
# Proje klasörüne git
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app"

# Tabloları oluştur
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
```

## 🌱 Adım 5: Test Verilerini Yükle (Opsiyonel)

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\seed.sql"
```

## ⚙️ Adım 6: Backend .env Dosyasını Oluştur

`crane-truck-app/backend/` klasöründe `.env` dosyası oluşturun:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crane_truck_db
DB_USER=postgres
DB_PASSWORD=postgres_şifreniz_buraya
```

**ÖNEMLİ:** `DB_PASSWORD` kısmına PostgreSQL kurulumunda belirlediğiniz şifreyi yazın.

## 📦 Adım 7: Backend Bağımlılıklarını Kur

```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\backend"
npm install
```

## 🚀 Adım 8: Backend'i Başlat

```powershell
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

## 🎨 Adım 9: Frontend'i Başlat (Yeni Terminal)

Yeni bir PowerShell penceresi açın:

```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\frontend"
npm run dev
```

Frontend `http://localhost:3000` adresinde otomatik açılacak.

## ✅ Kontrol Listesi

- [ ] PostgreSQL servisi çalışıyor
- [ ] Veritabanı oluşturuldu (`crane_truck_db`)
- [ ] Tablolar oluşturuldu
- [ ] Test verileri yüklendi (opsiyonel)
- [ ] `.env` dosyası oluşturuldu ve şifre girildi
- [ ] Backend bağımlılıkları kuruldu
- [ ] Backend çalışıyor (port 3001)
- [ ] Frontend çalışıyor (port 3000)

## 🐛 Sorun Giderme

### PostgreSQL servisi başlamıyor
- Servisi Yönetici olarak başlatmayı deneyin
- PostgreSQL'in data klasörünün doğru olduğundan emin olun
- Windows Event Viewer'da hata mesajlarını kontrol edin

### Veritabanı oluşturulamıyor
- PostgreSQL servisinin çalıştığından emin olun
- Kullanıcı adı ve şifrenin doğru olduğundan emin olun
- `psql -U postgres -l` komutu ile mevcut veritabanlarını listeleyin

### Backend bağlanamıyor
- `.env` dosyasındaki bilgileri kontrol edin
- PostgreSQL servisinin çalıştığından emin olun
- Port 5432'nin kullanımda olduğunu kontrol edin: `netstat -an | findstr 5432`

### Frontend API hatası alıyorsa
- Backend'in çalıştığından emin olun
- `http://localhost:3001/api/health` adresini tarayıcıda test edin

## 📞 Yardım

Sorun yaşıyorsanız:
1. Backend console çıktısını kontrol edin
2. PostgreSQL log dosyalarını kontrol edin: `C:\Program Files\PostgreSQL\18\data\log\`
3. Veritabanı bağlantısını test edin: `psql -U postgres -d crane_truck_db`




