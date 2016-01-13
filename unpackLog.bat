@echo off

echo.
echo unpacking changelog

echo reading config.json
for /f "delims=" %%i in ('node cfg.js mongoDir') do set mongoDir=%%i
for /f "delims=" %%i in ('node cfg.js database') do set database=%%i
for /f "delims=" %%i in ('node cfg.js serverDir') do set serverDir=%%i

echo updating client changelog
%mongoDir%\mongorestore --drop --db %database% %serverDir%\changelog\webClientChanges.bson >nul 2>&1

echo updating server changelog
%mongoDir%\mongorestore --drop --db %database% %serverDir%\changelog\serverChanges.bson >nul 2>&1
