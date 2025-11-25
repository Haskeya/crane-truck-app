# 🏗️ Vinç & Kamyon Operasyon Yönetim Sistemi

Kapsamlı operasyon takip ve yönetim sistemi. Proje, vinç, kamyon, ekipman ve personel yönetimi için tasarlanmıştır.

## 📋 Özellikler

- ✅ Proje yönetimi
- ✅ Vinç ve kamyon takibi
- ✅ Ekipman yönetimi
- ✅ Konum takibi (manuel)
- ✅ Hareket kayıtları
- ✅ Dashboard ve raporlama
- ✅ Müşteri yönetimi

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ 
- PostgreSQL 14+
- npm veya yarn

### 1. Veritabanı Kurulumu

```bash
# PostgreSQL'de veritabanı oluştur
createdb crane_truck_db

# Migration'ları çalıştır
psql -d crane_truck_db -f database/migrations/001_create_tables.sql

# Test verilerini yükle (opsiyonel)
psql -d crane_truck_db -f database/seed.sql
```

### 2. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle ve veritabanı bilgilerini girin

# Geliştirme modunda çalıştır
npm run dev
```

Backend `http://localhost:3001` adresinde çalışacak.

### 3. Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme modunda çalıştır
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacak.

## 📁 Proje Yapısı

```
crane-truck-app/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── routes/   # API route'ları
│   │   ├── config/   # Konfigürasyon
│   │   └── server.ts # Ana server dosyası
│   └── package.json
├── frontend/          # React uygulaması
│   ├── src/
│   │   ├── pages/    # Sayfa component'leri
│   │   ├── api/      # API client
│   │   └── App.tsx   # Ana component
│   └── package.json
├── database/          # Veritabanı script'leri
│   ├── migrations/   # Migration dosyaları
│   └── seed.sql      # Test verileri
└── README.md
```

## 🔌 API Endpoint'leri

### Dashboard
- `GET /api/v1/dashboard/overview` - Genel özet

### Projeler
- `GET /api/v1/projects` - Proje listesi
- `GET /api/v1/projects/:id` - Proje detayı
- `POST /api/v1/projects` - Yeni proje
- `PUT /api/v1/projects/:id` - Proje güncelle
- `DELETE /api/v1/projects/:id` - Proje sil

### Vinçler
- `GET /api/v1/cranes` - Vinç listesi
- `GET /api/v1/cranes/:id` - Vinç detayı
- `POST /api/v1/cranes` - Yeni vinç
- `PUT /api/v1/cranes/:id` - Vinç güncelle
- `POST /api/v1/cranes/:id/move` - Vinç konum değiştir

### Kamyonlar
- `GET /api/v1/trucks` - Kamyon listesi
- `GET /api/v1/trucks/:id` - Kamyon detayı
- `POST /api/v1/trucks` - Yeni kamyon

### Müşteriler
- `GET /api/v1/customers` - Müşteri listesi
- `POST /api/v1/customers` - Yeni müşteri

## 🎨 Ekranlar

- **Dashboard**: Genel istatistikler ve özet bilgiler
- **Projeler**: Proje listesi ve yönetimi
- **Vinçler**: Vinç listesi ve detayları
- **Kamyonlar**: Kamyon listesi ve detayları
- **Müşteriler**: Müşteri listesi

## 📝 Notlar

- Veritabanı bağlantı bilgilerini `.env` dosyasında yapılandırın
- İlk kurulumda `seed.sql` dosyasını çalıştırarak test verileri yükleyebilirsiniz
- Backend ve frontend ayrı portlarda çalışır (3001 ve 3000)

## 🔄 Sonraki Adımlar

- [ ] Form ekranları (Yeni proje, vinç, kamyon ekleme)
- [ ] Detay sayfaları
- [ ] Filtreleme ve arama
- [ ] Hareket kayıtları ekranı
- [ ] Vinç konfigürasyon modülü
- [ ] Authentication ve authorization

## 📄 Lisans

ISC

