# Esquema histórico — servicios UTPL (portal servicios)

> **Archivado.** Este esquema describía un modelo Prisma/PostgreSQL que **no está presente** en el repositorio actual. El catálogo de servicios y categorías del wizard se obtiene vía **Power Automate + SharePoint**, con caché en **Upstash Redis**. Se conserva este documento solo como referencia histórica.

## Relaciones (cardinalidad)

- `StudentType` 1:N `ServiceCategory`
- `ServiceCategory` 1:N `Service`
- `Service` 1:N `ServiceRequirement`
- `Service` 1:N `ServiceRequirementTab`
- `ServiceRequirementTab` 1:N `ServiceRequirementItem`
- `Service` 1:N `ServicePeriod`
- `ServicePeriod` 1:N `ServicePeriodModality`
- `Service` 1:N `ServiceGuide`
- `Service` 1:N `ServiceExtraField`

## Tablas y campos

### Tabla `StudentType`

- `id`: integer, PK, autoincrement
- `code`: string, unique
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

### Tabla `ServiceCategory`

- `id`: integer, PK, autoincrement
- `studentTypeId`: integer, FK -> `StudentType.id`
- `slug`: string
- `name`: string
- `description`: string, nullable
- `sortOrder`: integer
- `isActive`: boolean
- `createdAt`: datetime
- `updatedAt`: datetime

### Tabla `Service`

- `id`: integer, PK, autoincrement
- `categoryId`: integer, FK -> `ServiceCategory.id`
- `sourceKey`: string, unique
- `title`: string
- `slug`: string
- `description`: string, nullable
- `status`: enum (`draft`, `published`, `needs_review`)
- `createdAt`: datetime
- `updatedAt`: datetime

### Tabla `ServiceRequirement`

- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `text`: string
- `sortOrder`: integer

### Tabla `ServiceRequirementTab`

- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `tabName`: string
- `title`: string, nullable
- `sortOrder`: integer

### Tabla `ServicePeriod`

- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `name`: string
- `sortOrder`: integer

### Tabla `ServicePeriodModality`

- `id`: integer, PK, autoincrement
- `periodId`: integer, FK -> `ServicePeriod.id`
- `modality`: string
- `requestWindow`: string, nullable
- `responseWindow`: string, nullable
- `enabledFrom`: date, nullable
- `enabledTo`: date, nullable
- `sortOrder`: integer

### Tabla `ServiceGuide`

- `id`: integer, PK, autoincrement
- `serviceId`: integer, FK -> `Service.id`
- `label`: string
- `url`: string
- `sortOrder`: integer
