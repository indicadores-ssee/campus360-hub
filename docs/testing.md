## Pruebas y calidad de código

```bash
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format
```

### Verificación manual

1. Flujo completo **estudiante** con servicio `GUIA`
2. Flujo **estudiante** con servicio `TURNO` → número + enlace Zoom
3. Flujo **aspirante** (menos pasos)
4. Fuera de horario → redirección a `/fuera-horario`
5. Agendar llamada → wizard con `?mode=fuera-horario`
