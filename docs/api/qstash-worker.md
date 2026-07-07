# POST /api/qstash-worker

Worker interno invocado por **Upstash QStash** al procesar la cola `turnos`. Reenvía el payload a Power Automate (`WEBHOOK_URLS.crearTurno`).

No debe llamarse manualmente en producción; `PUT /api/turno` encola aquí cuando `NEXT_PUBLIC_APP_URL` no es localhost y `QSTASH_TOKEN` está configurado.

## Rate limiting

No aplica (protegido por QStash en el edge de Upstash).

## Body (JSON)

Payload encolado por `enqueueTurno`:

| Campo | Tipo | Notas |
|-------|------|-------|
| `requestId` | string | Opcional |
| `turno` | string | Número de turno |
| `fecha` | string | Fecha/hora del turno |
| `nombres` | string | Nombre completo |
| `cedula` | string | |
| `email` | string | |
| `pais` | string | |
| `prefijo` | string | Prefijo telefónico |
| `telefono` | string | |
| `modalidad` | string | |
| `servicio` | string | |
| `detalle` | string | Default `""` |
| `origen` | string | |
| `asesor` | string | Default `""` |

## Respuestas

**200**:

```json
{ "success": true }
```

**500**:

```json
{ "success": false, "error": "..." }
```

## Auth

No usa Bearer `REFRESH_SECRET`. La verificación de firma QStash debe configurarse en el dashboard de Upstash / middleware (no implementada en el handler actual).

## Variables de entorno

- `QSTASH_TOKEN` — Habilita la cola desde `lib/server/turno-queue.ts`
