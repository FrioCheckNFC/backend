# Arquitectura del Backend — FrioCheck

> Documento técnico para el equipo de desarrollo.  
> Explica cada carpeta, subcarpeta y archivo del proyecto.  
> **Actualizado:** Abril 2026

---

## Índice

1. [Resumen General](#resumen-general)
2. [Árbol de Carpetas](#árbol-de-carpetas)
3. [Duplicados detectados y su propósito](#duplicados-detectados-y-su-propósito)
4. [Oportunidades de mejora](#oportunidades-de-mejora)
5. [Descripción detallada por carpeta](#descripción-detallada-por-carpeta)
   - [src/ (raíz)](#src-raíz)
   - [src/auth/](#srcauth)
   - [src/application/](#srcapplication)
   - [src/shared/](#srcshared)
   - [src/database/](#srcdatabase)
   - [src/migrations/](#srcmigrations)
   - [src/modules/auth/](#srcmodulesauth)
   - [src/modules/identity/](#srcmodulesidentity)
   - [src/modules/field/](#srcmodulesfield)
   - [src/modules/work/](#srcmoduleswork)
   - [src/modules/commerce/](#srcmodulescommerce)
   - [src/modules/shared/](#srcmodulesshared)

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

## Árbol de Carpetas

```
src/
├── app.module.ts          ← Módulo raíz: orquesta toda la app
├── app.controller.ts      ← Endpoint de healthcheck (GET /)
├── app.service.ts         ← Servicio del healthcheck
├── main.ts                ← Punto de entrada: arranca el servidor
│
├── auth/                  ← RE-EXPORTA lo de modules/auth (barrel export)
├── application/           ← Lógica de negocio pura (casos de uso)
├── shared/                ← Constantes y utilidades globales
├── database/              ← Scripts SQL de migración manual
├── migrations/            ← Migraciones TypeORM (programáticas)
│
└── modules/               ← TODOS los módulos del negocio
    ├── auth/              ← Autenticación
    ├── identity/          ← Usuarios y Tenants
    │   ├── users/
    │   └── tenants/
    ├── field/             ← Activos físicos en terreno
    │   ├── machines/
    │   ├── nfc-tags/
    │   └── sectors/
    ├── work/              ← Operaciones de trabajo
    │   ├── visits/
    │   ├── tickets/
    │   └── work-orders/
    ├── commerce/          ← Datos comerciales
    │   ├── sales/
    │   ├── inventory/
    │   ├── mermas/
    │   └── kpis/
    └── shared/            ← Módulos transversales
        ├── attachments/
        └── sync-queue/
```

---

## Duplicados detectados y su propósito

Hay 3 carpetas fuera de `modules/` que **parecen** duplicados pero tienen un rol distinto:

| Carpeta            | ¿Es duplicado?      | Propósito real                                                                                                                                                                                                                                                             |
| ------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/auth/`        | **NO es duplicado** | Es un **barrel export** (`index.ts`). Re-exporta todo lo de `modules/auth/` para que otros archivos fuera de `modules/` no tengan que escribir rutas largas. También tiene `AuthCoreModule` y una copia liviana del `JwtStrategy` para importar sin cargar todo el módulo. |
| `src/shared/`      | **NO es duplicado** | Contiene **constantes globales** (`constants/index.ts`) y **funciones helper** (`utils/validation.ts`). Es distinto de `modules/shared/` que contiene los módulos NestJS de `attachments` y `sync-queue`.                                                                  |
| `src/application/` | **NO es duplicado** | Contiene los **casos de uso puros** (Clean Architecture). No depende de NestJS ni de HTTP. Solo lógica de negocio con interfaces (ports).                                                                                                                                  |

> **Regla fácil de recordar:**
>
> - `src/auth/` → re-exporta, no define
> - `src/shared/` → constantes y helpers de TypeScript puro
> - `src/application/` → lógica de negocio sin NestJS
> - `src/modules/` → todo lo que NestJS necesita para correr

---

## Oportunidades de mejora

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
