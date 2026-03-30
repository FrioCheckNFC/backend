<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


# FrioCheck Backend

Este proyecto es el backend de FrioCheck, una plataforma para gestionar equipos de refrigeración, técnicos, visitas, tickets y archivos de evidencia. Está pensado para que cualquier persona (incluso sin saber programar) pueda entender cómo funciona, colaborar y probarlo fácilmente.

## ¿Qué hace este backend?

- Permite a empresas registrar y gestionar sus equipos de refrigeración (assets).
- Los técnicos pueden registrar visitas a equipos usando la app móvil (con GPS y NFC).
- Se pueden crear tickets (órdenes de trabajo) y asignarlos a técnicos.
- Permite subir y consultar archivos de evidencia (fotos, documentos).
- Todo está protegido por roles (ADMIN, TECHNICIAN) y autenticación JWT.

## Estructura de carpetas

- `src/modules/auth/` — Autenticación y registro de usuarios.
- `src/modules/users/` — Gestión de usuarios (solo admin).
- `src/modules/assets/` — Equipos de refrigeración.
- `src/modules/visits/` — Visitas de técnicos a equipos.
- `src/modules/tickets/` — Tickets/órdenes de trabajo.
- `src/modules/media/` — Archivos y fotos de evidencia.

## ¿Cómo lo pruebo rápido?

1. **Clona el repo y entra a la carpeta:**
   ```bash
   git clone ...
   cd backend-friocheck
   ```
2. **Copia el archivo `.env.example` a `.env` y pon tus datos de base de datos.**
3. **Instala dependencias:**
   ```bash
   npm install
   ```
4. **Levanta la base de datos (opcional, si usas Docker):**
   ```bash
   docker compose up -d
   ```
5. **Arranca el backend:**
   ```bash
   npm run start:dev
   ```
6. **Abre la documentación interactiva:**
   - [http://localhost:3000/api](http://localhost:3000/api)
   - Ahí puedes probar todos los endpoints, ver ejemplos y hacer requests sin programar.

## Ejemplos de requests (para Postman, cURL o Swagger)

### 1. Login (obtener token JWT)
```json
POST /api/v1/auth/login
{
  "email": "admin@friocheck.com",
  "password": "tuClave"
}
```
Respuesta:
```json
{
  "access_token": "...",
  "user": { "id": "...", "role": "ADMIN", ... }
}
```

### 2. Crear un equipo (asset)
```json
POST /api/v1/assets
Headers: Authorization: Bearer <token>
{
  "name": "Freezer 1",
  "nfcTagId": "1234567890",
  "location": "Sucursal Centro"
}
```

### 3. Registrar una visita
```json
POST /api/v1/visits
Headers: Authorization: Bearer <token>
{
  "assetId": "uuid-del-equipo",
  "latitude": -33.44,
  "longitude": -70.66
}
```

### 4. Crear un ticket
```json
POST /api/v1/tickets
Headers: Authorization: Bearer <token>
{
  "assetId": "uuid-del-equipo",
  "title": "No enfría",
  "description": "El equipo no está enfriando correctamente"
}
```

### 5. Subir archivo de evidencia
Usa el endpoint `/api/v1/media` (ver Swagger para detalles de multipart/form-data).

## Roles y permisos

- **ADMIN:** Puede ver y gestionar todo lo de su empresa.
- **TECHNICIAN:** Solo puede ver/crear lo asignado a él.

## Swagger (documentación interactiva)

Abre [http://localhost:3000/api](http://localhost:3000/api) para ver y probar todos los endpoints, sin necesidad de programar.

---

¿Dudas? Lee los comentarios en cada archivo o pregunta a tu equipo. Todo está pensado para que sea fácil de entender y modificar.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
