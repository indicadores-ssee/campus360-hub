# GET /api/avisos

Devuelve mensajes activos del banner en `/tipo`, con caché en Redis.

## Rate limiting

Sí — 30 req/min por IP.

## Params

Ninguno.

## Respuestas

**200**:

```json
{
  "messages": [
    {
      "title": "Renueva tu beca.",
      "message": "Renueva tu beca desde el 23 de abril al 3 de mayo.",
      "link": {
        "label": "ingresa aquí",
        "url": "https://becas.utpl.edu.ec/"
      }
    }
  ],
  "rotationIntervalMs": 20000
}
```

Si no hay avisos o falla la integración, `messages` es `[]`.

**429** — Rate limit.

Headers: `Cache-Control: no-store`.

## Auth

No requiere Bearer.
