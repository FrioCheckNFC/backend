# 4. Seguridad y Autenticación - FrioCheck Backend

La seguridad de FrioCheck se basa en el estándar **JWT (JSON Web Tokens)** y un sistema de control de acceso basado en roles (RBAC).

## Flujo de Autenticación

1. **Login**: El usuario envía sus credenciales (email/RUT y contraseña) al endpoint `/auth/login`.
2. **Validación**: El `LoginUseCase` verifica las credenciales y el estado del usuario/tenant.
3. **Emisión de Token**: Si es válido, el sistema devuelve un JWT firmado con `JWT_SECRET`.
4. **Peticiones Protegidas**: El cliente debe incluir el token en el header `Authorization: Bearer <token>` para todas las peticiones posteriores.

## Capas de Seguridad (Guards)

El sistema utiliza tres niveles de protección en cascada:

### 1. JwtAuthGuard
Valida que el token sea auténtico, no haya expirado y esté correctamente firmado. Inyecta el objeto `user` en la petición.

### 2. TenantGuard
Asegura la multi-tenencia. Verifica que el `tenantId` del recurso que se intenta acceder coincida con el `tenantId` del usuario autenticado (extraído del token).
*Nota: Los usuarios con rol `SUPER_ADMIN` suelen saltarse esta restricción para labores de soporte global.*

### 3. RolesGuard
Controla el acceso granular basado en el arreglo `role` del usuario.
- `@Roles('ADMIN')`: Solo administradores de la empresa.
- `@Roles('SUPER_ADMIN')`: Solo soporte técnico de FrioCheck.
- `@Roles('TECHNICIAN')`: Técnicos de mantenimiento.

## Roles Definidos

| Rol | Descripción |
| :--- | :--- |
| **SUPER_ADMIN** | Control total de todos los tenants y configuración global. |
| **ADMIN** | Administrador de una empresa específica. |
| **SUPPORT** | Soporte técnico avanzado para un tenant. |
| **TECHNICIAN** | Usuario operativo encargado de escaneos y mantenimiento. |
| **VENDOR / RETAILER** | Roles de consulta y visualización de inventario. |

## Criptografía

- **Contraseñas**: Nunca se almacenan en texto plano. Se utiliza **Bcrypt** con un factor de costo de 10.
- **Tokens**: Firmados con algoritmos de hash seguros y una expiración de 24 horas.
