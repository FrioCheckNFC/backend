# Arquitectura del Backend — FrioCheck

> Documento técnico para el equipo de desarrollo.  
> Explica cada carpeta, subcarpeta y archivo del proyecto.  
> **Actualizado:** Abril 2026

---

## Índice

1. [Resumen General](#resumen-general)
2. [Árbol de Carpetas](#árbol-de-carpetas)
3. [Arquitectura Clean Architecture](#arquitectura-clean-architecture)
4. [Duplicados detectados y su propósito](#duplicados-detectados-y-su-propósito)
5. [Oportunidades de mejora](#oportunidades-de-mejora)
6. [Descripción detallada por carpeta](#descripción-detallada-por-carpeta)
   - [src/ (raíz)](#src-raíz)
   - [src/domain/](#srcdomain)
   - [src/application/](#srcapplication)
   - [src/infrastructure/](#srcinfrastructure)
   - [src/interfaces/](#srcinterfaces)
   - [src/auth/](#srcauth)
   - [src/shared/](#srcshared)
   - [src/modules/](#srcmodules)
7. [Sistema de Decoradores](#sistema-de-decoradores)

---

## Resumen General

FrioCheck es una API REST construida con **NestJS** + **TypeORM** + **PostgreSQL (Azure)**.

El backend gestiona:

- Autenticación con JWT y soporte multi-tenant
- Gestión de equipos de refrigeración (máquinas) con tags NFC
- Registro de visitas de técnicos en terreno con validación GPS + NFC
- Tickets de soporte, órdenes de trabajo
- Ventas, inventario, mermas y KPIs
- Adjuntos (fotos de evidencia almacenadas en Azure Blob Storage)
- Cola de sincronización offline para la app móvil

**Multi-tenant:** Cada empresa que usa FrioCheck es un "tenant". Todos los registros tienen `tenantId` y **todos los servicios filtran por él**, por lo que una empresa nunca puede ver los datos de otra.

---

## Árbol de Carpetas (Actual - Clean Architecture)

```
src/
├── app.module.ts              ← Módulo raíz: orquesta toda la app
├── app.controller.ts          ← Endpoint de healthcheck (GET /)
├── app.service.ts             ← Servicio del healthcheck
├── main.ts                    ← Punto de entrada: arranca el servidor
│
├── domain/                    ← ENTIDADES PURAS (Clean Architecture - Core)
│   └── entities/             ← Definiciones TypeScript sin TypeORM
│       ├── user.entity.ts
│       ├── tenant.entity.ts
│       ├── machine.entity.ts
│       ├── visit.entity.ts
│       ├── ticket.entity.ts
│       ├── sale.entity.ts
│       ├── merma.entity.ts
│       ├── inventory-item.entity.ts
│       ├── kpi.entity.ts
│       ├── sector.entity.ts
│       ├── attachment.entity.ts
│       ├── sync-queue.entity.ts
│       ├── work-order.entity.ts
│       └── index.ts
│
├── application/               ← CASOS DE USO + PUERTOS (Lógica de negocio)
│   ├── auth/
│   │   ├── ports/            ← Interfaces para adapters
│   │   │   ├── auth-user-reader.port.ts
│   │   │   ├── password-hasher.port.ts
│   │   │   └── token-signer.port.ts
│   │   └── use-cases/        ← Lógica de negocio pura
│   │       ├── login.use-case.ts
│   │       ├── forgot-password.use-case.ts
│   │       └── reset-password.use-case.ts
│   ├── users/
│   │   └── ports/
│   │       └── user.repository.port.ts
│   ├── tenants/
│   │   └── ports/
│   │       └── tenant.repository.port.ts
│   └── machines/
│       └── ports/
│           └── machine.repository.port.ts
│
├── infrastructure/            ← ADAPTERS (Implementaciones concretas)
│   └── persistence/
│       └── typeorm/          ← Repositorios TypeORM
│           ├── user.repository.ts
│           ├── tenant.repository.ts
│           └── machine.repository.ts
│
├── interfaces/              ← API HTTP (Controllers NestJS)
│   └── http/
│       ├── auth.controller.ts
│       ├── users.controller.ts
│       └── ...
│
├── auth/                     ← RE-EXPORTA lo de modules/auth (barrel export)
├── shared/                   ← Constantes y utilidades globales
├── database/                 ← Scripts SQL de migración manual
├── migrations/               ← Migraciones TypeORM (programáticas)
│
└── modules/                  ← MÓDULOS NESTJS (Legacy - en migración)
    ├── auth/
    ├── tenants/
    ├── users/
    ├── machines/
    ├── visits/
    ├── tickets/
    ├── attachments/
    ├── sectors/
    ├── sales/
    ├── mermas/
    ├── inventory/
    ├── kpis/
    ├── nfc-tags/
    ├── work-orders/
    └── sync-queue/
```

---

## Arquitectura Clean Architecture

### Capas del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES (API)                         │
│        src/interfaces/http/ (Controllers NestJS)            │
│                     ↓ depende de                            │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION (Casos de uso)               │
│        src/application/*/use-cases/*                        │
│        src/application/*/ports/* (Interfaces)               │
│                     ↓ depende de                            │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN (Entidades)                       │
│        src/domain/entities/* (TypeScript puro)             │
│                     ↓ NO depende de nada externa           │
├─────────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE (Implementaciones)           │
│        src/infrastructure/persistence/typeorm/*            │
│                     ↓ implementa                            │
└─────────────────────────────────────────────────────────────┘
```

### Regla de Dependencias

```
interfaces → application → domain ← infrastructure
```

- **Domain**: No importa NestJS, TypeORM, bcrypt, JWT, ni ninguna librería externa
- **Application**: Define puertos (interfaces) que la infraestructura implementa
- **Infrastructure**: Implementa los puertos con tecnología real (TypeORM, bcrypt, JWT)
- **Interfaces**: Convierte HTTP (DTO) ↔ Casos de uso

### Beneficios de esta Arquitectura

1. **Testabilidad**: Domain y Application se pueden testar sin base de datos
2. **Flexibilidad**: Puedo cambiar TypeORM por otro ORM sin tocar la lógica de negocio
3. **Claridad**: Las dependencias van en una sola dirección (hacia el centro)
4. **Mantenibilidad**: Cada cosa tiene su lugar específico

---

## Duplicados detectados y su propósito

Hay varias carpetas que **parecen** duplicadas pero tienen un rol distinto:

| Carpeta               | ¿Es duplicado?   | Propósito real                                                                                                            |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/auth/`           | **NO**           | **Barrel export** + AuthCoreModule liviano. Re-exporta `modules/auth/` para rutas más cortas.                             |
| `src/shared/`         | **NO**           | **Constantes globales** (`constants/`) y **helpers** (`utils/`). Distinto de `modules/shared/` (attachments, sync-queue). |
| `src/application/`    | **NO**           | **Casos de uso puros** (Clean Architecture). No depende de NestJS ni HTTP.                                                |
| `src/domain/`         | **NO**           | **Entidades puras** de TypeScript. Sin TypeORM, NestJS ni librerías externas.                                             |
| `src/infrastructure/` | **NO**           | **Adapters** que implementan los puertos de `application/`. TypeORM repositorios.                                         |
| `src/interfaces/`     | **NO**           | **Controllers HTTP** que exponen los endpoints REST.                                                                      |
| `src/modules/`        | **Parcialmente** | **Legacy** - contiene las entidades TypeORM y servicios NestJS actuales. En migración hacia Clean Architecture.           |

> **Regla fácil de recordar:**
>
> - `src/domain/` → entidades puras, nada de frameworks
> - `src/application/` → lógica de negocio, solo interfaces (puertos)
> - `src/infrastructure/` → implementa los puertos con tecnología real
> - `src/interfaces/` → controllers que reciben HTTP y llaman a casos de uso
> - `src/modules/` → estructura actual, se migra gradualmente a las capas superiores

---

## Oportunidades de mejora

### Estado de la Migración a Clean Architecture (Abril 2026)

| Capa                  | Estado        | Archivos    | Descripción                            |
| --------------------- | ------------- | ----------- | -------------------------------------- |
| **domain/entities**   | ✅ Completo   | 13 archivos | Entidades puras TypeScript sin TypeORM |
| **application/ports** | ✅ Completo   | 6 ports     | users, tenants, machines + auth        |
| **infrastructure/**   | ✅ Completo   | 4 archivos  | repositories TypeORM funcionales       |
| **interfaces/http**   | ⚠️ Estructura | 1 archivo   | Index + comentarios                    |
| **modules/**          | ✅ Legacy     | 15 módulos  | Funciona actualmente                   |

### Lo Completado en esta Migración

1. **Domain** - 13 entidades puras TypeScript
2. **Application** - 3 ports completos (user, tenant, machine) + 3 auth existentes
3. **Infrastructure** - 3 repositories funcionales que usan entidades TypeORM de modules/
   - `persistence/typeorm/user.repository.ts` ✅
   - `persistence/typeorm/tenant.repository.ts` ✅
   - `persistence/typeorm/machine.repository.ts` ✅

### Lo que Falta

1. **Interfaces** - Mover controllers a `http/`:
   - `http/auth.controller.ts`
   - `http/users.controller.ts`
   - etc.

2. **Refactorizar** - Los módulos actuales pueden usar los nuevos servicios de infrastructure

   **Solución sugerida**: Los repositories deben mapear entre la entidad TypeORM y la interfaz del domain, haciendo casting explícito.

---

### 1. `src/auth/` tiene una `JwtStrategy` duplicada

`src/auth/jwt.strategy.ts` y `src/modules/auth/jwt.strategy.ts` son prácticamente iguales (misma lógica). Solo debería existir en `modules/auth/` y el `index.ts` en `src/auth/` ya lo re-exporta correctamente.

- **Acción sugerida:** Eliminar `src/auth/jwt.strategy.ts` y actualizar `AuthCoreModule` para importar desde `modules/auth/`.

### 2. Los roles válidos están duplicados

Los roles (`ADMIN`, `TECHNICIAN`, etc.) están definidos en `src/shared/constants/index.ts` pero también hardcodeados en `users.service.ts` y en `machines.service.ts`.

- **Acción sugerida:** Reemplazar los arrays hardcodeados por la constante `USER_ROLES` importada desde `src/shared/constants/index.ts`.

### 3. `machines.service.ts` usa queries SQL crudas

`getLastControlDetails()` y `getRecentVisits()` usan `manager.query()` con SQL directo. Esto rompe el aislamiento TypeORM y es difícil de testear.

- **Acción sugerida:** Reemplazar con el QueryBuilder de TypeORM o importar el repositorio `Visit`.

### 4. `visits.service.ts` referencia relaciones que no existen en la entidad

`findAll()` carga la relación `'asset'`, pero en `visit.entity.ts` la relación se llama `machine` (no `asset`). Esto genera un error silencioso en runtime.

- **Acción sugerida:** Cambiar `relations: ['technician', 'asset']` por `relations: ['technician', 'machine']` en `visits.service.ts`.

### 5. `ForgotPasswordUseCase` importa `bcrypt` directamente

El caso de uso en `application/` debería ser agnóstico de implementación. Usa `bcrypt` directamente en vez de usar el `PasswordHasherPort`.

- **Acción sugerida:** Inyectar el `PasswordHasherPort` en `ForgotPasswordUseCase`.

### 6. `src/database/migrations/` y `src/migrations/` coexisten

Hay dos carpetas de migraciones: una con scripts `.sql` manuales y otra con migraciones TypeORM `.ts`. Puede confundir.

- **Acción sugerida:** Documentar claramente que `src/database/migrations/` son scripts históricos manuales (no se corren con TypeORM) y `src/migrations/` son las migraciones activas.

---

## Descripción detallada por carpeta

---

### `src/` (raíz)

#### `main.ts`

**Punto de entrada del servidor.** Es el primer archivo que se ejecuta.

- Verifica que `JWT_SECRET` esté definido antes de arrancar (si no, tira error y no levanta).
- Configura el prefijo global `/api/v1` para todos los endpoints.
- Configura **CORS** (lista blanca de orígenes permitidos, configurable via `ALLOWED_ORIGINS` en `.env`).
- Configura el **ValidationPipe global**: rechaza campos desconocidos en los DTOs (`whitelist: true`, `forbidNonWhitelisted: true`) y convierte tipos automáticamente (`transform: true`).
- Monta **Swagger** en `/api`.
- Escucha en el puerto definido en `PORT` (default: 3000).

#### `app.module.ts`

**Módulo raíz de NestJS.** Importa y registra todos los módulos del sistema.

- Configura **ThrottlerModule** (rate limiting): 10 req/seg, 60 req/min, 300 req/hora para proteger contra fuerza bruta.
- Carga variables de entorno con `ConfigModule.forRoot({ isGlobal: true })`.
- Conecta a PostgreSQL (Azure) via `TypeOrmModule.forRootAsync`. Si el host contiene `azure.com`, activa SSL automáticamente.
- Registra los 15 módulos de negocio.
- Aplica `ThrottlerGuard` globalmente a todos los endpoints.

#### `app.controller.ts`

Endpoint de salud (`GET /api/v1`). Devuelve un mensaje simple para verificar que el servidor está vivo.

#### `app.service.ts`

Servicio del controller raíz. Solo retorna el string "Hello World!" (healthcheck básico).

---

### `src/domain/`

> **Rol:** Entidades puras de TypeScript (Clean Architecture - Core)  
> **NO contiene:** NestJS, TypeORM, bcrypt, JWT, ni ninguna librería externa.  
> **Solo contiene:** Interfaces y tipos TypeScript puro.

#### `domain/entities/`

| Archivo                    | Descripción                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| `user.entity.ts`           | Interfaz `User` con todos los campos (id, email, rut, role[], etc.) |
| `tenant.entity.ts`         | Interfaz `Tenant` (id, name, slug, isActive, etc.)                  |
| `machine.entity.ts`        | Interfaz `Machine` (id, name, status, latitude, longitude, etc.)    |
| `visit.entity.ts`          | Interfaz `Visit` (id, technicianId, machineId, status, type, etc.)  |
| `ticket.entity.ts`         | Interfaz `Ticket` (id, title, priority, status, etc.)               |
| `sale.entity.ts`           | Interfaz `Sale` (id, vendorId, amount, saleDate, etc.)              |
| `merma.entity.ts`          | Interfaz `Merma` (id, productName, quantity, totalCost, etc.)       |
| `inventory-item.entity.ts` | Interfaz `InventoryItem` (id, partName, quantity, status, etc.)     |
| `kpi.entity.ts`            | Interfaz `Kpi` (id, type, targetValue, currentValue, etc.)          |
| `sector.entity.ts`         | Interfaz `Sector` (id, name, address, latitude, longitude, etc.)    |
| `attachment.entity.ts`     | Interfaz `Attachment` (id, url, fileName, mimeType, etc.)           |
| `sync-queue.entity.ts`     | Interfaz `SyncQueueItem` (id, operationType, status, payload, etc.) |
| `work-order.entity.ts`     | Interfaz `WorkOrder` (id, title, status, priority, dueDate, etc.)   |
| `index.ts`                 | **Barrel export** que re-exporta todas las entidades                |

Cada entidad también define:

- `CreateXxxInput` - tipos para crear registros
- `UpdateXxxInput` - tipos para actualizar registros
- `XxxResponse` - tipos para respuestas de API (sin passwordHash)

#### Ejemplo de entidad pura

```typescript
// domain/entities/user.entity.ts
export type UserRole =
  | 'ADMIN'
  | 'SUPPORT'
  | 'VENDOR'
  | 'RETAILER'
  | 'TECHNICIAN'
  | 'DRIVER';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  rut?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateUserInput {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  rut?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole[];
  // NOTA: No incluye passwordHash
}
```

---

### `src/application/`

> **Rol:** Casos de uso puros + Puertos (interfaces).  
> **NO contiene:** Implementaciones concretas, solo lógica de negocio.

#### `application/*/ports/`

Los **puertos** son interfaces que definen qué necesita la lógica de negocio, sin importar cómo se implementa.

| Puerto                       | Descripción                                     |
| ---------------------------- | ----------------------------------------------- |
| `auth-user-reader.port.ts`   | `findByEmail(email)` - busca usuario para auth  |
| `password-hasher.port.ts`    | `compare(plain, hash)` - compara contraseñas    |
| `token-signer.port.ts`       | `sign(payload)` - firma tokens JWT              |
| `user.repository.port.ts`    | CRUD de usuarios sin detalles de implementación |
| `tenant.repository.port.ts`  | CRUD de tenants sin detalles de implementación  |
| `machine.repository.port.ts` | CRUD de máquinas sin detalles de implementación |

#### `application/*/use-cases/`

Los **casos de uso** son la lógica de negocio real. Ejemplos:

| Caso de uso                   | Descripción                                  |
| ----------------------------- | -------------------------------------------- |
| `login.use-case.ts`           | Busca usuario, valida contraseña, genera JWT |
| `forgot-password.use-case.ts` | Genera token de reset de contraseña          |
| `reset-password.use-case.ts`  | Valida token, cambia contraseña              |

---

### `src/infrastructure/`

> **Rol:** Implementaciones concretas de los puertos (Clean Architecture - Adapter)  
> **Implementa:** Las interfaces definidas en `application/`

#### `infrastructure/persistence/typeorm/`

| Archivo                 | Descripción                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `user.repository.ts`    | Implementa `UserRepositoryPort` usando TypeORM + Entity `User` de modules/ |
| `tenant.repository.ts`  | Implementa `TenantRepositoryPort` usando TypeORM                           |
| `machine.repository.ts` | Implementa `MachineRepositoryPort` usando TypeORM                          |

También incluye implementaciones de seguridad:

- `BcryptPasswordHasher` - implementa `PasswordHasherPort`
- `JwtTokenSignerAdapter` - implementa `TokenSignerPort`

---

### `src/interfaces/`

> **Rol:** Capa de adapters para protocolos externos (API HTTP, CLI, etc.)  
> **Contiene:** Controllers NestJS que exponen los endpoints REST

#### `interfaces/http/`

| Archivo                 | Descripción                                        |
| ----------------------- | -------------------------------------------------- |
| `auth.controller.ts`    | Endpoints de autenticación (login, register, etc.) |
| `users.controller.ts`   | Endpoints de gestión de usuarios                   |
| `tenants.controller.ts` | Endpoints de gestión de tenants                    |

Esta capa:

1. Recibe la request HTTP
2. Valida el DTO
3. Llama al caso de uso correspondiente
4. Convierte la respuesta al formato HTTP

---

### `src/auth/`

> **Rol:** Barrel export + AuthCoreModule liviano.  
> **No contiene lógica propia de negocio.** Delega todo a `src/modules/auth/`.

#### `index.ts`

Re-exporta todos los guards, decoradores, adapters y servicios de `src/modules/auth/`.  
Permite escribir `import { JwtAuthGuard } from '../auth'` en vez de `import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard'`.

#### `auth.core.module.ts`

Módulo NestJS mínimo que solo registra `PassportModule` y `JwtStrategy`.  
Se usa cuando otro módulo necesita autenticación básica sin importar todo el `AuthModule`.

#### `jwt.strategy.ts`

**DUPLICADO PARCIAL** de `src/modules/auth/jwt.strategy.ts`.  
Estrategia Passport que extrae el JWT del header `Authorization: Bearer <token>`, lo valida y popula `req.user` con `{ id, email, role, tenantId }`.

#### `guards/jwt-auth.guard.ts`

Guard que protege endpoints con JWT. Extiende `AuthGuard('jwt')` de Passport.  
Si el token es inválido o no existe, responde `401 Unauthorized`.

#### `guards/roles.guard.ts`

Guard que verifica que el usuario tenga al menos uno de los roles requeridos.  
Lee los roles del metadata del decorador `@Roles()` o `@RequireRoles()`.  
Si el endpoint no tiene roles definidos, permite el acceso.

#### `guards/tenant.guard.ts`

Guard que verifica que `req.user.tenantId` exista.  
Bloquea usuarios que de alguna forma tengan un JWT sin `tenantId` (nunca debería ocurrir, pero es una red de seguridad).

#### `decorators/current-user.decorator.ts`

Decorador de parámetro: `@CurrentUser()`.  
Extrae el objeto `user` completo de `req.user` y lo inyecta como parámetro del método del controller.  
Ejemplo de uso: `findAll(@CurrentUser() user: any)`.

#### `decorators/current-tenant.decorator.ts`

Decorador de parámetro: `@CurrentTenant()`.  
Extrae solo `req.user.tenantId` y lo inyecta.  
Ejemplo de uso: `findAll(@CurrentTenant() tenantId: string)`.

#### `decorators/require-roles.decorator.ts`

Decorador de método: `@RequireRoles('ADMIN', 'SUPPORT')`.  
Usa `SetMetadata('roles', roles)` para agregar roles al metadata del endpoint.  
El `RolesGuard` lee ese metadata para validar.

---

### `src/application/`

> **Rol:** Capa de aplicación — casos de uso puros (Clean Architecture / Hexagonal).  
> Los archivos aquí **no importan nada de NestJS**. Son TypeScript puro.  
> Esto los hace testables sin necesidad de levantar el framework.

#### `application/auth/ports/`

Los **ports** son interfaces (contratos) que definen qué capacidades necesita la lógica de negocio, sin importar cómo se implementan.

| Archivo                    | Descripción                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-user-reader.port.ts` | Define `AuthUserReaderPort`: interfaz para buscar un usuario por email/RUT y obtener sus roles. La implementación concreta está en `modules/auth/adapters/typeorm-auth-user-reader.adapter.ts`. |
| `password-hasher.port.ts`  | Define `PasswordHasherPort`: interfaz para comparar una contraseña en texto plano contra su hash bcrypt.                                                                                        |
| `token-signer.port.ts`     | Define `TokenSignerPort`: interfaz para firmar un payload JWT y devolver el token como string.                                                                                                  |

#### `application/auth/use-cases/`

Los **use-cases** son la lógica de negocio real. Reciben datos, aplican reglas, y devuelven resultados o lanzan errores.

| Archivo                       | Descripción                                                                                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `login.use-case.ts`           | **LoginUseCase**: Busca al usuario por email/RUT, verifica que esté activo, verifica que su tenant esté activo, compara la contraseña con bcrypt, obtiene sus roles y genera el JWT. Lanza `InvalidCredentialsError`, `InactiveUserError` o `TenantNotFoundError`. |
| `forgot-password.use-case.ts` | **ForgotPasswordUseCase**: Genera un token seguro de reset de contraseña. Guarda el hash del token (nunca el token en texto plano) en la tabla `password_resets`. Responde igual haya o no un usuario con ese email (evita user enumeration).                      |
| `reset-password.use-case.ts`  | **ResetPasswordUseCase**: Valida el token de reset (primero filtra por prefijo para no hacer bcrypt en toda la tabla), verifica que no haya expirado, cambia el hash de la contraseña y marca el token como usado.                                                 |

---

### `src/shared/`

> **Rol:** Constantes y funciones utilitarias de TypeScript puro.  
> No contiene módulos NestJS ni entidades de base de datos.

#### `shared/constants/index.ts`

Exporta todas las constantes compartidas del proyecto.

| Constante                               | Descripción                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `USER_ROLES`                            | Array de todos los roles válidos: `ADMIN`, `SUPPORT`, `VENDOR`, `RETAILER`, `TECHNICIAN`, `DRIVER`. |
| `DEFAULT_ROLE`                          | Rol por defecto al registrar usuarios: `TECHNICIAN`.                                                |
| `BCRYPT_SALT_ROUNDS`                    | Rondas de encriptación bcrypt: `10`.                                                                |
| `JWT_EXPIRY`                            | Duración del JWT: `24h`.                                                                            |
| `PASSWORD_RESET_TOKEN_EXPIRY_HOURS`     | Duración del token de reset: `1` hora.                                                              |
| `GPS_VALIDATION_RADIUS_METERS`          | Radio máximo de GPS para validar visitas: `100` metros.                                             |
| `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE`   | Paginación: 20 por defecto, máximo 100.                                                             |
| `MACHINE_STATUSES`                      | Estados válidos de máquinas.                                                                        |
| `VISIT_STATUSES` / `VISIT_TYPES`        | Estados y tipos válidos de visitas.                                                                 |
| `TICKET_STATUSES` / `TICKET_PRIORITIES` | Estados y prioridades de tickets.                                                                   |

#### `shared/utils/validation.ts`

Funciones helper de validación (sin dependencias externas).

| Función                                | Descripción                                                         |
| -------------------------------------- | ------------------------------------------------------------------- |
| `isValidRut(rut)`                      | Valida un RUT chileno con dígito verificador (algoritmo módulo 11). |
| `cleanRut(rut)`                        | Elimina puntos, guiones y espacios del RUT.                         |
| `formatRut(rut)`                       | Formatea un RUT con puntos de miles y guión.                        |
| `isValidEmail(email)`                  | Valida formato básico de email con regex.                           |
| `isValidPassword(password, minLength)` | Verifica longitud mínima de contraseña.                             |
| `isValidChileanPhone(phone)`           | Valida número celular chileno (`+569XXXXXXXX`, `9XXXXXXXX`).        |
| `normalizeChileanPhone(phone)`         | Normaliza teléfono al formato estándar `+569XXXXXXXX`.              |

---

### `src/database/`

> **Rol:** Scripts SQL históricos de migración manual.  
> **No son migraciones TypeORM.** No se ejecutan con `npm run migration:run`.  
> Son scripts SQL que se corrieron directamente en Azure para arreglar cosas puntuales.

#### `database/migrations/`

| Archivo                       | Descripción                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `001_create_user_roles.sql`   | Crea la tabla `user_roles` para la relación N:M de usuarios con múltiples roles. |
| `001_rollback_user_roles.sql` | Rollback del script anterior (elimina la tabla).                                 |
| `002_users_role_to_array.sql` | Migra la columna `role` de un string a un array de texto en PostgreSQL.          |

---

### `src/migrations/`

> **Rol:** Migraciones TypeORM programáticas.  
> Se ejecutan con `npm run migration:run`.  
> Cada archivo es una clase con métodos `up()` (aplicar) y `down()` (revertir).

Las migraciones están ordenadas por timestamp. Las más relevantes:

| Archivo                                       | Descripción                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| `1678879200000-CreateInitialSchema.ts`        | Crea el esquema inicial completo (todas las tablas).                              |
| `1774297640209-AddTimestampsAndSoftDelete.ts` | Agrega `created_at`, `updated_at`, `deleted_at` a todas las tablas (soft delete). |
| `1774300000000-CreateCleanSchema.ts`          | Re-creación completa y limpia del esquema con todas las FK correctas.             |
| `1774400000000-AddUserRolesTable.ts`          | Agrega tabla `user_roles` para multi-rol.                                         |
| `1774500000000-AddTenantNameToUsers.ts`       | Agrega columna `tenant_name` a `users` para desnormalización.                     |

---

### `src/modules/auth/`

> **Rol:** Módulo NestJS completo de autenticación.  
> Maneja login, registro, JWT, guards y recuperación de contraseña.

#### `auth.module.ts`

Módulo principal de auth. Registra:

- `TypeOrmModule.forFeature([User, PasswordReset])` — acceso a las tablas.
- `JwtModule.registerAsync` — configura JWT con `JWT_SECRET` del `.env`.
- `PassportModule` — estrategia JWT.
- Todos los adapters y casos de uso como providers.
- Los tokens de inyección (`AUTH_USER_READER`, `PASSWORD_HASHER`, etc.) para el patrón de puertos.

#### `auth.controller.ts`

Expone los endpoints HTTP de autenticación bajo el prefijo `/auth`.

| Endpoint                           | Método  | Descripción                                                                   |
| ---------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `POST /auth/login`                 | Público | Recibe email/RUT y contraseña, devuelve JWT + datos del usuario.              |
| `POST /auth/register`              | ADMIN   | Registra un usuario nuevo. Siempre asigna rol `TECHNICIAN`.                   |
| `POST /auth/forgot-password`       | Público | Solicita reset de contraseña. Responde igual sin importar si el email existe. |
| `POST /auth/reset-password`        | Público | Cambia la contraseña usando el token de reset.                                |
| `GET /auth/check-user/:identifier` | Público | Verifica si existe un usuario por email o RUT.                                |
| `POST /auth/validate-token`        | JWT     | Verifica que el JWT sea válido y no haya expirado.                            |

#### `auth.service.ts`

Intermediario entre el controller y los casos de uso.

- `login()` — llama al `LoginUseCase` y convierte los errores de dominio en `UnauthorizedException`.
- `register()` — crea el usuario con rol `TECHNICIAN` hardcodeado (seguridad: no se puede auto-asignar `ADMIN`).
- `forgotPassword()` / `resetPassword()` — delega a los casos de uso.
- `checkUser()` — busca usuario por email o RUT y devuelve si existe y si está activo.

#### `jwt.strategy.ts`

Estrategia Passport-JWT. Lee el token del header `Authorization: Bearer <token>`, lo valida con `JWT_SECRET` y popula `req.user` con `{ id, email, role[], tenantId }`.

#### `tokens.ts`

Define los **tokens de inyección de dependencias** (Symbols de JavaScript) para el patrón de puertos:

- `AUTH_USER_READER` → instancia de `TypeormAuthUserReaderAdapter`
- `PASSWORD_HASHER` → instancia de `BcryptPasswordHasherAdapter`
- `TOKEN_SIGNER` → instancia de `JwtTokenSignerAdapter`
- `LOGIN_USE_CASE` → instancia de `LoginUseCase`

#### `entities/password-reset.entity.ts`

Tabla `password_resets`. Almacena los tokens de recuperación de contraseña.

| Campo            | Descripción                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `userId`         | FK al usuario que solicitó el reset.                                          |
| `tokenPrefix`    | Primeros 8 caracteres del token (texto plano, indexado para búsqueda rápida). |
| `resetTokenHash` | Hash bcrypt del token completo (nunca se guarda el token original).           |
| `expiresAt`      | Fecha de expiración (1 hora desde la creación).                               |
| `used`           | Si ya se usó este token (no se puede reutilizar).                             |

#### `adapters/typeorm-auth-user-reader.adapter.ts`

Implementa `AuthUserReaderPort` usando TypeORM.

- `findByEmail()` — busca usuario por email O por RUT.
- `getUserRoles()` — consulta la tabla `user_roles` para obtener todos los roles del usuario.

#### `adapters/bcrypt-password-hasher.adapter.ts`

Implementa `PasswordHasherPort` usando bcrypt.

- `compare()` — compara contraseña en texto plano contra su hash.

#### `adapters/jwt-token-signer.adapter.ts`

Implementa `TokenSignerPort` usando `JwtService` de NestJS.

- `sign()` — firma el payload y devuelve el token JWT como string.

#### `guards/`

Los mismos guards que `src/auth/guards/`. Ver descripción arriba.

#### `decorators/`

Los mismos decoradores que `src/auth/decorators/`. Ver descripción arriba.  
Agrega también `roles.decorator.ts`: `@Roles('ADMIN')` — alternativa semántica a `@RequireRoles()`.

#### `dto/`

| Archivo                  | Descripción                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| `login.dto.ts`           | Acepta `email` o `rut` (uno de los dos) + `password`.                       |
| `register.dto.ts`        | `email`, `password`, `firstName`, `lastName`, `tenantId`, `rut` (opcional). |
| `forgot-password.dto.ts` | Solo `email`.                                                               |
| `reset-password.dto.ts`  | `token` + `newPassword`.                                                    |

---

### `src/modules/identity/`

> **Rol:** Gestión de quién puede acceder al sistema (usuarios y empresas).

#### `identity/tenants/`

**Tenants** = empresas clientes que usan FrioCheck (ej: "SuperFrio S.A.").

##### `tenants.module.ts`

Registra `Tenant` en TypeORM y exporta `TenantsService` para que `AuthModule` lo use.

##### `tenants.service.ts`

CRUD completo de tenants.

- `findAll()` — lista todos los tenants ordenados por fecha de creación.
- `findOne(id)` — busca un tenant por ID, lanza 404 si no existe.
- `create(dto)` — crea un tenant verificando que el `slug` sea único.
- `update(id, dto)` — actualiza un tenant. Si cambia el slug, verifica que no esté en uso.
- `remove(id)` — soft delete: marca `deleted_at`, no borra el registro.

##### `tenants.controller.ts`

Expone los endpoints bajo `/tenants`. Todos requieren JWT + rol `ADMIN`.

##### `entities/tenant.entity.ts`

Tabla `tenants`.

| Campo                           | Descripción                                    |
| ------------------------------- | ---------------------------------------------- |
| `id`                            | UUID, clave primaria.                          |
| `name`                          | Nombre de la empresa (ej: "SuperFrio S.A.").   |
| `slug`                          | Identificador único en URLs (ej: `superfrio`). |
| `description`                   | Descripción opcional.                          |
| `logoUrl`                       | URL del logo (almacenado en Azure Blob).       |
| `isActive`                      | Si el tenant puede iniciar sesión.             |
| `createdAt/updatedAt/deletedAt` | Timestamps automáticos + soft delete.          |

---

#### `identity/users/`

**Usuarios** = personas que inician sesión en la app (técnicos, admins, vendedores, etc.).

##### `users.service.ts`

CRUD completo de usuarios, siempre filtrado por `tenantId`.

- `findAll(tenantId)` — lista usuarios de la empresa. **Nunca devuelve el `passwordHash`** (usa `select` explícito).
- `findOne(id, tenantId)` — busca un usuario verificando que pertenezca al tenant.
- `create(dto, tenantId)` — crea usuario con contraseña hasheada. Rol por defecto: `TECHNICIAN`.
- `update(id, dto, tenantId)` — actualiza campos. Si viene nueva contraseña, la hashea.
- `remove(id, tenantId)` — soft delete.
- `deactivate/activate(id, tenantId)` — desactiva/activa acceso sin borrar el usuario.
- `changePassword(id, currentPassword, newPassword, tenantId)` — cambia contraseña verificando la actual.
- `addRole(id, role, tenantId)` — agrega un rol al usuario (valida que sea un rol válido).
- `removeRole(id, role, tenantId)` — elimina un rol. Lanza error si es el último rol.

##### `entities/user.entity.ts`

Tabla `users`.

| Campo                           | Descripción                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `id`                            | UUID.                                                                                                    |
| `tenantId`                      | FK a `tenants.id`. Define a qué empresa pertenece.                                                       |
| `email`                         | Único. Se usa para login.                                                                                |
| `rut`                           | RUT chileno (único si existe). Alternativa al email para login.                                          |
| `passwordHash`                  | Hash bcrypt. **Nunca se expone en las respuestas.**                                                      |
| `firstName/lastName`            | Nombre y apellido.                                                                                       |
| `phone`                         | Teléfono opcional.                                                                                       |
| `role`                          | Array de texto en PostgreSQL. Valores: `ADMIN`, `SUPPORT`, `VENDOR`, `RETAILER`, `TECHNICIAN`, `DRIVER`. |
| `fcmTokens`                     | Tokens FCM para notificaciones push (JSON como texto).                                                   |
| `active`                        | Si puede iniciar sesión.                                                                                 |
| `createdAt/updatedAt/deletedAt` | Timestamps + soft delete.                                                                                |

---

### `src/modules/field/`

> **Rol:** Gestión de los activos físicos que están "en campo" (en las empresas de los clientes).

#### `field/machines/`

**Máquinas** = equipos de refrigeración (cámaras frigoríficas, refrigeradores industriales, etc.).

##### `machines.service.ts`

Servicio más complejo del sistema. Además del CRUD básico, implementa:

- `findByNfc(nfcTagId, tenantId)` — busca la máquina asociada a un tag NFC. Normaliza el ID del tag antes de buscar (maneja distintos formatos UUID).
- `scan(dto, tenantId)` — valida un escaneo NFC + GPS: verifica que el tag pertenezca a la máquina y que el técnico esté a menos de 100 metros.
- `nfcRead(dto, tenantId, userRoles)` — endpoint principal del flujo NFC. Devuelve todos los datos de la máquina, historial de visitas recientes, último control y acciones permitidas según el rol del usuario.
- `getAllowedActions(roles)` — calcula qué acciones puede hacer el usuario según su rol (`ADMIN`: todo, `TECHNICIAN`: visitas y mermas, `VENDOR`: ventas).
- `calculateDistance(lat1, lng1, lat2, lng2)` — fórmula de Haversine para calcular distancia en metros entre dos coordenadas GPS.
- `normalizeNfcId(nfcId)` — normaliza el ID del tag NFC a formato UUID estándar.

##### `entities/machine.entity.ts`

Tabla `machines`.

| Campo                                                     | Descripción                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `tenantId`                                                | FK al tenant dueño del equipo.                                                       |
| `name/type/brand/model`                                   | Datos del equipo.                                                                    |
| `serialNumber`                                            | Número de serie (único por fabricante).                                              |
| `nfcTagId`                                                | ID del tag NFC físico pegado al equipo (único).                                      |
| `nfcCode`                                                 | Código alternativo del tag.                                                          |
| `clientName/clientId/clientAddress/clientPhone/clientRut` | Datos del cliente donde está instalado el equipo.                                    |
| `status`                                                  | Estado: `OPERATIVE`, `MAINTENANCE`, `OUT_OF_SERVICE`, `PENDING_INSTALL`, `INACTIVE`. |
| `latitude/longitude`                                      | Coordenadas GPS del equipo para validación.                                          |
| `isActive`                                                | Si el equipo está habilitado.                                                        |

---

#### `field/nfc-tags/`

**NFC Tags** = los stickers NFC físicos que se pegan a las máquinas.

##### `entities/nfc-tag.entity.ts`

Tabla `nfc_tags`.

| Campo       | Descripción                                                    |
| ----------- | -------------------------------------------------------------- |
| `tenantId`  | FK al tenant.                                                  |
| `tagId`     | ID único del chip NFC (UUID o formato hexadecimal).            |
| `alias`     | Nombre amigable opcional (ej: "Tag cámara #3").                |
| `machineId` | FK a la máquina a la que está vinculado.                       |
| `isActive`  | Si el tag puede ser usado. Un tag inactivo bloquea el escaneo. |

---

#### `field/sectors/`

**Sectores** = divisiones geográficas o de negocio dentro de un tenant (ej: "Zona Norte", "Sucursal Centro").

##### `sectors.service.ts`

CRUD básico filtrado por `tenantId`.

##### `entities/sector.entity.ts`

Tabla `sectors`.

| Campo         | Descripción                   |
| ------------- | ----------------------------- |
| `tenantId`    | FK al tenant.                 |
| `name`        | Nombre del sector.            |
| `description` | Descripción opcional.         |
| `isActive`    | Si el sector está habilitado. |

---

### `src/modules/work/`

> **Rol:** Todo lo relacionado con las operaciones de trabajo en terreno.

#### `work/visits/`

**Visitas** = registros de cada vez que un técnico llega a un equipo y lo revisa.

##### `visits.service.ts`

- `findAll(tenantId)` — lista todas las visitas del tenant (para el dashboard admin).
- `findByTechnician(technicianId, tenantId)` — lista solo las visitas de un técnico específico.
- `create(dto, technicianId, tenantId)` — crea la visita. `technicianId` viene del JWT, nunca del body (seguridad).
- `update()` — los técnicos solo pueden editar sus propias visitas. Los admins pueden editar cualquiera.
- `checkIn(dto, userId, tenantId)` — abre una visita: registra llegada, GPS y tag NFC escaneado. Lanza error si ya hay una visita abierta para esa máquina.
- `checkOut(visitId, dto, userId, tenantId)` — cierra la visita: verifica que el tag NFC del check-out coincida con el del check-in (anti-fraude). Cambia estado a `completed`.

##### `entities/visit.entity.ts`

Tabla `visits`.

| Campo                | Descripción                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `tenantId`           | FK al tenant.                                                                             |
| `technicianId`       | FK al técnico que hizo la visita.                                                         |
| `machineId`          | FK al equipo visitado.                                                                    |
| `latitude/longitude` | GPS del técnico al momento del escaneo.                                                   |
| `nfcTagId`           | ID del tag NFC escaneado (evidencia física).                                              |
| `temperature`        | Temperatura registrada del equipo.                                                        |
| `notes`              | Notas del técnico.                                                                        |
| `status`             | `pending` (abierta), `completed`, `flagged`.                                              |
| `type`               | `MAINTENANCE`, `SALE`, `INSPECTION`, `DELIVERY`.                                          |
| `visitedAt`          | Timestamp de cuándo ocurrió la visita (puede ser distinto de `createdAt` si fue offline). |

---

#### `work/tickets/`

**Tickets** = reportes de problemas o solicitudes de trabajo.

##### `tickets.service.ts`

CRUD de tickets con filtrado por tenant.

- Al crear, `createdById` viene del JWT.
- Permite asignar un técnico responsable (`assignedToId`).
- Estados: `open` → `in_progress` → `resolved` → `closed`.

##### `entities/ticket.entity.ts`

Tabla `tickets`.

| Campo               | Descripción                                  |
| ------------------- | -------------------------------------------- |
| `tenantId`          | FK al tenant.                                |
| `machineId`         | FK opcional al equipo con problemas.         |
| `createdById`       | FK al usuario que creó el ticket.            |
| `assignedToId`      | FK al técnico asignado para resolver.        |
| `title/description` | Descripción del problema.                    |
| `priority`          | `low`, `medium`, `high`, `urgent`.           |
| `status`            | `open`, `in_progress`, `resolved`, `closed`. |

---

#### `work/work-orders/`

**Órdenes de trabajo** = instrucciones formales de trabajo asignadas a técnicos.

##### `work-orders.service.ts`

CRUD de órdenes de trabajo.

- `dueDate` — fecha límite para completar la orden.
- `completedAt` — se registra automáticamente al cambiar el estado a `completed`.

##### `entities/work-order.entity.ts`

Tabla `work_orders`.

| Campo                 | Descripción                                         |
| --------------------- | --------------------------------------------------- |
| `tenantId`            | FK al tenant.                                       |
| `createdById`         | FK al usuario que creó la orden.                    |
| `assignedToId`        | FK al técnico asignado.                             |
| `machineId`           | FK opcional al equipo.                              |
| `title/description`   | Descripción de la tarea.                            |
| `status`              | `pending`, `in_progress`, `completed`, `cancelled`. |
| `priority`            | `low`, `medium`, `high`, `urgent`.                  |
| `dueDate/completedAt` | Fechas de control.                                  |

---

### `src/modules/commerce/`

> **Rol:** Módulos de datos comerciales y métricas de negocio.

#### `commerce/sales/`

**Ventas** = registros de ventas realizadas por vendedores.

##### `entities/sale.entity.ts`

Tabla `sales`.

| Campo         | Descripción                          |
| ------------- | ------------------------------------ |
| `tenantId`    | FK al tenant.                        |
| `vendorId`    | FK al usuario que hizo la venta.     |
| `sectorId`    | FK al sector donde ocurrió la venta. |
| `machineId`   | FK opcional al equipo involucrado.   |
| `amount`      | Monto de la venta.                   |
| `description` | Descripción opcional.                |
| `saleDate`    | Fecha de la venta.                   |

---

#### `commerce/inventory/`

**Inventario** = stock de repuestos y materiales del tenant.

##### `entities/inventory.entity.ts`

Tabla `inventory`.

| Campo                  | Descripción                                           |
| ---------------------- | ----------------------------------------------------- |
| `tenantId`             | FK al tenant.                                         |
| `partName/partNumber`  | Nombre y número del repuesto.                         |
| `quantity/minQuantity` | Cantidad actual y mínima antes de alertar.            |
| `unitCost`             | Costo unitario.                                       |
| `status`               | Enum: `disponible`, `en_uso`, `agotado`, `en_pedido`. |
| `location`             | Ubicación física del repuesto.                        |

---

#### `commerce/mermas/`

**Mermas** = pérdidas o desperdicios de producto registrados por técnicos o vendedores.

##### `entities/merma.entity.ts`

Tabla `mermas`.

| Campo                                     | Descripción                         |
| ----------------------------------------- | ----------------------------------- |
| `tenantId`                                | FK al tenant.                       |
| `reportedById`                            | FK al usuario que reportó la merma. |
| `ticketId`                                | FK opcional al ticket relacionado.  |
| `machineId`                               | FK opcional al equipo involucrado.  |
| `productName/quantity/unitCost/totalCost` | Datos del producto perdido.         |
| `cause`                                   | Causa de la merma (texto libre).    |
| `mermaDate`                               | Fecha en que ocurrió la merma.      |

---

#### `commerce/kpis/`

**KPIs** = indicadores de rendimiento configurados por el tenant.

##### `entities/kpi.entity.ts`

Tabla `kpis`.

| Campo                      | Descripción                                     |
| -------------------------- | ----------------------------------------------- |
| `tenantId`                 | FK al tenant.                                   |
| `userId`                   | FK opcional al usuario al que aplica el KPI.    |
| `sectorId`                 | FK opcional al sector al que aplica.            |
| `type`                     | Enum: `visitas`, `ventas`, `tickets`, `mermas`. |
| `name`                     | Nombre descriptivo del KPI.                     |
| `targetValue/currentValue` | Valor objetivo y valor actual.                  |
| `startDate/endDate`        | Período de medición.                            |

---

### `src/modules/shared/`

> **Rol:** Módulos transversales que son usados por otros módulos del sistema.

#### `shared/attachments/`

**Attachments** = archivos adjuntos (fotos de evidencia).

##### `attachments.service.ts`

Gestiona el registro de adjuntos en base de datos. El archivo real se almacena en Azure Blob Storage (manejo externo). El servicio solo guarda la URL resultante.

##### `entities/attachment.entity.ts`

Tabla `attachments`.

| Campo                        | Descripción                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| `tenantId`                   | FK al tenant.                                                        |
| `uploadedById`               | FK al usuario que subió el archivo.                                  |
| `entityType`                 | Tipo del registro al que pertenece: `visit`, `ticket`, `work_order`. |
| `entityId`                   | UUID del registro específico.                                        |
| `url`                        | URL pública del archivo en Azure Blob.                               |
| `fileName/mimeType/fileSize` | Metadatos del archivo.                                               |

---

#### `shared/sync-queue/`

**Sync Queue** = cola de sincronización para la app móvil offline.

Cuando el técnico trabaja sin internet, la app guarda las acciones localmente. Al recuperar conexión, las envía al backend que las procesa en cola.

##### `entities/sync-queue.entity.ts`

Tabla `sync_queue`.

| Campo          | Descripción                                             |
| -------------- | ------------------------------------------------------- |
| `tenantId`     | FK al tenant.                                           |
| `userId`       | FK opcional al usuario que generó la acción.            |
| `entityType`   | Tipo de entidad afectada: `visit`, `ticket`, etc.       |
| `entityId`     | UUID de la entidad afectada.                            |
| `operation`    | Operación a realizar: `CREATE`, `UPDATE`, `DELETE`.     |
| `payload`      | Datos de la operación en formato JSONB.                 |
| `status`       | Estado: `pending`, `processing`, `completed`, `failed`. |
| `retryCount`   | Cantidad de reintentos realizados.                      |
| `errorMessage` | Mensaje del último error si falló.                      |
| `processedAt`  | Timestamp de cuando fue procesada.                      |

---

## Guía rápida para nuevos desarrolladores

### ¿Dónde agrego un nuevo endpoint?

1. Identificar el contexto (`field`, `work`, `commerce`, `identity`, `shared`)
2. Ir al módulo correspondiente en `src/modules/<contexto>/<módulo>/`
3. Agregar el método en el `.service.ts` (lógica) y en el `.controller.ts` (HTTP)
4. Si necesitas un nuevo campo en la BD: crear una migración en `src/migrations/`

### ¿Cómo funciona el multi-tenant?

Cada endpoint protegido extrae el `tenantId` del JWT con `@CurrentTenant()`. Ese `tenantId` se pasa a todos los métodos del servicio que siempre incluyen `WHERE tenant_id = $tenantId` en sus queries. **Nunca omitas el `tenantId` en una query de un servicio.**

### ¿Cómo protejo un endpoint?

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@RequireRoles('ADMIN')
@ApiBearerAuth()
miEndpoint(@CurrentTenant() tenantId: string) { ... }
```

### ¿Cómo corro el proyecto?

```bash
cp .env.example .env   # Configurar variables
npm install
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Compilar
npm run start:prod     # Producción
```

### ¿Dónde está el Swagger?

Una vez corriendo: `http://localhost:3000/api`

---

## Sistema de Decoradores

> Esta sección explica **qué son**, **dónde viven** en el código y **cómo están programados** todos los decoradores del proyecto.

---

### ¿Qué es un decorador?

Un decorador es una función especial de TypeScript que se coloca con `@` antes de una clase, método, propiedad o parámetro. **No ejecuta lógica en ese momento**, sino que le agrega metadatos o comportamiento extra **en tiempo de compilación**.

NestJS y TypeORM son frameworks 100% basados en decoradores. Sin ellos, el framework no sabría:

- Qué clases son controladores (`@Controller`)
- Qué métodos manejan qué rutas HTTP (`@Get`, `@Post`)
- Qué propiedades son columnas de base de datos (`@Column`)
- Qué campos del DTO son obligatorios (`@IsString`)

> **Prerequisito fundamental:** `reflect-metadata` debe estar importado al inicio del programa.  
> En este proyecto está en la primera línea de `src/main.ts`:  
> `import 'reflect-metadata';`  
> Sin esto, **ningún decorador funcionaría**.

---

### Categorías de decoradores

El proyecto usa **5 grupos de decoradores**, cada uno de una librería diferente:

| Categoría                   | Paquete npm                      | Propósito                                     |
| --------------------------- | -------------------------------- | --------------------------------------------- |
| **Personalizados (Custom)** | ninguno (código propio)          | Extraer usuario/tenant del request            |
| **NestJS**                  | `@nestjs/common`, `@nestjs/core` | Definir módulos, controladores, rutas, guards |
| **TypeORM**                 | `typeorm`                        | Mapear clases TypeScript → tablas PostgreSQL  |
| **class-validator**         | `class-validator`                | Validar campos de los DTOs automáticamente    |
| **Swagger**                 | `@nestjs/swagger`                | Generar documentación automática en `/api`    |

---

### Decoradores personalizados (Custom)

Estos son los únicos decoradores **escritos por el equipo**. Viven en:

```
src/modules/auth/decorators/
├── current-user.decorator.ts     ← @CurrentUser()
├── current-tenant.decorator.ts   ← @CurrentTenant()
├── roles.decorator.ts            ← @Roles(...)
└── require-roles.decorator.ts    ← @RequireRoles(...)
```

#### `@CurrentUser()` — Decorador de parámetro

**Archivo:** `src/modules/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // ← lo puso JwtStrategy en validate()
  },
);
```

**¿Cómo funciona?**

1. `JwtStrategy.validate()` devuelve `{ id, email, role[], tenantId }` → NestJS lo guarda en `req.user`.
2. `@CurrentUser()` llama a `ctx.switchToHttp().getRequest()` y devuelve `req.user`.
3. NestJS inyecta ese valor directamente como parámetro del método del controller.

**Uso en controllers:**

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: any) {
  return user; // { id, email, role[], tenantId }
}
```

---

#### `@CurrentTenant()` — Decorador de parámetro

**Archivo:** `src/modules/auth/decorators/current-tenant.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId; // ← lo puso TenantGuard
  },
);
```

**⚠️ PROBLEMA DETECTADO — Bug potencial:**

Este decorador lee `request.tenantId` (que asigna `TenantGuard` en la línea `request.tenantId = user.tenantId`).  
**Pero si el endpoint no tiene `TenantGuard` en su `@UseGuards()`**, `request.tenantId` será `undefined`.

Ejemplo del problema en `work-orders.controller.ts`:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // ← NO tiene TenantGuard
findAll(@Req() req, @Query('status') status?: string) {
  return this.workOrdersService.findAll(req.user.tenantId, status);
  // usa req.user.tenantId directamente, correcto en este caso
}
```

Si alguien usara `@CurrentTenant()` aquí en vez de `req.user.tenantId`, obtendría `undefined`.

**Acción sugerida:** Agregar `TenantGuard` a todos los controllers que manejan datos de tenant, o reescribir `@CurrentTenant()` para que lea directamente de `request.user.tenantId` (más robusto):

```typescript
// Versión más robusta:
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId ?? request.user?.tenantId; // fallback seguro
  },
);
```

---

#### `@Roles()` vs `@RequireRoles()` — Decoradores de método (DUPLICADOS)

**Archivos:**

- `src/modules/auth/decorators/roles.decorator.ts`
- `src/modules/auth/decorators/require-roles.decorator.ts`

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// require-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const RequireRoles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Son exactamente lo mismo.** Ambos llaman a `SetMetadata('roles', roles)` con la misma clave `'roles'`.

**¿Por qué hay dos?**  
Se crearon en distintos momentos del proyecto sin verificar que ya existía el otro.

**¿Cómo funciona `SetMetadata`?**

`SetMetadata('roles', ['ADMIN', 'TECHNICIAN'])` guarda los roles en el **metadata del endpoint** (no en el request). Luego `RolesGuard` los lee con el `Reflector` de NestJS:

```typescript
// En RolesGuard.canActivate():
const requiredRoles = this.reflector.get<string[]>(
  'roles',
  context.getHandler(),
);
```

Ciclo completo:

```
@Roles('ADMIN')          → SetMetadata('roles', ['ADMIN'])
   ↓ (guarda en metadata del método)
RolesGuard.canActivate() → this.reflector.get('roles', handler)
   ↓ (lee el metadata)
Compara con req.user.role[]
   ↓
Permite o bloquea el request
```

**Acción sugerida:** Eliminar `require-roles.decorator.ts` y usar solo `@Roles()` en todo el proyecto. Hacer búsqueda global de `@RequireRoles` y reemplazar por `@Roles`.

---

### Decoradores de NestJS

Vienen del paquete `@nestjs/common`. Son los que hacen que NestJS "entienda" la estructura del proyecto.

#### Decoradores de clase (van sobre la clase entera)

| Decorador             | Archivo típico               | Qué hace                                                                  |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `@Module({...})`      | `*.module.ts`                | Define un módulo NestJS con sus imports, providers, controllers y exports |
| `@Controller('ruta')` | `*.controller.ts`            | Registra la clase como controlador HTTP con prefijo de ruta               |
| `@Injectable()`       | `*.service.ts`, `*.guard.ts` | Permite que NestJS inyecte esta clase como dependencia                    |

**Ejemplo real — `AuthModule`:**

```typescript
// src/modules/auth/auth.module.ts
@Module({
  imports: [TenantsModule, PassportModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

#### Decoradores de método (van sobre los métodos del controller)

| Decorador                    | Qué hace                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| `@Get('ruta')`               | Mapea el método a `GET /prefijo/ruta`                          |
| `@Post('ruta')`              | Mapea a `POST /prefijo/ruta`                                   |
| `@Patch(':id')`              | Mapea a `PATCH /prefijo/:id`                                   |
| `@Delete(':id')`             | Mapea a `DELETE /prefijo/:id`                                  |
| `@UseGuards(GuardA, GuardB)` | Ejecuta los guards en orden antes del método                   |
| `@HttpCode(200)`             | Cambia el código HTTP de respuesta (por defecto `201` en POST) |

**Ejemplo real — `AuthController`:**

```typescript
// src/modules/auth/auth.controller.ts
@Post('register')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)  // orden importa
@RequireRoles('ADMIN')
@HttpCode(HttpStatus.CREATED)
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

**⚠️ El orden de `@UseGuards` importa:**  
`JwtAuthGuard` → `RolesGuard` → `TenantGuard`  
Si `RolesGuard` va antes que `JwtAuthGuard`, el `req.user` todavía no existe y `RolesGuard` fallará.

#### Decoradores de parámetro (van dentro de los argumentos del método)

| Decorador          | Qué inyecta                             |
| ------------------ | --------------------------------------- |
| `@Body()`          | El cuerpo completo del request JSON     |
| `@Param('id')`     | Un parámetro de ruta (`:id`)            |
| `@Query('status')` | Un query param (`?status=pending`)      |
| `@Req()`           | El objeto `Request` de Express completo |
| `@CurrentUser()`   | Solo `req.user` (decorador custom)      |
| `@CurrentTenant()` | Solo `req.tenantId` (decorador custom)  |

**Ejemplo real — `WorkOrdersController`:**

```typescript
// src/modules/work-orders/work-orders.controller.ts
@Get()
@Roles('ADMIN', 'DRIVER', 'TECHNICIAN', 'VENDOR', 'RETAILER')
findAll(@Req() req, @Query('status') status?: string) {
  return this.workOrdersService.findAll(req.user.tenantId, status);
}
```

---

### Decoradores de TypeORM

Permiten mapear clases TypeScript directamente a tablas y columnas de PostgreSQL.

#### Decoradores de clase (entidad)

| Decorador                 | Qué hace                                  |
| ------------------------- | ----------------------------------------- |
| `@Entity('nombre_tabla')` | Vincula la clase a la tabla en PostgreSQL |

#### Decoradores de propiedad (columnas)

| Decorador                                      | Qué genera en PostgreSQL                            |
| ---------------------------------------------- | --------------------------------------------------- |
| `@PrimaryGeneratedColumn('uuid')`              | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`     |
| `@Column({ name: 'tenant_id', type: 'uuid' })` | `tenant_id UUID NOT NULL`                           |
| `@Column({ nullable: true })`                  | Columna que acepta `NULL`                           |
| `@Column({ default: 'pending' })`              | Columna con valor por defecto                       |
| `@Column({ length: 255 })`                     | `VARCHAR(255)`                                      |
| `@Column({ type: 'text' })`                    | `TEXT`                                              |
| `@Column({ type: 'timestamp' })`               | `TIMESTAMP`                                         |
| `@CreateDateColumn({ name: 'created_at' })`    | Se llena automáticamente al crear el registro       |
| `@UpdateDateColumn({ name: 'updated_at' })`    | Se actualiza automáticamente en cada `save()`       |
| `@DeleteDateColumn({ name: 'deleted_at' })`    | **Soft delete**: en vez de borrar, llena este campo |

#### Decoradores de relación

| Decorador                                 | Relación en BD                         |
| ----------------------------------------- | -------------------------------------- |
| `@ManyToOne(() => Tenant)`                | FK: muchos registros → un tenant       |
| `@OneToMany(() => Visit, v => v.machine)` | Un registro → muchas visitas           |
| `@JoinColumn({ name: 'tenant_id' })`      | Especifica qué columna es la FK física |

**Ejemplo real — `WorkOrder` entity:**

```typescript
// src/modules/work-orders/entities/work-order.entity.ts
@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant; // ← relación cargable con relations:[]

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date; // ← soft delete activo
}
```

**¿Por qué `@Column` Y `@ManyToOne` para lo mismo?**

Se usan los dos juntos para tener:

- `tenantId: string` → el UUID crudo (útil en queries simples)
- `tenant: Tenant` → el objeto completo (útil cuando se hace `relations: ['tenant']`)

Si solo tienes `@ManyToOne`, no tienes acceso directo al UUID sin cargar el objeto completo.

---

### Decoradores de class-validator

Se usan en los **DTOs** (Data Transfer Objects). Trabajan junto con el `ValidationPipe` global (configurado en `main.ts`) para rechazar automáticamente requests con datos inválidos.

**¿Cómo lo activa el ValidationPipe?**

```typescript
// src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // elimina campos no declarados en el DTO
    forbidNonWhitelisted: true, // si vienen campos extra, devuelve 400
    transform: true, // convierte strings a números automáticamente
  }),
);
```

Con `whitelist: true`, si el cliente envía `{ "title": "test", "hackField": "evil" }` y en el DTO solo existe `title`, el `hackField` se elimina silenciosamente antes de llegar al servicio.

#### Decoradores más usados en el proyecto

| Decorador              | Valida                               | Error si falla       |
| ---------------------- | ------------------------------------ | -------------------- |
| `@IsString()`          | Que el valor sea string              | `400 Bad Request`    |
| `@IsOptional()`        | Permite que el campo sea `undefined` | No da error si falta |
| `@IsUUID()`            | Que sea un UUID válido (v1-v5)       | `400 Bad Request`    |
| `@IsEmail()`           | Que sea un email válido              | `400 Bad Request`    |
| `@IsEnum(Enum)`        | Que el valor esté en el enum         | `400 Bad Request`    |
| `@IsIn(['a','b','c'])` | Que el valor esté en la lista        | `400 Bad Request`    |
| `@IsDateString()`      | Que sea un string ISO 8601           | `400 Bad Request`    |
| `@IsNumber()`          | Que sea número                       | `400 Bad Request`    |
| `@Min(n)` / `@Max(n)`  | Rango numérico                       | `400 Bad Request`    |
| `@IsBoolean()`         | Que sea `true` o `false`             | `400 Bad Request`    |

**Ejemplo real — `CreateWorkOrderDto`:**

```typescript
// src/modules/work-orders/dto/work-order.dto.ts
export class CreateWorkOrderDto {
  @IsString() // OBLIGATORIO: debe ser string
  title: string;

  @IsOptional() // OPCIONAL: puede no venir
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID() // Si viene, debe ser UUID válido
  assignedToId?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical']) // Solo estos valores
  priority?: string;

  @IsOptional()
  @IsDateString() // Formato ISO: "2026-04-15T10:00:00Z"
  dueDate?: string;
}

// PartialType hace todos los campos opcionales automáticamente:
export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'rejected', 'cancelled'])
  status?: string;
}
```

**⚠️ PROBLEMA DETECTADO — `@IsIn` vs `@IsEnum`:**

El proyecto usa `@IsIn(['low', 'medium', ...])` con arrays de strings hardcodeados en vez de usar `@IsEnum` con un enum TypeScript. Esto significa que si cambias los valores válidos, tienes que buscarlo en todos los DTOs.

**Acción sugerida:** Crear enums en `src/shared/constants/index.ts` y referenciarlos:

```typescript
// src/shared/constants/index.ts
export enum WorkOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// En el DTO:
@IsEnum(WorkOrderPriority)
priority?: WorkOrderPriority;
```

---

### Decoradores de Swagger

Generan automáticamente la documentación visible en `http://localhost:3000/api`.

| Decorador                                           | Dónde va         | Qué genera en Swagger                           |
| --------------------------------------------------- | ---------------- | ----------------------------------------------- |
| `@ApiTags('Nombre')`                                | Clase controller | Agrupa los endpoints bajo una categoría         |
| `@ApiOperation({ summary: '...' })`                 | Método           | Descripción del endpoint                        |
| `@ApiResponse({ status: 200, description: '...' })` | Método           | Documenta posibles respuestas                   |
| `@ApiBearerAuth()`                                  | Método           | Muestra el candado 🔒 en Swagger (requiere JWT) |
| `@ApiProperty()`                                    | Propiedad de DTO | Documenta el campo del body                     |

**Observación:** Los decoradores de Swagger en este proyecto son **parciales**. Algunos controllers como `WorkOrdersController` solo tienen `@ApiTags` pero no documentan sus respuestas con `@ApiResponse`. Esto no rompe nada —la API funciona igual— pero la documentación queda incompleta.

---

### Cómo se conectan entre sí

Este es el ciclo completo de un request protegido, mostrando qué decorador actúa en cada paso:

```
cliente envía: POST /api/v1/auth/register
  │
  ▼
[1] @Controller('auth')          ← NestJS sabe que es este controller
[2] @Post('register')            ← NestJS sabe que es este método
[3] @UseGuards(JwtAuthGuard,     ← Se ejecutan en orden:
               RolesGuard,
               TenantGuard)
    │
    ├─ JwtAuthGuard              ← extiende AuthGuard('jwt') de Passport
    │   └─ JwtStrategy.validate()  lee el token del header Authorization
    │       └─ popula req.user = { id, email, role[], tenantId }
    │
    ├─ RolesGuard                ← implements CanActivate
    │   └─ this.reflector.get('roles', handler)
    │       └─ lee el metadata de @RequireRoles('ADMIN')
    │       └─ verifica que req.user.role.includes('ADMIN')
    │
    └─ TenantGuard               ← implements CanActivate
        └─ verifica req.user.tenantId existe
        └─ asigna req.tenantId = req.user.tenantId
[4] @RequireRoles('ADMIN')       ← SetMetadata('roles', ['ADMIN'])
    (leído por RolesGuard arriba)
[5] @Body() dto: RegisterDto     ← ValidationPipe valida los decoradores
    │                               @IsString(), @IsEmail(), etc.
    │                               si falla → 400 Bad Request automático
    └─ método ejecuta → authService.register(dto)
```

---

### Diagnóstico: ¿está bien o mal?

#### ✅ Lo que está bien

| Aspecto                                   | Calificación | Detalle                                                                         |
| ----------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| Estructura de guards                      | ✅ Correcto  | `JwtAuthGuard → RolesGuard → TenantGuard` en el orden correcto                  |
| `@CurrentUser()`                          | ✅ Correcto  | Lee de `req.user` que garantiza `JwtStrategy`, nunca falla si el guard pasó     |
| Soft delete con `@DeleteDateColumn`       | ✅ Correcto  | Todos los entities principales lo tienen                                        |
| `ValidationPipe` global                   | ✅ Correcto  | `whitelist: true` + `forbidNonWhitelisted: true` es la configuración más segura |
| `@Module` con ports y tokens              | ✅ Correcto  | El patrón de inyección de dependencias con Symbols es limpio y testeable        |
| `@IsOptional` siempre antes del validador | ✅ Correcto  | El orden importa: `@IsOptional()` debe ir ANTES de `@IsString()`, etc.          |

#### ⚠️ Problemas encontrados

| Problema                                      | Severidad | Ubicación                                                                 | Solución                                                              |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `@Roles` y `@RequireRoles` son idénticos      | 🟡 Media  | `decorators/roles.decorator.ts` y `decorators/require-roles.decorator.ts` | Eliminar `require-roles.decorator.ts`, usar solo `@Roles()`           |
| `@CurrentTenant()` lee `request.tenantId`     | 🟡 Media  | `decorators/current-tenant.decorator.ts`                                  | Depende de `TenantGuard`. Agregar fallback a `request.user?.tenantId` |
| `work-orders.controller.ts` sin `TenantGuard` | 🔴 Alta   | `work-orders.controller.ts` línea 22                                      | Agregar `TenantGuard` al `@UseGuards()` del controller                |
| `@IsIn([...])` con strings hardcodeados       | 🟡 Media  | Todos los DTOs con `priority` y `status`                                  | Reemplazar por `@IsEnum(MiEnum)` con enums en `shared/constants/`     |
| Controllers sin `@ApiResponse`                | 🟢 Baja   | `work-orders`, `tickets`, `visits`, etc.                                  | Agregar `@ApiResponse` para documentación completa                    |
| `@Req() req` en vez de `@CurrentUser()`       | 🟢 Baja   | `work-orders.controller.ts`, `tickets.controller.ts`                      | Cambiar a `@CurrentUser()` y `@CurrentTenant()` para consistencia     |

#### Prioridad de acciones recomendadas

```
PRIORIDAD 1 (rompe seguridad):
  → Agregar TenantGuard a work-orders.controller.ts

PRIORIDAD 2 (mejora mantenibilidad):
  → Eliminar require-roles.decorator.ts
  → Agregar fallback a @CurrentTenant()

PRIORIDAD 3 (mejora calidad):
  → Crear enums para status/priority y usar @IsEnum()
  → Reemplazar @Req() req por @CurrentUser() / @CurrentTenant()

PRIORIDAD 4 (documentación):
  → Completar @ApiResponse en todos los controllers
```
