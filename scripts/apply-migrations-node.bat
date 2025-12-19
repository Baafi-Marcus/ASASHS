@echo off
REM This script applies all database migrations using Node.js

echo Applying all database migrations using Node.js...
echo.

REM Apply the semester migration
echo Applying semester migration...
node scripts/apply-migration.cjs

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