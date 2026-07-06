# Solución de problemas — Campus360 Hub

Guía organizada por síntoma para desarrolladores y soporte técnico. Para el contexto institucional del canal, ver [informe-tecnico-canal-virtual.md](./informe-tecnico-canal-virtual.md).

---

## Redis no disponible o datos vacíos

**Síntomas:** Horarios por defecto incorrectos, banner sin mensajes, categorías vacías en `/servicio`, errores 500 en APIs que leen Redis.

**Causa:** `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` no configurados, credenciales inválidas, o caché sin sincronizar desde Power Automate.

**Solución:**

1. Verifica las variables en `.env.local` (local) o en el panel de Vercel (producción).
2. Ejecuta los endpoints de refresh con `REFRESH_SECRET`:
   ```bash
   curl -X POST "https://campus360-hub-eight.vercel.app/api/refresh-config" \
     -H "Authorization: Bearer $REFRESH_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"Titulo":"Horario Normal","HoraAperturaM":"08:00","HoraCierreM":"13:00","HorarioAperturaT":"15:00","HorarioCierreT":"18:00","habilitado":"Si"}'
   ```
3. Reinicia el servidor de desarrollo (`pnpm dev`) o redeploy en Vercel.

**Prevención:** Configura flujos Power Automate con trigger en SharePoint para sincronizar automáticamente al modificar listas.

**Escalar si:** Redis responde pero los datos no persisten tras refresh exitoso — revisar logs de Upstash y permisos del token.

---

## Banner no muestra avisos

**Síntomas:** La página `/tipo` carga sin carousel de avisos; `GET /api/avisos` devuelve `messages: []`.

**Causa:** Redis vacío para `campus360:banner-avisos`, elementos inactivos en SharePoint (`Bannerconfig`), o fallo del flujo `MICROSOFT_AVISOS_FLOW_URL`.

**Solución:**

1. Consulta `GET /api/avisos` y verifica la respuesta.
2. Ejecuta `POST /api/avisos/refresh` con el payload de SharePoint.
3. Confirma que los items tienen `activar` en estado «Activado».

**Prevención:** Mantener el flujo PA de sync activo al crear o modificar elementos en `Bannerconfig`.

**Escalar si:** El refresh responde `success: true` pero `count: 0` — revisar mapeo en `lib/server/banner-mapper.ts` y formato del body PA.

---

## Categorías vacías en `/servicio`

**Síntomas:** El paso 3 del wizard no muestra tarjetas de categoría; `GET /api/categorias?audience=continuo` devuelve `categories: []`.

**Causa:** Redis sin datos para `campus360:categorias-wizard`, fallback a Power Automate fallido, o categorías inactivas en SharePoint (`CategoriasWizard`).

**Solución:**

1. Verifica el query param: `audience=continuo` (Ya soy UTPL +) o `audience=nuevo` (Quiero ser UTPL +).
2. Ejecuta `POST /api/categorias/refresh` con datos de SharePoint.
3. Confirma que `Activo` está en «Activado» y `TipoEstudiante` coincide con la audiencia.

**Prevención:** Sincronizar categorías al publicar cambios en SharePoint vía flujo PA.

**Escalar si:** Fallback PA también falla — revisar `MICROSOFT_CATEGORIAS_FLOW_URL` y timeout (15 s en `lib/server/power-automate.ts`).

---

## Wizard redirige siempre a `/fuera-horario`

**Síntomas:** Al abrir la URL raíz o cualquier paso del wizard, el usuario termina en `/fuera-horario`.

**Causa:** Fuera de horario real según `America/Guayaquil`, perfiles deshabilitados en SharePoint, o en desarrollo `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` no está en `open`.

**Solución:**

1. Consulta `GET /api/schedule-config` y revisa el campo `state`.
2. En desarrollo local:
   ```env
   NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
   ```
3. En producción, verifica que al menos un perfil (`Horario Normal` o `Horario Extendido`) esté `habilitado: true` en Redis.

**Prevención:** No usar `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` en Vercel producción.

**Escalar si:** `state` es `open` pero el proxy sigue redirigiendo — revisar `proxy.ts` y caché del navegador (`Cache-Control: no-store`).

---

## Turno no se asigna (403 Forbidden)

**Síntomas:** Al enviar el formulario en `/detalle`, la API responde 403; no se genera número de turno.

**Causa:** El estado del horario no es `open`. En `closing-soon` el wizard sigue activo pero **no se aceptan turnos nuevos** (`canAcceptNewTurnos()` en `lib/schedule-core.ts`).

**Solución:**

1. Verifica `GET /api/schedule-config` → `state` debe ser `open`.
2. Si es `closing-soon`, espera al siguiente día hábil o ajusta horarios en SharePoint.
3. En desarrollo, usa `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open`.

**Prevención:** Ajustar horarios con margen suficiente antes del cierre; el sistema bloquea turnos 10 minutos antes del cierre exacto.

**Escalar si:** `state` es `open` pero PUT `/api/turno` sigue devolviendo 403 — revisar lógica en `app/api/turno/route.ts`.

---

## QStash no procesa turnos en producción

**Síntomas:** El usuario completa el wizard pero el turno no llega a Power Automate; no hay registro en el backend institucional.

**Causa:** `QSTASH_TOKEN` no configurado, `NEXT_PUBLIC_APP_URL` incorrecta, o el worker `/api/qstash-worker` no es accesible desde Upstash.

**Solución:**

1. En Vercel, confirma:
   ```env
   NEXT_PUBLIC_APP_URL=https://campus360-hub-eight.vercel.app
   QSTASH_TOKEN=<token válido>
   ```
2. Verifica en el dashboard de Upstash QStash que los mensajes de la cola `turnos` no están en dead letter.
3. Revisa logs de Vercel para `/api/qstash-worker`.

**Prevención:** Tras cambiar dominio, actualizar `NEXT_PUBLIC_APP_URL` antes de desplegar.

**Escalar si:** QStash entrega pero PA no recibe — revisar `PA_CREAR_TURNO_URL` y logs del flujo Power Automate.

---

## Power Automate timeout

**Síntomas:** Error 502/504 en APIs que llaman a PA; turnos o registros no se crean; logs muestran timeout.

**Causa:** El webhook de Power Automate tarda más de 20 s (turnos) o 15 s (banner/categorías).

**Solución:**

1. Revisa el historial de ejecuciones del flujo PA en el portal de Power Automate.
2. Optimiza acciones lentas (consultas SharePoint, bucles).
3. Para turnos en producción, QStash desacopla la llamada — verifica que la cola esté activa.

**Prevención:** Mantener flujos PA simples; evitar acciones síncronas pesadas en el camino crítico.

**Escalar si:** Timeouts persistentes en flujos previamente estables — contactar administrador de Power Platform UTPL.

---

## Refresh devuelve 401 Unauthorized

**Síntomas:** `POST /api/avisos/refresh`, `/api/categorias/refresh` o `/api/refresh-config` responden 401.

**Causa:** Header `Authorization: Bearer <REFRESH_SECRET>` ausente, incorrecto o no coincide con la variable de entorno del servidor.

**Solución:**

1. Verifica que el Bearer en Power Automate coincide exactamente con `REFRESH_SECRET` en Vercel.
2. No incluyas comillas ni espacios extra en el token.
3. Usa comparación timing-safe — el secret es case-sensitive.

**Prevención:** Rotar `REFRESH_SECRET` en Vercel y en todos los flujos PA simultáneamente.

**Escalar si:** 401 persiste con secret verificado — revisar `lib/server/refresh-auth.ts`.

---

## Zoom link no abre o reunión incorrecta

**Síntomas:** El enlace de videollamada en `/resultado` no abre Zoom o lleva a una reunión distinta.

**Causa:** `ZOOM_MEETING_ID` mal configurado o ausente (usa default del código).

**Solución:**

1. Verifica `ZOOM_MEETING_ID` en variables de entorno de Vercel.
2. Confirma que el ID corresponde a la reunión activa del centro de atención.
3. Prueba el enlace web generado: `https://zoom.us/j/{ID}?uname=...`

**Prevención:** Documentar el ID de reunión oficial y actualizarlo al cambiar de sala virtual.

**Escalar si:** El ID es correcto pero Zoom rechaza la conexión — revisar configuración de la reunión en Zoom Admin.

---

## Build falla en Vercel

**Síntomas:** El deploy en Vercel falla durante `pnpm build`.

**Causa:** Versión de Node incompatible. El proyecto requiere **Node.js 22.x** (`engines` en `package.json`).

**Solución:**

1. En Vercel → Settings → General → Node.js Version → selecciona **22.x**.
2. Ejecuta `pnpm build` localmente para reproducir el error.
3. Corrige errores de TypeScript o ESLint antes de pushear.

**Prevención:** Alinear la versión local de Node con `engines` del proyecto.

**Escalar si:** Build local pasa pero Vercel falla — revisar logs completos y variables de entorno requeridas en build time.

---

## Mock de horario activo en producción

**Síntomas:** El sitio en producción ignora el horario real de Ecuador; siempre muestra estado `open` (u otro mock).

**Causa:** `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` definida en variables de Vercel. El mock solo debería usarse en desarrollo (`isScheduleMockEnabled()` verifica `NODE_ENV` y `VERCEL_ENV`).

**Solución:**

1. Elimina `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` de las variables de entorno de producción en Vercel.
2. Redeploy el proyecto.
3. Verifica `GET /api/schedule-config` → `state` refleja el horario real.

**Prevención:** Usar `.env.local` para desarrollo; nunca copiar variables de mock a Vercel producción.

**Escalar si:** Sin mock, el estado sigue siendo incorrecto — revisar datos en SharePoint y Redis.

---

## Rate limit excedido (429)

**Síntomas:** Las APIs responden HTTP 429; el wizard no puede enviar formularios.

**Causa:** Más de 30 peticiones por minuto desde la misma IP (`lib/server/api-utilities.ts`).

**Solución:**

1. Espera 60 segundos y reintenta.
2. En pruebas automatizadas, reduce la frecuencia de peticiones o usa IPs distintas.
3. Para desarrollo local intensivo, ajusta temporalmente el límite en `api-utilities.ts`.

**Prevención:** No ejecutar scripts de carga contra producción sin coordinación.

**Escalar si:** 429 en tráfico normal de un solo usuario — revisar polling excesivo en `BusinessHoursWatcher` (cada 30 s es normal).

---

## Power Automate no sincroniza tras cambio en SharePoint

**Síntomas:** Se modifica un elemento en SharePoint pero el sitio no refleja el cambio tras recargar.

**Causa:** Flujo PA de sync deshabilitado, Bearer incorrecto, o body del POST no coincide con el formato esperado.

**Solución:**

1. Revisa el historial del flujo PA (trigger + HTTP POST a `*/refresh`).
2. Confirma que el body es `body('Obtener_elementos')?['value']` del flujo.
3. Ejecuta un refresh manual con `curl` para aislar si el problema es PA o la app.

**Prevención:** Probar flujos PA en entorno de staging antes de producción.

**Escalar si:** Refresh manual funciona pero el trigger PA no — revisar permisos del conector SharePoint en Power Automate.

---

## Datos personales no llegan al backend institucional

**Síntomas:** El usuario completa el wizard pero no hay registro en el sistema de atención UTPL.

**Causa:** Webhook PA incorrecto, flujo PA con error, o timeout en la cadena QStash → worker → PA.

**Solución:**

1. Revisa logs de Vercel para la ruta correspondiente (`/api/turno`, `/api/fuera-horario`, `/api/autogestion`).
2. Verifica la URL del webhook en la variable `PA_*` correspondiente.
3. Consulta el historial de ejecuciones del flujo PA en Power Platform.

**Prevención:** Monitorear ejecuciones fallidas de flujos PA semanalmente.

**Escalar si:** La API responde 200 pero PA no registra — escalar al administrador de Power Platform con el `run id` del flujo.

---

## Índice rápido por código HTTP

| Código | Causas frecuentes |
|--------|-------------------|
| **401** | `REFRESH_SECRET` incorrecto en endpoints refresh |
| **403** | Turno fuera de horario (`state` ≠ `open`) |
| **429** | Rate limit (30 req/min/IP) |
| **500** | Redis no disponible, error interno |
| **502/504** | Timeout de Power Automate |

---

**Documentación relacionada:** [deployment.md](./deployment.md) · [api/README.md](./api/README.md) · [architecture.md](./architecture.md)
