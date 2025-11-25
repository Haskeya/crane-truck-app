# 📘 pgAdmin'de PostgreSQL Sunucusu Ekleme - Detaylı Rehber

## ✅ Adım Adım Talimatlar

### 1️⃣ pgAdmin'i Açın

- **Başlat menüsünde** "pgAdmin 4" arayın
- pgAdmin 4'ü açın
- İlk açılışta master şifre isteyebilir (pgAdmin için, PostgreSQL şifresi değil)

### 2️⃣ Sunucu Ekleme

1. **Sol panelde** "Servers" yazısına **sağ tıklayın**
2. Açılan menüden **"Register"** seçin
3. Alt menüden **"Server..."** seçin

### 3️⃣ Genel Sekmesi (General Tab)

Açılan pencerede **"General"** sekmesinde:

- **Name:** `PostgreSQL 18` yazın (veya istediğiniz bir isim)
  - Bu sadece pgAdmin'de görünecek isim
  - Gerçek sunucu adı değil, sadece etiket

**"Next"** butonuna tıklayın veya **"Connection"** sekmesine geçin.

### 4️⃣ Connection Sekmesi (Bağlantı Bilgileri) ⚠️ ÖNEMLİ!

**"Connection"** sekmesinde şu bilgileri girin:

#### Host name/address:
```
localhost
```
veya
```
127.0.0.1
```

#### Port:
```
5432
```
(Bu PostgreSQL'in varsayılan portu)

#### Maintenance database:
```
postgres
```
(Bu varsayılan veritabanı)

#### Username:
```
postgres
```
(Bu varsayılan kullanıcı adı)

#### Password:
```
[PostgreSQL kurulumunda belirlediğiniz şifre]
```
⚠️ **ÖNEMLİ:** Bu şifre PostgreSQL kurulum sırasında belirlediğiniz şifre!

#### ✅ Save password:
Bu kutuyu **işaretleyin** - böylece her seferinde şifre girmeniz gerekmez.

### 5️⃣ Kaydetme

**"Save"** butonuna tıklayın.

### 6️⃣ Bağlantı Kontrolü

Bağlantı başarılı olursa:

- Sol panelde **"Servers"** altında **"PostgreSQL 18"** görünecek
- Sunucu adının yanında **yeşil nokta** (🟢) olacak
- Sunucu adına tıklayıp genişletebilmelisiniz
- Altında şunlar görünecek:
  - Databases
  - Login/Group Roles
  - Tablespaces

### 7️⃣ Veritabanı Oluşturma

Sunucuya bağlandıktan sonra:

1. Sol panelde **"PostgreSQL 18"** > **"Databases"** üzerine **sağ tıklayın**
2. **"Create"** > **"Database..."** seçin
3. **Database name:** `crane_truck_db` yazın
4. **"Save"** butonuna tıklayın

### 8️⃣ Tabloları Oluşturma

1. Sol panelde **"crane_truck_db"** veritabanına **tıklayın**
2. Üst menüden **"Tools"** > **"Query Tool"** seçin
   - Veya veritabanına **sağ tıklayıp** "Query Tool" seçin
3. Şu dosyayı açın:
   ```
   C:\Users\ACER\Desktop\First Step\crane-truck-app\database\migrations\001_create_tables.sql
   ```
4. Dosyanın **tüm içeriğini** kopyalayın (Ctrl+A, Ctrl+C)
5. Query Tool'a yapıştırın (Ctrl+V)
6. **F5** tuşuna basın veya üstteki **"Execute"** (▶) butonuna tıklayın
7. Başarılı mesajını görmelisiniz: **"Query returned successfully"**

### 9️⃣ Test Verilerini Yükleme (Opsiyonel)

1. Query Tool'da yeni bir sorgu açın (üstteki **"New Query"** butonu)
2. Şu dosyayı açın:
   ```
   C:\Users\ACER\Desktop\First Step\crane-truck-app\database\seed.sql
   ```
3. İçeriğini kopyalayıp Query Tool'a yapıştırın
4. **F5** tuşuna basın veya **"Execute"** butonuna tıklayın

## 🐛 Sorun Giderme

### "password authentication failed" hatası:
- Şifre yanlış, tekrar deneyin
- Büyük/küçük harf duyarlı olduğundan emin olun
- Şifreyi unuttuysanız PostgreSQL'i yeniden kurmanız gerekebilir

### "could not connect to server" hatası:
- PostgreSQL servisinin çalıştığından emin olun
- Windows Servisleri'nde "postgresql-x64-18" servisinin "Running" olduğunu kontrol edin

### "connection timeout" hatası:
- PostgreSQL servisi çalışmıyor
- Servisi başlatın: Windows Servisleri'nde servise sağ tıklayıp "Start" seçin

### Sunucu görünmüyor:
- Sol panelde "Servers" altında arayın
- Sunucu adına tıklayıp genişletin
- Eğer hala görünmüyorsa, tekrar eklemeyi deneyin

## ✅ Başarı Kontrolü

Bağlantı başarılı olduğunda:

1. ✅ Sol panelde sunucu görünüyor
2. ✅ Sunucu yanında yeşil nokta var
3. ✅ Sunucuya tıklayıp genişletebiliyorsunuz
4. ✅ "Databases" altında "postgres" veritabanını görebiliyorsunuz

## 📝 Sonraki Adımlar

Sunucuya başarıyla bağlandıktan sonra:

1. ✅ `crane_truck_db` veritabanını oluşturun
2. ✅ Tabloları oluşturun (001_create_tables.sql)
3. ✅ Test verilerini yükleyin (seed.sql - opsiyonel)
4. ✅ Backend'i kurun ve çalıştırın
5. ✅ Frontend'i kurun ve çalıştırın

## 🎉 Hazır!

Artık pgAdmin'de PostgreSQL sunucunuza bağlanabilir ve veritabanı işlemlerini yapabilirsiniz!





