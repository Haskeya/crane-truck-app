-- Add type column to cranes table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name='cranes' AND column_name='type'
  ) THEN
    ALTER TABLE cranes 
      ADD COLUMN type VARCHAR(50);
      
    UPDATE cranes SET type = 'MOBILE' WHERE type IS NULL;
    
    ALTER TABLE cranes 
      ALTER COLUMN type SET NOT NULL,
      ALTER COLUMN type SET DEFAULT 'MOBILE',
      ADD CONSTRAINT check_cranes_type CHECK (type IN ('MOBILE', 'PALETLI', 'SEPET', 'HIUP'));
      
    CREATE INDEX IF NOT EXISTS idx_cranes_type ON cranes(type);
  END IF;
END$$;




