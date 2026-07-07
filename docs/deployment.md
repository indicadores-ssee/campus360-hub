# Despliegue — Campus360 Hub

Guía operativa para desplegar y mantener el canal virtual en producción.

**URL de producción:** https://campus360-hub-eight.vercel.app

Informe institucional (respaldo de URL): [informe-tecnico-canal-virtual.md](./informe-tecnico-canal-virtual.md).

---

## Vercel (recomendado)

### Primer despliegue

1. Importa el repositorio en [vercel.com](https://vercel.com): `https://github.com/JomiChCal/campus360-hub`
2. Framework preset: **Next.js**
3. Node.js version: **22.x** (Settings → General → Node.js Version)
4. Añade todas las variables de entorno (ver checklist abajo)
5. Despliega

### Despliegues posteriores

Cada push a la rama conectada (típicamente `main`) dispara un deploy automático. Los preview deploys se generan para pull requests.

---

## Checklist de variables de entorno en Vercel

| Variable | Producción | Notas |
|----------|------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://campus360-hub-eight.vercel.app` | Obligatoria para QStash |
| `UPSTASH_REDIS_REST_URL` | ✓ | O par `KV_REST_API_*` |
| `UPSTASH_REDIS_REST_TOKEN` | ✓ | |
| `QSTASH_TOKEN` | ✓ | Cola de turnos |
| `PA_CREAR_TURNO_URL` | ✓ | |
| `PA_CREAR_AUTOGESTION_URL` | ✓ | |
| `PA_CREAR_FUERA_HORARIO_URL` | ✓ | |
| `PA_ACTUALIZAR_TURNO_URL` | ✓ | Caducidad de turnos |
| `MICROSOFT_AVISOS_FLOW_URL` | ✓ | Fallback banner |
| `MICROSOFT_CATEGORIAS_FLOW_URL` | ✓ | Fallback categorías |
| `REFRESH_SECRET` | ✓ | Bearer para sync SharePoint |
| `ZOOM_MEETING_ID` | Opcional | Default en código si omitida |
| `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` | **No configurar** | Solo desarrollo local |

Referencia completa: [env-vars.md](./env-vars.md) y [`.env.example`](../.env.example).

---

## Post-despliegue

1. **Verificar horario real:** abre `https://campus360-hub-eight.vercel.app/api/schedule-config` y confirma que `state` refleja el horario de Ecuador.
2. **Sincronizar datos iniciales:** ejecuta los flujos Power Automate de sync o llama manualmente a `*/refresh` con `REFRESH_SECRET`.
3. **Probar wizard completo:** flujo estudiante → turno asignado → enlace Zoom.
4. **Confirmar QStash:** revisa en Upstash que la cola `turnos` procesa mensajes tras un turno de prueba.
5. **Actualizar Bearer en PA:** todos los flujos que llaman a `*/refresh` deben usar el mismo `REFRESH_SECRET` de Vercel.

---

## Dominio personalizado (opcional)

Si la UTPL asigna un dominio institucional (ej. `campus360.utpl.edu.ec`):

1. En Vercel → Settings → Domains → añade el dominio.
2. Configura los registros DNS según indique Vercel (CNAME o A).
3. Actualiza `NEXT_PUBLIC_APP_URL` al nuevo dominio.
4. Actualiza el Bearer y URLs en flujos Power Automate si referencian el dominio.
5. Actualiza [informe-tecnico-canal-virtual.md](./informe-tecnico-canal-virtual.md) con la nueva URL.

---

## Build local (verificación pre-deploy)

```bash
pnpm install
pnpm build
pnpm start
```

Abre http://localhost:3000. Requiere `.env.local` con las variables mínimas (ver [getting-started.md](./getting-started.md)).

---

## Infraestructura

| Componente | Proveedor | Notas |
|------------|-----------|-------|
| Hosting / CDN / SSL | Vercel | Serverless, sin servidor dedicado |
| Caché y turnos | Upstash Redis | Región según cuenta Upstash UTPL |
| Cola asíncrona | Upstash QStash | Solo producción |
| Sync de contenido | Power Automate + SharePoint | Triggers en listas SP |
| Videollamadas | Zoom | ID en `ZOOM_MEETING_ID` |

No existe `vercel.json` en el repositorio; el despliegue usa los defaults de Next.js en Vercel.

---

## Rollback

1. En Vercel → Deployments → selecciona un deployment anterior estable → **Promote to Production**.
2. Si el rollback incluye cambio de variables de entorno, revierte también en Settings → Environment Variables.

---

## Solución de problemas de despliegue

Ver [troubleshooting.md](./troubleshooting.md) — secciones «Build falla en Vercel», «Mock de horario activo en producción», «QStash no procesa turnos».

---

**Documentación relacionada:** [architecture.md](./architecture.md) · [prerequisites.md](./prerequisites.md)
