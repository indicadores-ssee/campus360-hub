# Requisitos previos

## Herramientas locales

| Requisito | Versión | Notas |
|-----------|---------|-------|
| **Node.js** | **22.x** | Definido en `package.json` → `engines.node` |
| **pnpm** | **9+** | El proyecto usa `pnpm-lock.yaml` |

Verificar:

```bash
node -v   # debe ser v22.x
pnpm -v   # debe ser >= 9
```

## Cuentas y servicios externos

| Servicio | Uso |
|----------|-----|
| **Upstash Redis** | Turnos, caché de avisos, categorías y horarios |
| **Upstash QStash** | Cola de envío de turnos a Power Automate (producción) |
| **Microsoft Power Automate** | Webhooks para crear turnos, autogestión, fuera de horario, lectura de SharePoint |
| **Zoom** | ID de reunión para enlaces de atención virtual (opcional en desarrollo) |
| **Vercel** | Despliegue recomendado (opcional para desarrollo local) |

## Variables de entorno

Crea `.env.local` en la raíz del proyecto.

### Power Automate

```env
PA_CREAR_TURNO_URL=https://prod-xxx.logic.azure.com:443/...
PA_CREAR_AUTOGESTION_URL=https://prod-xxx.logic.azure.com:443/...
PA_CREAR_FUERA_HORARIO_URL=https://prod-xxx.logic.azure.com:443/...
PA_ACTUALIZAR_TURNO_URL=https://prod-xxx.logic.azure.com:443/...   # opcional, caducidad de turnos

MICROSOFT_AVISOS_FLOW_URL=https://prod-xxx.logic.azure.com:443/...
MICROSOFT_CATEGORIAS_FLOW_URL=https://prod-xxx.logic.azure.com:443/...
```

### Autenticación de refresh (SharePoint → Redis)

```env
REFRESH_SECRET=your_long_random_secret
```

Usado en `POST /api/avisos/refresh`, `/api/categorias/refresh` y `/api/refresh-config` con header `Authorization: Bearer <REFRESH_SECRET>`.

### Upstash Redis

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

En Vercel KV también se aceptan `KV_REST_API_URL` y `KV_REST_API_TOKEN`.

### Upstash QStash

```env
QSTASH_TOKEN=xxx
```

Requerido en producción para encolar turnos. En localhost el sistema llama a Power Automate directamente.

### Zoom

```env
ZOOM_MEETING_ID=89419717339
```

### Desarrollo y despliegue

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open` fuerza horario abierto sin depender del reloj.
- `NEXT_PUBLIC_APP_URL` base URL para callbacks de QStash (por defecto `http://localhost:3000`).

## Instalación rápida

```bash
git clone https://github.com/JomiChCal/campus360-hub.git
cd campus360-hub
pnpm install
# Configurar .env.local según las secciones anteriores
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).
