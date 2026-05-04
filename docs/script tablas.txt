-- =============================================================================
-- FRIOCHECK - ESQUEMA COMPLETO DE BASE DE DATOS PostgreSQL
-- Versión: 1.0
-- Fecha: 2026-04-23
-- Descripción: Sistema de gestión de cámaras de frío, visitas técnicas, ventas y más.
-- Nota: Este script está diseñado para Azure PostgreSQL 17 (gen_random_uuid())
-- =============================================================================

-- =============================================================================
-- 1. TENANTS (Empresas/Clientes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- =============================================================================
-- 2. USERS (Usuarios del sistema)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    rut VARCHAR(12) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role TEXT[] DEFAULT '{TECHNICIAN}', -- Array: ADMIN, SUPPORT, VENDOR, RETAILER, TECHNICIAN, DRIVER
    fcm_tokens TEXT, -- Tokens FCM para notificaciones push
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT chk_role_not_empty CHECK (array_length(role, 1) > 0)
);

-- Índices para users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_rut ON users(rut);

-- =============================================================================
-- 3. SECTORS (Zonas/Regiones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,           -- Nombre del sector (ej: "Santiago Centro")
    comuna VARCHAR(255),                -- Comuna
    city VARCHAR(255),                 -- Ciudad
    address VARCHAR(500),            -- Dirección
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_sectors_tenant_id ON sectors(tenant_id);

-- =============================================================================
-- 4. STORES (Puntos de venta/Minoristas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    retailer_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Usuario retailer asignado
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    retailer_phone VARCHAR(20),         -- Teléfono del retailer
    retailer_email VARCHAR(255),         -- Email del retailer
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_stores_tenant_id ON stores(tenant_id);
CREATE INDEX idx_stores_sector_id ON stores(sector_id);
CREATE INDEX idx_stores_retailer_id ON stores(retailer_id);

-- =============================================================================
-- 5. MACHINES (Equipos/Cámaras de frío)
-- =============================================================================
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    name VARCHAR(255),
    brand VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'ACTIVE',   -- ACTIVE, MAINTENANCE, OUT_OF_SERVICE
    acquisition_type VARCHAR(20),         -- RENTED o PURCHASED
    location_name VARCHAR(255),           -- Nombre de ubicación
    location_lat FLOAT,                   -- Latitud GPS
    location_lng FLOAT,                 -- Longitud GPS
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_machines_tenant_id ON machines(tenant_id);
CREATE INDEX idx_machines_store_id ON machines(store_id);
CREATE INDEX idx_machines_assigned_user_id ON machines(assigned_user_id);
CREATE INDEX idx_machines_status ON machines(status);

-- =============================================================================
-- 6. VISITS (Registro de visitas técnicas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    latitude FLOAT,
    longitude FLOAT,
    nfc_tag_id VARCHAR(255),            -- Tag NFC escaneado
    temperature DECIMAL(5, 2),           -- Temperatura registrada
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed, flagged
    type VARCHAR(50),                     -- MAINTENANCE, SALE, INSPECTION, DELIVERY
    visited_at TIMESTAMPTZ NOT NULL,       -- Fecha de visita
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_visits_tenant_id ON visits(tenant_id);
CREATE INDEX idx_visits_technician_id ON visits(technician_id);
CREATE INDEX idx_visits_machine_id ON visits(machine_id);
CREATE INDEX idx_visits_visited_at ON visits(visited_at);

-- =============================================================================
-- 7. WORK_ORDERS (Órdenes de trabajo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_work_orders_tenant_id ON work_orders(tenant_id);
CREATE INDEX idx_work_orders_assigned_to_id ON work_orders(deployed_to_id);

-- =============================================================================
-- 8. TICKETS (Reportes de problemas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(50) DEFAULT 'open',      -- open, in_progress, resolved, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_assigned_to_id ON tickets(assigned_to_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- =============================================================================
-- 9. SALES (Registro de ventas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    description VARCHAR(500),
    sale_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX idx_sales_vendor_id ON sales(vendor_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);

-- =============================================================================
-- 10. MERMAS (Pérdidas/Productos vencidos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS mermas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    cause TEXT,
    merma_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_mermas_tenant_id ON mermas(tenant_id);
CREATE INDEX idx_mermas_reported_by_id ON mermas(reported_by_id);
CREATE INDEX idx_mermas_merma_date ON mermas(merma_date);

-- =============================================================================
-- 11. INVENTORY (Inventario de repuestos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    part_name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100),
    description VARCHAR(500),
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit_cost NUMERIC(10, 2),
    status VARCHAR(20) DEFAULT 'disponible', -- disponible, en_uso, agotado, en_pedido
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_inventory_tenant_id ON inventory(tenant_id);
CREATE INDEX idx_inventory_status ON inventory(status);

-- =============================================================================
-- 12. ATTACHMENTS (Archivos/fotos subidos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,     -- visit, ticket, merma, etc.
    entity_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_attachments_tenant_id ON attachments(tenant_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- =============================================================================
-- 13. NFC_TAGS (Tags NFC físicos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS nfc_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    uid VARCHAR(14) UNIQUE NOT NULL,      -- UID físico del tag (14 hex)
    tag_model VARCHAR(20) DEFAULT 'NTAG-215',
    hardware_model VARCHAR(20) DEFAULT 'NTAG215',
    is_locked BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_nfc_tags_machine_id ON nfc_tags(machine_id);
CREATE INDEX idx_nfc_tags_uid ON nfc_tags(uid);

-- =============================================================================
-- 14. KPIS (Indicadores de rendimiento)
-- =============================================================================
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,          -- visitas, ventas, tickets, mermas
    name VARCHAR(255) NOT NULL,
    target_value NUMERIC(10, 2) NOT NULL,
    current_value NUMERIC(10, 2) DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_kpis_tenant_id ON kpis(tenant_id);
CREATE INDEX idx_kpis_type ON kpis(type);

-- =============================================================================
-- 15. SYNC_QUEUE (Cola de sincronización offline)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL, -- visit_check_in, visit_check_out, etc.
    status VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, SINCRONIZADO, FALLIDO, REVISION_MANUAL
    payload JSONB NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_stack TEXT,
    next_retry_at TIMESTAMP,
    synced_at TIMESTAMP,
    entity_id UUID,
    entity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);

-- =============================================================================
-- 16. PASSWORD_RESETS (Recuperación de contraseña)
-- =============================================================================
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_prefix VARCHAR(8) NOT NULL,   -- Primeros 8 caracteres del token
    reset_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_token_prefix ON password_resets(token_prefix);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- =============================================================================
-- VISTAS MATERIALIZADAS (para reportes)
-- =============================================================================

-- Vista: Resumen de visitas por técnico
CREATE OR REPLACE VIEW view_visits_summary AS
SELECT 
    v.tenant_id,
    v.technician_id,
    u.first_name || ' ' || u.last_name AS technician_name,
    COUNT(*) AS total_visits,
    COUNT(CASE WHEN v.status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN v.status = 'flagged' THEN 1 END) AS flagged,
    AVG(v.temperature) AS avg_temperature,
    MIN(v.visited_at) AS first_visit,
    MAX(v.visited_at) AS last_visit
FROM visits v
JOIN users u ON v.technician_id = u.id
WHERE v.deleted_at IS NULL
GROUP BY v.tenant_id, v.technician_id, u.first_name, u.last_name;

-- Vista: Máquinas con última visita
CREATE OR REPLACE VIEW view_machines_with_last_visit AS
SELECT 
    m.id AS machine_id,
    m.name AS machine_name,
    m.status AS machine_status,
    m.brand,
    m.model,
    v.visited_at AS last_visit_date,
    v.temperature AS last_temperature,
    v.status AS last_visit_status
FROM machines m
LEFT JOIN LATERAL (
    SELECT * FROM visits 
    WHERE machine_id = m.id AND deleted_at IS NULL 
    ORDER BY visited_at DESC LIMIT 1
) v ON true
WHERE m.deleted_at IS NULL;

-- =============================================================================
-- FUNCIONES ÚTILES
-- =============================================================================

-- Función: Obtener usuarios por rol
CREATE OR REPLACE FUNCTION get_users_by_role(p_tenant_id UUID, p_role TEXT)
RETURNS TABLE(id UUID, email VARCHAR, first_name VARCHAR, last_name VARCHAR, phone VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone
    FROM users u
    WHERE u.tenant_id = p_tenant_id 
      AND p_role = ANY(u.role)
      AND u.active = TRUE
      AND u.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Función: Contar mermas por período
CREATE OR REPLACE FUNCTION count_mermas_by_period(p_tenant_id UUID, p_start_date TIMESTAMP, p_end_date TIMESTAMP)
RETURNS TABLE(period DATE, total_count BIGINT, total_cost NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.merma_date::DATE AS period,
        COUNT(*)::BIGINT AS total_count,
        SUM(m.total_cost) AS total_cost
    FROM mermas m
    WHERE m.tenant_id = p_tenant_id
      AND m.merma_date >= p_start_date
      AND m.merma_date <= p_end_date
      AND m.deleted_at IS NULL
    GROUP BY m.merma_date::DATE
    ORDER BY period;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================