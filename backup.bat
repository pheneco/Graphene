@echo off

echo.
echo backing up database

echo reading config.json
for /f "delims=" %%i in ('node cfg.js backupDir') do set backupDir=%%i
for /f "delims=" %%i in ('node cfg.js mongoDir') do set mongoDir=%%i
for /f "delims=" %%i in ('node cfg.js database') do set database=%%i
for /f "delims=" %%i in ('node cfg.js sevenZipDir') do set sevenZipDir=%%i
for /f "delims=" %%i in ('node cfg.js serverDir') do set serverDir=%%i

echo moving to backup directory
if not exist %backupDir% md %backupDir%
cd %backupDir%

echo creating backup filename
set filename=%database% %date% %time%
set filename=%filename:/=-%
set filename=%filename:.=_%
set filename=%filename::=-%
echo filename "%filename%"

echo dumping backup
%mongoDir%\mongoDump --out "%filename%" --db %database% >nul 2>&1

echo compressing backup
"%sevenZipDir%\7z.exe" a -tzip "%filename%.zip" "%filename%" > nul

echo deleting uncompressed backup
rmdir "%filename%" /s /q
echo backup complete
echo.

cd %serverDir%