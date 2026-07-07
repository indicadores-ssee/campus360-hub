# GET /api/categorias

Categorías del wizard en `/servicio`.

## Rate limiting

Sí — 30 req/min por IP.

## Query params

| Param | Valores | Requerido |
|-------|---------|-----------|
| `audience` | `continuo` \| `nuevo` | Sí |

## Respuestas

**200**:

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

**400** — `audience` inválido:

```json
{ "error": "Query param audience must be continuo or nuevo" }
```

**429** — Rate limit.

Si Redis no tiene datos, fallback a `MICROSOFT_CATEGORIAS_FLOW_URL` (TTL 10 min). Si todo falla, `categories: []`.

Headers: `Cache-Control: no-store`.

## Auth

No requiere Bearer.
