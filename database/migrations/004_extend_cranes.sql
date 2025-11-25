ALTER TABLE cranes
  ADD COLUMN IF NOT EXISTS plate_no VARCHAR(20),
  ADD COLUMN IF NOT EXISTS tonnage NUMERIC,
  ADD COLUMN IF NOT EXISTS machine_category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS brand_model VARCHAR(255),
  ADD COLUMN IF NOT EXISTS model_year INTEGER,
  ADD COLUMN IF NOT EXISTS km_reading VARCHAR(50),
  ADD COLUMN IF NOT EXISTS engine_hours VARCHAR(50),
  ADD COLUMN IF NOT EXISTS current_location_text VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cranes_plate_no_key'
  ) THEN
    ALTER TABLE cranes ADD CONSTRAINT cranes_plate_no_key UNIQUE (plate_no);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_cranes_plate_no ON cranes(plate_no);




