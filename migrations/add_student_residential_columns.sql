-- Migration script to add residential status columns to students table
-- This script adds residential_status and house_preference columns to the students table

-- Add residential_status column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS residential_status VARCHAR(20) DEFAULT 'Day Student' 
CHECK (residential_status IN ('Day Student', 'Boarding Student'));

-- Add house_preference column
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS house_preference VARCHAR(50);

-- Update any existing records to have default values
UPDATE students 
SET residential_status = 'Day Student' 
WHERE residential_status IS NULL;