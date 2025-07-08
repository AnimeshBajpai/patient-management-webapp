# PowerShell script to deploy React frontend to Azure Web App using Docker Hub

param(
    [string]$ResourceGroup = "rg-userservice-sea",
    [string]$Location = "Southeast Asia",
    [string]$AppName = "patientapp-web-sea",
    [string]$DockerHubUsername = "animeshbajpaidocker",
    [string]$AppServicePlan = "patientapp-plan-sea"
)

Write-Host "Deploying Patient Management Frontend to Azure Web App..." -ForegroundColor Green

# Clean up old Docker images locally to ensure fresh build
Write-Host "Cleaning up old Docker images..." -ForegroundColor Yellow
docker image prune -f
docker rmi "$DockerHubUsername/$AppName`:latest" -f 2>$null

# Generate a unique tag to force fresh deployment
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$imageTag = "v$timestamp"

# Build the Docker image with timestamp tag
Write-Host "Building Docker image with tag: $imageTag..." -ForegroundColor Yellow
docker build --no-cache -t "$DockerHubUsername/$AppName`:$imageTag" -t "$DockerHubUsername/$AppName`:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed"
    exit 1
}

# Push both tags to Docker Hub
Write-Host "Pushing image to Docker Hub..." -ForegroundColor Yellow
docker push "$DockerHubUsername/$AppName`:$imageTag"
docker push "$DockerHubUsername/$AppName`:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker push failed. Make sure you're logged in to Docker Hub with 'docker login'"
    exit 1
}

# Create App Service Plan if it doesn't exist
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku B1 `
    --is-linux `
    --number-of-workers 1

# Create or update Azure Web App with timestamped image
Write-Host "Creating/updating Azure Web App with image: $imageTag..." -ForegroundColor Yellow

# Stop the app first to ensure clean deployment
Write-Host "Stopping web app for clean deployment..." -ForegroundColor Yellow
az webapp stop --name $AppName --resource-group $ResourceGroup

az webapp create `
    --name $AppName `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --deployment-container-image-name "$DockerHubUsername/$AppName`:$imageTag"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Web app creation failed, trying update..." -ForegroundColor Yellow
    
    # Force container image update with new tag
    az webapp config container set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --docker-custom-image-name "$DockerHubUsername/$AppName`:$imageTag"
    
    # Force restart to pull new image
    Write-Host "Restarting web app to pull new image..." -ForegroundColor Yellow
    az webapp restart --name $AppName --resource-group $ResourceGroup
}

# Configure app settings
Write-Host "Configuring app settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $AppName `
    --resource-group $ResourceGroup `
    --settings REACT_APP_API_URL="https://userservice-app-sea.azurewebsites.net/user-service" `
               WEBSITES_PORT=80 `
               DOCKER_ENABLE_CI=true

# Enable container logging
az webapp log config `
    --name $AppName `
    --resource-group $ResourceGroup `
    --docker-container-logging filesystem

# Ensure app is started and running
Write-Host "Ensuring app is running..." -ForegroundColor Yellow
az webapp start --name $AppName --resource-group $ResourceGroup

# Final restart to apply all configurations
Write-Host "Final restart to apply all configurations..." -ForegroundColor Yellow
az webapp restart --name $AppName --resource-group $ResourceGroup

# Verify app is running and wait for startup
Write-Host "Verifying app status and waiting for startup..." -ForegroundColor Yellow
$maxAttempts = 6
$attempt = 1
do {
    $appState = az webapp show --name $AppName --resource-group $ResourceGroup --query "state" -o tsv
    if ($appState -eq "Running") {
        Write-Host "✅ App is running!" -ForegroundColor Green
        break
    }
    Write-Host "App state: $appState - Waiting... (Attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    $attempt++
} while ($attempt -le $maxAttempts)

if ($appState -ne "Running") {
    Write-Host "⚠️ App may not be running properly. Starting it manually..." -ForegroundColor Yellow
    az webapp start --name $AppName --resource-group $ResourceGroup
    Start-Sleep -Seconds 15
}

# Get the app URL
Write-Host "Getting application URL..." -ForegroundColor Yellow
$appUrl = az webapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostName" -o tsv

if ($appUrl) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Frontend URL: https://$appUrl" -ForegroundColor Cyan
    Write-Host "🔗 Backend API: https://userservice-app-sea.azurewebsites.net/user-service" -ForegroundColor Cyan
    Write-Host "🏷️  Deployed Image: $imageTag" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Features Updated:" -ForegroundColor Green
    Write-Host "✅ Mobile OTP Authentication" -ForegroundColor White
    Write-Host "✅ User Profile Display in Dashboard" -ForegroundColor White
    Write-Host "✅ Enhanced User Interface" -ForegroundColor White
    Write-Host "✅ Profile Management" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Your Spring Boot backend remains untouched and running." -ForegroundColor Green
} else {
    Write-Error "Failed to get application URL"
}

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Troubleshooting Commands (if needed):" -ForegroundColor Yellow
Write-Host "View logs: az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "Check container: az webapp config container show --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "Manual restart: az webapp restart --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
