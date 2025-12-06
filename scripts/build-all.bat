@echo off
setlocal enabledelayedexpansion

rem Build Tauri artifacts for Windows (x64 + ARM64).
cd /d "%~dp0\.."

echo Installing JS deps...
pnpm install
if errorlevel 1 exit /b 1

echo Adding Rust targets...
rustup target add x86_64-pc-windows-msvc aarch64-pc-windows-msvc
if errorlevel 1 exit /b 1

echo Building Windows (x64)...
pnpm tauri build --target x86_64-pc-windows-msvc
if errorlevel 1 exit /b 1

echo Building Windows (ARM64)...
pnpm tauri build --target aarch64-pc-windows-msvc
if errorlevel 1 exit /b 1

echo Done. Bundles are in src-tauri\target\release\bundle\
endlocal
