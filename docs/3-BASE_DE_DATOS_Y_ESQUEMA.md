# 3. Base de Datos y Esquema - FrioCheck Backend

FrioCheck utiliza una arquitectura de base de datos relacional basada en **PostgreSQL**, optimizada para un entorno **SaaS Multi-Tenant**.

## Modelo Multi-Tenant

El sistema utiliza un esquema de **Aislamiento de Datos por Columna (`tenant_id`)**. 
- Todas las empresas (Clientes) comparten la misma base de datos física.
- Casi todas las tablas (Users, Machines, Tickets, etc.) incluyen una columna `tenant_id`.
- Los **Guards de NestJS** aseguran que un usuario solo pueda acceder a los registros que coincidan con su `tenant_id`.

## Entidades Principales

### 1. Tenants (Empresas)
Representa a los clientes de FrioCheck.
- `id`: UUID.
- `name`: Nombre comercial.
- `slug`: Identificador único para URLs.
- `isActive`: Estado de la suscripción.

### 2. Users (Usuarios)
Personas que acceden al sistema.
- `id`: UUID.
- `tenantId`: Referencia a la empresa.
- `email`: Credencial de acceso.
- `role`: Arreglo de roles (RBAC).
- `passwordHash`: Almacenado con Bcrypt.

### 3. Machines (Maquinaria)
Equipos de frío monitoreados.
- `id`: UUID.
- `tenantId`: Empresa dueña.
- `name`: Identificador del equipo.
- `serialNumber`: Número de serie único.
- `nfcTag`: ID del tag físico asociado.

## Estrategia de Borrado (Soft Delete)

Para prevenir la pérdida accidental de datos, el sistema implementa **Soft Delete**.
- Los registros no se eliminan físicamente de la base de datos.
- Se utiliza la columna `deleted_at`.
- Si `deleted_at` tiene valor, el registro se considera "eliminado" y no aparecerá en las consultas estándar.

## Migraciones

El esquema se gestiona mediante **TypeORM Migrations**. Esto permite llevar un historial de cambios y replicar la estructura en cualquier entorno de forma segura.

```bash
# Ver migraciones pendientes
npm run migration:show

# Ejecutar migraciones
npm run migration:run
```
