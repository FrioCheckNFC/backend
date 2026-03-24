# Guía para Backend Developer - FrioCheck API

## 1. Requisitos Previos

- Node.js 18+
- Docker Desktop
- PostgreSQL (vía Docker o Azure)
- Git

## 2. Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/svnilr/nfcproject.git
cd nfcproject
git checkout FrioCheckDB

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

## 3. Configuración de Base de Datos

### Opción A: Azure PostgreSQL (Producción)

```env
DB_HOST=friocheck-db-server.postgres.database.azure.com
DB_PORT=5432
DB_USERNAME=friocheck_admin
DB_PASSWORD=Fr1o-Ch3ck
DB_NAME=friocheck_db
NODE_ENV=production
JWT_SECRET=bd6281fe545dda07fd42a584fd7a149ed867835e0a660e5361d8e32332f8297e
```

### Opción B: Docker Local (Desarrollo)

```bash
# Iniciar PostgreSQL y Redis
docker compose up -d

# Ejecutar seed (crear datos iniciales)
npx ts-node scripts/seed.ts
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nfcproject_dev
DB_PASSWORD=nfcproject_pass
DB_NAME=nfcproject_db
NODE_ENV=development
JWT_SECRET=bd6281fe545dda07fd42a584fd7a149ed867835e0a660e5361d8e32332f8297e
```

## 4. Iniciar Servidor

```bash
npm run start:dev
```

El servidor corre en `http://localhost:3001`

## 5. Autenticación

Todos los endpoints (excepto login) requieren:

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
X-Tenant-Id: <TENANT_UUID>
```

**Obtener token:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@friocheck.com","password":"Admin123!"}'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "9ca3f737-3f06-43de-ba88-bc95db31dc45"
}
```

## 6. Estructura de la Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `tenants` | Multi-tenant (clientes) |
| `users` | Usuarios con 6 roles |
| `machines` | Equipos refrigerados |
| `nfc_tags` | Etiquetas NFC asociadas a máquinas |
| `visits` | Check-in / Check-out |
| `work_orders` | Órdenes de trabajo |
| `tickets` | Tickets de soporte |
| `attachments` | Archivos adjuntos |
| `sync_queue` | Cola de sincronización offline |

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso total |
| TECHNICIAN | Check-in/out, tickets, fotos |
| DRIVER | Entregas, validación NFC |
| VENDOR | Reportar tickets |
| RETAILER | Ver máquinas, reportar fallas |
| SUPPORT | Gestionar tickets (web) |

## 7. Endpoints Principales

### Auth
```
POST /auth/login           - Iniciar sesión
POST /auth/register        - Registrar usuario [ADMIN]
POST /auth/validate-token  - Validar token JWT
```

### Users
```
POST /users                - Crear usuario [ADMIN]
GET /users                 - Listar usuarios [ADMIN]
GET /users/email/:email    - Buscar por email [ADMIN]
GET /users/:id             - Obtener usuario [ADMIN]
PATCH /users/:id           - Actualizar usuario [ADMIN]
DELETE /users/:id          - Eliminar usuario [ADMIN]
```

### Machines
```
POST /machines             - Crear máquina [ADMIN]
POST /machines/scan        - Escanear máquina [ADMIN]
GET /machines              - Listar máquinas [ADMIN]
GET /machines/:id          - Obtener máquina [ADMIN]
GET /machines/serial/:serial - Buscar por serial [ADMIN]
PATCH /machines/:id        - Actualizar máquina [ADMIN]
DELETE /machines/:id       - Eliminar máquina [ADMIN]
```

### Visits (Check-in / Check-out)
```
POST /visits/check-in      - Check-in [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
POST /visits/:id/check-out - Check-out [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/open           - Visitas abiertas [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/user/:userId   - Visitas por usuario [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
GET /visits/:id            - Obtener visita [TECHNICIAN, DRIVER, VENDOR, RETAILER, ADMIN]
```

### Work Orders
```
POST /work-orders          - Crear orden [ADMIN]
GET /work-orders           - Listar órdenes [ADMIN, DRIVER, TECHNICIAN, VENDOR, RETAILER]
GET /work-orders/:id       - Obtener orden [ADMIN, DRIVER, TECHNICIAN, VENDOR, RETAILER]
POST /work-orders/:id/validate-nfc - Validar NFC [ADMIN, DRIVER, TECHNICIAN, RETAILER]
POST /work-orders/:id/deliver - Entregar [ADMIN, DRIVER, TECHNICIAN, RETAILER]
PATCH /work-orders/:id     - Actualizar [ADMIN, DRIVER]
DELETE /work-orders/:id    - Eliminar [ADMIN]
```

### Tickets
```
POST /tickets              - Crear ticket [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets               - Listar tickets [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets/open          - Tickets abiertos [ADMIN, TECHNICIAN, VENDOR, RETAILER]
GET /tickets/metrics       - Métricas [ADMIN]
GET /tickets/sla           - SLA promedio [ADMIN]
GET /tickets/:id           - Obtener ticket [ADMIN, TECHNICIAN, VENDOR, RETAILER]
PATCH /tickets/:id         - Actualizar [ADMIN, TECHNICIAN]
POST /tickets/:id/resolve  - Resolver [ADMIN, TECHNICIAN]
```

## 8. Datos de Prueba

### Usuarios

| Rol | Email | Contraseña |
|-----|-------|------------|
| ADMIN | admin@friocheck.com | Admin123! |
| TECHNICIAN | tecnico2@friocheck.com | Tecnico123! |
| DRIVER | driver2@friocheck.com | Driver123! |
| VENDOR | vendor2@friocheck.com | Vendor123! |
| RETAILER | retailer@friocheck.com | Retailer123! |
| SUPPORT | support2@friocheck.com | Support123! |

### Tenant

| Campo | Valor |
|-------|-------|
| ID | `cf82de22-9dc5-4ea5-91a4-d54dccdbb532` |
| Nombre | SuperFrio Refrigeración |
| Slug | superfrio |

## 9. Probar Endpoints

```bash
# Ejecutar suite de tests completa
powershell -ExecutionPolicy Bypass -File test_all_endpoints.ps1
```

**Resultado esperado:**
```
PASSED:  69
FAILED:  0
SKIPPED: 0
TOTAL:   69
```

## 10. Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Documentación general |
| `TESTING.md` | Guía de testing |
| `docs/SCHEMA_BD_FRIOCHECK.txt` | Esquema completo de BD |
| `.env.example` | Variables de entorno |

## 11. Contacto DBA

Para consultas sobre la base de datos, contactar al DBA que diseñó el esquema.

---

**Repositorio:** https://github.com/svnilr/nfcproject/tree/FrioCheckDB
**Rama:** FrioCheckDB
**Última actualización:** Marzo 2026
