-- Proje Mühendisi ve Proje Saha Sorumlusu alanlarını ekle
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_engineer_id INTEGER REFERENCES persons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_site_manager_id INTEGER REFERENCES persons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_engineer ON projects(project_engineer_id);
CREATE INDEX IF NOT EXISTS idx_projects_site_manager ON projects(project_site_manager_id);



