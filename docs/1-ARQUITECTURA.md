# 1. Arquitectura del Sistema - FrioCheck Backend

FrioCheck utiliza una **Arquitectura Limpia (Clean Architecture)** basada en los principios de **Domain-Driven Design (DDD)**. Esta estructura garantiza que la lógica de negocio esté completamente aislada de las herramientas tecnológicas (Base de Datos, Frameworks, APIs Externas).

## Capas de la Arquitectura

Cada módulo del sistema (ej: `Machines`, `Users`, `Tenants`) está dividido en tres capas principales:

### 1. Dominio (`domain/`)
Es el corazón del sistema. Contiene las reglas de negocio más puras.
- **Entidades (`models/`):** Clases TypeScript puras que representan los objetos de negocio (ej: `MachineModel`, `UserModel`). No tienen decoradores de TypeORM.
- **Puertos (`repositories/`):** Interfaces que definen qué acciones se pueden realizar con los datos (ej: `UserRepositoryPort`). Definen el "qué" pero no el "cómo".

### 2. Aplicación (`application/`)
Orquesta el flujo de datos hacia y desde las entidades de dominio.
- **Casos de Uso (`use-cases/`):** Clases que implementan una acción específica del sistema (ej: `RegisterMachineUseCase`, `LoginUseCase`). Solo dependen de los Puertos (interfaces) del dominio.

### 3. Infraestructura (`infrastructure/`)
Contiene las implementaciones técnicas y herramientas externas.
- **Base de Datos (`database/`):** 
    - **Entidades de TypeORM:** Esquemas que mapean las tablas de la base de datos.
    - **Adaptadores:** Implementaciones reales de los Puertos del dominio (ej: `TypeormUserRepositoryAdapter`).
    - **Mappers:** Clases encargadas de transformar Entidades de Base de Datos en Modelos de Dominio y viceversa.
- **HTTP (`http/`):**
    - **Controladores:** Reciben las peticiones REST y delegan la ejecución a los Casos de Uso.
    - **DTOs:** Objetos de transferencia de datos con validaciones integradas.
    - **Guards/Decoradores:** Lógica de seguridad y autorización.

## Flujo de Dependencias

La regla de oro es: **Las dependencias siempre apuntan hacia adentro.**
`Infraestructura` -> `Aplicación` -> `Dominio`

Esto significa que el Dominio no conoce nada de la base de datos o de NestJS. Si decidimos cambiar la base de datos de PostgreSQL a MongoDB, solo tendríamos que crear un nuevo Adaptador en la capa de Infraestructura sin tocar una sola línea de la lógica de negocio.

## Estado de la Migración

Actualmente, los siguientes módulos han sido completamente refactorizados a esta arquitectura:
- [x] **MachinesModule**: Gestión de máquinas de frío y tags NFC.
- [x] **AuthModule**: Seguridad, JWT y autenticación.
- [x] **UsersModule**: Gestión de usuarios y roles.
- [x] **TenantsModule**: Soporte Multi-Tenant (Empresas).
