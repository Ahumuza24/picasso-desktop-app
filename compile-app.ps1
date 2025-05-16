Write-Host "Building Drive Mapper Desktop App Installer..." -ForegroundColor Green

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

# Create database template
$resourcesDir = "Frontend/src-tauri/resources"
Write-Host "Setting up database files..." -ForegroundColor Yellow

# Create an empty database file in resources if it doesn't exist
if (-not (Test-Path "$resourcesDir/picasso.db")) {
    # Copy database files if they exist, otherwise create a placeholder
    if (Test-Path "Backend/data/picasso.db") {
        Copy-Item -Path "Backend/data/picasso.db" -Destination "$resourcesDir/picasso.db" -Force
    } else {
        # Create empty file
        New-Item -ItemType File -Path "$resourcesDir/picasso.db" -Force | Out-Null
    }
    Write-Host "Database template created" -ForegroundColor Green
}

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

# Create placeholder images for installer if they don't exist
if (-not (Test-Path "src-tauri/icons/banner.png")) {
    # Create a simple colored banner
    Write-Host "Creating placeholder banner image..." -ForegroundColor Yellow
    Copy-Item -Path "src-tauri/icons/icon.png" -Destination "src-tauri/icons/banner.png" -Force
}

if (-not (Test-Path "src-tauri/icons/dialog.png")) {
    # Create a simple dialog image
    Write-Host "Creating placeholder dialog image..." -ForegroundColor Yellow
    Copy-Item -Path "src-tauri/icons/icon.png" -Destination "src-tauri/icons/dialog.png" -Force
}

# Copy backend executable to the resources directory
Write-Host "Including backend executable in resources..." -ForegroundColor Yellow
Copy-Item -Path "..\Backend\drive-mapper-backend.exe" -Destination "src-tauri\resources\drive-mapper-backend.exe" -Force
if (-not $?) {
    Write-Host "Failed to copy backend executable to resources!" -ForegroundColor Red
    exit 1
}

# Build Tauri app with installer
Write-Host "Building Tauri desktop app installer..." -ForegroundColor Yellow
npm run bundle
if (-not $?) {
    Write-Host "Failed to bundle Tauri app!" -ForegroundColor Red
    exit 1
}

# Find the MSI installer
$msiPath = Get-ChildItem -Path "src-tauri\target\release\bundle\msi" -Filter "*.msi" | Select-Object -First 1 -ExpandProperty FullName
if (-not $msiPath) {
    Write-Host "Could not find MSI installer!" -ForegroundColor Red
    exit 1
}

Write-Host "Build complete!" -ForegroundColor Green
Write-Host "The Windows installer can be found at: $msiPath" -ForegroundColor Cyan

# Copy the installer to the root directory for easy access
Copy-Item -Path $msiPath -Destination "..\" -Force
Write-Host "Installer copied to root directory: $((Get-Item $msiPath).Name)" -ForegroundColor Cyan

# Return to the original directory
Set-Location -Path .. 