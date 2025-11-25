-- Seed Data - Test Verileri

-- Locations
INSERT INTO locations (name, type, city, notes) VALUES
('Bursa Garage', 'GARAGE', 'Bursa', 'Ana garaj'),
('İstanbul Depot', 'DEPOT', 'İstanbul', 'İstanbul deposu'),
('Ankara Garage', 'GARAGE', 'Ankara', 'Ankara garajı'),
('İzmir Depot', 'DEPOT', 'İzmir', 'İzmir deposu')
ON CONFLICT DO NOTHING;

-- Customers
INSERT INTO customers (name, city, notes) VALUES
('ABC İnşaat A.Ş.', 'İstanbul', 'Önemli müşteri'),
('XYZ Yapı Ltd.', 'Ankara', 'Düzenli müşteri'),
('DEF Mühendislik', 'Bursa', 'Yeni müşteri')
ON CONFLICT DO NOTHING;

-- Cranes
INSERT INTO cranes (name, model, type, serial_no, status, current_location_id, notes) VALUES
('LTM1500-001', 'LTM1500', 'MOBILE', 'SN-001', 'ACTIVE', 1, 'Ana vinç'),
('LTM1500-002', 'LTM1500', 'MOBILE', 'SN-002', 'ACTIVE', 1, 'İkinci vinç'),
('LTM1200-001', 'LTM1200', 'MOBILE', 'SN-003', 'ACTIVE', 2, 'Küçük vinç'),
('LTM1500-003', 'LTM1500', 'MOBILE', 'SN-004', 'MAINTENANCE', 1, 'Bakımda')
ON CONFLICT DO NOTHING;

-- Trucks
INSERT INTO trucks (plate_no, type, model, status, current_location_id, notes) VALUES
('34ABC123', 'LOWBED', 'Mercedes Actros', 'ACTIVE', 1, 'Ana lowbed'),
('34XYZ456', 'LOWBED', 'Volvo FH', 'ACTIVE', 2, 'İkinci lowbed'),
('06DEF789', 'FLATBED', 'MAN TGX', 'ACTIVE', 1, 'Flatbed kamyon')
ON CONFLICT DO NOTHING;

-- Equipment Types
INSERT INTO equipment_types (name, category, unit, notes) VALUES
('Boom 84m', 'BOOM', 'PIECE', '84 metre bom'),
('Boom 60m', 'BOOM', 'PIECE', '60 metre bom'),
('Counterweight 20t', 'COUNTERWEIGHT', 'PIECE', '20 ton karşı ağırlık'),
('Counterweight 10t', 'COUNTERWEIGHT', 'PIECE', '10 ton karşı ağırlık'),
('Jib 30m', 'JIB', 'PIECE', '30 metre jib')
ON CONFLICT DO NOTHING;

-- Equipment Items
INSERT INTO equipment_items (equipment_type_id, serial_no, status, current_location_id, notes) VALUES
(1, 'BOOM-84-001', 'AVAILABLE', 1, 'İlk 84m bom'),
(1, 'BOOM-84-002', 'AVAILABLE', 1, 'İkinci 84m bom'),
(2, 'BOOM-60-001', 'AVAILABLE', 2, '60m bom'),
(3, 'CW-20T-001', 'AVAILABLE', 1, '20t karşı ağırlık'),
(3, 'CW-20T-002', 'AVAILABLE', 1, '20t karşı ağırlık'),
(3, 'CW-20T-003', 'AVAILABLE', 2, '20t karşı ağırlık'),
(4, 'CW-10T-001', 'AVAILABLE', 1, '10t karşı ağırlık')
ON CONFLICT DO NOTHING;

-- Persons
INSERT INTO persons (name, phone, email, role, status, notes) VALUES
('Ahmet Yılmaz', '05321234567', 'ahmet@example.com', 'OPERATOR', 'ACTIVE', 'Deneyimli operatör'),
('Mehmet Demir', '05329876543', 'mehmet@example.com', 'RIGGER', 'ACTIVE', 'Uzman rigger'),
('Ali Kaya', '05321112233', 'ali@example.com', 'DRIVER', 'ACTIVE', 'Kamyon şoförü'),
('Ayşe Öztürk', '05324445566', 'ayse@example.com', 'SUPERVISOR', 'ACTIVE', 'Proje sorumlusu')
ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (name, customer_id, location_id, start_date, end_date, status, notes) VALUES
('ABC İnşaat - Yeni Bina Projesi', 1, 1, '2024-02-01', '2024-02-15', 'PLANNED', 'Büyük proje'),
('XYZ Yapı - Köprü İnşaatı', 2, 2, '2024-02-10', '2024-03-01', 'ACTIVE', 'Aktif proje'),
('DEF Mühendislik - Fabrika', 3, 1, '2024-03-01', '2024-03-20', 'PLANNED', 'Planlanan proje')
ON CONFLICT DO NOTHING;

-- Crane Config Templates - LTM1500 84m
WITH template AS (
  INSERT INTO crane_config_templates (crane_model, config_name, description, diagram_file_path)
  VALUES ('LTM1500', '84m Ana Konfigürasyon', 'LTM1500 için tam bom + karşı ağırlık seti', NULL)
  ON CONFLICT (crane_model, config_name) DO UPDATE
  SET description = EXCLUDED.description
  RETURNING id
),
items AS (
  SELECT template.id AS template_id, et.id AS equipment_type_id, 1 AS quantity_required, 1 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Boom 84m' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 8 AS quantity_required, 2 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 20t' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 4 AS quantity_required, 3 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 10t' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 1 AS quantity_required, 4 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Jib 30m' LIMIT 1) et ON true
)
INSERT INTO crane_config_template_items (template_id, equipment_type_id, quantity_required, order_index)
SELECT i.template_id, i.equipment_type_id, i.quantity_required, i.order_index
FROM items i
WHERE NOT EXISTS (
  SELECT 1 FROM crane_config_template_items existing
  WHERE existing.template_id = i.template_id
    AND existing.equipment_type_id = i.equipment_type_id
);

-- Crane Config Templates - LTM1500 60m
WITH template AS (
  INSERT INTO crane_config_templates (crane_model, config_name, description, diagram_file_path)
  VALUES ('LTM1500', '60m Hafif Konfigürasyon', 'Şehir içi hafif kurulum', NULL)
  ON CONFLICT (crane_model, config_name) DO UPDATE
  SET description = EXCLUDED.description
  RETURNING id
),
items AS (
  SELECT template.id AS template_id, et.id AS equipment_type_id, 1 AS quantity_required, 1 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Boom 60m' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 4 AS quantity_required, 2 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 20t' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 2 AS quantity_required, 3 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 10t' LIMIT 1) et ON true
)
INSERT INTO crane_config_template_items (template_id, equipment_type_id, quantity_required, order_index)
SELECT i.template_id, i.equipment_type_id, i.quantity_required, i.order_index
FROM items i
WHERE NOT EXISTS (
  SELECT 1 FROM crane_config_template_items existing
  WHERE existing.template_id = i.template_id
    AND existing.equipment_type_id = i.equipment_type_id
);

-- Crane Config Templates - LTM1200
WITH template AS (
  INSERT INTO crane_config_templates (crane_model, config_name, description, diagram_file_path)
  VALUES ('LTM1200', '1200 Standart Kurulum', 'Standart bom + ağırlık kombinasyonu', NULL)
  ON CONFLICT (crane_model, config_name) DO UPDATE
  SET description = EXCLUDED.description
  RETURNING id
),
items AS (
  SELECT template.id AS template_id, et.id AS equipment_type_id, 1 AS quantity_required, 1 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Boom 60m' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 2 AS quantity_required, 2 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 20t' LIMIT 1) et ON true
  UNION ALL
  SELECT template.id AS template_id, et.id AS equipment_type_id, 2 AS quantity_required, 3 AS order_index
  FROM template
  JOIN LATERAL (SELECT id FROM equipment_types WHERE name = 'Counterweight 10t' LIMIT 1) et ON true
)
INSERT INTO crane_config_template_items (template_id, equipment_type_id, quantity_required, order_index)
SELECT i.template_id, i.equipment_type_id, i.quantity_required, i.order_index
FROM items i
WHERE NOT EXISTS (
  SELECT 1 FROM crane_config_template_items existing
  WHERE existing.template_id = i.template_id
    AND existing.equipment_type_id = i.equipment_type_id
);

