# Testing - FrioCheck API

## Prerrequisitos

1. Servidor corriendo en `http://localhost:3001`
2. Base de datos PostgreSQL activa (Docker)
3. Seed ejecutado

## Ejecutar Tests

```powershell
# Opción 1: Script automático (Recomendado)
cd nfcproject
powershell -ExecutionPolicy Bypass -File test_all_endpoints.ps1

# Opción 2: Manual con Thunder Client
# Seguir el checklist abajo
```

## Resultado Esperado

```
PASSED:  69
FAILED:  0
SKIPPED: 0
TOTAL:   69
```

## Checklist de Tests

### Auth (3)
- [ ] POST /auth/login → 200 OK
- [ ] POST /auth/register → 201 OK
- [ ] POST /auth/validate-token → 200 OK

### Users (6)
- [ ] POST /users → 201 OK
- [ ] GET /users → 200 OK
- [ ] GET /users/email/:email → 200 OK
- [ ] GET /users/:id → 200 OK
- [ ] PATCH /users/:id → 200 OK
- [ ] DELETE /users/:id → 204 No Content

### Tenants (6)
- [ ] POST /tenants → 201 OK
- [ ] GET /tenants → 200 OK
- [ ] GET /tenants/slug/:slug → 200 OK
- [ ] GET /tenants/:id → 200 OK
- [ ] PATCH /tenants/:id → 200 OK
- [ ] DELETE /tenants/:id → 204 No Content

### Machines (8)
- [ ] POST /machines → 201 OK
- [ ] POST /machines/scan → 200 OK
- [ ] GET /machines → 200 OK
- [ ] GET /machines/serial/:serial → 200 OK
- [ ] GET /machines/:id → 200 OK
- [ ] GET /machines/:id/nfc-tag → 200 OK
- [ ] PATCH /machines/:id → 200 OK
- [ ] DELETE /machines/:id → 204 No Content

### NFC Tags (7)
- [ ] POST /nfc-tags → 201 OK
- [ ] GET /nfc-tags → 200 OK
- [ ] GET /nfc-tags/machine/:machineId → 200 OK
- [ ] GET /nfc-tags/:uid → 200 OK
- [ ] POST /nfc-tags/:uid/validate-integrity → 200 OK
- [ ] POST /nfc-tags/:uid/lock → 200 OK
- [ ] POST /nfc-tags/:uid/deactivate → 200 OK

### Visits (5)
- [ ] POST /visits/check-in → 201 OK
- [ ] POST /visits/:id/check-out → 200 OK
- [ ] GET /visits/open → 200 OK
- [ ] GET /visits/user/:userId → 200 OK
- [ ] GET /visits/:id → 200 OK

### Tickets (8)
- [ ] POST /tickets → 201 OK
- [ ] GET /tickets → 200 OK
- [ ] GET /tickets/open → 200 OK
- [ ] GET /tickets/metrics → 200 OK
- [ ] GET /tickets/sla → 200 OK
- [ ] GET /tickets/:id → 200 OK
- [ ] PATCH /tickets/:id → 200 OK
- [ ] POST /tickets/:id/resolve → 200 OK

### Work Orders (7)
- [ ] POST /work-orders → 201 OK
- [ ] GET /work-orders → 200 OK
- [ ] GET /work-orders/:id → 200 OK
- [ ] POST /work-orders/:id/validate-nfc → 200 OK
- [ ] POST /work-orders/:id/deliver → 200 OK
- [ ] PATCH /work-orders/:id → 200 OK
- [ ] DELETE /work-orders/:id → 204 No Content

### Attachments (7)
- [ ] POST /attachments → 201 OK
- [ ] GET /attachments/visit/:visitId → 200 OK
- [ ] GET /attachments/work-order/:woId → 200 OK
- [ ] GET /attachments/ticket/:ticketId → 200 OK
- [ ] GET /attachments/:id → 200 OK
- [ ] POST /attachments/validate-type → 200 OK
- [ ] DELETE /attachments/:id → 204 No Content

### Sync Queue (7)
- [ ] POST /sync-queue → 201 OK
- [ ] GET /sync-queue/pending → 200 OK
- [ ] GET /sync-queue/retry-needed → 200 OK
- [ ] GET /sync-queue/stats → 200 OK
- [ ] GET /sync-queue/:id → 200 OK
- [ ] POST /sync-queue/:id/mark-synced → 200 OK
- [ ] POST /sync-queue/:id/mark-failed → 200 OK

## Datos para Tests

| Dato | Valor |
|------|-------|
| Base URL | http://localhost:3001 |
| Admin Email | admin@friocheck.com |
| Admin Password | Admin123! |
| Tenant Slug | superfrio |

## Troubleshooting

### Error 401 Unauthorized
- Verificar que el JWT token sea válido
- Ejecutar login nuevamente

### Error 403 Forbidden
- Verificar que el usuario tenga el rol correcto
- Verificar header `X-Tenant-Id`

### Error 404 Not Found
- Verificar que el ID exista en la base de datos
- Ejecutar seed si es necesario

### Error 500 Internal Server Error
- Verificar logs del servidor
- Verificar conexión a PostgreSQL
