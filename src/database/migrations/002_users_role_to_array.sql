-- ===========================================
-- Migración 002: Cambiar role de users a array
-- Fecha: 2026-04-06
-- Descripción: Convertir columna role de enum a text[]
-- ===========================================

-- 1. Agregar nueva columna como text[]
ALTER TABLE users ADD COLUMN role_new text[];

-- 2. Migrar datos: convertir el enum actual a array
UPDATE users SET role_new = ARRAY[role] WHERE role IS NOT NULL;

-- 3. Establecer默认值 para usuarios sin rol
UPDATE users SET role_new = '{TECHNICIAN}' WHERE role_new IS NULL;

-- 4. Eliminar columna old y renombrar la nueva
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_new TO role;

-- 5. Agregar restricción de valores permitidos (opcional, como CHECK)
ALTER TABLE users ADD CONSTRAINT role_check 
CHECK (role && ARRAY['ADMIN', 'SUPPORT', 'VENDOR', 'RETAILER', 'TECHNICIAN', 'DRIVER']);

-- 6. Si existe la vista users_view, actualizarla
-- DROP VIEW IF EXISTS users_view;
-- CREATE VIEW users_view AS SELECT *, role[1] AS main_role FROM users;

-- Verificar migración
SELECT id, email, role FROM users LIMIT 5;