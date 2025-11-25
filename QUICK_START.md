# 🚀 Hızlı Başlangıç Kılavuzu

## ⚡ 5 Dakikada Çalıştırma

### Adım 1: Veritabanı Hazırlığı

PostgreSQL'inizin çalıştığından emin olun, sonra:

```bash
# Veritabanı oluştur
createdb crane_truck_db

# Tabloları oluştur
psql -d crane_truck_db -f database/migrations/001_create_tables.sql

# Test verilerini yükle (opsiyonel ama önerilir)
psql -d crane_truck_db -f database/seed.sql
```

**Windows PowerShell için:**
```powershell
# PostgreSQL'in PATH'inde olduğundan emin olun
createdb crane_truck_db
psql -d crane_truck_db -f database\migrations\001_create_tables.sql
psql -d crane_truck_db -f database\seed.sql
```

### Adım 2: Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını düzenle (veritabanı şifrenizi girin)
# Windows'ta notepad .env ile açabilirsiniz

# Backend'i başlat
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak. Terminal'de "🚀 Server is running" mesajını görmelisiniz.

### Adım 3: Frontend Kurulumu

**Yeni bir terminal penceresi açın:**

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Frontend'i başlat
npm run dev
```

Frontend `http://localhost:3000` adresinde otomatik açılacak.

## ✅ Kontrol Listesi

- [ ] PostgreSQL çalışıyor
- [ ] Veritabanı oluşturuldu
- [ ] Tablolar oluşturuldu
- [ ] Test verileri yüklendi (opsiyonel)
- [ ] Backend bağımlılıkları yüklendi
- [ ] Backend çalışıyor (port 3001)
- [ ] Frontend bağımlılıkları yüklendi
- [ ] Frontend çalışıyor (port 3000)

## 🎯 İlk Görüntüleme

Tarayıcınızda `http://localhost:3000` adresine gidin. Şunları görmelisiniz:

1. **Dashboard**: İstatistikler ve özet bilgiler
2. **Projeler**: Test projeleri listesi
3. **Vinçler**: Test vinçleri listesi
4. **Kamyonlar**: Test kamyonları listesi
5. **Müşteriler**: Test müşterileri listesi

## 🐛 Sorun Giderme

### Backend başlamıyor
- PostgreSQL'in çalıştığından emin olun
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin
- Port 3001'in kullanımda olmadığından emin olun

### Frontend başlamıyor
- Port 3000'in kullanımda olmadığından emin olun
- Backend'in çalıştığından emin olun

### Veri görünmüyor
- Veritabanı bağlantısını kontrol edin
- `seed.sql` dosyasını çalıştırdığınızdan emin olun
- Backend console'unda hata mesajı var mı kontrol edin

## 📞 Yardım

Sorun yaşıyorsanız:
1. Backend ve frontend console'larını kontrol edin
2. Veritabanı bağlantısını test edin: `psql -d crane_truck_db -c "SELECT COUNT(*) FROM projects;"`
3. API'yi test edin: `http://localhost:3001/api/health`

