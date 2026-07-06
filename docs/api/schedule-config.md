# GET /api/schedule-config

Configuración de horarios desde Redis y estado operativo actual.

## Rate limiting

Sí — 30 req/min por IP.

## Respuestas

**200**:

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

`state`: `open` \| `closing-soon` \| `lunch` \| `after-hours`.

`meta.source`: `kv` \| `empty` \| `mock`.

**429** — Rate limit.

En error, devuelve estructura vacía con `state: "after-hours"` y `meta` con valores por defecto.

Headers: `Cache-Control: no-store`.

## Auth

No requiere Bearer.
