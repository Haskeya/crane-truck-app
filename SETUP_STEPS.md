# 🚀 PostgreSQL Kurulum Sonrası Adımlar

## ✅ Adım 1: PostgreSQL Kurulumunu Tamamlayın

1. İndirdiğiniz `.exe` dosyasını çalıştırın
2. Kurulum sırasında:
   - **Port:** 5432 (varsayılan - değiştirmeyin)
   - **Şifre:** postgres kullanıcısı için bir şifre belirleyin ⚠️ **UNUTMAYIN!**
   - **Locale:** Turkish, Turkey (opsiyonel)
3. Kurulum tamamlandıktan sonra **bilgisayarı yeniden başlatın**

## ✅ Adım 2: pgAdmin ile Veritabanı Oluşturma (Kolay Yol)

pgAdmin, PostgreSQL ile birlikte gelir ve görsel arayüz sağlar.

### 2.1. pgAdmin'i Açın
- Başlat menüsünden "pgAdmin 4" arayın ve açın
- İlk açılışta master şifre isteyebilir (bu pgAdmin için, farklı bir şifre olabilir)

### 2.2. PostgreSQL Sunucusuna Bağlanın
- Sol panelde "Servers" > "PostgreSQL 15" (veya kurduğunuz versiyon) üzerine tıklayın
- Şifre sorulursa, kurulum sırasında belirlediğiniz **postgres şifresini** girin

### 2.3. Veritabanı Oluşturun
1. Sol panelde "Servers" > "PostgreSQL 15" > "Databases" üzerine **sağ tıklayın**
2. "Create" > "Database..." seçin
3. **Database name:** `crane_truck_db` yazın
4. "Save" butonuna tıklayın

### 2.4. Tabloları Oluşturun
1. Sol panelde yeni oluşturduğunuz `crane_truck_db` veritabanına tıklayın
2. Üst menüden "Tools" > "Query Tool" seçin (veya sağ tıklayıp "Query Tool")
3. Aşağıdaki dosyayı açın:
   ```
   C:\Users\ACER\Desktop\First Step\crane-truck-app\database\migrations\001_create_tables.sql
   ```
4. Dosyanın **tüm içeriğini** kopyalayın (Ctrl+A, Ctrl+C)
5. Query Tool'a yapıştırın (Ctrl+V)
6. **F5** tuşuna basın veya üstteki "Execute" (▶) butonuna tıklayın
7. Başarılı mesajını görmelisiniz: "Query returned successfully"

### 2.5. Test Verilerini Yükleyin (Opsiyonel ama Önerilir)
1. Query Tool'da yeni bir sorgu açın (üstteki "New Query" butonu)
2. Şu dosyayı açın:
   ```
   C:\Users\ACER\Desktop\First Step\crane-truck-app\database\seed.sql
   ```
3. İçeriğini kopyalayıp Query Tool'a yapıştırın
4. **F5** tuşuna basın veya "Execute" butonuna tıklayın

## ✅ Adım 3: Node.js Kurulumu

PostgreSQL hazır! Şimdi Node.js'e ihtiyacımız var.

1. https://nodejs.org/ adresine gidin
2. **LTS (Long Term Support)** versiyonunu indirin (önerilen)
3. İndirilen `.msi` dosyasını çalıştırın
4. Kurulum sihirbazını takip edin (varsayılan ayarlar yeterli)
5. Kurulumdan sonra **bilgisayarı yeniden başlatın**

### Node.js Kurulumunu Test Edin
PowerShell'de şu komutu çalıştırın:
```powershell
node --version
npm --version
```
Her ikisi de versiyon numarası göstermeli.

## ✅ Adım 4: Backend Kurulumu

### 4.1. Backend Klasörüne Gidin
PowerShell'de:
```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\backend"
```

### 4.2. Bağımlılıkları Yükleyin
```powershell
npm install
```
Bu işlem birkaç dakika sürebilir.

### 4.3. .env Dosyası Oluşturun
Backend klasöründe `.env` adında bir dosya oluşturun ve şu içeriği ekleyin:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crane_truck_db
DB_USER=postgres
DB_PASSWORD=buraya_postgres_kurulumunda_belirlediginiz_sifreyi_yazin
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**ÖNEMLİ:** `DB_PASSWORD` kısmına PostgreSQL kurulumunda belirlediğiniz şifreyi yazın!

### 4.4. Backend'i Başlatın
```powershell
npm run dev
```

Başarılı olursa şunu göreceksiniz:
```
🚀 Server is running on http://localhost:3001
📊 API available at http://localhost:3001/api/v1
```

## ✅ Adım 5: Frontend Kurulumu

**Yeni bir PowerShell penceresi açın** (backend çalışırken):

### 5.1. Frontend Klasörüne Gidin
```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app\frontend"
```

### 5.2. Bağımlılıkları Yükleyin
```powershell
npm install
```

### 5.3. Frontend'i Başlatın
```powershell
npm run dev
```

Tarayıcı otomatik olarak `http://localhost:3000` adresinde açılacak! 🎉

## 🎯 Kontrol Listesi

- [ ] PostgreSQL kuruldu ve çalışıyor
- [ ] `crane_truck_db` veritabanı oluşturuldu
- [ ] Tablolar oluşturuldu (001_create_tables.sql çalıştırıldı)
- [ ] Test verileri yüklendi (seed.sql çalıştırıldı - opsiyonel)
- [ ] Node.js kuruldu
- [ ] Backend bağımlılıkları yüklendi (npm install)
- [ ] .env dosyası oluşturuldu ve şifre girildi
- [ ] Backend çalışıyor (port 3001)
- [ ] Frontend bağımlılıkları yüklendi (npm install)
- [ ] Frontend çalışıyor (port 3000)

## 🐛 Sorun Giderme

### PostgreSQL şifresini unuttum
- pgAdmin'de "Servers" > "PostgreSQL 15" > sağ tık > "Properties" > "Connection" sekmesinde şifreyi görebilirsiniz
- Veya PostgreSQL'i yeniden kurun

### "psql komutu bulunamadı" hatası
- pgAdmin kullanın (komut satırı yerine)
- Veya PostgreSQL'in `bin` klasörünü PATH'e ekleyin

### Backend başlamıyor
- PostgreSQL servisinin çalıştığından emin olun
- .env dosyasındaki şifrenin doğru olduğundan emin olun
- Veritabanının oluşturulduğundan emin olun

### Port zaten kullanımda
- Port 3000 veya 3001 başka bir uygulama tarafından kullanılıyor olabilir
- O uygulamayı kapatın

## 📞 Yardım

Herhangi bir adımda takıldıysanız, hangi adımda olduğunuzu söyleyin, yardımcı olayım!





