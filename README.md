# Campus360 Hub

![Banner](public/images/banner.png)

Plataforma web de atención y gestión de turnos para la **Universidad Técnica Particular de Loja (UTPL)**. Permite a estudiantes, aspirantes y visitantes solicitar servicios académicos mediante un asistente paso a paso: autogestión con guías interactivas, asignación de turnos en horario de atención, o registro de solicitudes fuera de horario para contacto telefónico posterior.

## Tabla de contenidos

- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Primeros pasos](#primeros-pasos)
- [Arquitectura](#arquitectura)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [API REST](#api-rest)
- [Pruebas y calidad de código](#pruebas-y-calidad-de-código)
- [Despliegue](#despliegue)
- [Solución de problemas](#solución-de-problemas)
- [Documentación técnica](#documentación-técnica)
- [Contribuir](#contribuir)

---

## Características principales

- **Asistente multipaso (wizard)** con 5 etapas: tipo de usuario, datos personales, categoría de servicio, detalle y resultado.
- **Autogestión con guías**: muchos trámites se resuelven con contenido guiado sin necesidad de asesor.
- **Asignación de turnos** en horario laboral, con numeración diaria (`001`, `002`, …) y reintentos ante condiciones de carrera.
- **Modo fuera de horario**: redirección automática cuando el centro está cerrado o en almuerzo; el usuario puede agendar una franja de llamada.
- **Integración con Zoom**: enlaces personalizados por turno para atención virtual.
- **Horario de atención Ecuador** (`America/Guayaquil`): Horario Normal lun–vie; Horario Extendido puede cubrir lun–dom cuando está habilitado.
- **Rate limiting** en APIs (30 peticiones/minuto por IP) y sanitización de inputs.
- **Diseño institucional UTPL** con Tailwind CSS, animaciones Framer Motion y advertencia en dispositivos móviles.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Lenguaje** | TypeScript 5 |
| **Framework** | [Next.js](https://nextjs.org) 16.2 (App Router) |
| **UI** | React 19, Tailwind CSS 4, Framer Motion 12 |
| **Iconos** | Lucide React |
| **Banderas** | react-world-flags |
| **Base de datos** | Neon PostgreSQL |
| **Autenticación** | NextAuth.js |
| **Backend / datos** | Route Handlers de Next.js + Prisma ORM |
| **Integraciones** | Microsoft Power Automate (turnos, notificaciones, autogestión) |
| **Videollamadas** | Zoom (enlaces deep link y web) |
| **Gestor de paquetes** | pnpm |
| **Linting / formato** | ESLint 9, Prettier 3 |
| **Despliegue recomendado** | Vercel (plataforma nativa para Next.js) |

---

## Base de datos servicios UTPL portal servicios

### Relaciones (cardinalidad)

- `StudentType` 1:N `ServiceCategory`
- `ServiceCategory` 1:N `Service`
- `Service` 1:N `ServiceRequirement`
- `Service` 1:N `ServiceRequirementTab`
- `ServiceRequirementTab` 1:N `ServiceRequirementItem`
- `Service` 1:N `ServicePeriod`
- `ServicePeriod` 1:N `ServicePeriodModality`
- `Service` 1:N `ServiceGuide`
- `Service` 1:N `ServiceExtraField`

### Tablas y campos

**Tabla `StudentType`**
- `id`: integer, PK, autoincrement
- `code`: string, unique
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

**Tabla `ServiceCategory`**
- `id`: integer, PK, autoincrement
- `studentTypeId`: integer, FK -> `StudentType.id`
- `slug`: string
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

**Tabla `Service`**
- `id`: integer, PK, autoincrement
- `categoryId`: integer, FK -> `ServiceCategory.id`
- `sourceKey`: string, unique
- `title`: string
- `slug`: string
- `description`: string, nullable
- `status`: enum (`draft`, `published`, `needs_review`)
- `createdAt`: datetime
- `updatedAt`: datetime

**Tabla `ServiceRequirement`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `text`: string
- `sortOrder`: integer

**Tabla `ServiceRequirementTab`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `tabName`: string
- `title`: string, nullable
- `sortOrder`: integer

**Tabla `ServicePeriod`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `name`: string
- `sortOrder`: integer

**Tabla `ServicePeriodModality`**
- `id`: integer, PK, autoincrement
- `periodId`: integer, FK -> `ServicePeriod.id`
- `modality`: string
- `requestWindow`: string, nullable
- `responseWindow`: string, nullable
- `enabledFrom`: date, nullable
- `enabledTo`: date, nullable
- `sortOrder`: integer

**Tabla `ServiceGuide`**
- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `label`: string
- `url`: string
- `sortOrder`: integer

---

## Requisitos previos

- **Node.js** 20 o superior
- **pnpm** 9+ (recomendado; el proyecto usa `pnpm-lock.yaml`)
- Una cuenta de **Neon PostgreSQL** (o PostgreSQL compatible)
- (Opcional) ID de reunión **Zoom** para atención virtual

---

## Primeros pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/JomiChCal/campus360-hub.git
cd campus360-hub
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Variables necesarias:

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/campus360

# Power Automate webhooks
PA_CREAR_TURNO_URL=https://prod-xxx.logic.azure.com:443/...
PA_CREAR_AUTOGESTION_URL=https://prod-xxx.logic.azure.com:443/...
PA_CREAR_FUERA_HORARIO_URL=https://prod-xxx.logic.azure.com:443/...

# Banner / avisos (SharePoint vía Power Automate)
MICROSOFT_AVISOS_FLOW_URL=https://prod-xxx.logic.azure.com:443/...

# Categorías del wizard (SharePoint vía Power Automate, lectura fallback)
MICROSOFT_CATEGORIAS_FLOW_URL=https://prod-xxx.logic.azure.com:443/...

# Secret compartido para POST refresh (banner, categorías y horarios)
REFRESH_SECRET=your_long_random_secret

# Upstash Redis (turnos + caché de avisos y categorías)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Zoom
NEXT_PUBLIC_ZOOM_MEETING_ID=89419717339
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open

# NextAuth
AUTH_SECRET=your_auth_secret_here
AUTH_URL=http://localhost:3000
```

### 4. Inicializar base de datos (temporalmente deshabilitada)

> **Nota**: La base de datos está temporalmente fuera de servicio. Una vez restaurada, ejecuta:

```bash
pnpm prisma db push
pnpm prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige según el horario:

- **Horario abierto** → `/tipo` (inicio del wizard)
- **Almuerzo o fuera de horario** → `/fuera-horario`

Para probar sin depender del reloj:

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```

---

## Arquitectura

### Estructura de directorios

```
campus360-hub/
├── app/                          # App Router de Next.js
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Redirección según horario
│   ├── globals.css               # Estilos globales
│   ├── fuera-horario/            # Pantalla fuera de horario
│   ├── (form)/                   # Grupo de rutas del wizard
│   │   ├── layout.tsx            # Shell del formulario
│   │   ├── tipo/                 # Paso 1: estudiante / aspirante
│   │   ├── datos/                # Paso 2: datos personales
│   │   ├── servicio/             # Paso 3: catálogo de servicios
│   │   ├── detalle/              # Paso 4: texto libre
│   │   └── resultado/            # Paso 5: turno o autogestión
│   └── api/                      # Route Handlers
├── components/
│   ├── wizard/                   # Componentes del wizard
│   ├── ui/                       # shadcn/ui components
│   └── ...
├── contexts/
│   └── FormContext.tsx           # Estado global del wizard
├── lib/
│   ├── power-automate.ts         # Integración Power Automate
│   ├── business-hours.ts         # Lógica horario Ecuador
│   ├── api-utilities.ts          # Rate limit, validación
│   └── validation.ts             # Validación de formularios
├── prisma/
│   └── schema.prisma             # Modelos de datos
└── tailwind.config.ts            # Paleta de colores UTPL
```

### Flujo del usuario

```mermaid
flowchart TD
    A["/ (inicio)"] --> B{¿Horario abierto?}
    B -->|Sí| C["/tipo"]
    B -->|No| D["/fuera-horario"]
    D -->|Agendar llamada| E["/tipo?mode=fuera-horario"]
    C --> F["/datos"]
    F --> G["/servicio"]
    G --> H{¿Servicio GUIA o TURNO?}
    H -->|GUIA| I["Modal guía"]
    I -->|Resuelto| J["/resultado (completed)"]
    I -->|Necesita asesor| K["Asignar turno"]
    H -->|TURNO| L["/detalle"]
    L --> K
    K --> M["/resultado"]
    M --> N{Estado}
    N -->|turno-assigned| O["Número de turno + Zoom"]
    N -->|fuera-horario| P["Confirmación llamada"]
    N -->|completed| Q["Autogestión exitosa"]
```

### Horario de atención

Zona horaria: **America/Guayaquil**. Configuración dinámica desde SharePoint (`Config-horarios`) vía `POST /api/refresh-config`.

| Estado | Condición |
|--------|-----------|
| `open` | Dentro de franja activa hasta **cierre − 10 min** |
| `closing-soon` | Últimos 10 min antes del cierre PA (modal en wizard) |
| `lunch` | Hueco entre mañana y tarde (solo Horario Normal dual) |
| `after-hours` | Fuera de franja, fin de semana sin Extendido habilitado, o ambos perfiles deshabilitados |

Perfiles:

- **Horario Normal** (dual): solo **lunes a viernes**. Si ambos perfiles están `habilitado=Si`, gana Normal entre semana.
- **Horario Extendido** (continuo o dual): puede operar **lunes a domingo** cuando `habilitado=Si`. En **sábado y domingo** solo aplica Extendido; Normal no se evalúa en fin de semana.

Para abrir solo fines de semana: habilitar Extendido y mantener Normal activo entre semana. Para un periodo extendido de toda la semana: habilitar Extendido y deshabilitar Normal en Power Apps.

El `middleware.ts` redirige a `/fuera-horario` en `lunch` y `after-hours`. El wizard permite `open` y `closing-soon` (o `?mode=fuera-horario`).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Compilación de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint con correcciones |
| `pnpm format` | Prettier |
| `pnpm prisma` | Prisma CLI |

---

## API REST

Todas las rutas aplican **rate limiting** (30 req/min por IP) y validación.

### `PUT /api/turno` — Asignar turno

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "cedula": "1234567890",
  "email": "juan@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Matrícula",
  "modalidad": "Presencial",
  "pais": "Ecuador"
}
```

### `POST /api/autogestion` — Registrar autogestión

```json
{
  "nombres": "María López",
  "cedula": "1234567890",
  "email": "maria@ejemplo.com",
  "servicio": "Horarios de clases",
  "resultado": "ÉXITO",
  "pais": "Ecuador"
}
```

### `POST /api/fuera-horario` — Solicitar llamada

```json
{
  "horaContactoPreferida": "09:00 - 10:00",
  "nombres": "Carlos Ruiz",
  "cedula": "1234567890",
  "email": "carlos@ejemplo.com",
  "telefono": "0991234567",
  "servicio": "Información General",
  "pais": "Ecuador"
}
```

### `GET /api/avisos` — Avisos del banner en `/tipo`

Devuelve mensajes activos desde SharePoint (vía Power Automate), con caché compartida en Redis.

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

Si no hay avisos activos o falla la integración, `messages` es un array vacío y el banner no se muestra.

### `POST /api/avisos/refresh` — Sincronizar avisos desde Power Automate

Actualiza Redis al crear o modificar items en SharePoint (`Bannerconfig`). Requiere autenticación Bearer.

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <REFRESH_SECRET>
```

**Body:** array JSON con el mismo shape que devuelve el flujo de lectura de SharePoint (`body('Obtener_elementos')?['value']`).

**Respuesta:**

```json
{ "success": true, "count": 2 }
```

### `GET /api/categorias` — Categorías del wizard en `/servicio`

Query param obligatorio: `audience=continuo` (Ya soy UTPL +) o `audience=nuevo` (Quiero ser UTPL +).

```json
{
  "categories": [
    {
      "id": "matriculas-y-tramites",
      "title": "Matrículas y trámites",
      "description": "Renovación, inscripción y procesos administrativos",
      "iconLabel": "Libro – matrículas y trámites",
      "studentType": "continuo"
    }
  ]
}
```

Si Redis no tiene datos, se usa `MICROSOFT_CATEGORIAS_FLOW_URL` como fallback (TTL 10 min). Si todo falla, `categories` es `[]`.

### `POST /api/categorias/refresh` — Sincronizar categorías desde Power Automate

Igual que avisos: Bearer `REFRESH_SECRET`, body = array de la lista SharePoint `CategoriasWizard`.

**Flujo Power Automate (sync):**

1. Disparador: *Cuando se crea o modifica un elemento* en `Bannerconfig` o `CategoriasWizard`.
2. Acción: *Obtener elementos* de la misma lista.
3. Acción HTTP POST a `https://<dominio>/api/avisos/refresh` o `/api/categorias/refresh` con los headers anteriores y body `body('Obtener_elementos')?['value']`.

Los cambios son visibles en segundos tras el POST refresh y una recarga de página (GET lee Redis).

**Pruebas locales:**

```bash
curl -X POST "http://localhost:3000/api/avisos/refresh" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '[{"Title":"Test","field_1":"Mensaje","activar":{"Value":"Activado"}}]'

curl "http://localhost:3000/api/categorias?audience=continuo"

curl -X POST "http://localhost:3000/api/categorias/refresh" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '[{"Title":"Pagos","Activo":{"Value":"Activado"},"TipoEstudiante":{"Value":"Continuo"},"Icono":{"Value":"Dinero – pagos y becas"}}]'
```

### `GET /api/schedule-config` — Configuración de horarios

Devuelve horarios almacenados en Redis y el estado actual (`open`, `closing-soon`, `lunch`, `after-hours`).

```json
{
  "horarios": {
    "Horario Normal": {
      "horaAperturaM": "08:00",
      "horaCierreM": "13:00",
      "horarioAperturaT": "15:00",
      "horarioCierreT": "18:00",
      "modo": "dual",
      "habilitado": true
    }
  },
  "resolved": { "hasActiveSchedule": true, "titulo": "Horario Normal" },
  "state": "open",
  "updatedAt": "2026-06-19T12:00:00.000Z"
}
```

### `POST /api/refresh-config` — Sincronizar horarios desde Power Automate

Upsert de **una fila** por request (trigger de SharePoint `Config-horarios`).

**Headers:** `Content-Type: application/json`, `Authorization: Bearer <REFRESH_SECRET>`

**Body (campos del trigger):**

```json
{
  "Titulo": "Horario Normal",
  "HoraAperturaM": "08:00",
  "HoraCierreM": "13:00",
  "HorarioAperturaT": "15:00",
  "HorarioCierreT": "18:00",
  "habilitado": "Si"
}
```

**Prueba local:**

```bash
curl -X POST "http://localhost:3000/api/refresh-config" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"Titulo":"Horario Normal","HoraAperturaM":"08:00","HoraCierreM":"13:00","HorarioAperturaT":"15:00","HorarioCierreT":"18:00","habilitado":"Si"}'

curl "http://localhost:3000/api/schedule-config"
```

**Power Automate:** actualizar Bearer de `campus360-pa-horario-2026` a `REFRESH_SECRET` (mismo que banner/categorías).

En producción, quitar `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open` para que aplique el horario real.

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

---

## Despliegue

### Vercel (recomendado)

1. Importa el repositorio en [vercel.com](https://vercel.com)
2. Framework preset: **Next.js**
3. Añade variables de entorno
4. Despliega

### Build local

```bash
pnpm build
pnpm start
```

---

## Solución de problemas

### Error de conexión a base de datos

**Causa:** `DATABASE_URL` no configurada o Neon fuera de servicio.

**Solución:** Verifica `.env.local` yreinicia `pnpm dev`.

### Rate limit excedido (429)

**Causa:** Más de 30 peticiones/minuto desde la misma IP.

**Solución:** Espera un minuto o ajusta en `lib/api-utilities.ts`.

### Wizard redirige siempre a `/fuera-horario`

**Causa:** Fuera de horario o `NEXT_PUBLIC_MOCK_BUSINESS_HOURS` no está en `open`.

**Solución:**

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```

---

## Documentación técnica

Documentación ampliada en la carpeta [`docs/`](docs/tech-index.md):

| Documento | Para quién |
|-----------|------------|
| [informe-tecnico-canal-virtual.md](docs/informe-tecnico-canal-virtual.md) | UTPL — informe institucional (plataforma, alojamiento, URL) |
| [architecture.md](docs/architecture.md) | Desarrolladores — estructura y flujos |
| [api/](docs/api/README.md) | Desarrolladores — referencia REST |
| [troubleshooting.md](docs/troubleshooting.md) | Soporte — guía ampliada de problemas |

Índice completo: [docs/tech-index.md](docs/tech-index.md).

---

## Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Asegúrate de que `pnpm lint` pase
4. Abre un Pull Request

---

## Licencia

Proyecto privado de la UTPL. Consulta con el equipo propietario antes de redistribuir.

---

**Universidad Técnica Particular de Loja** — *decide ser +*