# FrioCheck - Resumen de Base de Datos
## v3.0 - 27/03/2026

## Información de conexión
| Dato | Valor |
|------|-------|
| Servidor | Azure PostgreSQL Flexible |
| Host | friocheck-db-server.postgres.database.azure.com |
| Puerto | 5432 |
| Base de datos | friocheck_db |
| Usuario | friocheck_admin |
| SSL | Requerido |

---

## Estadísticas
| Concepto | Cantidad |
|----------|----------|
| Tablas | 15 |
| Enums | 14 |
| Foreign Keys | 35+ |
| Índices | 60+ |
| Endpoints API | 68 |

---

## Relación entre tablas

```
TENANTS ─┬── USERS ──┬── VISITS
         │           ├── WORK_ORDERS
         │           ├── TICKETS (reported_by, assigned_to, resolved_by)
         │           ├── ATTACHMENTS (uploaded_by)
         │           ├── SALES (vendor)
         │           ├── MERMAS (reported_by)
         │           └── SYNC_QUEUE
         │
         ├── MACHINES ──┬── NFC_TAGS
         │              ├── VISITS
         │              ├── WORK_ORDERS
         │              ├── TICKETS
         │              ├── SALES
         │              └── MERMAS
         │
         ├── SECTORS ──┬── SALES
         │             └── KPIS
         │
         ├── SALES
         ├── MERMAS
         ├── INVENTORY
         └── KPIS (user, sector)
```

---

## Tablas y sus columnas principales

### 1. tenants (9 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| name | varchar | Nombre del tenant |
| slug | varchar UNIQUE | URL-friendly identifier |
| description | text | Descripción |
| is_active | boolean | Estado activo |

---

### 2. users (14 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant del usuario |
| email | varchar UNIQUE | Email |
| rut | varchar UNIQUE | RUT chileno |
| password_hash | varchar | Contraseña hasheada |
| first_name | varchar | Nombre |
| last_name | varchar | Apellido |
| phone | varchar | Teléfono |
| role | enum | ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER |
| fcm_tokens | text | Tokens notificaciones push |
| active | boolean | Estado activo |

---

### 3. machines (13 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| assigned_user_id | uuid FK | Usuario asignado |
| serial_number | varchar UNIQUE | Número de serie |
| model | varchar | Modelo |
| brand | varchar | Marca |
| location_name | varchar | Ubicación descriptiva |
| location_lat | numeric | Latitud |
| location_lng | numeric | Longitud |
| status | enum | ACTIVE, INACTIVE, IN_TRANSIT, MAINTENANCE, DECOMMISSIONED |

---

### 4. nfc_tags (14 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| machine_id | uuid FK | Máquina asociada |
| uid | varchar UNIQUE | UID de la etiqueta NFC |
| tag_model | varchar | Modelo NTAG-215 |
| machine_serial_id | varchar | Serial de máquina |
| integrity_checksum | varchar | Checksum de integridad |
| is_locked | boolean | Etiqueta bloqueada |
| is_active | boolean | Estado activo |

---

### 5. visits (18 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| user_id | uuid FK | Usuario que visitó |
| machine_id | uuid FK | Máquina visitada |
| check_in_timestamp | timestamp | Hora entrada |
| check_out_timestamp | timestamp | Hora salida |
| check_in_nfc_uid | varchar | NFC entrada |
| check_out_nfc_uid | varchar | NFC salida |
| check_in_gps_lat | numeric | Latitud entrada |
| check_in_gps_lng | numeric | Longitud entrada |
| check_out_gps_lat | numeric | Latitud salida |
| check_out_gps_lng | numeric | Longitud salida |
| status | enum | ABIERTA, CERRADA, ANULADA |
| is_valid | boolean | Validación de integridad |

---

### 6. work_orders (23 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| machine_id | uuid FK | Máquina |
| assigned_user_id | uuid FK | Técnico asignado |
| visit_id | uuid FK | Visita asociada |
| type | enum | entrega, reposicion, retiro, reparacion |
| status | enum | pendiente, en_transito, entregado, rechazado, cancelado |
| expected_nfc_uid | varchar | NFC esperado |
| actual_nfc_uid | varchar | NFC real |
| nfc_validated | boolean | NFC validado |
| estimated_delivery_date | timestamp | Fecha estimada |
| delivery_date | timestamp | Fecha real |
| signature_url | varchar | URL firma digital |

---

### 7. tickets (20 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| machine_id | uuid FK | Máquina (opcional) |
| reported_by_id | uuid FK | Creador |
| assigned_to_id | uuid FK | Asignado a |
| resolved_by_id | uuid FK | Resolvedor |
| type | enum | falla, merma, error_nfc, mantenimiento, otro |
| priority | enum | baja, media, alta, critica |
| status | enum | abierto, en_progreso, resuelto, cerrado |
| title | varchar | Título |
| description | text | Descripción |
| resolved_at | timestamp | Fecha resolución |

---

### 8. attachments (16 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| uploaded_by_id | uuid FK | Quien subió |
| visit_id | uuid FK | Visita (opcional) |
| work_order_id | uuid FK | Orden (opcional) |
| ticket_id | uuid FK | Ticket (opcional) |
| type | enum | foto, documento, firma, video |
| category | enum | evidencia, antes_despues, daños, placa_maquina, confirmacion |
| file_name | varchar | Nombre archivo |
| file_size_bytes | integer | Tamaño bytes |
| mime_type | varchar | Tipo MIME |
| azure_blob_url | varchar | URL en Azure Blob |

---

### 9. sync_queue (17 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| user_id | uuid FK | Usuario |
| operation_type | enum | visit_check_in, visit_check_out, work_order_delivery, ticket_report, ticket_update, attachment_upload |
| status | enum | PENDIENTE, SINCRONIZADO, FALLIDO, REVISION_MANUAL |
| payload | json | Datos de la operación |
| retry_count | integer | Intentos realizados |
| max_retries | integer | Máximo de reintentos |
| error_message | text | Último error |

---

### 10. sectors (8 columnas) - NUEVO
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| name | varchar | Nombre del sector |
| description | varchar | Descripción |
| is_active | boolean | Estado activo |

---

### 11. sales (11 columnas) - NUEVO
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| vendor_id | uuid FK | Vendedor |
| sector_id | uuid FK | Sector |
| machine_id | uuid FK | Máquina (opcional) |
| amount | numeric | Monto de la venta |
| description | varchar | Descripción |
| sale_date | timestamp | Fecha de la venta |

---

### 12. mermas (14 columnas) - NUEVO
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| reported_by_id | uuid FK | Quien reportó |
| ticket_id | uuid FK | Ticket (opcional) |
| machine_id | uuid FK | Máquina (opcional) |
| product_name | varchar | Producto perdido |
| quantity | numeric | Cantidad |
| unit_cost | numeric | Costo unitario |
| total_cost | numeric | Costo total |
| cause | text | Causa de la merma |
| merma_date | timestamp | Fecha de la merma |

---

### 13. inventory (13 columnas) - NUEVO
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| part_name | varchar | Nombre del repuesto |
| part_number | varchar | Número de parte |
| description | varchar | Descripción |
| quantity | integer | Cantidad disponible |
| min_quantity | integer | Cantidad mínima |
| unit_cost | numeric | Costo unitario |
| status | enum | disponible, en_uso, agotado, en_pedido |
| location | varchar | Ubicación física |

---

### 14. kpis (13 columnas) - NUEVO
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid PK | Identificador único |
| tenant_id | uuid FK | Tenant |
| user_id | uuid FK | Usuario (opcional) |
| sector_id | uuid FK | Sector (opcional) |
| type | enum | visitas, ventas, tickets, mermas |
| name | varchar | Nombre de la meta |
| target_value | numeric | Valor objetivo |
| current_value | numeric | Valor actual |
| start_date | timestamp | Inicio del periodo |
| end_date | timestamp | Fin del periodo |

---

### 15. migrations (3 columnas)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | serial PK | ID de migración |
| timestamp | bigint | Timestamp de la migración |
| name | varchar | Nombre de la migración |

---

## Multi-tenancy
- Todas las tablas tienen `tenant_id` como FK a `tenants.id`
- Todas las queries deben filtrar por `tenant_id`
- Los índices incluyen `tenant_id` para performance

## Soft Delete
- Todas las tablas tienen `deleted_at` (timestamp nullable)
- `deleted_at IS NULL` = registro activo
- `deleted_at NOT NULL` = registro eliminado

## Timestamps
- `created_at`: Fecha de creación (auto)
- `updated_at`: Última actualización (auto)
- `deleted_at`: Fecha de eliminación (manual)

---

Generado automáticamente - FrioCheck v3.0
