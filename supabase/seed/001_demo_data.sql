insert into public.organizations (id, name, slug, timezone)
values ('11111111-1111-1111-1111-111111111111', 'Jet Scooter DEMO', 'jet-scooter-demo', 'America/Santiago')
on conflict (slug) do nothing;

insert into public.meeting_points (id, organization_id, name, slug, address, latitude, longitude, reference, description, status, internal_notes)
values
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Metro Escuela Militar DEMO', 'metro-escuela-militar-demo', 'Av. Apoquindo 4501', -33.413100, -70.585200, 'Salida principal del metro', 'Punto operativo de alta rotacion en Las Condes.', 'active', 'Datos DEMO'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Plaza Italia DEMO', 'plaza-italia-demo', 'Av. Providencia 1', -33.437800, -70.634500, 'Costado norte', 'Punto de monitoreo central.', 'review', 'Datos DEMO'),
  ('23333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Mall Costanera DEMO', 'mall-costanera-demo', 'Av. Andres Bello 2425', -33.416700, -70.606700, 'Acceso principal', 'Punto cercano a zona comercial.', 'active', 'Datos DEMO'),
  ('24444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Metro Los Leones DEMO', 'metro-los-leones-demo', 'Av. Nueva Providencia 2214', -33.421900, -70.608900, 'Salida Pedro de Valdivia', 'Punto temporal para flujo vespertino.', 'temporary', 'Datos DEMO'),
  ('25555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Parque Arauco DEMO', 'parque-arauco-demo', 'Av. Presidente Kennedy 5413', -33.401700, -70.578900, 'Sector estacionamientos', 'Punto con revision frecuente.', 'inactive', 'Datos DEMO')
on conflict (organization_id, slug) do nothing;

insert into public.reports (organization_id, meeting_point_id, title, description, observations, importance)
select '11111111-1111-1111-1111-111111111111', id, 'Reporte DEMO en ' || name, 'Observacion operativa creada como dato DEMO.', 'No corresponde a actividad real.', 'medium'
from public.meeting_points
where organization_id = '11111111-1111-1111-1111-111111111111';

insert into public.activity_logs (organization_id, meeting_point_id, action_type, entity_type, entity_id, title, description, metadata)
select organization_id, id, 'meeting_point_seeded', 'meeting_point', id, 'Punto DEMO creado', name, jsonb_build_object('demo', true)
from public.meeting_points
where organization_id = '11111111-1111-1111-1111-111111111111';
