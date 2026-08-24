# Jet Scooter Operaciones

PWA interna para gestionar Puntos Jet, tareas, reportes, fotografias y actividad diaria de Jet Scooter. El proyecto ya incluye una primera version navegable de todas las fases en modo DEMO y el paquete SQL para crear la base de datos en Supabase.

## Arquitectura

- Next.js 16 App Router, React 19, TypeScript y Tailwind CSS.
- Supabase Auth como fuente de identidad.
- PostgreSQL en Supabase con RLS obligatorio.
- Supabase Storage para imagenes operativas.
- Configuracion centralizada en `src/config`.
- Validaciones iniciales con Zod.
- PWA basica con manifest, service worker, pagina offline, indicador de conexion y prompt de instalacion.
- Mapa con Leaflet + OpenStreetMap.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- Proyecto Supabase.
- Supabase CLI para aplicar migraciones localmente o contra un proyecto remoto.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` es solo para herramientas server-side o scripts controlados. No se usa en el frontend.

## Supabase

Migracion inicial:

```bash
supabase db push
```

Seed demo:

```bash
supabase db reset
```

La migracion crea `organizations`, `profiles`, `meeting_points`, imagenes, `tasks`, comentarios, `reports`, `activity_logs`, historial y `notifications`, ademas de enums, indices, triggers `updated_at`, bucket privado `jet-operations`, politicas RLS iniciales y funciones para actividad diaria por zona horaria.

Detalles: [supabase/README.md](supabase/README.md).

Tambien existe un archivo combinado para SQL Editor:

```text
supabase/setup.sql
```

## Desarrollo

```bash
npm run dev
```

Rutas iniciales:

- `/auth/login`
- `/dashboard`
- `/map`
- `/points`
- `/points/[id]`
- `/tasks`
- `/reports`
- `/reports/daily`
- `/reports/daily/[date]`
- `/users`
- `/settings`
- `/profile`
- `/offline`

## Calidad

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## PWA

La PWA basica ya esta creada. El soporte offline avanzado queda preparado para IndexedDB, cola de sincronizacion, reintentos y resolucion de conflictos.

## Seguridad

- RLS activo en todas las tablas operativas.
- Aislamiento por `organization_id`.
- Roles iniciales: `admin` y `operator`.
- Soft delete en entidades operativas relevantes.
- Timestamps `timestamptz`.
- Zona horaria organizacional inicial: `America/Santiago`.

## Documento tecnico

Ver [docs/technical-plan.md](docs/technical-plan.md).
