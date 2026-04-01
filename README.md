# FrioCheck API

Backend NFC para refrigeración comercial.

## Stack

NestJS + TypeScript | PostgreSQL + TypeORM | JWT Auth

## Instalación

```bash
npm install && cp .env.example .env && npm run start:dev
```

## Producción

```
https://friocheck-api-b9eqhbd5ddevfbat.canadacentral-01.azurewebsites.net/api/v1
```

## Roles

| Rol | Permisos |
|-----|----------|
| SUPER_ADMIN | Tenants, admins globales |
| ADMIN | Todo en su tenant |
| SUPPORT | Gestiona usuarios operativos |
| VENDOR/TECHNICIAN/RETAILER/DRIVER | Operaciones de campo |

> Un usuario puede tener múltiples roles.

## Endpoints

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login (identifier + password) |
| POST | `/auth/validate-token` | Validar JWT |

### Usuarios (SUPER_ADMIN, ADMIN, SUPPORT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/users` | Listar/Crear |
| GET/PATCH/DELETE | `/users/:id` | CRUD por ID |
| PATCH | `/users/:id/activate` | Activar |
| PATCH | `/users/:id/deactivate` | Desactivar |
| GET/POST/PATCH | `/users/:id/roles` | Gestionar roles |
| DELETE | `/users/:id/roles/:role` | Quitar rol |

### Visitas (Mobile)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/visits/check-in` | Iniciar visita |
| POST | `/visits/:id/check-out` | Finalizar visita |
| GET | `/visits/open` | Visitas abiertas |
| GET | `/visits/user/:userId` | Por usuario |

### Máquinas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/machines/scan` | Escanear NFC |
| GET | `/machines` | Listar (filtro: ?status=) |
| GET | `/machines/serial/:serialNumber` | Por serial |
| POST/PATCH/DELETE | `/machines/:id` | CRUD (ADMIN) |

### NFC Tags
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/nfc-tags` | Listar |
| GET | `/nfc-tags/:uid` | Por UID |
| POST | `/nfc-tags/:uid/validate-integrity` | Validar checksum |
| POST | `/nfc-tags/:uid/lock` | Bloquear (ADMIN) |

### Work Orders
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/work-orders` | Listar (filtro: ?status=) |
| POST | `/work-orders/:id/validate-nfc` | Validar NFC al llegar |
| POST | `/work-orders/:id/deliver` | Marcar entregado |

### Tickets
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/tickets` | Listar/Crear |
| GET | `/tickets/open` | Tickets abiertos |
| POST | `/tickets/:id/resolve` | Resolver |

### Sync Queue (Mobile offline)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/sync-queue` | Encolar operación |
| GET | `/sync-queue/pending` | Pendientes |
| POST | `/sync-queue/:id/mark-synced` | Marcar sincronizado |

### Otros
| Recurso | Endpoints |
|---------|-----------|
| Sales | `/sales` - CRUD + métricas |
| Inventory | `/inventory` - CRUD + low-stock |
| Mermas | `/mermas` - CRUD + stats |
| Sectors | `/sectors` - CRUD |
| KPIs | `/kpis` - CRUD (ADMIN) |
| Attachments | `/attachments` - subir archivos |
| Tenants | `/tenants` - CRUD (SUPER_ADMIN) |

## Headers requeridos

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Response JWT Login

```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "user@mail.com",
    "role": ["VENDOR", "TECHNICIAN"],
    "tenantId": "uuid"
  }
}
```
