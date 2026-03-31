# FrioCheck API - Resumen Rápido

## Base URL
```
https://api.friocheck.cl
```

## Headers requeridos
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-Id: ea2eb353-f604-49ff-821d-aac6c4c9fbe4
```

---

## Login (email o RUT)
```http
POST /auth/login
{ "identifier": "admin@friocheck.cl", "password": "Admin123!" }
```

---

## Endpoints principales

| Módulo | CRUD | Otros |
|--------|------|-------|
| /users | GET, POST, PATCH, DELETE | GET /users/email/:email |
| /machines | GET, POST, PATCH, DELETE | POST /machines/scan |
| /visits | GET, POST | POST /visits/check-in, POST /visits/:id/check-out |
| /work-orders | GET, POST, PATCH, DELETE | POST /:id/deliver, POST /:id/validate-nfc |
| /tickets | GET, POST, PATCH | POST /:id/resolve |
| /attachments | GET, POST, DELETE | - |
| /sectors | GET, POST, PATCH, DELETE | - |
| /sales | GET, POST, PATCH, DELETE | GET /metrics/by-vendor, GET /metrics/by-sector |
| /mermas | GET, POST, PATCH, DELETE | GET /stats, GET /stats/by-product |
| /inventory | GET, POST, PATCH, DELETE | GET /low-stock |
| /kpis | GET, POST, PATCH, DELETE | PATCH /:id/progress |

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@friocheck.cl | Admin123! |
| SUPPORT | soporte@friocheck.cl | Soporte123! |
| VENDOR | vendedor@friocheck.cl | Vendedor123! |
| RETAILER | minorista@friocheck.cl | Minorista123! |
| TECHNICIAN | tecnico@friocheck.cl | Tecnico123! |
| DRIVER | conductor@friocheck.cl | Conductor123! |

---

## Ejemplos rápidos

### Listar máquinas
```bash
curl http://localhost:3001/machines \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: ea2eb353-f604-49ff-821d-aac6c4c9fbe4"
```

### Registrar venta
```bash
curl -X POST http://localhost:3001/sales \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: ea2eb353-f604-49ff-821d-aac6c4c9fbe4" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150000, "description": "Venta refrigerador", "saleDate": "2026-03-27"}'
```

### Check-in visita
```bash
curl -X POST http://localhost:3001/visits/check-in \
  -H "Authorization: Bearer <token>" \
  -H "X-Tenant-Id: ea2eb353-f604-49ff-821d-aac6c4c9fbe4" \
  -H "Content-Type: application/json" \
  -d '{"machineId": "uuid", "nfcUid": "01F2E5E53FFCDC", "gpsLat": -33.4489, "gpsLng": -70.6693}'
```

---

## Base de datos
- **Host:** friocheck-db-server.postgres.database.azure.com
- **Puerto:** 5432
- **BD:** friocheck_db
- **Usuario:** friocheck_admin
- **SSL:** Requerido

## Tablas
15 tablas: tenants, users, machines, nfc_tags, visits, work_orders, tickets, attachments, sync_queue, sectors, sales, mermas, inventory, kpis, migrations
