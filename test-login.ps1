$body = @{
    email = "admin@friocheck.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"

$response | ConvertTo-Json -Depth 3