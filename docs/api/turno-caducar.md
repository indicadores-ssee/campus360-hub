# POST /api/turno/caducar

Marca un turno como caducado en Power Automate cuando el usuario genera un nuevo turno desde `ResultCard`.

## Rate limiting

No aplica.

## Body (JSON)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `requestId` | string | Sí | ID del turno en Power Automate |
| `turno` | string | Sí | Número de turno |
| `nuevoEstado` | string | Sí | Ej. `CADUCADO` |
| `fechaCaducidad` | string (ISO) | No | Default: timestamp actual |

## Respuestas

**200** — Siempre devuelve éxito si el body es válido (fallos de PA se registran en log, no bloquean):

```json
{ "success": true, "message": "Turno marcado como caducado" }
```

**400** — Campos faltantes:

```json
{ "error": "Faltan campos requeridos: requestId, turno, nuevoEstado" }
```

**500** — Error interno:

```json
{ "success": false, "error": "..." }
```

## Auth

No requiere Bearer.

## Variables de entorno

- `PA_ACTUALIZAR_TURNO_URL` — Webhook de Power Automate para actualizar estado. Si no está configurado, la ruta responde 200 pero omite la llamada externa.
