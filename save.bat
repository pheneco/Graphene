@echo off

echo.
echo saving update

echo reading config.json
for /f "delims=" %%i in ('node cfg.js mongoDir') do set mongoDir=%%i
for /f "delims=" %%i in ('node cfg.js sub') do set sub=%%i
for /f "delims=" %%i in ('node cfg.js %sub%ServerDir') do set serverDir=%%i
for /f "delims=" %%i in ('node cfg.js %sub%ClientDir') do set clientDir=%%i

echo moving to changelog dir
if not exist %serverDir%\changelog md %serverDir%\changelog
cd %serverDir%\changelog

echo dumping web client changelog
%mongoDir%\mongoDump --out "tmp" --db %sub%phene --collection webClientChanges >nul 2>&1

echo dumping server changelog
%mongoDir%\mongoDump --out "tmp" --db %sub%phene --collection serverChanges >nul 2>&1

echo moving .bson files
move /y %serverDir%\changelog\tmp\%sub%phene\*.bson %serverDir%\changelog >nul

echo removing temporary dir
rmdir /s /q %serverDir%\changelog\tmp

echo returning to server dir
cd %serverDir%

echo copying client code
if not exist %serverDir%\client md %serverDir%\client
xcopy %clientDir% %serverDir%\client\ /e /h /c /r /q /y >nul

echo pushing changes to github
git add .
echo.
set /p changeDesc=describe changes: 
git commit -m "%changeDesc%" >nul
echo.
git remote add origin https://github.com/Trewbot/Graphene.git >nul 2>&1
git push origin master >nul

backup