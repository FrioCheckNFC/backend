# 2. Configuración y Despliegue - FrioCheck Backend

Este documento detalla los pasos para configurar el entorno de desarrollo y realizar el despliegue a producción en Azure.

## Requisitos Previos

- **Node.js**: v20 o superior.
- **npm**: v10 o superior.
- **PostgreSQL**: Instancia local o remota (Azure).

## Configuración del Entorno Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz del proyecto basado en el siguiente esquema:

   ```env
   # Base de datos PostgreSQL
   DB_HOST=tu_host
   DB_PORT=5432
   DB_USERNAME=tu_usuario
   DB_PASSWORD=tu_password
   DB_NAME=tu_base_de_datos
   DB_SSL=true

   # Seguridad
   JWT_SECRET=tu_secreto_muy_seguro

   # Entorno y Puerto
   NODE_ENV=development
   PORT=80
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run start:dev
   ```
   La API estará disponible en `http://localhost:80`.

## Scripts Disponibles

- `npm run build`: Compila el proyecto en la carpeta `dist/`.
- `npm run start:prod`: Ejecuta la versión compilada (requiere `build` previo).
- `npm run lint`: Ejecuta el linter para asegurar la calidad del código.
- `npm run migration:run`: Ejecuta las migraciones pendientes en la base de datos.

## Despliegue en Azure

El proyecto está configurado para desplegarse en **Azure App Service** con una base de datos **Azure Database for PostgreSQL**.

### Pasos de Despliegue (Manual)

1. **Generar Build**:
   ```bash
   npm run build
   ```

2. **Configurar App Service**:
   - Asegúrate de que las variables de entorno (`App Settings`) estén configuradas en el portal de Azure.
   - El puerto debe ser el `80` (configurado por defecto en Azure).
   - `NODE_ENV` debe ser `production`.

3. **Despliegue vía GitHub Actions**:
   El proyecto incluye un flujo de CI/CD en `.github/workflows/`. Al hacer push a la rama `main`, GitHub compila y despliega automáticamente en Azure.

## Acceso a la Documentación API (Swagger)

Una vez que el servidor esté corriendo, puedes acceder a la interfaz interactiva de Swagger en:
`http://localhost:80/api-docs` (o la URL de producción correspondiente).
