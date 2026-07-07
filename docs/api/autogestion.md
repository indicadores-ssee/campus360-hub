# POST /api/autogestion

Registra un resultado de autogestión y lo envía a Power Automate.

## Rate limiting

Sí — 30 req/min por IP.

## Body (JSON)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `nombres` | string | Sí | |
| `cedula` | string | Sí | Validación de identificación |
| `email` | string | Sí | |
| `servicio` | string | Sí | |
| `resultado` | string | Sí | Ej. `ÉXITO` |
| `fecha` | string | No* | Fecha del registro (*enviado por el cliente) |
| `telefono` | string | No | |
| `pais` | string | No | Default `Ecuador` |
| `prefijoTelefonico` | string | No | Default `+593` |
| `modalidad` | string | No | Default `-` |
| `requestId` | string | No | ID de correlación |

## Respuestas

**200**:

```json
{ "success": true, "message": "Autogestión guardada" }
```

**400** — Validación:

```json
{ "error": "..." }
```

**429** — Rate limit.

**500**:

```json
{ "success": false, "error": "..." }
```

## Auth

No requiere Bearer.
