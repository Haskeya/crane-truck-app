-- Vinç & Kamyon Operasyon Yönetim Sistemi
-- Veritabanı Migration Script'leri
-- PostgreSQL

-- 1. Customers (Müşteriler)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);

-- 2. Locations (Konumlar)
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('GARAGE', 'DEPOT', 'PROJECT', 'OTHER')),
    address TEXT,
    city VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- 3. Projects (Projeler)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- 4. Cranes (Vinçler)
CREATE TABLE IF NOT EXISTS cranes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    plate_no VARCHAR(20) UNIQUE,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'MOBILE' CHECK (type IN ('MOBILE', 'PALETLI', 'SEPET', 'HIUP')),
    serial_no VARCHAR(100),
    tonnage NUMERIC,
    machine_category VARCHAR(100),
    brand_model VARCHAR(255),
    model_year INTEGER,
    km_reading VARCHAR(50),
    engine_hours VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RETIRED')),
    current_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    current_location_text VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cranes_model ON cranes(model);
CREATE INDEX IF NOT EXISTS idx_cranes_type ON cranes(type);
CREATE INDEX IF NOT EXISTS idx_cranes_status ON cranes(status);
CREATE INDEX IF NOT EXISTS idx_cranes_location ON cranes(current_location_id);
CREATE INDEX IF NOT EXISTS idx_cranes_plate ON cranes(plate_no);

-- 5. Trucks (Kamyonlar)
CREATE TABLE IF NOT EXISTS trucks (
    id SERIAL PRIMARY KEY,
    plate_no VARCHAR(20) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('LOWBED', 'FLATBED', 'OTHER')),
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'RETIRED')),
    current_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trucks_plate ON trucks(plate_no);
CREATE INDEX IF NOT EXISTS idx_trucks_type ON trucks(type);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
CREATE INDEX IF NOT EXISTS idx_trucks_location ON trucks(current_location_id);

-- 6. Equipment Types (Ekipman Tipleri)
CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('BOOM', 'JIB', 'COUNTERWEIGHT', 'OTHER')),
    unit VARCHAR(20) DEFAULT 'PIECE' CHECK (unit IN ('PIECE', 'METER', 'TON', 'KG')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_types_category ON equipment_types(category);
CREATE INDEX IF NOT EXISTS idx_equipment_types_name ON equipment_types(name);

-- 7. Equipment Items (Ekipman Parçaları)
CREATE TABLE IF NOT EXISTS equipment_items (
    id SERIAL PRIMARY KEY,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    serial_no VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED')),
    current_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    on_truck_id INTEGER REFERENCES trucks(id) ON DELETE SET NULL,
    owner_crane_id INTEGER REFERENCES cranes(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_location_or_truck CHECK (
        (
            (current_location_id IS NOT NULL)::int +
            (on_truck_id IS NOT NULL)::int
        ) <= 1
    )
);

CREATE INDEX IF NOT EXISTS idx_equipment_items_type ON equipment_items(equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_status ON equipment_items(status);
CREATE INDEX IF NOT EXISTS idx_equipment_items_location ON equipment_items(current_location_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_truck ON equipment_items(on_truck_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_owner ON equipment_items(owner_crane_id);

-- 8. Persons (Personel)
CREATE TABLE IF NOT EXISTS persons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('OPERATOR', 'RIGGER', 'DRIVER', 'SUPERVISOR', 'OTHER')),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_persons_role ON persons(role);
CREATE INDEX IF NOT EXISTS idx_persons_status ON persons(status);
CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);

-- 9. Project Assignments (Proje Atamaları)
CREATE TABLE IF NOT EXISTS project_assignments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('CRANE', 'TRUCK', 'EQUIPMENT', 'PERSON')),
    resource_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    unassignment_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_resource ON project_assignments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_active ON project_assignments(project_id, unassigned_at) WHERE unassigned_at IS NULL;

-- 10. Movement Logs (Hareket Kayıtları)
CREATE TABLE IF NOT EXISTS movement_logs (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('CRANE', 'TRUCK', 'EQUIPMENT')),
    resource_id INTEGER NOT NULL,
    from_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    moved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    moved_by INTEGER REFERENCES persons(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movement_logs_resource ON movement_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_movement_logs_dates ON movement_logs(moved_at);
CREATE INDEX IF NOT EXISTS idx_movement_logs_from_location ON movement_logs(from_location_id);
CREATE INDEX IF NOT EXISTS idx_movement_logs_to_location ON movement_logs(to_location_id);

-- 11. Crane Config Templates (Vinç Konfigürasyon Şablonları)
CREATE TABLE IF NOT EXISTS crane_config_templates (
    id SERIAL PRIMARY KEY,
    crane_model VARCHAR(100) NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    description TEXT,
    diagram_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crane_model, config_name)
);

CREATE INDEX IF NOT EXISTS idx_crane_config_templates_model ON crane_config_templates(crane_model);

-- 12. Crane Config Template Items (Şablon Ekipman Listesi)
CREATE TABLE IF NOT EXISTS crane_config_template_items (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES crane_config_templates(id) ON DELETE CASCADE,
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_template_items_template ON crane_config_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_equipment ON crane_config_template_items(equipment_type_id);

-- 13. Project Crane Configs (Proje Vinç Konfigürasyonları)
CREATE TABLE IF NOT EXISTS project_crane_configs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    crane_id INTEGER NOT NULL REFERENCES cranes(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES crane_config_templates(id) ON DELETE RESTRICT,
    configured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    configured_by INTEGER REFERENCES persons(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_crane_configs_project ON project_crane_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_crane_configs_crane ON project_crane_configs(crane_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cranes_updated_at BEFORE UPDATE ON cranes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_items_updated_at BEFORE UPDATE ON equipment_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crane_config_templates_updated_at BEFORE UPDATE ON crane_config_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

