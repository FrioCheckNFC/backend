# FrioCheck API

Sistema de control de visitas con NFC para refrigeración comercial.

## Stack

- **Backend:** NestJS + TypeScript
- **Base de datos:** PostgreSQL 15
- **ORM:** TypeORM
- **Autenticación:** JWT + Guards
- **Cache:** Redis

## Requisitos

- Node.js 18+
- Docker Desktop
- PostgreSQL (vía Docker)

## Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd nfcproject

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar servicios Docker
docker compose up -d

# 5. Ejecutar seed (crear datos iniciales)
npx ts-node scripts/seed.ts

# 6. Iniciar servidor
npm run start:dev
```

El servidor corre en `http://localhost:3001`

## Credenciales (Seed)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@friocheck.com | Admin123! | ADMIN |
| tecnico@friocheck.com | Tecnico123! | TECHNICIAN |
| conductor@friocheck.com | Conductor123! | DRIVER |
| vendedor@friocheck.com | Vendedor123! | VENDOR |
| soporte@friocheck.com | Soporte123! | SUPPORT |

## Estructura del Proyecto

```
nfcproject/
├── src/
│   ├── auth/              # Autenticación JWT
│   ├── users/             # Usuarios (6 roles)
│   ├── tenants/           # Multi-tenant
│   ├── machines/          # Equipos refrigerados
│   ├── nfc-tags/          # Etiquetas NFC
│   ├── visits/            # Check-in / Check-out
│   ├── work-orders/       # Órdenes de trabajo
│   ├── tickets/           # Tickets de soporte
│   ├── attachments/       # Archivos adjuntos
│   ├── sync-queue/        # Cola de sincronización offline
│   └── migrations/        # Migraciones TypeORM
├── scripts/
│   ├── seed.ts            # Crear datos iniciales
│   └── cleanup.ts         # Limpiar base de datos
├── docker-compose.yml     # Servicios Docker
├── docs/
│   └── SCHEMA_BD_FRIOCHECK.txt # Documentación del esquema
├── .env.example           # Variables de entorno
└── test_all_endpoints.ps1 # Script de pruebas
```

## Módulos y Endpoints

### Auth (3 endpoints)
```
POST /auth/login
POST /auth/register         [ADMIN]
POST /auth/validate-token
```

### Users (6 endpoints)
```
POST /users                 [ADMIN]
GET /users                  [ADMIN]
GET /users/email/:email     [ADMIN]
GET /users/:id              [ADMIN]
PATCH /users/:id            [ADMIN]
DELETE /users/:id           [ADMIN]
```

### Tenants (6 endpoints)
```
POST /tenants               [ADMIN]
GET /tenants                [ADMIN]
GET /tenants/slug/:slug     [ADMIN]
GET /tenants/:id            [ADMIN]
PATCH /tenants/:id          [ADMIN]
DELETE /tenants/:id         [ADMIN]
```

### Machines (8 endpoints)
```
POST /machines              [ADMIN]
POST /machines/scan         [ADMIN]
GET /machines               [ADMIN]
GET /machines/serial/:serial [ADMIN]
GET /machines/:id           [ADMIN]
GET /machines/:id/nfc-tag   [ADMIN]
PATCH /machines/:id         [ADMIN]
DELETE /machines/:id        [ADMIN]
```

### NFC Tags (7 endpoints)
```
POST /nfc-tags              [ADMIN, TECHNICIAN]
GET /nfc-tags               [ADMIN, TECHNICIAN, VENDOR, DRIVER, RETAILER]
GET /nfc-tags/machine/:id   [ADMIN, TECHNICIAN, VENDOR, DRIVER, RETAILER]
GET /nfc-tags/:uid          [ADMIN, TECHNICIAN, VENDOR, DRIVER, RETAILER]
POST /nfc-tags/:uid/validate-integrity [ADMIN, TECHNICIAN, VENDOR, DRIVER, RETAILER]
POST /nfc-tags/:uid/lock    [ADMIN]
POST /nfc-tags/:uid/deactivate [ADMIN]
```

### Visits (5 endpoints)
```
POST /visits/check-in       [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
POST /visits/:id/check-out  [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/open            [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/user/:userId    [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/:id             [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
```

### Tickets (8 endpoints)
```
POST /tickets               [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets                [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets/open           [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets/metrics        [ADMIN]
GET /tickets/sla            [ADMIN]
GET /tickets/:id            [ADMIN, TECHNICIAN, VENDOR, RETAILER]
PATCH /tickets/:id          [ADMIN, TECHNICIAN]
POST /tickets/:id/resolve   [ADMIN, TECHNICIAN]
```

### Work Orders (7 endpoints)
```
POST /work-orders           [ADMIN]
GET /work-orders            [ADMIN, DRIVER, TECHNICIAN, VENDOR, RETAILER]
GET /work-orders/:id        [ADMIN, DRIVER, TECHNICIAN, VENDOR, RETAILER]
POST /work-orders/:id/validate-nfc [ADMIN, DRIVER, TECHNICIAN, RETAILER]
POST /work-orders/:id/deliver [ADMIN, DRIVER, TECHNICIAN, RETAILER]
PATCH /work-orders/:id      [ADMIN, DRIVER]
DELETE /work-orders/:id     [ADMIN]
```

### Attachments (7 endpoints)
```
POST /attachments           [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
GET /attachments/visit/:id  [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
GET /attachments/work-order/:id [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
GET /attachments/ticket/:id [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
GET /attachments/:id        [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
POST /attachments/validate-type [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
DELETE /attachments/:id     [ADMIN]
```

### Sync Queue (7 endpoints)
```
POST /sync-queue            [ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER]
GET /sync-queue/pending     [ADMIN, TECHNICIAN]
GET /sync-queue/retry-needed [ADMIN]
GET /sync-queue/stats       [ADMIN]
GET /sync-queue/:id         [ADMIN, TECHNICIAN]
POST /sync-queue/:id/mark-synced [ADMIN, TECHNICIAN]
POST /sync-queue/:id/mark-failed [ADMIN, TECHNICIAN]
```

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| ADMIN | Administrador del tenant, acceso total |
| TECHNICIAN | Técnico de servicio, hace check-in/out |
| DRIVER | Conductor, entrega y retira máquinas |
| VENDOR | Vendedor, reporta tickets |
| RETAILER | Minorista, cliente final |
| SUPPORT | Soporte técnico interno |

## Autenticación

Todas las peticiones (excepto login) requieren:

```
Headers:
  Authorization: Bearer <JWT_TOKEN>
  X-Tenant-Id: <TENANT_UUID>
```

## Desarrollo

```bash
# Compilar
npm run build

# Lint
npm run lint

# Tests
npx ts-node scripts/seed.ts
powershell -ExecutionPolicy Bypass -File test_all_endpoints.ps1
```

## Base de Datos

Ver documentación completa en `docs/SCHEMA_BD_FRIOCHECK.txt`

## Licencia

Privado - FrioCheck
