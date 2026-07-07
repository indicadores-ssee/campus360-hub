## Variables de entorno

Plantilla con placeholders: [`.env.example`](.env.example).

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Sí* | URL REST de Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Sí* | Token REST de Upstash Redis |
| `KV_REST_API_URL` | Alt. | Alias Vercel KV (en lugar de `UPSTASH_REDIS_REST_URL`) |
| `KV_REST_API_TOKEN` | Alt. | Alias Vercel KV (en lugar de `UPSTASH_REDIS_REST_TOKEN`) |
| `PA_CREAR_TURNO_URL` | Sí | Webhook PA: crear turno |
| `PA_CREAR_AUTOGESTION_URL` | Sí | Webhook PA: autogestión |
| `PA_CREAR_FUERA_HORARIO_URL` | Sí | Webhook PA: solicitud fuera de horario |
| `PA_ACTUALIZAR_TURNO_URL` | Sí | Webhook PA: caducar/actualizar turno |
| `MICROSOFT_AVISOS_FLOW_URL` | Sí | Flujo PA: lectura de avisos (banner) |
| `MICROSOFT_CATEGORIAS_FLOW_URL` | Sí | Flujo PA: categorías del wizard (fallback) |
| `REFRESH_SECRET` | Sí | Bearer para `POST /api/*/refresh` |
| `QSTASH_TOKEN` | Prod. | Cola de turnos (no necesario en `localhost`) |
| `NEXT_PUBLIC_APP_URL` | Prod. | URL pública de la app (default: `http://localhost:3000`) |
| `ZOOM_MEETING_ID` | No | ID de reunión Zoom (default en código: `89419717339`) |
| `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` | Dev. | `open` \| `lunch` \| `after-hours` — solo desarrollo |

\* Redis: basta con el par Upstash **o** el par KV.

Variables de plataforma (no configurar manualmente): `NODE_ENV`, `VERCEL_ENV`.
