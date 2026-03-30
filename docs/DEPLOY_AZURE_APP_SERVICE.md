# Deploy En Azure App Service (Backend Compartido)

## Objetivo
Publicar la API en Azure para que el backend no dependa del computador de un integrante.

## Estado Del Proyecto
- Ya existe workflow de GitHub Actions en .github/workflows/deploy.yml
- El deploy actual usa azure/webapps-deploy y publish profile.

## Arquitectura Recomendada
- Backend: Azure App Service (Node 20)
- Base de datos: Azure PostgreSQL (ya existente)
- Cliente movil y web: consumen URL publica unica

## Paso 1. Crear O Verificar App Service
1. Crear recurso App Service con runtime Node 20.
2. Definir nombre, por ejemplo: friocheck-api.
3. Obtener URL publica, por ejemplo: https://friocheck-api.azurewebsites.net

## Paso 2. Configurar Variables En App Service
En Configuration > Application settings agregar:
- NODE_ENV=production
- PORT=3001
- DB_HOST=<host-postgres-azure>
- DB_PORT=5432
- DB_USERNAME=<usuario>
- DB_PASSWORD=<password>
- DB_NAME=<database>
- JWT_SECRET=<secreto-fuerte>

Notas:
- Si la BD exige SSL, mantener configuracion SSL activa en backend.
- Nunca guardar secretos en repositorio.

## Paso 3. Configurar GitHub Actions
1. En Azure App Service, descargar Publish Profile.
2. En GitHub repo, crear secret:
   - AZURE_WEBAPP_PUBLISH_PROFILE = contenido del publish profile
3. Confirmar rama que dispara deploy en .github/workflows/deploy.yml
   - Actualmente: FrioCheckDB

## Paso 4. Ejecutar Deploy
1. Subir cambios a la rama configurada para deploy.
2. Esperar ejecucion del workflow FrioCheck Deploy.
3. Verificar en logs que finaliza en success.

## Paso 5. Verificacion Post Deploy
1. Probar salud de API:
   - GET https://<app-name>.azurewebsites.net/auth/validate-token
2. Probar login:
   - POST https://<app-name>.azurewebsites.net/auth/login
3. Validar conexion a BD (lectura de usuarios, login correcto).

## Paso 6. Unificar URL De Equipo
- Backend unico compartido en nube, ejemplo:
  https://friocheck-api.azurewebsites.net
- App movil y clientes deben usar esa URL base.
- Evitar localhost o IP privada para integracion de equipo.

## Paso 7. Checklist De Produccion
- Secrets cargados en Azure y GitHub.
- CORS configurado para app movil/web.
- JWT secret no por defecto.
- Migrations aplicadas en ambiente cloud.
- Usuario admin creado o seed controlado.
- Monitoreo de errores habilitado.

## Comandos Utiles (Local)
- Build:
  npm run build
- Migraciones:
  npm run migration:run
- Seed:
  npm run db:seed

## Problemas Frecuentes
1. Error 500 al iniciar:
- Revisar DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.
- Revisar SSL en conexion a PostgreSQL.

2. Deploy exitoso pero API no responde:
- Revisar startup command y logs de App Service.
- Confirmar que app escucha en el puerto esperado por App Service.

3. Login falla en cloud y funciona local:
- Verificar datos seed en BD cloud.
- Verificar JWT_SECRET en App Service.

## Ownership Recomendado
- Responsable backend: despliegue y endpoint publico.
- Responsable BD: migraciones, indices, integridad.
- Responsable app movil: consumo de URL cloud y pruebas E2E.
