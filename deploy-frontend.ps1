# PowerShell script to deploy React frontend to Azure Web App using Docker Hub

param(
    [string]$ResourceGroup = "rg-userservice-sea",
    [string]$Location = "Southeast Asia",
    [string]$AppName = "patientapp-web-sea",
    [string]$DockerHubUsername = "animeshbajpaidocker",
    [string]$AppServicePlan = "patientapp-plan-sea"
)

Write-Host "Deploying Patient Management Frontend to Azure Web App..." -ForegroundColor Green

# Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t "$DockerHubUsername/$AppName`:latest" .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed"
    exit 1
}

# Push to Docker Hub
Write-Host "Pushing image to Docker Hub..." -ForegroundColor Yellow
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

# Create or update Azure Web App
Write-Host "Creating/updating Azure Web App..." -ForegroundColor Yellow

az webapp create `
    --name $AppName `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --deployment-container-image-name "$DockerHubUsername/$AppName`:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Web app creation failed, trying update..." -ForegroundColor Yellow
    
    az webapp config container set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --docker-custom-image-name "$DockerHubUsername/$AppName`:latest"
}

# Configure app settings
Write-Host "Configuring app settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $AppName `
    --resource-group $ResourceGroup `
    --settings REACT_APP_API_URL="https://userservice-app-sea.azurewebsites.net/api" `
               WEBSITES_PORT=80

# Enable container logging
az webapp log config `
    --name $AppName `
    --resource-group $ResourceGroup `
    --docker-container-logging filesystem

# Get the app URL
Write-Host "Getting application URL..." -ForegroundColor Yellow
$appUrl = az webapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostName" -o tsv

if ($appUrl) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Frontend URL: https://$appUrl" -ForegroundColor Cyan
    Write-Host "🔗 Backend API: https://userservice-app-sea.azurewebsites.net" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Demo Credentials:" -ForegroundColor Yellow
    Write-Host "Doctor: doctor@example.com / password" -ForegroundColor White
    Write-Host "Patient: patient@example.com / password" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Your Spring Boot backend remains untouched and running." -ForegroundColor Green
} else {
    Write-Error "Failed to get application URL"
}

Write-Host "Deployment completed!" -ForegroundColor Green
