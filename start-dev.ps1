# PowerShell script to start development servers
Write-Host "Starting development servers..." -ForegroundColor Green

# Start API server in background
Write-Host "Starting API server on port 3000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "vercel", "dev", "--listen", "3000"

# Wait a moment for API to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Set-Location frontend
npm run dev
