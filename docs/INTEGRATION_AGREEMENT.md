# Acuerdo De Integracion Tecnica (BD + Backend + App Movil)

## 1. Objetivo
Alinear al equipo en un contrato unico de datos y API para evitar roturas entre base de datos, backend y app movil.

## 2. Responsables
- Base de datos: define esquema, migraciones, constraints e indices.
- Backend: expone endpoints, valida datos, aplica reglas de negocio y seguridad.
- App movil: consume API, maneja UI/estado y sincronizacion offline.

## 3. Fuente De Verdad
- Estructura de datos: migraciones SQL/TypeORM del backend.
- Contrato de API: endpoints documentados en este repo.
- Regla: si hay conflicto, manda el contrato versionado mas reciente aprobado por el equipo.

## 4. Contrato Minimo De Auth
### 4.1 Login
- Endpoint: POST /auth/login
- Request:

```json
{
  "identifier": "admin@friocheck.com o 11111111-1",
  "password": "Admin123!"
}
```

- Compatibilidad temporal: se acepta email en lugar de identifier mientras se actualiza la app.
- Regla de comparacion: email/rut y password deben coincidir exactamente con lo registrado.
  - Sin trim automatico.
  - Sin convertir mayusculas/minusculas.

### 4.2 Password
- Nunca guardar password en texto plano.
- Siempre guardar hash bcrypt en columna password_hash.
- Validar login con bcrypt.compare.
- Nunca devolver password_hash en responses.

## 5. Reglas De Cambio
- Ningun cambio de BD o API va directo a desarrollo sin anunciarse.
- Todo cambio que rompa compatibilidad requiere:
  - Documento corto de cambio.
  - Fecha de entrada.
  - Plan de migracion para app movil.

## 6. Flujo De Trabajo Entre Roles
1. BD propone cambio (tabla/campo/indice/constraint).
2. Backend evalua impacto en entidades, DTOs y servicios.
3. App movil valida impacto en request/response.
4. Se aprueba y se mergea en este orden:
   - migracion
   - backend
   - app movil

## 7. Ambientes
- Local: cada dev puede correr su backend local.
- Integracion: backend unico para pruebas de equipo.
- BD de desarrollo: compartida (Azure SQL/Postgres), con datos seed.

## 8. Checklist Antes De Integrar
- Migraciones aplicadas sin error.
- Build backend en verde.
- Login OK por email y por RUT.
- password_hash verificado como hash bcrypt en BD.
- Endpoints clave probados con Postman/curl.
- App movil validada contra backend de integracion.

## 9. Matriz De Errores Estandar
- 400: request invalido (faltan campos, formato incorrecto).
- 401: credenciales invalidas.
- 403: sin permisos por rol.
- 404: recurso no encontrado.
- 409: conflicto de datos (duplicado, estado invalido).
- 500: error interno.

## 10. Convenciones De Versionado API
- Version actual: v1.
- Cambios compatibles: agregar campos opcionales.
- Cambios incompatibles: renombrar/eliminar campos o cambiar tipos.
- Para cambios incompatibles usar:
  - nueva ruta versionada, o
  - periodo de compatibilidad definido.

## 11. Acuerdo Operativo
- Reunion de integracion: 15 minutos diarios.
- Canal unico de bloqueos: chat del equipo.
- SLA de respuesta interna a bloqueos criticos: 2 horas habiles.

## 12. Estado Actual (Inicial)
- Password en registro: hash bcrypt.
- Login: acepta identifier (RUT o email) + password.
- Comparacion de credenciales: estricta.
- Build backend: OK.

## 13. Firmas Del Equipo
- Responsable BD: ____________________
- Responsable Backend: _______________
- Responsable App Movil: _____________
- Fecha: _____________________________
