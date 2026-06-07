-- Migration: Change due_date from DATE to TIMESTAMP to preserve time component
-- Previously, times were stripped to midnight because the column was DATE type

ALTER TABLE assignments 
ALTER COLUMN due_date TYPE TIMESTAMP USING due_date::TIMESTAMP;
