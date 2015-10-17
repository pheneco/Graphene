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
git fetch --all
git reset --hard origin/master

echo updating client changelog
%mongoDir%\mongorestore --drop --db %sub%phene %serverDir%\changelog\webClientChanges.bson >nul 2>&1

echo updating server changelog
%mongoDir%\mongorestore --drop --db %sub%phene %serverDir%\changelog\serverChanges.bson >nul 2>&1

echo changing $dev to false
del %serverDir%\client\scripts\dev.php
rename %serverDir%\client\scripts\gra.php dev.php

echo copying client code
xcopy %serverDir%\client %clientDir%\ /e /h /c /r /q /y >nul

echo running npm install
call npm install

echo running update commands
node update.js

backup