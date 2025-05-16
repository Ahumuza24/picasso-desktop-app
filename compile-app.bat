@echo off
echo Building Picasso Design Agency Desktop App...

REM Build React frontend
cd Frontend
echo Building frontend...
call npm install
call npm run build

REM Build Tauri app
echo Building Tauri desktop app...
call npm run bundle

echo Build complete!
echo The Windows executable can be found in Frontend\src-tauri\target\release\picasso-design-agency.exe 