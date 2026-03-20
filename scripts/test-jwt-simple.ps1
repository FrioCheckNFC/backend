# Test JWT Authentication - Versión Simple sin Advertencias

$BASE_URL = "http://localhost:3001"
$EMAIL = "admin@demo.com"
$PASSWORD = "Admin123!"

Write-Host "`n=== PRUEBA DE AUTENTICACION JWT ===" -ForegroundColor Cyan

# [1] LOGIN
Write-Host "`n[1] LOGIN - Obtener token JWT..." -ForegroundColor Green

$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing

    $data = $response.Content | ConvertFrom-Json
    $token = $data.access_token

    Write-Host "SUCCESS! Token obtenido" -ForegroundColor Green
    Write-Host "Token: $token" -ForegroundColor Magenta

    # [2] Test Protected Endpoint
    Write-Host "`n[2] ACCEDER A /tenants (endpoint protegido)..." -ForegroundColor Green

    $tenantsResponse = Invoke-WebRequest -Uri "$BASE_URL/tenants" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -UseBasicParsing

    Write-Host "SUCCESS! Acceso a /tenants permitido" -ForegroundColor Green
    Write-Host "Datos de tenants:" -ForegroundColor Cyan
    $tenantsData = $tenantsResponse.Content | ConvertFrom-Json
    Write-Host ($tenantsData | ConvertTo-Json -Depth 3)

    # [3] Validate Token
    Write-Host "`n[3] VALIDAR TOKEN..." -ForegroundColor Green

    $validateResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/validate-token" `
        -Method POST `
        -Headers @{ "Authorization" = "Bearer $token" } `
        -UseBasicParsing

    Write-Host "SUCCESS! Token es valido" -ForegroundColor Green
    $validateData = $validateResponse.Content | ConvertFrom-Json
    Write-Host "Datos del token:" -ForegroundColor Cyan
    Write-Host ($validateData | ConvertTo-Json -Depth 3)

    Write-Host "`n=== TODAS LAS PRUEBAS PASARON ===" -ForegroundColor Cyan
    Write-Host "JWT Authentication esta FUNCIONANDO correctamente!" -ForegroundColor Green

} catch {
    Write-Host "`nERROR!" -ForegroundColor Red
    Write-Host "Mensaje: " $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $body -ForegroundColor Yellow
    }
    exit 1
}
