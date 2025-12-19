@echo off
echo Applying database migration for class subjects and indexes...
echo.

REM This script applies the migration to add indexes and class_subjects table
REM Make sure to update the database connection details below

echo Running migration script...
psql -h your-database-host -U your-username -d your-database-name -f migrations/add-indexes-and-class-subjects.sql

echo.
echo Migration completed!
echo Please verify that the class_subjects table and indexes were created successfully.
pause