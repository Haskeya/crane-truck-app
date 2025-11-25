# 📦 Kurulum Rehberi

## Gereksinimler

Uygulamayı çalıştırmak için şunlara ihtiyacınız var:

### 1. Node.js Kurulumu

**Windows için:**
1. https://nodejs.org/ adresine gidin
2. LTS (Long Term Support) versiyonunu indirin (önerilen)
3. İndirilen `.msi` dosyasını çalıştırın
4. Kurulum sihirbazını takip edin (varsayılan ayarlar yeterli)
5. Kurulumdan sonra bilgisayarı yeniden başlatın

**Kontrol:**
```powershell
node --version
npm --version
```
Her iki komut da versiyon numarası göstermeli.

### 2. PostgreSQL Kurulumu

**Windows için:**
1. https://www.postgresql.org/download/windows/ adresine gidin
2. "Download the installer" butonuna tıklayın
3. İndirilen `.exe` dosyasını çalıştırın
4. Kurulum sırasında:
   - Port: 5432 (varsayılan)
   - **Şifre belirleyin ve unutmayın!** (postgres kullanıcısı için)
   - Locale: Turkish, Turkey (opsiyonel)
5. Kurulum tamamlandıktan sonra bilgisayarı yeniden başlatın

**Kontrol:**
```powershell
psql --version
```

**Not:** PostgreSQL kurulumundan sonra `psql` komutu PATH'e eklenmeyebilir. Bu durumda:
- PostgreSQL'in kurulu olduğu klasöre gidin (genellikle `C:\Program Files\PostgreSQL\15\bin`)
- Bu klasörü Windows PATH'e ekleyin

### 3. Veritabanı Oluşturma

**pgAdmin kullanarak (GUI):**
1. pgAdmin'i açın (PostgreSQL ile birlikte gelir)
2. Sol panelde "Servers" > "PostgreSQL 15" > "Databases" üzerine sağ tıklayın
3. "Create" > "Database" seçin
4. Database name: `crane_truck_db`
5. "Save" butonuna tıklayın

**Komut satırından:**
```powershell
createdb -U postgres crane_truck_db
```
Şifre sorulacak, kurulum sırasında belirlediğiniz şifreyi girin.

### 4. Tabloları Oluşturma

**pgAdmin kullanarak:**
1. `crane_truck_db` veritabanına sağ tıklayın
2. "Query Tool" seçin
3. `database/migrations/001_create_tables.sql` dosyasını açın
4. İçeriğini kopyalayıp Query Tool'a yapıştırın
5. "Execute" (F5) butonuna tıklayın

**Komut satırından:**
```powershell
psql -U postgres -d crane_truck_db -f "crane-truck-app\database\migrations\001_create_tables.sql"
```

### 5. Test Verilerini Yükleme (Opsiyonel)

**pgAdmin kullanarak:**
1. Query Tool'u açın
2. `database/seed.sql` dosyasını açın ve içeriğini çalıştırın

**Komut satırından:**
```powershell
psql -U postgres -d crane_truck_db -f "crane-truck-app\database\seed.sql"
```

## Uygulamayı Çalıştırma

### Backend

1. Terminal/PowerShell'de proje klasörüne gidin:
```powershell
cd "crane-truck-app\backend"
```

2. Bağımlılıkları yükleyin:
```powershell
npm install
```

3. `.env` dosyasını oluşturun ve düzenleyin:
```powershell
# .env dosyası içeriği:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crane_truck_db
DB_USER=postgres
DB_PASSWORD=buraya_postgres_sifrenizi_yazin
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

4. Backend'i başlatın:
```powershell
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

### Frontend

**Yeni bir terminal penceresi açın:**

1. Frontend klasörüne gidin:
```powershell
cd "crane-truck-app\frontend"
```

2. Bağımlılıkları yükleyin:
```powershell
npm install
```

3. Frontend'i başlatın:
```powershell
npm run dev
```

Frontend otomatik olarak `http://localhost:3000` adresinde açılacak.

## 🎉 Hazır!

Tarayıcınızda `http://localhost:3000` adresine gidin ve uygulamayı görün!

## 🐛 Sorun Giderme

### "psql komutu bulunamadı"
- PostgreSQL'in `bin` klasörünü PATH'e ekleyin
- Veya pgAdmin kullanın

### "node komutu bulunamadı"
- Node.js'in kurulu olduğundan emin olun
- Bilgisayarı yeniden başlatın
- PATH'e eklendiğinden emin olun

### Veritabanı bağlantı hatası
- PostgreSQL servisinin çalıştığından emin olun
- `.env` dosyasındaki şifrenin doğru olduğundan emin olun
- Veritabanının oluşturulduğundan emin olun

### Port zaten kullanımda
- Port 3000 veya 3001 başka bir uygulama tarafından kullanılıyor olabilir
- O uygulamayı kapatın veya `.env` dosyasında farklı port kullanın






