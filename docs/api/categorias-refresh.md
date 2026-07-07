# POST /api/categorias/refresh

Sincroniza categorías desde Power Automate (lista SharePoint `CategoriasWizard`) hacia Redis.

## Rate limiting

Sí — 30 req/min por IP.

## Headers

```
Content-Type: application/json
Authorization: Bearer <REFRESH_SECRET>
```

## Body

Array JSON con elementos de la lista `CategoriasWizard`.

## Respuestas

**200**:

```json
{ "success": true, "count": 5 }
```

**400** — Payload inválido.

**401** — Unauthorized.

**429** — Rate limit.

## Auth

Bearer `REFRESH_SECRET`.
