# API REST — Campus360 Hub

Referencia por endpoint. Visión general (diagrama, auth, convenciones): [overview.md](./overview.md).

La copia canónica para desarrolladores también está en [README.md](../../README.md#api-rest).

| Endpoint | Método | Auth | Doc |
|----------|--------|------|-----|
| `/api/turno` | PUT | — | [turno.md](./turno.md) |
| `/api/turno/caducar` | POST | — | [turno-caducar.md](./turno-caducar.md) |
| `/api/qstash-worker` | POST | QStash* | [qstash-worker.md](./qstash-worker.md) |
| `/api/autogestion` | POST | — | [autogestion.md](./autogestion.md) |
| `/api/fuera-horario` | POST | — | [fuera-horario.md](./fuera-horario.md) |
| `/api/avisos` | GET | — | [avisos.md](./avisos.md) |
| `/api/avisos/refresh` | POST | Bearer `REFRESH_SECRET` | [avisos-refresh.md](./avisos-refresh.md) |
| `/api/categorias` | GET | — | [categorias.md](./categorias.md) |
| `/api/categorias/refresh` | POST | Bearer `REFRESH_SECRET` | [categorias-refresh.md](./categorias-refresh.md) |
| `/api/schedule-config` | GET | — | [schedule-config.md](./schedule-config.md) |
| `/api/refresh-config` | POST | Bearer `REFRESH_SECRET` | [refresh-config.md](./refresh-config.md) |
| `/api/cerrado` | GET, POST | — | [cerrado.md](./cerrado.md) |

\* Worker interno; no expuesto al cliente.

**Rate limiting:** 30 req/min por IP en la mayoría de rutas públicas. Excepciones: `turno/caducar`, `cerrado`, `qstash-worker`.
