# Stack tecnológico

Referencia alineada con `package.json` y el código del repositorio.

## Resumen

| Capa | Tecnología | Versión (lockfile) |
|------|------------|-------------------|
| **Lenguaje** | TypeScript | 5.x |
| **Framework** | [Next.js](https://nextjs.org) (App Router) | 16.2 |
| **UI** | React | 19.2 |
| **Estilos** | Tailwind CSS | 4.x |
| **Animaciones** | Framer Motion | 12.x |
| **Iconos** | Lucide React | 1.x |
| **Banderas** | react-world-flags | 1.x |
| **Datos / caché** | [Upstash Redis](https://upstash.com/docs/redis) (`@upstash/redis`) | 1.x |
| **Cola asíncrona** | [Upstash QStash](https://upstash.com/docs/qstash) (`@upstash/qstash`) | 2.x |
| **Integraciones** | Microsoft Power Automate (turnos, notificaciones, autogestión, horarios) | — |
| **Videollamadas** | Zoom (enlaces deep link y web) | — |
| **Gestor de paquetes** | pnpm | 9+ |
| **Linting** | ESLint 9 + eslint-config-next | 9.x / 16.2 |
| **Formato** | Prettier | 3.x |
| **Despliegue recomendado** | Vercel | — |

## Arquitectura de datos

No hay ORM ni base de datos relacional en el proyecto actual.

- **Turnos**: contador diario y estado en **Upstash Redis** (`lib/server/turno-counter.ts`).
- **Banner, categorías y horarios**: sincronizados desde **SharePoint** vía **Power Automate** hacia Redis; las APIs leen Redis con fallback a flujos de lectura.
- **Envío de turnos en producción**: **QStash** encola el POST a `/api/qstash-worker`, que reenvía a Power Automate. En localhost se llama al webhook de PA directamente.

## Backend

- **Route Handlers** en `app/api/` (REST).
- **Rate limiting** y validación en `lib/server/api-utilities.ts`.
- **Proxy de horario** en `proxy.ts` (redirección según estado de atención).

## Frontend

- **App Router** con grupo de rutas `(form)/` para el wizard multipaso.
- **Estado del formulario**: React Context (`contexts/FormContext.tsx`).
- **Diseño UTPL**: tokens en `app/globals.css` y componentes en `components/`.

## Lo que ya no forma parte del stack

| Tecnología | Estado |
|------------|--------|
| Prisma ORM | Eliminado — sin `prisma/` ni dependencia en `package.json` |
| Neon / PostgreSQL | Eliminado — sin `DATABASE_URL` en el código |
| NextAuth.js | Eliminado — autenticación de refresh vía `REFRESH_SECRET` (Bearer) |

Esquema histórico del portal de servicios: [archive/db-schema.md](./archive/db-schema.md).
