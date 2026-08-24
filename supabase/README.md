# Supabase - Jet Scooter

## Orden rapido

1. Crear proyecto en Supabase.
2. Copiar URL y publishable key a `.env.local`.
3. Aplicar migraciones con CLI:

```bash
supabase db push
```

Alternativa rapida: abrir Supabase SQL Editor y ejecutar `supabase/setup.sql`.

4. Cargar demo local con CLI:

```bash
supabase db reset
```

## Migraciones incluidas

- `202608240001_initial_operational_schema.sql`: tablas, enums, FK, indices, RLS, Storage.
- `202608240002_daily_activity_helpers.sql`: funciones para actividad diaria por zona horaria y delete policy de Storage.

## Usuarios

No se crea una tabla `users`. Crea usuarios con Supabase Auth y luego inserta su fila en `profiles` usando el mismo `auth.users.id`.

Para crear usuarios desde la app:

1. Copia la service role key del proyecto en `.env.local` como `SUPABASE_SERVICE_ROLE_KEY`.
2. Crea el primer usuario administrador en Supabase Auth.
3. Inserta su `profile` con rol `admin`.
4. Inicia sesion en `/auth/login`.
5. En `/users`, crea administradores u operadores.

Ejemplo para el primer profile admin, reemplazando `<AUTH_USER_ID>`:

```sql
insert into public.organizations (id, name, slug, timezone)
values ('11111111-1111-1111-1111-111111111111', 'Jet Scooter', 'jet-scooter', 'America/Santiago')
on conflict (slug) do nothing;

insert into public.profiles (
  id,
  organization_id,
  first_name,
  last_name,
  display_name,
  role,
  status
)
values (
  '<AUTH_USER_ID>',
  '11111111-1111-1111-1111-111111111111',
  'Admin',
  'Jet',
  'Admin Jet',
  'admin',
  'active'
);
```

## Tareas y notificaciones

Las tareas pueden quedar generales (`assigned_to` null) o asignadas personalmente. Cuando `assigned_to` tiene un perfil, el trigger `tasks_assignment_notification` crea automaticamente una fila en `notifications` para ese usuario y registra `activity_logs`.

## Storage

Bucket privado: `jet-operations`.

Rutas esperadas:

- `{organization_id}/meeting-points/{meeting_point_id}/file.webp`
- `{organization_id}/tasks/{task_id}/file.webp`
- `{organization_id}/reports/{report_id}/file.webp`
