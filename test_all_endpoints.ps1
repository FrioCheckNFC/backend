# FrioCheck API - Complete Testing Suite (All 61 Endpoints)

$BASE_URL = "http://localhost:3001"
$TENANT_ID = "cf82de22-9dc5-4ea5-91a4-d54dccdbb532"
$ADMIN_USER_ID = ""  # Se setea dinámicamente después del login

$passed = 0
$failed = 0
$skipped = 0

function Test-Endpoint {
    param([string]$TestName, [string]$Method, [string]$Url, [hashtable]$Headers = @{}, [string]$Body = $null)
    $num = $script:passed + $script:failed + $script:skipped + 1
    Write-Host "`n[$num] $TestName" -ForegroundColor Cyan
    Write-Host "    $Method $Url" -ForegroundColor Gray
    try {
        $params = @{ Uri = $Url; Method = $Method; Headers = $Headers; UseBasicParsing = $true }
        if ($Body) { $params.Body = $Body }
        $resp = Invoke-WebRequest @params
        $data = $resp.Content | ConvertFrom-Json
        Write-Host "    PASS - Status: $($resp.StatusCode)" -ForegroundColor Green
        $script:passed++
        return $data
    } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "" }
        Write-Host "    FAIL - $code $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

function Get-AuthHeaders {
    $token = Get-Content "$env:TEMP\jwt_token.txt" -Raw
    return @{ "Content-Type"="application/json"; "Authorization"="Bearer $token"; "X-Tenant-Id"=$TENANT_ID }
}

function Skip-Test {
    param([string]$TestName)
    $num = $script:passed + $script:failed + $script:skipped + 1
    Write-Host "`n[$num] $TestName" -ForegroundColor Cyan
    Write-Host "    SKIPPED" -ForegroundColor Yellow
    $script:skipped++
}

function Read-Id { param([string]$File); $v = Get-Content "$env:TEMP\$File" -Raw -ErrorAction SilentlyContinue; if ($v) { return $v.Trim() }; return $null }

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  FRIOCHECK API - TESTING SUITE" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# MODULE 1: AUTH (3)
Write-Host "`n--- MODULE 1: AUTHENTICATION ---" -ForegroundColor Magenta

$data = Test-Endpoint "1.1 POST /auth/login" "POST" "$BASE_URL/auth/login" @{"Content-Type"="application/json"} (@{email="admin@friocheck.com"; password="Admin123!"} | ConvertTo-Json)
if ($data -and $data.access_token) { 
    $data.access_token | Out-File "$env:TEMP\jwt_token.txt" -NoNewline
    # Decode JWT to get user_id
    $payload = $data.access_token.Split('.')[1]
    $payload = $payload + '=' * (4 - $payload.Length % 4)
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload)) | ConvertFrom-Json
    $ADMIN_USER_ID = $decoded.sub
    Write-Host "    JWT saved, User ID: $ADMIN_USER_ID" -ForegroundColor Yellow
}

$headers = Get-AuthHeaders

Test-Endpoint "1.2 POST /auth/register" "POST" "$BASE_URL/auth/register" $headers (@{email="tech_$(Get-Random)@friocheck.com"; password="Pass@12345"; firstName="Test"; lastName="Tech"; tenantId=$TENANT_ID; role="TECHNICIAN"} | ConvertTo-Json)
Test-Endpoint "1.3 POST /auth/validate-token" "POST" "$BASE_URL/auth/validate-token" $headers

# MODULE 2: USERS (6)
Write-Host "`n--- MODULE 2: USERS ---" -ForegroundColor Magenta

$data = Test-Endpoint "2.1 POST /users" "POST" "$BASE_URL/users" $headers (@{email="user_$(Get-Random)@friocheck.com"; password="User@12345"; firstName="Juan"; lastName="Perez"; role="DRIVER"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\user_id.txt" -NoNewline }

Test-Endpoint "2.2 GET /users" "GET" "$BASE_URL/users" $headers
Test-Endpoint "2.3 GET /users/email/:email" "GET" "$BASE_URL/users/email/admin@friocheck.com" $headers

$userId = Read-Id "user_id.txt"
if ($userId) { Test-Endpoint "2.4 GET /users/:id" "GET" "$BASE_URL/users/$userId" $headers }
if ($userId) { Test-Endpoint "2.5 PATCH /users/:id" "PATCH" "$BASE_URL/users/$userId" $headers (@{firstName="Juan Updated"} | ConvertTo-Json) }

# 2.6 Delete User (crea temporal y lo borra)
$delUser = Test-Endpoint "2.6 POST /users (temporal)" "POST" "$BASE_URL/users" $headers (@{email="delete_$(Get-Random)@friocheck.com"; password="Del@12345"; firstName="Delete"; lastName="Test"; role="DRIVER"} | ConvertTo-Json)
if ($delUser -and $delUser.id) { Test-Endpoint "2.6 DELETE /users/:id" "DELETE" "$BASE_URL/users/$($delUser.id)" $headers }

# MODULE 3: TENANTS (6)
Write-Host "`n--- MODULE 3: TENANTS ---" -ForegroundColor Magenta

$data = Test-Endpoint "3.1 POST /tenants" "POST" "$BASE_URL/tenants" $headers (@{name="SuperFrio Test"; slug="sf-test-$(Get-Random -Min 10000 -Max 99999)"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\tenant_id.txt" -NoNewline }

Test-Endpoint "3.2 GET /tenants" "GET" "$BASE_URL/tenants" $headers
Test-Endpoint "3.3 GET /tenants/slug/:slug" "GET" "$BASE_URL/tenants/slug/superfrio-test" $headers

$tenantId = Read-Id "tenant_id.txt"
if ($tenantId) { Test-Endpoint "3.4 GET /tenants/:id" "GET" "$BASE_URL/tenants/$tenantId" $headers }
if ($tenantId) { Test-Endpoint "3.5 PATCH /tenants/:id" "PATCH" "$BASE_URL/tenants/$tenantId" $headers (@{name="SuperFrio Updated"} | ConvertTo-Json) }

# 3.6 Delete Tenant (crea temporal y lo borra)
$delTenant = Test-Endpoint "3.6 POST /tenants (temporal)" "POST" "$BASE_URL/tenants" $headers (@{name="Delete Test"; slug="del-test-$(Get-Random -Min 100 -Max 999)"} | ConvertTo-Json)
if ($delTenant -and $delTenant.id) { Test-Endpoint "3.6 DELETE /tenants/:id" "DELETE" "$BASE_URL/tenants/$($delTenant.id)" $headers }

# MODULE 4: MACHINES (8)
Write-Host "`n--- MODULE 4: MACHINES ---" -ForegroundColor Magenta

$data = Test-Endpoint "4.1 POST /machines" "POST" "$BASE_URL/machines" $headers (@{model="Refrigerador Samsung RF28"; brand="Samsung"; serialNumber="SN-RF-$(Get-Random -Min 10000 -Max 99999)"; locationName="Almacen A"; status="ACTIVE"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\machine_id.txt" -NoNewline }
$machineSerial = $data.serialNumber

Test-Endpoint "4.2 POST /machines/scan" "POST" "$BASE_URL/machines/scan" $headers (@{nfcTagId=$machineSerial; nfcUid="NFC-001-ABC"; latitude=-34.1234; longitude=-58.5678; scannedAt="2026-03-23T10:00:00Z"} | ConvertTo-Json)
Test-Endpoint "4.3 GET /machines" "GET" "$BASE_URL/machines" $headers
if ($machineSerial) { Test-Endpoint "4.4 GET /machines/serial/:serial" "GET" "$BASE_URL/machines/serial/$machineSerial" $headers }

$machineId = Read-Id "machine_id.txt"
if ($machineId) { Test-Endpoint "4.5 GET /machines/:id" "GET" "$BASE_URL/machines/$machineId" $headers }
if ($machineId) { Test-Endpoint "4.6 GET /machines/:id/nfc-tag" "GET" "$BASE_URL/machines/$machineId/nfc-tag" $headers }
if ($machineId) { Test-Endpoint "4.7 PATCH /machines/:id" "PATCH" "$BASE_URL/machines/$machineId" $headers (@{status="MAINTENANCE"} | ConvertTo-Json) }

# 4.8 Delete Machine (crea temporal y la borra)
$delMachine = Test-Endpoint "4.8 POST /machines (temporal)" "POST" "$BASE_URL/machines" $headers (@{model="Delete Test"; brand="Test"; serialNumber="SN-DEL-$(Get-Random -Min 10000 -Max 99999)"; locationName="Temporal"; status="ACTIVE"} | ConvertTo-Json)
if ($delMachine -and $delMachine.id) { Test-Endpoint "4.8 DELETE /machines/:id" "DELETE" "$BASE_URL/machines/$($delMachine.id)" $headers }

# MODULE 5: NFC TAGS (7)
Write-Host "`n--- MODULE 5: NFC TAGS ---" -ForegroundColor Magenta

$machineId = Read-Id "machine_id.txt"

$data = Test-Endpoint "5.1 POST /nfc-tags" "POST" "$BASE_URL/nfc-tags" $headers (@{uid="NFC-$(Get-Random -Min 100000 -Max 999999)"; machineId=$machineId} | ConvertTo-Json)
if ($data -and $data.uid) { $data.uid | Out-File "$env:TEMP\nfc_uid.txt" -NoNewline }

Test-Endpoint "5.2 GET /nfc-tags" "GET" "$BASE_URL/nfc-tags" $headers
if ($machineId) { Test-Endpoint "5.3 GET /nfc-tags/machine/:machineId" "GET" "$BASE_URL/nfc-tags/machine/$machineId" $headers }

$nfcUid = Read-Id "nfc_uid.txt"
if ($nfcUid) { Test-Endpoint "5.4 GET /nfc-tags/:uid" "GET" "$BASE_URL/nfc-tags/$nfcUid" $headers }
if ($nfcUid -and $data -and $data.integrityChecksum) { Test-Endpoint "5.5 POST /nfc-tags/:uid/validate-integrity" "POST" "$BASE_URL/nfc-tags/$nfcUid/validate-integrity" $headers (@{checksum=$data.integrityChecksum} | ConvertTo-Json) }
if ($nfcUid) { Test-Endpoint "5.6 POST /nfc-tags/:uid/lock" "POST" "$BASE_URL/nfc-tags/$nfcUid/lock" $headers }
if ($nfcUid) { Test-Endpoint "5.7 POST /nfc-tags/:uid/deactivate" "POST" "$BASE_URL/nfc-tags/$nfcUid/deactivate" $headers }

# MODULE 6: VISITS (5)
Write-Host "`n--- MODULE 6: VISITS ---" -ForegroundColor Magenta

$machineId = Read-Id "machine_id.txt"

$data = Test-Endpoint "6.1 POST /visits/check-in" "POST" "$BASE_URL/visits/check-in" $headers (@{tenantId=$TENANT_ID; machineId=$machineId; userId=$ADMIN_USER_ID; checkInNfcUid="NFC-CHECKIN-001"; checkInGpsLat=-34.1234; checkInGpsLng=-58.5678} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\visit_id.txt" -NoNewline }

$visitId = Read-Id "visit_id.txt"
if ($visitId) { Test-Endpoint "6.2 POST /visits/:id/check-out" "POST" "$BASE_URL/visits/$visitId/check-out" $headers (@{checkOutNfcUid="NFC-CHECKIN-001"; checkOutGpsLat=-34.1235; checkOutGpsLng=-58.5679} | ConvertTo-Json) }

Test-Endpoint "6.3 GET /visits/open" "GET" "$BASE_URL/visits/open" $headers
Test-Endpoint "6.4 GET /visits/user/:userId" "GET" "$BASE_URL/visits/user/$ADMIN_USER_ID" $headers
if ($visitId) { Test-Endpoint "6.5 GET /visits/:id" "GET" "$BASE_URL/visits/$visitId" $headers }

# MODULE 7: TICKETS (8)
Write-Host "`n--- MODULE 7: TICKETS ---" -ForegroundColor Magenta

$machineId = Read-Id "machine_id.txt"

$data = Test-Endpoint "7.1 POST /tickets" "POST" "$BASE_URL/tickets" $headers (@{tenantId=$TENANT_ID; machineId=$machineId; reportedById=$ADMIN_USER_ID; type="falla"; priority="alta"; title="Temperatura fuera de rango"; description="El refrigerador mostro -2C"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\ticket_id.txt" -NoNewline }

Test-Endpoint "7.2 GET /tickets" "GET" "$BASE_URL/tickets" $headers
Test-Endpoint "7.3 GET /tickets/open" "GET" "$BASE_URL/tickets/open" $headers
Test-Endpoint "7.4 GET /tickets/metrics" "GET" "$BASE_URL/tickets/metrics" $headers
Test-Endpoint "7.5 GET /tickets/sla" "GET" "$BASE_URL/tickets/sla" $headers

$ticketId = Read-Id "ticket_id.txt"
if ($ticketId) { Test-Endpoint "7.6 GET /tickets/:id" "GET" "$BASE_URL/tickets/$ticketId" $headers }
if ($ticketId) { Test-Endpoint "7.7 PATCH /tickets/:id" "PATCH" "$BASE_URL/tickets/$ticketId" $headers (@{status="en_progreso"} | ConvertTo-Json) }
if ($ticketId) { Test-Endpoint "7.8 POST /tickets/:id/resolve" "POST" "$BASE_URL/tickets/$ticketId/resolve" $headers (@{updateDto=@{resolutionNotes="Problema resuelto"}} | ConvertTo-Json) }

# MODULE 8: WORK ORDERS (7)
Write-Host "`n--- MODULE 8: WORK ORDERS ---" -ForegroundColor Magenta

$machineId = Read-Id "machine_id.txt"

$data = Test-Endpoint "8.1 POST /work-orders" "POST" "$BASE_URL/work-orders" $headers (@{tenantId=$TENANT_ID; machineId=$machineId; assignedUserId=$ADMIN_USER_ID; type="entrega"; expectedNfcUid="NFC-WO-$(Get-Random -Min 1000 -Max 9999)"; expectedLocationLat=-33.4567; expectedLocationLng=-70.6543; estimatedDeliveryDate="2026-03-30T10:00:00Z"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\wo_id.txt" -NoNewline }

Test-Endpoint "8.2 GET /work-orders" "GET" "$BASE_URL/work-orders" $headers

$woId = Read-Id "wo_id.txt"
if ($woId) { Test-Endpoint "8.3 GET /work-orders/:id" "GET" "$BASE_URL/work-orders/$woId" $headers }
if ($woId -and $data -and $data.expectedNfcUid) { Test-Endpoint "8.4 POST /work-orders/:id/validate-nfc" "POST" "$BASE_URL/work-orders/$woId/validate-nfc" $headers (@{actualNfcUid=$data.expectedNfcUid} | ConvertTo-Json) }
if ($woId) { Test-Endpoint "8.5 POST /work-orders/:id/deliver" "POST" "$BASE_URL/work-orders/$woId/deliver" $headers (@{signedBy="Juan Perez"; signatureUrl="https://example.com/sig/1.png"} | ConvertTo-Json) }
if ($woId) { Test-Endpoint "8.6 PATCH /work-orders/:id" "PATCH" "$BASE_URL/work-orders/$woId" $headers (@{description="Orden actualizada"} | ConvertTo-Json) }

# 8.7 Delete Work Order (crea temporal y la borra)
$delWo = Test-Endpoint "8.7 POST /work-orders (temporal)" "POST" "$BASE_URL/work-orders" $headers (@{tenantId=$TENANT_ID; machineId=$machineId; assignedUserId=$ADMIN_USER_ID; type="entrega"; expectedNfcUid="NFC-DEL-$(Get-Random -Min 1000 -Max 9999)"; expectedLocationLat=-33.4567; expectedLocationLng=-70.6543; estimatedDeliveryDate="2026-03-30T10:00:00Z"} | ConvertTo-Json)
if ($delWo -and $delWo.id) { Test-Endpoint "8.7 DELETE /work-orders/:id" "DELETE" "$BASE_URL/work-orders/$($delWo.id)" $headers }

# MODULE 9: ATTACHMENTS (7)
Write-Host "`n--- MODULE 9: ATTACHMENTS ---" -ForegroundColor Magenta

$visitId = Read-Id "visit_id.txt"

$data = Test-Endpoint "9.1 POST /attachments" "POST" "$BASE_URL/attachments" $headers (@{tenantId=$TENANT_ID; uploadedById=$ADMIN_USER_ID; visitId=$visitId; type="foto"; category="evidencia"; fileName="foto_refrigerador.jpg"; fileSizeBytes=102400; mimeType="image/jpeg"; azureBlobUrl="https://example.com/blob/foto.jpg"} | ConvertTo-Json)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\attachment_id.txt" -NoNewline }

if ($visitId) { Test-Endpoint "9.2 GET /attachments/visit/:visitId" "GET" "$BASE_URL/attachments/visit/$visitId" $headers }

$woId = Read-Id "wo_id.txt"
if ($woId) { Test-Endpoint "9.3 GET /attachments/work-order/:woId" "GET" "$BASE_URL/attachments/work-order/$woId" $headers }

$ticketId = Read-Id "ticket_id.txt"
if ($ticketId) { Test-Endpoint "9.4 GET /attachments/ticket/:ticketId" "GET" "$BASE_URL/attachments/ticket/$ticketId" $headers }

$attachId = Read-Id "attachment_id.txt"
if ($attachId) { Test-Endpoint "9.5 GET /attachments/:id" "GET" "$BASE_URL/attachments/$attachId" $headers }

Test-Endpoint "9.6 POST /attachments/:id/validate-type" "POST" "$BASE_URL/attachments/validate-type" $headers (@{mimeType="image/jpeg"} | ConvertTo-Json)

# 9.7 Delete Attachment (crea temporal y lo borra)
$visitId = Read-Id "visit_id.txt"
$delAttach = Test-Endpoint "9.7 POST /attachments (temporal)" "POST" "$BASE_URL/attachments" $headers (@{tenantId=$TENANT_ID; uploadedById=$ADMIN_USER_ID; visitId=$visitId; type="documento"; category="evidencia"; fileName="delete_test.pdf"; fileSizeBytes=512; mimeType="application/pdf"; azureBlobUrl="https://example.com/del.pdf"} | ConvertTo-Json)
if ($delAttach -and $delAttach.id) { Test-Endpoint "9.7 DELETE /attachments/:id" "DELETE" "$BASE_URL/attachments/$($delAttach.id)" $headers }

# MODULE 10: SYNC QUEUE (7)
Write-Host "`n--- MODULE 10: SYNC QUEUE ---" -ForegroundColor Magenta

$data = Test-Endpoint "10.1 POST /sync-queue" "POST" "$BASE_URL/sync-queue" $headers (@{tenantId=$TENANT_ID; userId=$ADMIN_USER_ID; operationType="CREATE"; payload=@{entityType="visit"; entityId="test-123"}} | ConvertTo-Json -Depth 3)
if ($data -and $data.id) { $data.id | Out-File "$env:TEMP\sync_id.txt" -NoNewline }

Test-Endpoint "10.2 GET /sync-queue/pending" "GET" "$BASE_URL/sync-queue/pending" $headers
Test-Endpoint "10.3 GET /sync-queue/retry-needed" "GET" "$BASE_URL/sync-queue/retry-needed" $headers
Test-Endpoint "10.4 GET /sync-queue/stats" "GET" "$BASE_URL/sync-queue/stats" $headers

$syncId = Read-Id "sync_id.txt"
if ($syncId) { Test-Endpoint "10.5 GET /sync-queue/:id" "GET" "$BASE_URL/sync-queue/$syncId" $headers }
if ($syncId) { Test-Endpoint "10.6 POST /sync-queue/:id/mark-synced" "POST" "$BASE_URL/sync-queue/$syncId/mark-synced" $headers }
if ($syncId) { Test-Endpoint "10.7 POST /sync-queue/:id/mark-failed" "POST" "$BASE_URL/sync-queue/$syncId/mark-failed" $headers (@{error="Connection timeout"; stackTrace="Error at line 42"} | ConvertTo-Json) }

# RESULTS
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  PASSED:  $passed" -ForegroundColor Green
Write-Host "  FAILED:  $failed" -ForegroundColor Red
Write-Host "  SKIPPED: $skipped" -ForegroundColor Yellow
Write-Host "  TOTAL:   $($passed + $failed + $skipped)" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan
