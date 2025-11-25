# 🗄️ Manuel Veritabanı Oluşturma Rehberi

## 📋 Adım Adım Talimatlar

### 1️⃣ PostgreSQL Servisini Kontrol Et

PowerShell'de:
```powershell
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
```

Eğer servis çalışmıyorsa, başlatın:
```powershell
Get-Service -Name postgresql* | Start-Service
```

### 2️⃣ PostgreSQL'e Bağlan

PowerShell'de:
```powershell
cd "C:\Program Files\PostgreSQL\18\bin"
.\psql.exe -U postgres
```

**Not:** Parola sorulursa, kurulumda belirlediğiniz parolayı girin. Parola yoksa Enter'a basın.

### 3️⃣ Veritabanını Oluştur

psql içinde şu komutu çalıştırın:
```sql
CREATE DATABASE crane_truck_db;
```

Çıkmak için:
```sql
\q
```

### 4️⃣ Tabloları Oluştur

PowerShell'de (psql dışında):
```powershell
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
```

### 5️⃣ Test Verilerini Yükle (Opsiyonel)

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\seed.sql"
```

## ✅ Kontrol Et

Veritabanının oluşturulduğunu kontrol edin:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "\l" | Select-String "crane_truck_db"
```

Tabloların oluşturulduğunu kontrol edin:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -c "\dt"
```

## 🎯 Tek Komutla (Parola Yoksa)

Eğer PostgreSQL'de parola belirlemediyseniz, tüm işlemleri tek seferde yapabilirsiniz:

```powershell
# Veritabanı oluştur
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE crane_truck_db;"

# Tabloları oluştur
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"

# Test verilerini yükle (opsiyonel)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\seed.sql"
```

## 🔐 Parola Varsa

Eğer PostgreSQL'de parola belirlediyseniz, her komuttan önce parolayı girmeniz gerekecek. Alternatif olarak `PGPASSWORD` environment variable kullanabilirsiniz:

```powershell
# Parolayı ayarla (geçici olarak)
$env:PGPASSWORD = "parolaniz_buraya"

# Komutları çalıştır
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE crane_truck_db;"
cd "C:\Users\ACER\Desktop\First Step\crane-truck-app"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\migrations\001_create_tables.sql"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d crane_truck_db -f "database\seed.sql"

# Parolayı temizle (güvenlik için)
$env:PGPASSWORD = ""
```

## 🐛 Sorun Giderme

### "could not connect to server"
- PostgreSQL servisinin çalıştığından emin olun
- `services.msc` ile servisi başlatın

### "password authentication failed"
- Parolayı yanlış girdiniz
- Parola yoksa Enter'a basın

### "database already exists"
- Veritabanı zaten var, sorun değil
- Devam edebilirsiniz

### "permission denied"
- PowerShell'i Yönetici olarak çalıştırın




