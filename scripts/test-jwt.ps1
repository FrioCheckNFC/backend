$BASE_URL = "http://localhost:3001"
$EMAIL = "admin@demo.com"
$PASSWORD = "Admin123!"

Write-Host "=== PRUEBA DE AUTENTICACION JWT ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] LOGIN - Obtener token JWT..." -ForegroundColor Green

$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    $token = $data.access_token

    Write-Host "EXITO! Token obtenido" -ForegroundColor Green
    Write-Host "Token: $token" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "[2] ACCEDER A /tenants (endpoint protegido)..." -ForegroundColor Green

    $tenantsResponse = Invoke-WebRequest -Uri "$BASE_URL/tenants" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "EXITO! Acceso a /tenants permitido" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($tenantsResponse.Content | ConvertFrom-Json | ConvertTo-Json) -ForegroundColor White
    Write-Host ""

    Write-Host "[3] VALIDAR TOKEN..." -ForegroundColor Green

    $validateResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/validate-token" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "EXITO! Token es valido" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($validateResponse.Content | ConvertFrom-Json | ConvertTo-Json) -ForegroundColor White
    Write-Host ""

    Write-Host "=== TODAS LAS PRUEBAS PASARON ===" -ForegroundColor Cyan

} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
