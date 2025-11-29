# Fix Prisma Client Script
# This script stops Node processes and regenerates the Prisma client

Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma Client regenerated successfully!" -ForegroundColor Green
    Write-Host "You can now restart your dev server with: npm run dev" -ForegroundColor Green
} else {
    Write-Host "Error: Could not regenerate Prisma client" -ForegroundColor Red
    Write-Host "Try manually: npm run db:generate" -ForegroundColor Red
}

