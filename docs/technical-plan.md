# Jet Scooter PWA - documento tecnico inicial

## A. Arquitectura propuesta

- Frontend: Next.js 16 con App Router, React 19, TypeScript y Tailwind CSS. La UI se organiza por `app`, `components`, `features`, `lib`, `schemas`, `types` y `config`.
- Backend: Supabase como backend administrado para Auth, PostgreSQL, Storage y politicas RLS.
- Supabase: acceso desde Server Components, Server Actions y Client Components mediante clientes separados de `@supabase/ssr`.
- Storage: bucket privado inicial para imagenes operativas, con rutas por entidad: `meeting-points/{id}`, `tasks/{id}` y `reports/{id}`.
- PWA: Fase 7 con manifest, service worker y cache. Serwist queda como candidato por compatibilidad documentada con Next App Router; la fase inicial deja metadata preparada pero no implementa SW aun.
- Mapas: Leaflet + OpenStreetMap por bajo costo operativo. Se carga diferidamente cuando se implemente Fase 4.

## B. Modelo de datos

- `organizations`: `id`, `name`, `slug`, `timezone`, timestamps.
- `profiles`: `id = auth.users.id`, `organization_id`, nombres, avatar, telefono, `role`, `status`, timestamps.
- `meeting_points`: ubicacion, coordenadas, estado, notas, imagen principal, auditoria, soft delete.
- `meeting_point_images`: imagenes asociadas al punto, primaria opcional, soft delete.
- `tasks`: punto opcional, prioridad, estado, asignacion, fechas operativas.
- `task_comments`: comentarios con soft delete.
- `task_images`: fotografias de tareas.
- `reports`: reportes manuales creados por usuarios.
- `report_images`: fotografias de reportes.
- `activity_logs`: fuente de actividad operativa con JSONB para cambios y metadata.
- `meeting_point_history`: historial puntual de campos relevantes del punto.
- `notifications`: base futura para avisos.

## C. Diagrama logico

```text
Organization
  -> Profiles
  -> Meeting Points
       -> Meeting Point Images
       -> Tasks
            -> Task Comments
            -> Task Images
       -> Reports
            -> Report Images
       -> Activity Logs
       -> Meeting Point History
  -> Notifications
```

## D. Autenticacion

Supabase Auth es la fuente de identidad. `profiles.id` referencia `auth.users.id` y agrega datos operativos, organizacion, rol y estado. Las sesiones se manejan con cookies SSR mediante `@supabase/ssr`; el frontend no usa service role ni secretos.

## E. Roles y permisos

| Accion | Administrador | Operador |
| --- | --- | --- |
| Ver puntos, mapa, tareas, reportes y actividad | Si | Si |
| Crear/editar/desactivar/restaurar puntos | Si | No |
| Crear/asignar/editar tareas | Si | Limitado |
| Actualizar/completar tareas asignadas | Si | Si |
| Crear reportes, comentarios e imagenes | Si | Si |
| Administrar usuarios | Si | No |

## F. RLS

Todas las tablas operativas tienen RLS activo. La estrategia inicial aisla por `organization_id`, exige perfil activo y aplica reglas por rol. Funciones SQL `current_profile`, `current_organization_id`, `current_role` e `is_admin` centralizan permisos para evitar duplicacion.

## G. Estructura de carpetas

```text
src/app
src/components
src/config
src/features
src/hooks
src/lib
src/lib/supabase
src/schemas
src/types
src/utils
supabase/migrations
supabase/seed
tests
docs
```

## H. Navegacion

Rutas previstas: `/dashboard`, `/map`, `/points`, `/points/[id]`, `/tasks`, `/reports`, `/reports/daily`, `/reports/daily/[date]`, `/users`, `/settings`, `/profile`, `/auth/login`, `/auth/callback`.

## I. Fases

1. Arquitectura y base: proyecto, Supabase, modelo, Auth base, roles, RLS, config, docs y pruebas.
2. Diseno base: layout, navegacion mobile/sidebar, temas y estados comunes.
3. Puntos Jet: CRUD, detalle, imagenes, historial y acciones rapidas.
4. Mapa: marcadores, filtros, GPS y `LocationPicker`.
5. Tareas: flujos completos, comentarios, imagenes y permisos.
6. Reportes y actividad: reportes manuales, timeline diario y zona horaria.
7. PWA: manifest, service worker, instalacion, offline y cache.
8. Optimizacion: performance, accesibilidad, seguridad, responsive y build final.

## J. Riesgos tecnicos

- Offline: sincronizacion y conflictos requieren cola local e IndexedDB; no debe improvisarse en Fase 1.
- Imagenes: compresion, limites MIME y Storage privado deben probarse en dispositivos reales.
- Mapas: Leaflet debe cargarse solo en cliente para evitar problemas SSR.
- PWA iOS: instalacion y cache tienen limitaciones propias de Safari.
- RLS: errores sutiles pueden bloquear datos o exponer registros entre organizaciones; necesita tests SQL/manuales.
- Sincronizacion: no sobrescribir cambios remotos silenciosamente.
- Zona horaria: los cortes diarios deben calcularse con `organizations.timezone`, inicialmente `America/Santiago`, no UTC plano.
