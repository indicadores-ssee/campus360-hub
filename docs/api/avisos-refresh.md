# POST /api/avisos/refresh

Sincroniza avisos desde Power Automate (lista SharePoint `Bannerconfig`) hacia Redis.

## Rate limiting

Sí — 30 req/min por IP.

## Headers

```
Content-Type: application/json
Authorization: Bearer <REFRESH_SECRET>
```

## Body

Array JSON con el shape de `body('Obtener_elementos')?['value']` de SharePoint.

## Respuestas

**200**:

```json
{ "success": true, "count": 2 }
```

**400** — Payload inválido:

```json
{ "error": "..." }
```

**401** — Sin Bearer o secreto incorrecto:

```json
{ "error": "Unauthorized" }
```

**429** — Rate limit.

## Auth

Bearer `REFRESH_SECRET` (variable de entorno). Comparación timing-safe.
