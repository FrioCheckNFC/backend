# FrioCheck - Clean Map (simple y humano)

Este repo hoy funciona con Nest por modulos de feature (`auth`, `tenants`), que es valido para empezar.
No es Clean Architecture estricta porque la logica de negocio depende de Nest/TypeORM/JWT.

## Donde van las APIs

Las APIs HTTP van en la capa externa:

- `controllers` (rutas)
- `dto` (entrada/salida HTTP)
- `guards` y `decorators` de seguridad web
- `swagger` y bootstrap de app

En este repo, eso ya esta en:

- `src/main.ts`
- `src/modules/*/*.controller.ts`
- `src/modules/auth/guards/*`
- `src/modules/auth/decorators/*`

## Clean Architecture aterrizada a este proyecto

### 1) Domain (centro)
Solo reglas de negocio, sin Nest y sin TypeORM.

Ejemplos sugeridos:

- `src/domain/users/user.ts`
- `src/domain/tenants/tenant.ts`

### 2) Application (casos de uso)
Coordina acciones y define puertos (interfaces).

Ejemplos sugeridos:

- `src/application/auth/login.use-case.ts`
- `src/application/auth/register.use-case.ts`
- `src/application/tenants/create-tenant.use-case.ts`
- `src/application/ports/user-repository.port.ts`
- `src/application/ports/tenant-repository.port.ts`
- `src/application/ports/password-hasher.port.ts`
- `src/application/ports/token-signer.port.ts`

### 3) Infrastructure (adaptadores)
Implementa los puertos con tecnologia real.

Ejemplos sugeridos:

- `src/infrastructure/persistence/typeorm/user.repository.ts`
- `src/infrastructure/persistence/typeorm/tenant.repository.ts`
- `src/infrastructure/security/bcrypt-password-hasher.ts`
- `src/infrastructure/security/jwt-token-signer.ts`

### 4) Interface (API REST)
Controladores Nest que convierten DTO <-> caso de uso.

Ejemplos sugeridos:

- `src/interfaces/http/auth.controller.ts`
- `src/interfaces/http/tenants.controller.ts`

## Regla simple

Dependencias siempre hacia adentro:

- `interfaces` -> `application` -> `domain`
- `infrastructure` implementa puertos definidos por `application`
- `domain` no importa Nest, TypeORM, JWT, ni bcrypt

## Plan de migracion sin romper tu API

1. Mantener endpoints actuales y rutas actuales.
2. Extraer primero `AuthService.login` a `LoginUseCase`.
3. Crear puertos para usuario, password y token.
4. Implementar esos puertos con TypeORM/bcrypt/JWT.
5. Repetir en `tenants`.

Con este plan, mejoras testabilidad y limpieza sin reescribir todo de golpe.
