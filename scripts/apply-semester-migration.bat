@echo off
REM This script applies the migration to add semester field to classes table

echo Applying semester migration to database...
echo.

REM Run the migration script
psql "%DATABASE_URL%" -f "../migrations/add-semester-to-classes.sql"

if %errorlevel% == 0 (
    echo.
    echo Migration applied successfully!
    echo The semester field has been added to the classes table.
    echo.
) else (
    echo.
    echo Error applying migration. Please check the database connection and try again.
    echo.
)

pause