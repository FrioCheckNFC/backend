# FrioCheck API - Documentación de Endpoints
## v3.0 - Actualizado 27/03/2026

## Base URL
```
https://api.friocheck.cl
```

## Autenticación
Todos los endpoints (excepto login) requieren:
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-Id: <TENANT_UUID>
```

---

## 🔐 AUTH

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "admin@friocheck.cl",  // email o RUT
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@friocheck.cl",
    "rut": "11111111-1",
    "firstName": "Carlos",
    "lastName": "Administrador",
    "role": "ADMIN",
    "tenantId": "uuid"
  }
}
```

### Register (Solo ADMIN)
```http
POST /auth/register
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "email": "nuevo@friocheck.cl",
  "rut": "12345678-9",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "tenantId": "uuid",
  "role": "TECHNICIAN"
}
```

### Validate Token
```http
POST /auth/validate-token
Authorization: Bearer <token>
```

---

## 👥 USERS
**Roles permitidos:** ADMIN, SUPPORT

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| POST | /users | ADMIN, SUPPORT | Crear usuario |
| GET | /users | ADMIN, SUPPORT | Listar usuarios |
| GET | /users/email/:email | ADMIN, SUPPORT | Buscar por email |
| GET | /users/:id | ADMIN, SUPPORT | Obtener usuario |
| PATCH | /users/:id | ADMIN, SUPPORT | Actualizar usuario |
| DELETE | /users/:id | ADMIN | Eliminar usuario |

### Crear usuario
```http
POST /users
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "email": "nuevo@friocheck.cl",
  "rut": "12345678-9",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+56912345678",
  "role": "VENDOR"
}
```

### Actualizar usuario
```http
PATCH /users/:id
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "firstName": "Nuevo Nombre",
  "lastName": "Nuevo Apellido",
  "rut": "98765432-1",
  "phone": "+56987654321",
  "role": "TECHNICIAN"
}
```

---

## 🏢 TENANTS
**Roles permitidos:** Solo ADMIN

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /tenants | Crear tenant |
| GET | /tenants | Listar tenants |
| GET | /tenants/:id | Obtener tenant |
| GET | /tenants/slug/:slug | Buscar por slug |
| PATCH | /tenants/:id | Actualizar tenant |
| DELETE | /tenants/:id | Eliminar tenant |

---

## 🏭 MACHINES
**Roles permitidos:** ADMIN, TECHNICIAN, VENDOR, DRIVER, RETAILER

| Método | Endpoint | Roles (Escritura) | Descripción |
|--------|----------|-------------------|-------------|
| POST | /machines | ADMIN | Crear máquina |
| GET | /machines | ALL | Listar máquinas |
| GET | /machines/:id | ALL | Obtener máquina |
| GET | /machines/serial/:serial | ALL | Buscar por serial |
| PATCH | /machines/:id | ADMIN | Actualizar máquina |
| DELETE | /machines/:id | ADMIN | Eliminar máquina |
| POST | /machines/scan | ALL | Escanear NFC |
| GET | /machines/:id/nfc-tag | ALL | Obtener NFC tag |

### Crear máquina
```http
POST /machines
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "serialNumber": "SN-RF-00006",
  "model": "Refrigerador Samsung RF29",
  "brand": "Samsung",
  "locationName": "Sucursal Centro",
  "locationLat": -33.4489,
  "locationLng": -70.6693,
  "status": "ACTIVE",
  "assignedUserId": "uuid"
}
```

### Escanear NFC
```http
POST /machines/scan
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "nfcUid": "01F2E5E53FFCDC",
  "latitude": -33.4489,
  "longitude": -70.6693
}
```

---

## 📡 NFC TAGS
**Roles permitidos:** ADMIN, TECHNICIAN (escritura), todos (lectura)

| Método | Endpoint | Roles (Escritura) | Descripción |
|--------|----------|-------------------|-------------|
| POST | /nfc-tags | ADMIN, TECHNICIAN | Crear NFC tag |
| GET | /nfc-tags | ALL | Listar tags |
| GET | /nfc-tags/:uid | ALL | Buscar por UID |
| GET | /nfc-tags/machine/:machineId | ALL | Tags de máquina |
| POST | /nfc-tags/:uid/validate | ALL | Validar integridad |
| POST | /nfc-tags/:uid/lock | ADMIN | Bloquear tag |
| POST | /nfc-tags/:uid/deactivate | ADMIN | Desactivar tag |

---

## 🚶 VISITS
**Roles permitidos:** ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /visits/check-in | Check-in |
| POST | /visits/:id/check-out | Check-out |
| GET | /visits | Listar visitas |
| GET | /visits/open | Visitas abiertas |
| GET | /visits/user/:userId | Visitas por usuario |
| GET | /visits/:id | Obtener visita |

### Check-in
```http
POST /visits/check-in
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "machineId": "uuid",
  "nfcUid": "01F2E5E53FFCDC",
  "gpsLat": -33.4489,
  "gpsLng": -70.6693
}
```

### Check-out
```http
POST /visits/:id/check-out
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "nfcUid": "01F2E5E53FFCDC",
  "gpsLat": -33.4489,
  "gpsLng": -70.6693
}
```

---

## 📋 WORK ORDERS
**Roles permitidos:** ADMIN, DRIVER (escritura), TECHNICIAN, VENDOR, RETAILER (lectura)

| Método | Endpoint | Roles (Escritura) | Descripción |
|--------|----------|-------------------|-------------|
| POST | /work-orders | ADMIN, DRIVER | Crear orden |
| GET | /work-orders | ALL | Listar órdenes |
| GET | /work-orders/:id | ALL | Obtener orden |
| PATCH | /work-orders/:id | ADMIN, DRIVER | Actualizar orden |
| DELETE | /work-orders/:id | ADMIN | Eliminar orden |
| POST | /work-orders/:id/validate-nfc | ADMIN, DRIVER | Validar NFC |
| POST | /work-orders/:id/deliver | ADMIN, DRIVER | Marcar entrega |

### Crear orden
```http
POST /work-orders
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "machineId": "uuid",
  "assignedUserId": "uuid",
  "type": "entrega",           // entrega | reposicion | retiro | reparacion
  "expectedNfcUid": "01F2E5E53FFCDC",
  "expectedLocationLat": -33.4489,
  "expectedLocationLng": -70.6693,
  "estimatedDeliveryDate": "2026-04-01T10:00:00Z",
  "description": "Entrega de refrigerador nuevo"
}
```

### Marcar entrega
```http
POST /work-orders/:id/deliver
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "actualNfcUid": "01F2E5E53FFCDC",
  "actualLocationLat": -33.4489,
  "actualLocationLng": -70.6693,
  "signedBy": "Juan Pérez",
  "signatureUrl": "https://blob.azure.com/signatures/xxx.png"
}
```

---

## 🎫 TICKETS
**Roles permitidos:** ADMIN, TECHNICIAN, VENDOR, RETAILER

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /tickets | Crear ticket |
| GET | /tickets | Listar tickets |
| GET | /tickets/open | Tickets abiertos |
| GET | /tickets/:id | Obtener ticket |
| PATCH | /tickets/:id | Actualizar ticket |
| POST | /tickets/:id/resolve | Resolver ticket |
| GET | /tickets/metrics | Métricas (ADMIN) |
| GET | /tickets/sla | SLA (ADMIN) |

### Crear ticket
```http
POST /tickets
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "machineId": "uuid",         // opcional
  "type": "falla",             // falla | merma | error_nfc | mantenimiento | otro
  "priority": "alta",          // baja | media | alta | critica
  "title": "Fallo en compresor",
  "description": "El compresor no enciende correctamente",
  "manualMachineId": "SN-XXX"  // si no se identifica máquina
}
```

### Resolver ticket
```http
POST /tickets/:id/resolve
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "resolutionNotes": "Se reemplazó el compresor",
  "timeSpentMinutes": 120
}
```

---

## 📎 ATTACHMENTS
**Roles permitidos:** ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER

| Método | Endpoint | Roles (Escritura) | Descripción |
|--------|----------|-------------------|-------------|
| POST | /attachments | ALL | Subir archivo |
| GET | /attachments/visit/:visitId | ALL | Archivos de visita |
| GET | /attachments/work-order/:workOrderId | ALL | Archivos de orden |
| GET | /attachments/ticket/:ticketId | ALL | Archivos de ticket |
| GET | /attachments/:id | ALL | Obtener archivo |
| DELETE | /attachments/:id | ADMIN | Eliminar archivo |

### Subir archivo
```http
POST /attachments
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "type": "foto",              // foto | documento | firma | video
  "category": "evidencia",     // evidencia | antes_despues | daños | placa_maquina | confirmacion
  "fileName": "evidencia.jpg",
  "fileSizeBytes": 1024000,
  "mimeType": "image/jpeg",
  "azureBlobUrl": "https://blob.azure.com/attachments/xxx.jpg",
  "description": "Foto de evidencia",
  "visitId": "uuid",           // opcional
  "workOrderId": "uuid",       // opcional
  "ticketId": "uuid"           // opcional
}
```

---

## 🔄 SYNC QUEUE
**Roles permitidos:** ADMIN, TECHNICIAN (lectura), todos (enqueue)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /sync-queue | Encolar operación |
| GET | /sync-queue | Listar cola |
| GET | /sync-queue/stats | Estadísticas |
| GET | /sync-queue/pending | Pendientes |
| GET | /sync-queue/:id | Obtener item |
| POST | /sync-queue/:id/mark-synced | Marcar sincronizado |
| POST | /sync-queue/:id/mark-failed | Marcar fallido |

---

## 📍 SECTORS (NUEVO)
**Roles permitidos:** ADMIN (escritura), VENDOR, SUPPORT (lectura)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /sectors | Crear sector |
| GET | /sectors | Listar sectores |
| GET | /sectors/:id | Obtener sector |
| PATCH | /sectors/:id | Actualizar sector |
| DELETE | /sectors/:id | Eliminar sector |

### Crear sector
```http
POST /sectors
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "name": "Zona Norte",
  "description": "Sector norte de Santiago"
}
```

---

## 💰 SALES (NUEVO)
**Roles permitidos:** ADMIN, VENDOR

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /sales | Registrar venta |
| GET | /sales | Listar ventas |
| GET | /sales/:id | Obtener venta |
| GET | /sales/vendor/:vendorId | Ventas por vendedor |
| GET | /sales/sector/:sectorId | Ventas por sector |
| GET | /sales/metrics/by-vendor | Métricas por vendedor |
| GET | /sales/metrics/by-sector | Métricas por sector |
| PATCH | /sales/:id | Actualizar venta |
| DELETE | /sales/:id | Eliminar venta |

### Registrar venta
```http
POST /sales
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "sectorId": "uuid",          // opcional
  "machineId": "uuid",         // opcional
  "amount": 150000,
  "description": "Venta de refrigerador",
  "saleDate": "2026-03-27T14:30:00Z"
}
```

### Métricas por vendedor
```http
GET /sales/metrics/by-vendor
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>
```

**Response:**
```json
[
  {
    "vendorId": "uuid",
    "totalAmount": 455000,
    "totalSales": 3
  }
]
```

---

## 📉 MERMAS (NUEVO)
**Roles permitidos:** ADMIN, TECHNICIAN, VENDOR, RETAILER (crear), ADMIN, VENDOR (leer)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /mermas | Registrar merma |
| GET | /mermas | Listar mermas |
| GET | /mermas/:id | Obtener merma |
| GET | /mermas/stats | Estadísticas totales |
| GET | /mermas/stats/by-product | Estadísticas por producto |
| PATCH | /mermas/:id | Actualizar merma |
| DELETE | /mermas/:id | Eliminar merma |

### Registrar merma
```http
POST /mermas
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "machineId": "uuid",         // opcional
  "ticketId": "uuid",          // opcional
  "productName": "Helado de vainilla",
  "quantity": 50,
  "unitCost": 2000,
  "cause": "Fallo en compresor",
  "mermaDate": "2026-03-27T10:00:00Z"
}
```

### Estadísticas totales
```http
GET /mermas/stats
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>
```

**Response:**
```json
{
  "totalLoss": 136000,
  "totalMermas": 2,
  "totalQuantity": 80
}
```

---

## 📦 INVENTORY (NUEVO)
**Roles permitidos:** ADMIN, TECHNICIAN

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /inventory | Crear item |
| GET | /inventory | Listar inventario |
| GET | /inventory/:id | Obtener item |
| GET | /inventory/low-stock | Items con stock bajo |
| PATCH | /inventory/:id | Actualizar item |
| DELETE | /inventory/:id | Eliminar item |

### Crear item
```http
POST /inventory
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "partName": "Compresor Danfoss",
  "partNumber": "CMP-001",
  "description": "Compresor para refrigerador",
  "quantity": 10,
  "minQuantity": 3,
  "unitCost": 45000,
  "status": "disponible",      // disponible | en_uso | agotado | en_pedido
  "location": "Bodega Central"
}
```

### Stock bajo
```http
GET /inventory/low-stock
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>
```

**Response:** Items donde `quantity <= minQuantity`

---

## 🎯 KPIs (NUEVO)
**Roles permitidos:** Solo ADMIN

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /kpis | Crear KPI |
| GET | /kpis | Listar KPIs |
| GET | /kpis/:id | Obtener KPI |
| GET | /kpis/user/:userId | KPIs por usuario |
| GET | /kpis/sector/:sectorId | KPIs por sector |
| PATCH | /kpis/:id | Actualizar KPI |
| PATCH | /kpis/:id/progress | Actualizar progreso |
| DELETE | /kpis/:id | Eliminar KPI |

### Crear KPI
```http
POST /kpis
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "userId": "uuid",            // opcional (null = global)
  "sectorId": "uuid",          // opcional (null = global)
  "type": "ventas",            // visitas | ventas | tickets | mermas
  "name": "Meta ventas Q1",
  "targetValue": 500000,
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-03-31T23:59:59Z"
}
```

### Actualizar progreso
```http
PATCH /kpis/:id/progress
Authorization: Bearer <token>
X-Tenant-Id: <tenant_id>

{
  "currentValue": 320000
}
```

---

## 👤 ROLES Y PERMISOS

| Rol | Users | Machines | Visits | Work Orders | Tickets | Sales | Mermas | Inventory | KPIs |
|-----|-------|----------|--------|-------------|---------|-------|--------|-----------|------|
| ADMIN | CRUD | CRUD | R | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| SUPPORT | CRU | R | R | R | R | R | R | R | R |
| VENDOR | R | R | CR | R | CR | CRUD | CR | R | R |
| RETAILER | R | R | CR | R | CR | R | CR | R | R |
| TECHNICIAN | R | R | CR | R | CRU | R | CR | CRU | R |
| DRIVER | R | R | CR | CRU | R | R | R | R | R |

**C** = Create, **R** = Read, **U** = Update, **D** = Delete

---

## 📝 DATOS DE PRUEBA

| Email | RUT | Contraseña | Rol |
|-------|-----|------------|-----|
| admin@friocheck.cl | 11111111-1 | Admin123! | ADMIN |
| soporte@friocheck.cl | 22222222-2 | Soporte123! | SUPPORT |
| vendedor@friocheck.cl | 33333333-3 | Vendedor123! | VENDOR |
| minorista@friocheck.cl | 44444444-4 | Minorista123! | RETAILER |
| tecnico@friocheck.cl | 55555555-5 | Tecnico123! | TECHNICIAN |
| conductor@friocheck.cl | 66666666-6 | Conductor123! | DRIVER |

**Tenant ID:** `ea2eb353-f604-49ff-821d-aac6c4c9fbe4`

---

## 🔧 CODIGOS DE ERROR

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - Sin permisos para este rol |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Email o RUT ya existe |
| 500 | Internal Server Error |

---

## 📦 ENUMS

### users_role_enum
`ADMIN`, `SUPPORT`, `VENDOR`, `RETAILER`, `TECHNICIAN`, `DRIVER`

### machines_status_enum
`ACTIVE`, `INACTIVE`, `IN_TRANSIT`, `MAINTENANCE`, `DECOMMISSIONED`

### visits_status_enum
`ABIERTA`, `CERRADA`, `ANULADA`

### work_orders_type_enum
`entrega`, `reposicion`, `retiro`, `reparacion`

### work_orders_status_enum
`pendiente`, `en_transito`, `entregado`, `rechazado`, `cancelado`

### tickets_type_enum
`falla`, `merma`, `error_nfc`, `mantenimiento`, `otro`

### tickets_priority_enum
`baja`, `media`, `alta`, `critica`

### tickets_status_enum
`abierto`, `en_progreso`, `resuelto`, `cerrado`

### attachments_type_enum
`foto`, `documento`, `firma`, `video`

### attachments_category_enum
`evidencia`, `antes_despues`, `daños`, `placa_maquina`, `confirmacion`

### inventory_status_enum
`disponible`, `en_uso`, `agotado`, `en_pedido`

### kpis_type_enum
`visitas`, `ventas`, `tickets`, `mermas`

---

Generado automáticamente - FrioCheck v3.0
