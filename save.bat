@echo off

echo.
echo saving update

echo reading config.json
for /f "delims=" %%i in ('node cfg.js mongoDir') do set mongoDir=%%i
for /f "delims=" %%i in ('node cfg.js database') do set database=%%i
for /f "delims=" %%i in ('node cfg.js serverDir') do set serverDir=%%i

echo moving to changelog dir
if not exist %serverDir%\changelog md %serverDir%\changelog
cd %serverDir%\changelog

echo dumping web client changelog
%mongoDir%\mongoDump --out "tmp" --db %database% --collection webClientChanges >nul 2>&1

echo dumping server changelog
%mongoDir%\mongoDump --out "tmp" --db %database% --collection serverChanges >nul 2>&1

echo moving .bson files
move /y %serverDir%\changelog\tmp\%database%\*.bson %serverDir%\changelog >nul

echo removing temporary dir
rmdir /s /q %serverDir%\changelog\tmp

echo returning to server dir
cd %serverDir%

echo pushing changes to github
git add .
if [%1]==[] (
	set /p changeDesc=describe changes: 
) else (
	set changeDesc=%*
)
git commit -m "%changeDesc%" >nul
git remote add origin https://github.com/Trewbot/Graphene.git >nul 2>&1
set /p branch=branch: 
git push origin %branch% >nul

backup