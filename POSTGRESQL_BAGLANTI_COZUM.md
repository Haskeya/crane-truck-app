# 🔧 PostgreSQL Bağlantı Sorunu Çözümü

## Sorun: pgAdmin'de PostgreSQL sunucusuna bağlanamıyorum

### ✅ Çözüm 1: pgAdmin'de Sunucu Ekleme (Manuel)

PostgreSQL kurulu ama pgAdmin'de sunucu görünmüyorsa, manuel eklemeniz gerekir:

#### Adımlar:

1. **pgAdmin'i açın**
   - Başlat menüsünden "pgAdmin 4" arayın

2. **Sunucu ekleyin:**
   - Sol panelde **"Servers"** üzerine **sağ tıklayın**
   - **"Register" > "Server..."** seçin

3. **Genel Sekmesi:**
   - **Name:** `PostgreSQL 18` (veya istediğiniz bir isim)

4. **Connection Sekmesi (ÖNEMLİ!):**
   - **Host name/address:** `localhost` (veya `127.0.0.1`)
   - **Port:** `5432`
   - **Maintenance database:** `postgres`
   - **Username:** `postgres`
   - **Password:** PostgreSQL kurulumunda belirlediğiniz şifre
   - ✅ **"Save password"** kutusunu işaretleyin

5. **"Save" butonuna tıklayın**

### ✅ Çözüm 2: Şifre Kontrolü

Eğer "password authentication failed" hatası alıyorsanız:

1. **Şifreyi unuttuysanız:**
   - PostgreSQL'i yeniden kurun
   - Veya şifreyi sıfırlayın (ileri seviye)

2. **Şifreyi hatırlıyorsanız:**
   - pgAdmin'de Connection sekmesinde şifreyi tekrar girin
   - Büyük/küçük harf duyarlı olduğundan emin olun

### ✅ Çözüm 3: PostgreSQL Servisini Başlatma

PostgreSQL servisi çalışmıyorsa:

#### Windows Servisleri ile:

1. **Windows + R** tuşlarına basın
2. `services.msc` yazın ve Enter'a basın
3. Listede **"postgresql-x64-18"** veya benzer bir isim arayın
4. Bulursanız, üzerine sağ tıklayıp **"Start"** seçin

#### Komut Satırı ile:

PowerShell'i **Yönetici olarak** açın ve:

```powershell
# PostgreSQL servisini bul
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}

# Servisi başlat (servis adını bulduktan sonra)
Start-Service -Name "postgresql-x64-18"
```

### ✅ Çözüm 4: PostgreSQL'i Manuel Başlatma

Eğer servis yoksa, PostgreSQL'i manuel başlatabilirsiniz:

```powershell
# PostgreSQL data klasörünü bulun (genellikle)
$dataDir = "C:\Program Files\PostgreSQL\18\data"

# PostgreSQL'i başlat
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D $dataDir start
```

### ✅ Çözüm 5: Port Kontrolü

Port 5432 başka bir uygulama tarafından kullanılıyor olabilir:

```powershell
# Port 5432'yi kullanan uygulamayı bul
netstat -ano | findstr :5432
```

Eğer başka bir uygulama kullanıyorsa, o uygulamayı kapatın veya PostgreSQL'i farklı bir portta çalıştırın.

### ✅ Çözüm 6: Firewall Kontrolü

Windows Firewall PostgreSQL bağlantısını engelliyor olabilir:

1. **Windows Güvenlik Duvarı** açın
2. **"Gelen kuralları yönet"** seçin
3. PostgreSQL için bir kural olup olmadığını kontrol edin
4. Yoksa, PostgreSQL için bir kural ekleyin

## 🧪 Bağlantıyı Test Etme

### pgAdmin ile:
1. Sunucuya bağlandıktan sonra
2. Sol panelde sunucu adının yanında **yeşil nokta** görünmeli
3. Sunucu adına tıklayıp genişletebilmelisiniz

### Komut Satırı ile:

PowerShell'de:

```powershell
# PostgreSQL'e bağlanmayı deneyin
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost
```

Şifre sorulacak, kurulumda belirlediğiniz şifreyi girin.

Başarılı olursa şunu göreceksiniz:
```
postgres=#
```

Çıkmak için: `\q` yazıp Enter'a basın.

## 📝 Hata Mesajları ve Çözümleri

### "password authentication failed"
- Şifre yanlış, tekrar deneyin
- Şifreyi unuttuysanız PostgreSQL'i yeniden kurun

### "could not connect to server"
- PostgreSQL servisi çalışmıyor, servisi başlatın
- Port 5432 kullanımda, portu kontrol edin

### "connection refused"
- PostgreSQL servisi çalışmıyor
- Firewall engelliyor olabilir

## 🆘 Hala Çalışmıyorsa

1. **PostgreSQL'i yeniden kurun:**
   - Control Panel > Programs > PostgreSQL'i kaldırın
   - Yeniden kurun ve şifreyi not edin

2. **Alternatif: SQLite kullanın:**
   - Daha basit, kurulum gerektirmez
   - Aynı işlevi görür (küçük projeler için)

## ✅ Başarılı Bağlantı Sonrası

Bağlantı başarılı olduktan sonra:

1. **Veritabanı oluşturun:**
   - Sol panelde "Databases" > sağ tık > "Create" > "Database"
   - İsim: `crane_truck_db`

2. **Tabloları oluşturun:**
   - `crane_truck_db` > sağ tık > "Query Tool"
   - `database/migrations/001_create_tables.sql` dosyasını açıp çalıştırın

3. **Test verilerini yükleyin:**
   - Query Tool'da `database/seed.sql` dosyasını çalıştırın





