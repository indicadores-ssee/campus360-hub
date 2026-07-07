# POST /api/fuera-horario

Registra una solicitud de contacto fuera del horario de atención.

## Rate limiting

Sí — 30 req/min por IP.

## Body (JSON)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `horaContactoPreferida` | string | Sí | Franja horaria preferida |
| `nombres` | string | Sí | |
| `cedula` | string | Sí | Validación de identificación |
| `email` | string | Sí | |
| `telefono` | string | Sí | Validado según país |
| `servicio` | string | Sí | |
| `origen` | string | Sí | Origen del flujo |
| `fecha` | string | No | Fecha del registro |
| `modalidad` | string | No | Default `-` |
| `freeText` | string | No | Detalle adicional |
| `pais` | string | No | Default `Ecuador` |
| `prefijoTelefonico` | string | No | Default `+593` |
| `requestId` | string | No | ID de correlación |

## Respuestas

**200**:

```json
{ "success": true, "message": "Solicitud fuera de horario guardada" }
```

**400** — Validación.

**429** — Rate limit.

**500**:

```json
{ "success": false, "error": "..." }
```

## Auth

No requiere Bearer.
