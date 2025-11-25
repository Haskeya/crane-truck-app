# 🚀 PostgreSQL ile Uygulamayı Çalıştırma - Adım Adım

## ⚠️ ÖNEMLİ: Önce PostgreSQL Servisini Başlatın!

PostgreSQL servisi çalışmıyorsa uygulama çalışmaz. Önce servisi başlatın.

## 📋 Kurulum Adımları

### 1️⃣ PostgreSQL Servisini Başlat

**Yöntem A: Servis Yöneticisi ile (Önerilen)**
1. `Win + R` tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. Listede "postgresql" ile başlayan servisi bulun
4. Sağ tıklayıp "Start" seçin

**Yöntem B: PowerShell ile (Yönetici olarak)**
```powershell
Get-Service -Name postgresql* | Start-Service
```

**Yöntem C: Batch Script ile**
- `postgresql_baslat.bat` dosyasını çalıştırın (sadece talimat gösterir)

### 2️⃣ Veritabanını Hazırla

**Otomatik (Önerilen):**
- `veritabani_hazirla.bat` dosyasını çalıştırın
- Bu script:
  - Veritabanını oluşturur
  - Tabloları oluşturur
  - Test verilerini yükler

**Manuel:**
```powershell
cd "C:\Program Files\PostgreSQL\18\bin"
.\psql.exe -U postgres -c "CREATE DATABASE crane_truck_db;"
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app"
.\psql.exe -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
.\psql.exe -U postgres -d crane_truck_db -f "database\seed.sql"
```

### 3️⃣ Backend .env Dosyasını Oluştur

`crane-truck-app/backend/` klasöründe `.env` dosyası oluşturun:

**Windows'ta:**
```powershell
cd backend
notepad .env
```

**İçeriği:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crane_truck_db
DB_USER=postgres
DB_PASSWORD=postgres_şifreniz
```

**⚠️ ÖNEMLİ:** `DB_PASSWORD` kısmına PostgreSQL kurulumunda belirlediğiniz şifreyi yazın. Eğer şifre belirlemediyseniz boş bırakın veya `postgres` yazın.

### 4️⃣ Uygulamayı Başlat

**Otomatik (Önerilen):**
- `uygulamayi_baslat.bat` dosyasını çalıştırın
- Bu script:
  - Backend ve frontend bağımlılıklarını kontrol eder
  - Eksikse kurar
  - Her ikisini de başlatır

**Manuel:**

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\backend"
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\frontend"
npm install
npm run dev
```

## ✅ Kontrol

1. **Backend:** http://localhost:3001 - "🚀 Server is running" mesajını görmelisiniz
2. **Frontend:** http://localhost:3000 - Otomatik açılacak

## 🐛 Sorun Giderme

### PostgreSQL servisi başlamıyor
- Servisi Yönetici olarak başlatmayı deneyin
- PostgreSQL'in kurulu olduğundan emin olun: `Test-Path "C:\Program Files\PostgreSQL"`

### Veritabanı oluşturulamıyor
- PostgreSQL servisinin çalıştığından emin olun
- Şifre soruyorsa, kurulum sırasında belirlediğiniz şifreyi girin

### Backend bağlanamıyor
- `.env` dosyasındaki bilgileri kontrol edin
- PostgreSQL servisinin çalıştığından emin olun
- Port 5432'nin kullanımda olduğunu kontrol edin

### Frontend API hatası
- Backend'in çalıştığından emin olun
- `http://localhost:3001/api/health` adresini tarayıcıda test edin

## 📞 Yardım

Detaylı bilgi için `POSTGRESQL_KURULUM_REHBERI.md` dosyasına bakın.




