# FrioCheck Backend - Documentación Oficial

Bienvenido al repositorio del backend de **FrioCheck**. Esta aplicación proporciona los servicios necesarios para la gestión de equipos de frío, técnicos, visitas y tickets en un entorno multi-tenant.

## 🚀 Inicio Rápido

Para levantar el proyecto en tu entorno local:

1. **Instalar dependencias:** `npm install`
2. **Configurar variables:** Crea un archivo `.env` (ver guía de configuración).
3. **Compilar:** `npm run build`
4. **Ejecutar:** `npm run start:dev`

## 📚 Índice de Documentación Formal

Para una entrega profesional y una comprensión profunda del sistema, consulta los siguientes documentos:

1. [**Arquitectura del Sistema**](docs/1-ARQUITECTURA.md): Detalle de la **Arquitectura Limpia (DDD)**, capas de código y flujo de dependencias.
2. [**Configuración y Despliegue**](docs/2-CONFIGURACION_Y_DESPLIEGUE.md): Guía para el entorno local y el despliegue en **Azure**.
3. [**Base de Datos y Esquema**](docs/3-BASE_DE_DATOS_Y_ESQUEMA.md): Explicación del modelo relacional en PostgreSQL y la multi-tenencia.
4. [**Seguridad y Autenticación**](docs/4-SEGURIDAD_Y_AUTENTICACION.md): Flujo de JWT, Roles (RBAC) y Guards de seguridad.

## 🛠️ Stack Tecnológico

- **Lenguaje**: TypeScript
- **Framework**: NestJS v11
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Cloud**: Azure (App Service & Azure Database)

---

### 🔍 Documentación Interactiva (Swagger)

Puedes explorar y probar todos los endpoints de la API en tiempo real accediendo a:
`http://localhost:80/api-docs` (una vez iniciado el servidor).

### 🧪 Pruebas y Calidad

- `npm run test`: Ejecutar pruebas unitarias.
- `npm run lint`: Validar estilo de código y buenas prácticas.
