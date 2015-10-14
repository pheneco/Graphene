@echo off

echo.
echo updating code

echo reading config.json
for /f "delims=" %%i in ('node cfg.js mongoDir') do set mongoDir=%%i
for /f "delims=" %%i in ('node cfg.js sub') do set sub=%%i
for /f "delims=" %%i in ('node cfg.js %sub%ServerDir') do set serverDir=%%i
for /f "delims=" %%i in ('node cfg.js %sub%ClientDir') do set clientDir=%%i

echo fetching from github
git remote add origin https://github.com/Trewbot/Graphene.git >nul 2>&1
git fetch origin

echo updating client changelog
%mongoDir%\mongorestore --drop --db %sub%phene %serverDir%\changelog\webClientChanges.bson >nul 2>&1

echo updating server changelog
%mongoDir%\mongorestore --drop --db %sub%phene %serverDir%\changelog\serverChanges.bson >nul 2>&1

echo copying client code
xcopy %serverDir%\client\ %clientDir% /e /h /c /r /q /y >nul

echo running npm install
npm install

echo running update commands
node update.js

backup