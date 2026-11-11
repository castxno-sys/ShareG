@echo off
chcp 65001 >nul
title share.G - Instalador y ejecucion
cd /d "%~dp0"

echo ===============================================
echo    share.G  -  Preparando el proyecto
echo ===============================================
echo.

REM ---- 1. Node.js ----
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [1/4] Node.js no esta instalado. Instalando Node.js LTS...
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"
) else (
  echo [1/4] Node.js ya esta instalado.
)

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo No se pudo instalar Node.js automaticamente.
  echo Descargalo de https://nodejs.org ^(version LTS^), instalalo y vuelve a abrir este archivo.
  start https://nodejs.org
  pause
  exit /b 1
)
node -v

REM ---- 2. Dependencias (React, Vite, Supabase, React Router) ----
echo.
echo [2/4] Descargando React y todas las dependencias (npm install)...
call npm install
if %errorlevel% neq 0 (
  echo Hubo un error instalando dependencias. Revisa tu conexion a internet.
  pause
  exit /b 1
)

REM ---- 3. Abrir en Visual Studio Code ----
echo.
echo [3/4] Abriendo el proyecto en Visual Studio Code...
where code >nul 2>nul
if %errorlevel% equ 0 (
  call code .
) else (
  if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
    start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "%~dp0"
  ) else (
    echo No encontre VS Code. Abre esta carpeta manualmente en VS Code.
  )
)

REM ---- 4. Ejecutar ----
echo.
echo [4/4] Iniciando share.G en http://localhost:5173 ...
echo (Para detener el servidor cierra esta ventana o presiona Ctrl+C)
echo.
call npm run dev
pause
