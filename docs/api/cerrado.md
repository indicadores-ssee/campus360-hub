# GET /api/cerrado · POST /api/cerrado

Estado en memoria del flag `cerrado` (uso interno / pruebas). **No persiste** entre reinicios del servidor ni entre instancias en serverless.

## Rate limiting

No aplica.

## GET

Sin body ni params.

**200**:

```json
{ "cerrado": false }
```

## POST

**Body:**

```json
{ "cerrado": true }
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `cerrado` | boolean | Sí |

**200**:

```json
{ "cerrado": true }
```

**400**:

```json
{ "error": "cerrado must be a boolean" }
```

**500** — Error interno.

## Auth

No requiere Bearer.

## Nota

Actualmente no hay consumidores en el frontend; la ruta existe como endpoint de utilidad.
