-- Add storage_path column to excel_files table
ALTER TABLE excel_files
ADD COLUMN IF NOT EXISTS storage_path TEXT; 