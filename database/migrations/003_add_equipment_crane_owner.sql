DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='equipment_items' AND column_name='on_crane_id'
  ) THEN
    ALTER TABLE equipment_items
      RENAME COLUMN on_crane_id TO owner_crane_id;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='equipment_items' AND column_name='owner_crane_id'
  ) THEN
    ALTER TABLE equipment_items
      ADD COLUMN owner_crane_id INTEGER REFERENCES cranes(id) ON DELETE SET NULL;
  END IF;

  EXECUTE 'ALTER TABLE equipment_items DROP CONSTRAINT IF EXISTS check_location_or_truck';
  EXECUTE '
    ALTER TABLE equipment_items
    ADD CONSTRAINT check_location_or_truck CHECK (
      (
        (current_location_id IS NOT NULL)::int +
        (on_truck_id IS NOT NULL)::int
      ) <= 1
    )';

  CREATE INDEX IF NOT EXISTS idx_equipment_items_owner ON equipment_items(owner_crane_id);
END$$;

