# PUT /api/turno

Asigna o reasigna un turno de atención. En producción encola el envío a Power Automate vía QStash (`/api/qstash-worker`); en localhost llama al webhook directamente.

## Rate limiting

Sí — 30 req/min por IP.

## Query params

| Param | Valores | Descripción |
|-------|---------|-------------|
| `action` | `asignar` (requerido para asignación normal) \| `reasignar` | `reasignar` omite validación de horario y campos obligatorios |

## Body (JSON)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `nombres` | string | Sí (`asignar`) | |
| `apellidos` | string | Sí (`asignar`) | |
| `cedula` | string | Sí (`asignar`) | Validación de identificación |
| `email` | string | Sí (`asignar`) | |
| `telefono` | string | Sí (`asignar`) | Validado según país |
| `servicio` | string | Sí (`asignar`) | |
| `origen` | string | Sí (siempre en payload) | Origen del flujo en la app |
| `modalidad` | string | No | Default `-` |
| `pais` | string | No | Default `Ecuador` |
| `prefijoTelefonico` | string | No | Default `+593` |
| `freeText` | string | No | Detalle adicional |
| `requestId` | string | No | ID de correlación para Power Automate |

## Respuestas

**200** — Éxito:

```json
{
  "success": true,
  "turnoNumber": "A-042",
  "zoomLink": "zoommtg://...",
  "webZoomLink": "https://...",
  "requestId": "optional-uuid"
}
```

**400** — `action` inválido o errores de validación:

```json
{ "error": "Nombres es requerido, ..." }
```

**403** — Fuera de horario (`action=asignar`):

```json
{ "error": "Fuera de horario de atención (hora Ecuador). No se pueden asignar turnos." }
```

**429** — Rate limit.

**500** — Error interno:

```json
{ "success": false, "error": "..." }
```

## Auth

No requiere Bearer.
