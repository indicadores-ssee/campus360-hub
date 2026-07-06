# POST /api/refresh-config

Upsert de una fila de horario desde Power Automate (trigger SharePoint `Config-horarios`).

## Rate limiting

Sí — 30 req/min por IP.

## Headers

```
Content-Type: application/json
Authorization: Bearer <REFRESH_SECRET>
```

## Body (campos del trigger SharePoint)

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

## Respuestas

**200**:

```json
{
  "success": true,
  "resolved": { "hasActiveSchedule": true, "titulo": "Horario Normal" },
  "horarios": { "...": "..." },
  "updatedAt": "2026-06-19T12:00:00.000Z"
}
```

**400** — Payload inválido.

**401** — Unauthorized.

**429** — Rate limit.

## Auth

Bearer `REFRESH_SECRET`.
