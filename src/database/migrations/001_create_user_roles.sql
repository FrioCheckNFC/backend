-- ===========================================
-- Migración 001: Crear tabla user_roles
-- Fecha: 2026-03-31
-- Descripción: Tabla para almacenar múltiples roles por usuario
-- ===========================================

-- Crear tabla user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- Crear índice para búsquedas rápidas por user_id
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Migrar datos existentes: copiar role de users -> user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users WHERE role IS NOT NULL AND deleted_at IS NULL;

-- Verificar migración
SELECT 'Users con roles migrados: ' || COUNT(*) as result FROM user_roles;
