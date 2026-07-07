# Primeros pasos

Guía rápida para levantar Campus360 Hub en desarrollo local.

**Requisitos:** Node.js **22.x** y pnpm **9+** — ver [prerequisites.md](./prerequisites.md).

## 1. Clonar el repositorio

```bash
git clone https://github.com/JomiChCal/campus360-hub.git
cd campus360-hub
```

## 2. Instalar dependencias

```bash
pnpm install
```

## 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales. Consulta [env-vars.md](./env-vars.md) o los comentarios dentro de `.env.example`.

**Mínimo para desarrollo local:**

- `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`
- URLs de Power Automate (`PA_*`, `MICROSOFT_*`)
- `REFRESH_SECRET`
- `NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open` (evita redirección a fuera de horario)

`QSTASH_TOKEN` no es obligatorio en local: si la app detecta `localhost`, encola turnos llamando a Power Automate directamente.

## 4. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

- **Horario abierto** (o mock `open`) → redirige a `/tipo` (inicio del wizard).
- **Almuerzo o fuera de horario** → redirige a `/fuera-horario`.

## 5. Probar endpoints de refresh (opcional)

Con el servidor en marcha y `REFRESH_SECRET` configurado:

```bash
curl -X POST "http://localhost:3000/api/refresh-config" \
  -H "Authorization: Bearer $REFRESH_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"Titulo":"Horario Normal","HoraAperturaM":"08:00","HoraCierreM":"13:00","HorarioAperturaT":"15:00","HorarioCierreT":"18:00","habilitado":"Si"}'

curl "http://localhost:3000/api/schedule-config"
```

## Siguiente lectura

- [env-vars.md](./env-vars.md)
- [api/README.md](./api/README.md)
- [troubleshooting.md](./troubleshooting.md)
