# Pruebas de Endpoints NFC (FrioCheck)

Aquí tienes los ejemplos listos para importar o copiar en **Postman**, **Insomnia** o enviarlos por terminal usando `curl` o **Thunder Client** en VSCode.

Recuerda que todas estas peticiones requieren el **Token JWT** en la cabecera `Authorization: Bearer <TOKEN>` y, como implementamos multi-tenant, el servidor extraerá tu `tenantId` automáticamente del token.

---

### 1. Escaneo de Máquina / GPS (Validación NFC)
Valida si el técnico está físicamente a menos de 100 metros del refrigerador usando el tag NFC.

**`POST /api/v1/machines/scan`**
```json
{
  "nfcTagId": "TAG-12345",
  "nfcUid": "04:A3:B2:C1:D0:E9:F8",
  "latitude": -33.448890,
  "longitude": -70.669265,
  "gpsAccuracy": 5.0,
  "scannedAt": "2026-04-01T15:00:00Z"
}
```

---

### 2. Check-In de Visita (Apertura)
El técnico llega a la tienda y escanea el tag NFC para indicar que comienza la revisión.

**`POST /api/v1/visits/check-in`**
```json
{
  "machineId": "UUID-DE-LA-MAQUINA-AQUI",
  "nfcUid": "TAG-12345",
  "latitude": -33.448890,
  "longitude": -70.669265
}
```

---

### 3. Check-Out de Visita (Cierre Anti-fraude)
El técnico termina de trabajar y DEBE volver a escanear el tag NFC. Si este `nfcUid` no es el mismo que escaneó en el Check-In, el sistema levanta alerta de fraude y no cierra la visita.

**`POST /api/v1/visits/UUID-DE-LA-VISITA-AQUI/check-out`**
```json
{
  "nfcUid": "TAG-12345",
  "latitude": -33.448890,
  "longitude": -70.669265
}
```

---

### 4. Consultar Mis Visitas Activas (Para el Técnico)
Muestra únicamente las visitas asociadas al técnico logueado.

**`GET /api/v1/visits/my`**
*(No requiere body, solo el Token JWT del técnico)*

---

### 5. Validar Vigencia de Token (Auth)
Asegura que la sesión móvil sigue activa y el token no ha expirado.

**`POST /api/v1/auth/validate-token`**
```json
{
  "token": "TU_TOKEN_JWT_AQUI"
}
```

---

### 6. Desactivar un Usuario (Admin)
**`PATCH /api/v1/users/UUID-DEL-USUARIO-AQUI/deactivate`**
*(Body vacío)*

---

### 7. Registrar Merma (Para un Vendedor o Técnico)
**`POST /api/v1/mermas`**
```json
{
  "productName": "Bebida Cola 3L",
  "quantity": 2,
  "unitCost": 1500.0,
  "cause": "Envase roto durante reposición",
  "mermaDate": "2026-04-01T15:00:00Z"
}
```
