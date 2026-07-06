## Solución de problemas

Guía ampliada con 13+ escenarios: [docs/troubleshooting.md](docs/troubleshooting.md).

Problemas frecuentes en desarrollo:

- **Redis vacío** — configura credenciales y ejecuta endpoints `*/refresh`
- **429 rate limit** — espera 60 s o reduce frecuencia de peticiones
- **Redirección a `/fuera-horario`** — usa `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open` en local
