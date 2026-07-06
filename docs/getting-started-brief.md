## Primeros pasos

Guía extendida: [docs/getting-started.md](docs/getting-started.md).

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

```bash
cp .env.example .env.local
```

Completa los valores en `.env.local`. Referencia completa en [Variables de entorno](#variables-de-entorno).

### 4. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige según el horario:

- **Horario abierto** → `/tipo` (inicio del wizard)
- **Almuerzo o fuera de horario** → `/fuera-horario`

Para probar sin depender del reloj, en `.env.local`:

```env
NEXT_PUBLIC_MOCK_BUSINESS_HOURS=open
```
