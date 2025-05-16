Write-Host "Building Drive Mapper Desktop App..." -ForegroundColor Green

# Compile the Go backend
Set-Location -Path Backend
Write-Host "Building backend executable..." -ForegroundColor Yellow
go build -o drive-mapper-backend.exe
if (-not $?) {
    Write-Host "Failed to build backend!" -ForegroundColor Red
    exit 1
}
Write-Host "Backend build successful!" -ForegroundColor Green

# Return to root directory
Set-Location -Path ..

# Build React frontend
Set-Location -Path Frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm install
if (-not $?) {
    Write-Host "Failed to install frontend dependencies!" -ForegroundColor Red
    exit 1
}

npm run build
if (-not $?) {
    Write-Host "Failed to build frontend!" -ForegroundColor Red
    exit 1
}

# Build Tauri app
Write-Host "Building Tauri desktop app..." -ForegroundColor Yellow
npm run bundle
if (-not $?) {
    Write-Host "Failed to bundle Tauri app!" -ForegroundColor Red
    exit 1
}

# Copy backend executable to the release directory
Write-Host "Copying backend executable to release directory..." -ForegroundColor Yellow
$releaseDir = "src-tauri\target\release"
Copy-Item -Path "..\Backend\drive-mapper-backend.exe" -Destination "$releaseDir\drive-mapper-backend.exe" -Force
if (-not $?) {
    Write-Host "Failed to copy backend executable!" -ForegroundColor Red
    exit 1
}

Write-Host "Build complete!" -ForegroundColor Green
Write-Host "The Windows executable can be found in: Frontend\src-tauri\target\release\drive-mapper.exe" -ForegroundColor Cyan

# Return to the original directory
Set-Location -Path .. 