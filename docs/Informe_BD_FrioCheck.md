# Informe Técnico – Base de Datos FrioCheck

**Proyecto:** FrioCheck – Sistema de Trazabilidad y Gestión de Activos Refrigerados  
**Versión del documento:** 2.0  
**Fecha:** Abril 2026  
**Stack tecnológico:** NestJS v11 · TypeORM 0.3 · PostgreSQL 17 (Azure)  

---

## 1. Introducción

### 1.1 Propósito del Documento

El presente informe documenta de forma exhaustiva la estructura, relaciones y fundamentos de diseño de la base de datos del sistema FrioCheck. Está dirigido a ingenieros de software, administradores de base de datos y arquitectos que necesiten comprender, mantener o extender el modelo de datos.

### 1.2 Alcance del Sistema

FrioCheck es una plataforma digital orientada a la trazabilidad, control y gestión de activos refrigerados (cámaras de frío, refrigeradores comerciales, etc.) en entornos multi-tenant. El sistema cubre los siguientes procesos de negocio:

- **Gestión multi-empresa (multi-tenant):** aislamiento completo de datos por empresa cliente.
- **Control de activos refrigerados:** registro, ubicación y estado de cada equipo con identificación NFC.
- **Visitas técnicas:** check-in con validación GPS y escaneo NFC para garantizar presencia física.
- **Soporte y mantenimiento:** tickets de incidencias y órdenes de trabajo con asignación de técnicos.
- **Inventario de repuestos:** control de stock con alertas de mínimo.
- **Registro de mermas:** pérdidas de producto con valorización económica.
- **Ventas y KPIs:** seguimiento de ventas por sector y métricas de rendimiento.
- **Operación offline-first:** cola de sincronización para zonas sin conectividad.
- **Evidencia multimedia:** fotos y archivos almacenados en Azure Blob Storage.

### 1.3 Decisiones Arquitectónicas Clave

| Decisión | Detalle |
|---|---|
| **Motor de BD** | PostgreSQL 17, hospedado en Azure Database for PostgreSQL |
| **ORM** | TypeORM 0.3.28 con migraciones manuales (`synchronize: false`) |
| **Framework** | NestJS v11 (Node.js / TypeScript) |
| **Generación de IDs** | UUID v4 con `gen_random_uuid()` (nativo PostgreSQL 17, sin extensiones) |
| **Multi-tenancy** | Columna discriminadora `tenant_id` (UUID, FK) en cada tabla de negocio |
| **Borrado lógico** | Soft-delete vía columna `deleted_at` — nunca se eliminan filas físicamente |
| **Auditoría temporal** | Columnas automáticas `created_at`, `updated_at`, `deleted_at` en todas las tablas |
| **Conexión SSL** | Se activa automáticamente cuando el host contiene `azure.com` |
| **Migraciones** | Controladas por TypeORM CLI: `npm run migration:run` / `migration:revert` |
| **Rate Limiting** | ThrottlerModule con 3 niveles: 10 req/s, 60 req/min, 300 req/h |
| **Autenticación** | JWT + Passport con hash bcrypt para contraseñas |

---

## 2. Modelo Entidad-Relación (ER)

La base de datos contiene **16 tablas** organizadas en **6 grupos funcionales**. El siguiente diagrama muestra las relaciones entre entidades:

> *[Insertar aquí imagen del diagrama ER]*

### 2.1 Resumen de Tablas

| # | Tabla (PostgreSQL) | Entidad (TypeORM) | Grupo Funcional |
|---|---|---|---|
| 1 | `tenants` | TenantTypeOrmEntity | Multi-tenant y Usuarios |
| 2 | `users` | UserTypeOrmEntity | Multi-tenant y Usuarios |
| 3 | `password_resets` | PasswordReset | Seguridad |
| 4 | `machines` | MachineTypeOrmEntity | Activos y Operación |
| 5 | `nfc_tags` | NfcTag | Activos y Operación |
| 6 | `stores` | Store | Activos y Operación |
| 7 | `sectors` | Sector | Activos y Operación |
| 8 | `visits` | Visit | Operaciones y Visitas |
| 9 | `tickets` | Ticket | Soporte y Mantenimiento |
| 10 | `work_orders` | WorkOrder | Soporte y Mantenimiento |
| 11 | `mermas` | Merma | Soporte y Mantenimiento |
| 12 | `sync_queue` | SyncQueue | Sincronización Offline |
| 13 | `inventory` | InventoryItem | Inventario |
| 14 | `attachments` | Attachment | Evidencias Multimedia |
| 15 | `sales` | Sale | Ventas y KPIs |
| 16 | `kpis` | Kpi | Ventas y KPIs |

---

## 3. Descripción Detallada de Entidades

### 3.1 Gestión Multi-Tenant y Usuarios

Estas tablas implementan el aislamiento de datos por empresa y la gestión de identidad.

#### 3.1.1 Tenant (tabla: `tenants`)

Representa una empresa cliente que utiliza FrioCheck. Toda la información del sistema se filtra por tenant para garantizar el aislamiento multi-tenant.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del tenant |
| `name` | VARCHAR(255) | NOT NULL | Nombre comercial de la empresa |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE | Identificador URL-friendly (ej: `"superfrio"`) |
| `description` | TEXT | Nullable | Descripción opcional de la empresa |
| `logo_url` | VARCHAR | Nullable | URL del logotipo corporativo |
| `is_active` | BOOLEAN | Default: `true` | Si el tenant está habilitado en el sistema |
| `created_at` | TIMESTAMP | Auto | Fecha de creación del registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Fecha de borrado lógico (soft-delete) |

**Relaciones:** Un tenant posee múltiples registros en prácticamente todas las tablas del sistema (users, machines, stores, visits, tickets, etc.).

---

#### 3.1.2 User (tabla: `users`)

Representa a los usuarios del sistema. Cada usuario pertenece a un tenant y puede tener uno o más roles que determinan sus permisos.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del usuario |
| `tenant_id` | UUID | FK → `tenants.id`, ON DELETE CASCADE | Empresa a la que pertenece |
| `email` | VARCHAR | NOT NULL, UNIQUE | Correo electrónico (usado para login) |
| `rut` | VARCHAR | NOT NULL, UNIQUE | RUT chileno con dígito verificador |
| `password_hash` | VARCHAR | NOT NULL | Hash bcrypt de la contraseña (nunca texto plano) |
| `first_name` | VARCHAR | NOT NULL | Nombre del usuario |
| `last_name` | VARCHAR | NOT NULL | Apellido del usuario |
| `phone` | VARCHAR(20) | Nullable | Teléfono de contacto |
| `role` | TEXT[] | NOT NULL, Default: `{TECHNICIAN}` | Array de roles del usuario |
| `fcm_tokens` | TEXT | Nullable | Tokens Firebase Cloud Messaging para push notifications |
| `active` | BOOLEAN | Default: `true` | Si el usuario puede hacer login |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Roles disponibles:** `ADMIN`, `SUPPORT`, `VENDOR`, `RETAILER`, `TECHNICIAN`, `DRIVER`

**Relaciones salientes:**
- `tenant_id` → `tenants.id` (ManyToOne)

**Relaciones entrantes:** Un usuario puede ser referenciado como técnico en visitas, creador/asignado en tickets, creador/asignado en órdenes de trabajo, vendedor en ventas, reportador en mermas, y retailer en stores.

---

### 3.2 Gestión de Activos y Operación en Terreno

Estas entidades registran y controlan los activos refrigerados, su ubicación física, los tags NFC y la estructura geográfica.

#### 3.2.1 Machine (tabla: `machines`)

Representa un activo refrigerado (cámara de frío, refrigerador comercial, etc.). Es la entidad central del dominio operativo.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del activo |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `assigned_user_id` | UUID | Nullable | Técnico o usuario asignado al equipo |
| `store_id` | UUID | FK → `stores.id`, Nullable | Local/punto de venta donde está instalado |
| `location_name` | VARCHAR(255) | Nullable | Nombre descriptivo de la ubicación |
| `location_lat` | FLOAT | Nullable | Latitud GPS de la ubicación |
| `location_lng` | FLOAT | Nullable | Longitud GPS de la ubicación |
| `brand` | VARCHAR(255) | Nullable | Marca del equipo (ej: "Carrier") |
| `model` | VARCHAR(255) | Nullable | Modelo del equipo |
| `serial_number` | VARCHAR(255) | Nullable, UNIQUE | Número de serie del fabricante |
| `status` | VARCHAR(50) | Default: `'ACTIVE'` | Estado operativo del activo |
| `acquisition_type` | VARCHAR(20) | Nullable | Tipo de adquisición (compra, arriendo, comodato) |
| `is_active` | BOOLEAN | Default: `true` | Si el activo está operativo en el sistema |
| `created_at` | TIMESTAMP | Auto | Fecha de registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- `store_id` → `stores.id` (ManyToOne) — Un store puede tener múltiples machines

---

#### 3.2.2 NfcTag (tabla: `nfc_tags`)

Representa un tag NFC físico adherido a un activo. Se utiliza para verificar la presencia física del técnico durante una visita mediante el escaneo del chip.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del tag |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `machine_id` | UUID | FK → `machines.id`, NOT NULL | Máquina a la que está adherido (relación 1:1) |
| `uid` | VARCHAR(14) | NOT NULL, UNIQUE | UID físico del chip NFC (14 bytes hex). Detecta clonaciones |
| `tag_model` | VARCHAR(20) | Default: `'NTAG-215'` | Modelo del tag NFC |
| `hardware_model` | VARCHAR(20) | Default: `'NTAG215'` | Modelo del hardware |
| `is_locked` | BOOLEAN | Default: `false` | Si el tag está bloqueado contra escritura |
| `is_active` | BOOLEAN | Default: `true` | Si el tag está activo en el sistema |
| `created_at` | TIMESTAMP | Auto | Fecha de registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- `machine_id` → `machines.id` (OneToOne)

---

#### 3.2.3 Store (tabla: `stores`)

Representa un local comercial o punto de venta donde se instalan los activos refrigerados.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del local |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `sector_id` | UUID | FK → `sectors.id`, Nullable | Sector geográfico al que pertenece |
| `retailer_id` | UUID | FK → `users.id`, Nullable | Usuario minorista responsable del local |
| `name` | VARCHAR(255) | NOT NULL | Nombre del local comercial |
| `address` | VARCHAR(255) | Nullable | Dirección física |
| `retailer_phone` | VARCHAR(20) | Nullable | Teléfono de contacto del minorista |
| `retailer_email` | VARCHAR(255) | Nullable | Email del minorista |
| `latitude` | DECIMAL(10,8) | Nullable | Latitud GPS |
| `longitude` | DECIMAL(11,8) | Nullable | Longitud GPS |
| `is_active` | BOOLEAN | Default: `true` | Si el local está activo |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- `sector_id` → `sectors.id` (ManyToOne)
- `retailer_id` → `users.id` (ManyToOne)
- Un store tiene múltiples `machines` (OneToMany)

---

#### 3.2.4 Sector (tabla: `sectors`)

Representa una zona geográfica o sector comercial para agrupar stores y organizar la operación por territorio.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del sector |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `comuna` | VARCHAR | Nullable | Comuna (división administrativa chilena) |
| `city` | VARCHAR | Nullable | Ciudad |
| `address` | VARCHAR | Nullable | Dirección de referencia |
| `latitude` | DECIMAL(10,8) | Nullable | Latitud GPS del centroide |
| `longitude` | DECIMAL(11,8) | Nullable | Longitud GPS del centroide |
| `is_active` | BOOLEAN | Default: `true` | Si el sector está activo |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- Un sector agrupa múltiples `stores`, `sales` y `kpis`

---

### 3.3 Registro de Operaciones, Visitas y Soporte

Estas tablas proporcionan trazabilidad completa de las acciones sobre los activos.

#### 3.3.1 Visit (tabla: `visits`)

Registra cada visita de un técnico a un activo. El técnico llega al sitio, escanea el tag NFC del equipo y la app crea la visita con coordenadas GPS para validar presencia física.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único de la visita |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `technician_id` | UUID | FK → `users.id`, NOT NULL | Técnico que realizó la visita |
| `machine_id` | UUID | FK → `machines.id`, NOT NULL | Equipo visitado |
| `latitude` | FLOAT | Nullable | Latitud GPS del técnico al momento de la visita |
| `longitude` | FLOAT | Nullable | Longitud GPS del técnico |
| `nfc_tag_id` | VARCHAR(255) | Nullable | ID del tag NFC escaneado como prueba de presencia |
| `temperature` | DECIMAL(5,2) | Nullable | Temperatura registrada del equipo (°C) |
| `notes` | TEXT | Nullable | Observaciones del técnico |
| `status` | VARCHAR | Default: `'completed'` | Estado: `pending`, `completed`, `flagged` |
| `type` | VARCHAR(50) | Nullable | Tipo: `MAINTENANCE`, `SALE`, `INSPECTION`, `DELIVERY` |
| `visited_at` | TIMESTAMPTZ | NOT NULL | Fecha/hora real de la visita (puede diferir de `created_at` si fue offline) |
| `created_at` | TIMESTAMP | Auto | Fecha de registro en BD |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Nota técnica:** Se usa `FLOAT` en vez de `DECIMAL` para coordenadas GPS para que TypeORM devuelva `number` en lugar de `string`.

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- `technician_id` → `users.id` (ManyToOne)
- `machine_id` → `machines.id` (ManyToOne)

---

#### 3.3.2 Ticket (tabla: `tickets`)

Representa reportes de problemas u órdenes de incidencia. Se crean cuando un técnico detecta una anomalía durante una visita o cuando un administrador necesita atención sobre un equipo.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del ticket |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `machine_id` | UUID | FK → `machines.id`, Nullable | Equipo asociado (puede ser ticket general) |
| `created_by_id` | UUID | FK → `users.id`, NOT NULL | Usuario que creó el ticket |
| `assigned_to_id` | UUID | FK → `users.id`, Nullable | Técnico asignado para resolver |
| `title` | VARCHAR(255) | NOT NULL | Título corto del problema |
| `description` | TEXT | Nullable | Descripción detallada de la incidencia |
| `priority` | VARCHAR | Default: `'medium'` | Prioridad: `low`, `medium`, `high`, `urgent` |
| `status` | VARCHAR | Default: `'open'` | Estado: `open`, `in_progress`, `resolved`, `closed` |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id` (ManyToOne)
- `machine_id` → `machines.id` (ManyToOne)
- `created_by_id` → `users.id` (ManyToOne)
- `assigned_to_id` → `users.id` (ManyToOne)

---

#### 3.3.3 WorkOrder (tabla: `work_orders`)

Representa una orden de trabajo formal asignada a un técnico. A diferencia de un ticket (que es un reporte de problema), la orden de trabajo es una tarea planificada con fecha límite.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `created_by_id` | UUID | FK → `users.id`, NOT NULL | Usuario que creó la orden |
| `assigned_to_id` | UUID | FK → `users.id`, Nullable | Técnico asignado |
| `machine_id` | UUID | FK → `machines.id`, Nullable | Máquina asociada |
| `title` | VARCHAR(255) | NOT NULL | Título de la orden |
| `description` | TEXT | Nullable | Descripción detallada |
| `status` | VARCHAR | Default: `'pending'` | Estado: `pending`, `in_progress`, `completed`, `cancelled` |
| `priority` | VARCHAR | Default: `'medium'` | Prioridad: `low`, `medium`, `high`, `urgent` |
| `due_date` | TIMESTAMP | Nullable | Fecha límite para completar |
| `completed_at` | TIMESTAMP | Nullable | Fecha real de finalización |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id`, `created_by_id` → `users.id`, `assigned_to_id` → `users.id`, `machine_id` → `machines.id`

---

#### 3.3.4 Merma (tabla: `mermas`)

Registra pérdidas de producto (mermas) asociadas a fallas en los equipos. Permite valorizar económicamente el impacto de cada incidencia.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `reported_by_id` | UUID | FK → `users.id`, NOT NULL | Usuario que reporta la merma |
| `ticket_id` | UUID | FK → `tickets.id`, Nullable | Ticket de incidencia asociado |
| `machine_id` | UUID | FK → `machines.id`, Nullable | Equipo donde ocurrió la pérdida |
| `product_name` | VARCHAR | NOT NULL | Nombre del producto perdido |
| `quantity` | NUMERIC | NOT NULL | Cantidad perdida (unidades) |
| `unit_cost` | NUMERIC | NOT NULL | Costo unitario del producto |
| `total_cost` | NUMERIC | NOT NULL | Costo total de la merma (`quantity × unit_cost`) |
| `cause` | TEXT | Nullable | Causa de la merma (ej: "falla compresor") |
| `merma_date` | TIMESTAMP | NOT NULL | Fecha en que ocurrió la pérdida |
| `created_at` | TIMESTAMP | Auto | Fecha de registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Relaciones:**
- `tenant_id` → `tenants.id`, `reported_by_id` → `users.id`, `ticket_id` → `tickets.id`, `machine_id` → `machines.id`

---

### 3.4 Sincronización Offline

#### 3.4.1 SyncQueue (tabla: `sync_queue`)

Implementa la cola de sincronización para operaciones realizadas en modo offline. Cuando un técnico trabaja sin conectividad, las operaciones se encolan localmente y se sincronizan cuando se recupera la conexión.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único del evento |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `user_id` | UUID | FK → `users.id`, NOT NULL | Usuario que generó la operación |
| `operation_type` | ENUM | NOT NULL | Tipo de operación (ver valores abajo) |
| `status` | ENUM | Default: `'PENDIENTE'` | Estado de sincronización |
| `payload` | JSON | NOT NULL | Datos completos de la operación en formato JSON |
| `retry_count` | INTEGER | Default: `0` | Cantidad de reintentos realizados |
| `max_retries` | INTEGER | Default: `3` | Máximo de reintentos permitidos |
| `error_message` | TEXT | Nullable | Mensaje de error del último intento fallido |
| `error_stack` | TEXT | Nullable | Stack trace del error |
| `next_retry_at` | TIMESTAMP | Nullable | Fecha programada para el próximo reintento |
| `synced_at` | TIMESTAMP | Nullable | Fecha en que se sincronizó exitosamente |
| `entity_id` | UUID | Nullable | ID de la entidad creada tras sincronizar |
| `entity_type` | VARCHAR(50) | Nullable | Tipo de entidad creada (ej: `'visit'`, `'ticket'`) |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Valores de `operation_type`:** `visit_check_in`, `visit_check_out`, `work_order_delivery`, `ticket_report`, `ticket_update`, `attachment_upload`

**Valores de `status`:** `PENDIENTE`, `SINCRONIZADO`, `FALLIDO`, `REVISION_MANUAL`

---

### 3.5 Inventario y Evidencias

#### 3.5.1 InventoryItem (tabla: `inventory`)

Gestiona el inventario de repuestos y piezas necesarias para el mantenimiento de los activos refrigerados.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `part_name` | VARCHAR | NOT NULL | Nombre de la pieza o repuesto |
| `part_number` | VARCHAR | Nullable | Código o número de parte del fabricante |
| `description` | VARCHAR | Nullable | Descripción del ítem |
| `quantity` | INTEGER | Default: `0` | Cantidad disponible en stock |
| `min_quantity` | INTEGER | Default: `0` | Stock mínimo (genera alerta si `quantity < min_quantity`) |
| `unit_cost` | NUMERIC | Nullable | Costo unitario del repuesto |
| `status` | ENUM | Default: `'disponible'` | Estado del inventario |
| `location` | VARCHAR | Nullable | Ubicación física del repuesto (bodega, estante, etc.) |
| `created_at` | TIMESTAMP | Auto | Fecha de registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Valores de `status`:** `disponible`, `en_uso`, `agotado`, `en_pedido`

---

#### 3.5.2 Attachment (tabla: `attachments`)

Almacena metadatos de archivos multimedia (fotos, documentos) subidos como evidencia. Los archivos físicos se almacenan en **Azure Blob Storage**; esta tabla solo guarda la referencia URL.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `uploaded_by_id` | UUID | FK → `users.id`, NOT NULL | Usuario que subió el archivo |
| `entity_type` | VARCHAR(50) | NOT NULL | Tipo de entidad asociada (ej: `'visit'`, `'ticket'`) |
| `entity_id` | UUID | NOT NULL | ID de la entidad asociada (patrón polimórfico) |
| `url` | VARCHAR | NOT NULL | URL del archivo en Azure Blob Storage |
| `file_name` | VARCHAR(255) | NOT NULL | Nombre original del archivo |
| `mime_type` | VARCHAR(100) | NOT NULL | Tipo MIME (ej: `image/jpeg`, `application/pdf`) |
| `file_size` | INTEGER | Nullable | Tamaño del archivo en bytes |
| `created_at` | TIMESTAMP | Auto | Fecha de subida |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

**Nota:** Esta tabla usa un **patrón de asociación polimórfica** (`entity_type` + `entity_id`) para vincularse con cualquier entidad del sistema sin necesidad de múltiples FKs.

---

### 3.6 Ventas y KPIs

#### 3.6.1 Sale (tabla: `sales`)

Registra las ventas realizadas por los vendedores en terreno, vinculadas a un sector geográfico y opcionalmente a una máquina.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `vendor_id` | UUID | FK → `users.id`, NOT NULL | Vendedor que realizó la venta |
| `sector_id` | UUID | FK → `sectors.id`, NOT NULL | Sector geográfico de la venta |
| `machine_id` | UUID | FK → `machines.id`, Nullable | Máquina asociada (si aplica) |
| `amount` | NUMERIC | NOT NULL | Monto de la venta |
| `description` | VARCHAR | Nullable | Descripción o detalle de la venta |
| `sale_date` | TIMESTAMP | NOT NULL | Fecha de la venta |
| `created_at` | TIMESTAMP | Auto | Fecha de registro |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

---

#### 3.6.2 Kpi (tabla: `kpis`)

Almacena indicadores clave de rendimiento (KPIs) para medir el desempeño por usuario, sector o a nivel de tenant.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `tenant_id` | UUID | FK → `tenants.id`, NOT NULL | Empresa propietaria |
| `user_id` | UUID | FK → `users.id`, Nullable | Usuario al que aplica el KPI |
| `sector_id` | UUID | FK → `sectors.id`, Nullable | Sector al que aplica el KPI |
| `type` | ENUM | NOT NULL | Tipo: `visitas`, `ventas`, `tickets`, `mermas` |
| `name` | VARCHAR | NOT NULL | Nombre descriptivo del KPI |
| `target_value` | NUMERIC | NOT NULL | Valor objetivo a alcanzar |
| `current_value` | NUMERIC | Default: `0` | Valor actual acumulado |
| `start_date` | TIMESTAMP | Nullable | Inicio del período de medición |
| `end_date` | TIMESTAMP | Nullable | Fin del período de medición |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |
| `updated_at` | TIMESTAMP | Auto | Última modificación |
| `deleted_at` | TIMESTAMP | Nullable | Borrado lógico |

---

### 3.7 Seguridad y Recuperación de Acceso

#### 3.7.1 PasswordReset (tabla: `password_resets`)

Gestiona los tokens de recuperación de contraseña. Implementa un patrón seguro donde el token completo nunca se almacena; solo se guarda su hash bcrypt y un prefijo de 8 caracteres para búsqueda rápida.

| Columna | Tipo PostgreSQL | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, auto-generado | Identificador único |
| `user_id` | UUID | FK → `users.id`, NOT NULL | Usuario que solicitó el reset |
| `token_prefix` | VARCHAR(8) | INDEX | Primeros 8 caracteres del token (para filtrado rápido) |
| `reset_token_hash` | VARCHAR | NOT NULL | Hash bcrypt del token completo |
| `expires_at` | TIMESTAMP | NOT NULL | Fecha de expiración del token |
| `used` | BOOLEAN | Default: `false` | Si el token ya fue utilizado |
| `created_at` | TIMESTAMP | Auto | Fecha de creación |

**Nota de seguridad:** El `token_prefix` permite localizar candidatos en la tabla sin iterar todas las filas. Luego se valida el hash completo contra el token proporcionado por el usuario. Este patrón evita ataques de fuerza bruta y timing attacks.

---

## 4. Convenciones y Patrones de Diseño

### 4.1 Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tablas | snake_case, plural | `work_orders`, `nfc_tags` |
| Columnas | snake_case | `tenant_id`, `created_at` |
| Propiedades TypeORM | camelCase | `tenantId`, `createdAt` |
| Entidades | PascalCase + sufijo descriptivo | `MachineTypeOrmEntity`, `Visit` |
| Enums | UPPER_SNAKE_CASE o lowercase según contexto | `PENDIENTE`, `disponible` |

### 4.2 Patrones Recurrentes

1. **Multi-tenancy por discriminador:** Toda tabla de negocio incluye `tenant_id` (UUID, FK). Todas las queries filtran por tenant.
2. **Soft-delete universal:** Columna `deleted_at` en todas las tablas. TypeORM usa `@DeleteDateColumn` para gestionar automáticamente.
3. **Timestamps automáticos:** `created_at` y `updated_at` gestionados por `@CreateDateColumn` y `@UpdateDateColumn`.
4. **UUID como PK:** Todas las tablas usan UUID v4 generado por PostgreSQL (`gen_random_uuid()`), sin dependencia de extensiones.
5. **Asociación polimórfica:** La tabla `attachments` usa `entity_type` + `entity_id` para asociarse con múltiples entidades.
6. **Enums en PostgreSQL:** `sync_queue`, `inventory` y `kpis` usan tipos ENUM nativos de PostgreSQL.

### 4.3 Consideraciones de Seguridad

- Las contraseñas se almacenan como hash **bcrypt** (nunca texto plano).
- Los tokens de reset usan hash + prefijo indexado para búsqueda segura.
- La conexión a Azure usa SSL obligatorio (`rejectUnauthorized: false`).
- Rate limiting en 3 niveles para prevenir abuso de la API.
- Los datos nunca se eliminan físicamente (soft-delete para auditoría).

---

## 5. Infraestructura y Despliegue

| Componente | Tecnología |
|---|---|
| **Base de datos** | Azure Database for PostgreSQL Flexible Server |
| **Backend API** | Azure App Service (Linux) |
| **Almacenamiento de archivos** | Azure Blob Storage |
| **CI/CD** | GitHub Actions |
| **ORM** | TypeORM 0.3.28 |
| **Runtime** | Node.js con TypeScript 5.7 |

---

*Fin del documento.*
