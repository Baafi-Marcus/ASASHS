@echo off
REM This script applies all database migrations

echo Applying all database migrations...
echo.

REM Apply the class_subjects table migration (if not already applied)
echo Applying class_subjects migration...
psql "%DATABASE_URL%" -f "../migrations/add-indexes-and-class-subjects.sql"

if %errorlevel% neq 0 (
    echo Error applying class_subjects migration
    pause
    exit /b %errorlevel%
)

echo class_subjects migration applied successfully!
echo.

REM Apply the semester migration
echo Applying semester migration...
psql "%DATABASE_URL%" -f "../migrations/complete-semester-migration.sql"

if %errorlevel% neq 0 (
    echo Error applying semester migration
    pause
    exit /b %errorlevel%
)

echo Semester migration applied successfully!
echo.

echo All migrations applied successfully!
echo The database is now ready for the semester-based academic system.
echo.

pause