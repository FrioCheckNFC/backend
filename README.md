# FrioCheck API

Backend NFC para refrigeración comercial.

## Stack

NestJS + TypeScript | PostgreSQL + TypeORM | JWT Auth

## Instalación Local

```bash
npm install
cp .env.example .env
npm run start:dev
```

## Producción

```
https://friocheck-api-b9eqhbd5ddevfbat.canadacentral-01.azurewebsites.net/api/v1
```

Deploy automático desde `main` via GitHub Actions.

## Estructura

```
src/
├── auth/           # Login, JWT, Guards
├── users/          # Usuarios + multi-rol
├── tenants/        # Multi-tenant
├── machines/       # Equipos refrigerados
├── nfc-tags/       # Etiquetas NFC
├── visits/         # Check-in/out
├── work-orders/    # Órdenes de trabajo
├── tickets/        # Soporte
├── sales/          # Ventas
├── mermas/         # Pérdidas
├── inventory/      # Inventario
├── sectors/        # Sectores
├── kpis/           # Métricas
├── attachments/    # Archivos
├── sync-queue/     # Cola offline
└── migrations/     # Migraciones BD
```

## Roles

| Rol | Permisos |
|-----|----------|
| SUPER_ADMIN | Tenants, admins globales |
| ADMIN | Todo en su tenant |
| SUPPORT | Gestiona usuarios operativos |
| VENDOR | Vendedor |
| TECHNICIAN | Técnico |
| RETAILER | Minorista |
| DRIVER | Conductor |

> Un usuario puede tener múltiples roles (tabla `user_roles`).

## Endpoints

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login (identifier: email o RUT) |
| POST | `/auth/validate-token` | Validar JWT |

### Usuarios
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/users` | SUPER_ADMIN, ADMIN, SUPPORT |
| GET/PATCH/DELETE | `/users/:id` | SUPER_ADMIN, ADMIN, SUPPORT |
| PATCH | `/users/:id/activate` | SUPER_ADMIN, ADMIN, SUPPORT |
| PATCH | `/users/:id/deactivate` | SUPER_ADMIN, ADMIN, SUPPORT |
| GET/POST/PATCH | `/users/:id/roles` | SUPER_ADMIN, ADMIN, SUPPORT |
| DELETE | `/users/:id/roles/:role` | SUPER_ADMIN, ADMIN, SUPPORT |

### Visitas
| Método | Endpoint | Roles |
|--------|----------|-------|
| POST | `/visits/check-in` | ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER |
| POST | `/visits/:id/check-out` | ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER |
| GET | `/visits/open` | ADMIN, TECHNICIAN, DRIVER, VENDOR, RETAILER |

### Máquinas
| Método | Endpoint | Roles |
|--------|----------|-------|
| POST | `/machines/scan` | Todos |
| GET | `/machines` | Todos |
| POST/PATCH/DELETE | `/machines/:id` | ADMIN |

### NFC Tags
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/nfc-tags` | Todos |
| POST | `/nfc-tags/:uid/validate-integrity` | Todos |
| POST | `/nfc-tags/:uid/lock` | ADMIN |

### Work Orders
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET | `/work-orders` | Todos |
| POST | `/work-orders/:id/validate-nfc` | ADMIN, DRIVER, TECHNICIAN |
| POST | `/work-orders/:id/deliver` | ADMIN, DRIVER, TECHNICIAN |

### Tickets
| Método | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/tickets` | ADMIN, TECHNICIAN, VENDOR, RETAILER |
| POST | `/tickets/:id/resolve` | ADMIN, TECHNICIAN |

### Otros módulos
| Recurso | Descripción |
|---------|-------------|
| `/sales` | Ventas + métricas por vendedor/sector |
| `/inventory` | Inventario + alertas low-stock |
| `/mermas` | Pérdidas + estadísticas |
| `/sectors` | Sectores geográficos |
| `/kpis` | Métricas y metas (ADMIN) |
| `/attachments` | Archivos adjuntos |
| `/sync-queue` | Cola de sincronización offline |
| `/tenants` | CRUD tenants (SUPER_ADMIN) |

## Request/Response

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Login Request
```json
{
  "identifier": "email@mail.com o 12345678-9",
  "password": "Password123!"
}
```

### Login Response
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@mail.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": ["VENDOR", "TECHNICIAN"],
    "tenantId": "uuid"
  }
}
```

## Base de Datos

### Tablas principales
| Tabla | Descripción |
|-------|-------------|
| tenants | Multi-tenant |
| users | Usuarios |
| user_roles | Roles por usuario (N:M) |
| machines | Equipos refrigerados |
| nfc_tags | Etiquetas NFC |
| visits | Check-in/out |
| work_orders | Órdenes de trabajo |
| tickets | Tickets de soporte |

### Características
- Multi-tenant (tenant_id en todas las tablas)
- Soft delete (deleted_at)
- Timestamps automáticos (created_at, updated_at)

## Scripts

```bash
npm run start:dev      # Desarrollo
npm run build          # Build producción
npm run migration:run  # Ejecutar migraciones
```

## CI/CD

GitHub Actions despliega automáticamente a Azure App Service cuando se hace push a `main`.
