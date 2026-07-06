### `PUT /api/turno` — Asignar o reasignar turno

Query param obligatorio: `?action=asignar` (valida horario y campos) o `?action=reasignar` (omite validación de horario).

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "cedula": "1234567890",
  "email": "juan@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Matrícula",
  "modalidad": "Presencial",
  "origen": "wizard-servicio",
  "pais": "Ecuador",
  "requestId": "optional-uuid",
  "freeText": "",
  "prefijoTelefonico": "+593"
}
```

**Respuesta 200:**

```json
{
  "success": true,
  "turnoNumber": "A-042",
  "zoomLink": "zoommtg://...",
  "webZoomLink": "https://...",
  "requestId": "optional-uuid"
}
```

**403** si `action=asignar` y el centro está fuera de horario (hora Ecuador). En producción encola el envío a Power Automate vía QStash (`POST /api/qstash-worker`); en localhost llama al webhook directamente.

### `POST /api/turno/caducar` — Marcar turno caducado

Usado al generar un nuevo turno desde la pantalla de resultado. Actualiza estado en Power Automate si `PA_ACTUALIZAR_TURNO_URL` está configurado.

```json
{
  "requestId": "uuid-del-turno",
  "turno": "A-042",
  "nuevoEstado": "CADUCADO",
  "fechaCaducidad": "2026-07-06T21:00:00.000Z"
}
```

**Respuesta:** `{ "success": true, "message": "Turno marcado como caducado" }`

### `POST /api/qstash-worker` — Worker interno (QStash)

No llamar desde el cliente. Upstash QStash invoca esta ruta al procesar la cola `turnos` y reenvía el payload a Power Automate (`WEBHOOK_URLS.crearTurno`). Requiere `QSTASH_TOKEN` en el servidor que encola.

### `POST /api/autogestion` — Registrar autogestión

```json
{
  "fecha": "06/07/2026, 10:30:00",
  "nombres": "María López",
  "cedula": "1234567890",
  "email": "maria@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Horarios de clases",
  "resultado": "ÉXITO",
  "pais": "Ecuador",
  "modalidad": "-",
  "requestId": "optional-uuid"
}
```

**Respuesta:** `{ "success": true, "message": "Autogestión guardada" }`

### `POST /api/fuera-horario` — Solicitar llamada

```json
{
  "fecha": "06/07/2026, 10:30:00",
  "horaContactoPreferida": "09:00 - 10:00",
  "nombres": "Carlos Ruiz",
  "cedula": "1234567890",
  "email": "carlos@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Información General",
  "origen": "fuera-horario",
  "pais": "Ecuador",
  "modalidad": "-",
  "freeText": ""
}
```

**Respuesta:** `{ "success": true, "message": "Solicitud fuera de horario guardada" }`

### `GET /api/avisos` — Avisos del banner en `/tipo`

Devuelve mensajes activos desde SharePoint (vía Power Automate), con caché compartida en Redis.

```json
{
  "messages": [
    {
      "title": "Renueva tu beca.",
      "message": "Renueva tu beca desde el 23 de abril al 3 de mayo.",
      "link": {
        "label": "ingresa aquí",
        "url": "https://becas.utpl.edu.ec/"
      }
    }
  ],
  "rotationIntervalMs": 20000
}
```

Si no hay avisos activos o falla la integración, `messages` es un array vacío y el banner no se muestra.

### `POST /api/avisos/refresh` — Sincronizar avisos desde Power Automate

Actualiza Redis al crear o modificar items en SharePoint (`Bannerconfig`). Requiere autenticación Bearer.

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <REFRESH_SECRET>
```

**Body:** array JSON con el mismo shape que devuelve el flujo de lectura de SharePoint (`body('Obtener_elementos')?['value']`).

**Respuesta:**

```json
{ "success": true, "count": 2 }
```

### `GET /api/categorias` — Categorías del wizard en `/servicio`

Query param obligatorio: `audience=continuo` (Ya soy UTPL +) o `audience=nuevo` (Quiero ser UTPL +).

```json
{
  "categories": [
    {
      "id": "matriculas-y-tramites",
      "title": "Matrículas y trámites",
      "description": "Renovación, inscripción y procesos administrativos",
      "iconLabel": "Libro – matrículas y trámites",
      "studentType": "continuo"
    }
  ]
}
```

Si Redis no tiene datos, se usa `MICROSOFT_CATEGORIAS_FLOW_URL` como fallback (TTL 10 min). Si todo falla, `categories` es `[]`.

### `POST /api/categorias/refresh` — Sincronizar categorías desde Power Automate

Igual que avisos: Bearer `REFRESH_SECRET`, body = array de la lista SharePoint `CategoriasWizard`.

**Flujo Power Automate (sync):**

1. Disparador: *Cuando se crea o modifica un elemento* en `Bannerconfig` o `CategoriasWizard`.
2. Acción: *Obtener elementos* de la misma lista.
3. Acción HTTP POST a `https://<dominio>/api/avisos/refresh` o `/api/categorias/refresh` con los headers anteriores y body `body('Obtener_elementos')?['value']`.

Los cambios son visibles en segundos tras el POST refresh y una recarga de página (GET lee Redis).

**Pruebas locales:**

```bash
curl -X POST "http://localhost:3000/api/avisos/refresh" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '[{"Title":"Test","field_1":"Mensaje","activar":{"Value":"Activado"}}]'

curl "http://localhost:3000/api/categorias?audience=continuo"

curl -X POST "http://localhost:3000/api/categorias/refresh" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '[{"Title":"Pagos","Activo":{"Value":"Activado"},"TipoEstudiante":{"Value":"Continuo"},"Icono":{"Value":"Dinero – pagos y becas"}}]'
```

### `GET /api/schedule-config` — Configuración de horarios

Devuelve horarios almacenados en Redis y el estado actual (`open`, `closing-soon`, `lunch`, `after-hours`).

```json
{
  "horarios": {
    "Horario Normal": {
      "horaAperturaM": "08:00",
      "horaCierreM": "13:00",
      "horarioAperturaT": "15:00",
      "horarioCierreT": "18:00",
      "modo": "dual",
      "habilitado": true
    }
  },
  "resolved": { "hasActiveSchedule": true, "titulo": "Horario Normal" },
  "state": "open",
  "updatedAt": "2026-06-19T12:00:00.000Z",
  "meta": {
    "source": "kv",
    "redisEnabled": true,
    "mockActive": false,
    "ecuadorTime": "10:30",
    "isWeekday": true
  }
}
```

`state`: `open` | `closing-soon` | `lunch` | `after-hours`. `meta.source`: `kv` | `empty` | `mock`.

### `POST /api/refresh-config` — Sincronizar horarios desde Power Automate

Upsert de **una fila** por request (trigger de SharePoint `Config-horarios`).

**Headers:** `Content-Type: application/json`, `Authorization: Bearer <REFRESH_SECRET>`

**Body (campos del trigger):**

```json
{
  "Titulo": "Horario Normal",
  "HoraAperturaM": "08:00",
  "HoraCierreM": "13:00",
  "HorarioAperturaT": "15:00",
  "HorarioCierreT": "18:00",
  "habilitado": "Si"
}
```

**Respuesta 200:**

```json
{
  "success": true,
  "resolved": { "hasActiveSchedule": true, "titulo": "Horario Normal" },
  "horarios": { "Horario Normal": { "...": "..." } },
  "updatedAt": "2026-06-19T12:00:00.000Z"
}
```

**Prueba local:**

```bash
curl -X POST "http://localhost:3000/api/refresh-config" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"Titulo":"Horario Normal","HoraAperturaM":"08:00","HoraCierreM":"13:00","HorarioAperturaT":"15:00","HorarioCierreT":"18:00","habilitado":"Si"}'

curl "http://localhost:3000/api/schedule-config"
```

**Power Automate:** actualizar Bearer de `campus360-pa-horario-2026` a `REFRESH_SECRET` (mismo que banner/categorías).

En producción, quitar `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open` para que aplique el horario real.

### `GET /api/cerrado` · `POST /api/cerrado` — Flag de cierre (memoria)

Estado en memoria del proceso (`cerrado: boolean`). No persiste entre reinicios ni instancias serverless. Sin autenticación ni rate limit.

**GET** → `{ "cerrado": false }`

**POST** body `{ "cerrado": true }` → `{ "cerrado": true }` (400 si no es boolean).
