import type { MeetingPointStatus, TaskPriority, TaskStatus } from "@/types/domain";

export type DemoPoint = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  reference: string;
  description: string;
  status: MeetingPointStatus;
  pendingTasks: number;
  urgentTasks: number;
  updatedAt: string;
  updatedBy: string;
  imageUrl: string;
};

export type DemoTask = {
  id: string;
  title: string;
  description: string;
  pointId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
};

export type DemoReport = {
  id: string;
  title: string;
  description: string;
  pointId?: string;
  author: string;
  importance: TaskPriority;
  createdAt: string;
};

export type DemoActivity = {
  id: string;
  time: string;
  type: "system" | "manual";
  title: string;
  description: string;
  pointId?: string;
};

export const demoUsers = [
  { id: "u1", name: "Daniel Admin", role: "Administrador", status: "Activo" },
  { id: "u2", name: "Camila Operadora", role: "Operador", status: "Activo" },
  { id: "u3", name: "Pedro Tecnico", role: "Operador", status: "Activo" },
  { id: "u4", name: "Sofia Coordinadora", role: "Operador", status: "Activo" },
  { id: "u5", name: "Jet Demo", role: "Operador", status: "Inactivo" },
];

export const demoPoints: DemoPoint[] = [
  {
    id: "21111111-1111-1111-1111-111111111111",
    name: "Metro Escuela Militar DEMO",
    slug: "metro-escuela-militar-demo",
    address: "Av. Apoquindo 4501",
    latitude: -33.4131,
    longitude: -70.5852,
    reference: "Salida principal del metro",
    description: "Punto operativo de alta rotacion en Las Condes.",
    status: "active",
    pendingTasks: 2,
    urgentTasks: 1,
    updatedAt: "2026-08-24T16:45:00-04:00",
    updatedBy: "Camila Operadora",
    imageUrl: "https://images.unsplash.com/photo-1565626423788-7ff568144725?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Plaza Italia DEMO",
    slug: "plaza-italia-demo",
    address: "Av. Providencia 1",
    latitude: -33.4378,
    longitude: -70.6345,
    reference: "Costado norte",
    description: "Punto de monitoreo central con alto flujo peatonal.",
    status: "review",
    pendingTasks: 3,
    urgentTasks: 2,
    updatedAt: "2026-08-24T15:20:00-04:00",
    updatedBy: "Pedro Tecnico",
    imageUrl: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "23333333-3333-3333-3333-333333333333",
    name: "Mall Costanera DEMO",
    slug: "mall-costanera-demo",
    address: "Av. Andres Bello 2425",
    latitude: -33.4167,
    longitude: -70.6067,
    reference: "Acceso principal",
    description: "Punto cercano a zona comercial.",
    status: "active",
    pendingTasks: 1,
    urgentTasks: 0,
    updatedAt: "2026-08-24T12:30:00-04:00",
    updatedBy: "Sofia Coordinadora",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "24444444-4444-4444-4444-444444444444",
    name: "Metro Los Leones DEMO",
    slug: "metro-los-leones-demo",
    address: "Av. Nueva Providencia 2214",
    latitude: -33.4219,
    longitude: -70.6089,
    reference: "Salida Pedro de Valdivia",
    description: "Punto temporal para flujo vespertino.",
    status: "temporary",
    pendingTasks: 0,
    urgentTasks: 0,
    updatedAt: "2026-08-23T18:10:00-04:00",
    updatedBy: "Camila Operadora",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "25555555-5555-5555-5555-555555555555",
    name: "Parque Arauco DEMO",
    slug: "parque-arauco-demo",
    address: "Av. Presidente Kennedy 5413",
    latitude: -33.4017,
    longitude: -70.5789,
    reference: "Sector estacionamientos",
    description: "Punto con revision frecuente.",
    status: "inactive",
    pendingTasks: 0,
    urgentTasks: 0,
    updatedAt: "2026-08-20T10:05:00-04:00",
    updatedBy: "Daniel Admin",
    imageUrl: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&w=1200&q=80",
  },
];

export const demoTasks: DemoTask[] = [
  { id: "t1", title: "Revisar ubicacion", description: "Validar scooters mal posicionados.", pointId: demoPoints[0].id, priority: "urgent", status: "pending", assignedTo: "Pedro Tecnico", dueDate: "2026-08-24T18:00:00-04:00", createdAt: "2026-08-24T09:10:00-04:00" },
  { id: "t2", title: "Actualizar fotografia principal", description: "Tomar foto del acceso actual.", pointId: demoPoints[0].id, priority: "medium", status: "in_progress", assignedTo: "Camila Operadora", dueDate: "2026-08-25T12:00:00-04:00", createdAt: "2026-08-24T10:00:00-04:00" },
  { id: "t3", title: "Confirmar disponibilidad", description: "Revisar si el punto sigue operativo.", pointId: demoPoints[1].id, priority: "high", status: "pending", assignedTo: "Sofia Coordinadora", dueDate: "2026-08-24T17:00:00-04:00", createdAt: "2026-08-24T11:20:00-04:00" },
  { id: "t4", title: "Cerrar observacion", description: "Completar seguimiento de reporte manual.", pointId: demoPoints[2].id, priority: "low", status: "completed", assignedTo: "Camila Operadora", dueDate: "2026-08-23T17:00:00-04:00", createdAt: "2026-08-23T08:30:00-04:00" },
  { id: "t5", title: "Verificar punto en revision", description: "Enviar comentario con estado actualizado.", pointId: demoPoints[1].id, priority: "urgent", status: "pending", assignedTo: "Pedro Tecnico", dueDate: "2026-08-24T15:30:00-04:00", createdAt: "2026-08-24T13:20:00-04:00" },
  { id: "t6", title: "Ordenar scooters", description: "Alinear scooters en zona autorizada.", pointId: demoPoints[3].id, priority: "medium", status: "completed", assignedTo: "Sofia Coordinadora", dueDate: "2026-08-24T13:00:00-04:00", createdAt: "2026-08-24T08:20:00-04:00" },
  { id: "t7", title: "Validar punto inactivo", description: "Confirmar si aplica restaurar.", pointId: demoPoints[4].id, priority: "low", status: "cancelled", assignedTo: "Daniel Admin", dueDate: "2026-08-26T12:00:00-04:00", createdAt: "2026-08-22T09:00:00-04:00" },
  { id: "t8", title: "Agregar referencia visual", description: "Adjuntar foto del entorno.", pointId: demoPoints[2].id, priority: "medium", status: "pending", assignedTo: "Camila Operadora", dueDate: "2026-08-25T18:00:00-04:00", createdAt: "2026-08-24T14:10:00-04:00" },
  { id: "t9", title: "Revisar tareas vencidas", description: "Priorizar atencion requerida.", priority: "high", status: "in_progress", assignedTo: "Daniel Admin", dueDate: "2026-08-24T19:00:00-04:00", createdAt: "2026-08-24T08:00:00-04:00" },
  { id: "t10", title: "Preparar reporte diario", description: "Validar actividad del dia.", priority: "medium", status: "pending", assignedTo: "Sofia Coordinadora", dueDate: "2026-08-24T20:00:00-04:00", createdAt: "2026-08-24T12:00:00-04:00" },
];

export const demoReports: DemoReport[] = Array.from({ length: 10 }, (_, index) => ({
  id: `r${index + 1}`,
  title: index === 0 ? "Scooters mal estacionados" : `Reporte operativo DEMO ${index + 1}`,
  description: "Observacion manual creada por un operador en terreno.",
  pointId: demoPoints[index % demoPoints.length].id,
  author: demoUsers[index % demoUsers.length].name,
  importance: index % 3 === 0 ? "high" : "medium",
  createdAt: `2026-08-24T${String(9 + index).padStart(2, "0")}:20:00-04:00`,
}));

export const demoActivity: DemoActivity[] = [
  { id: "a1", time: "16:45", type: "system", title: "Tarea completada", description: "Revisar ubicacion", pointId: demoPoints[0].id },
  { id: "a2", time: "15:20", type: "system", title: "Fotografia agregada", description: "Metro Escuela Militar", pointId: demoPoints[0].id },
  { id: "a3", time: "14:10", type: "manual", title: "Reporte creado", description: "Scooters mal estacionados", pointId: demoPoints[1].id },
  { id: "a4", time: "12:30", type: "system", title: "Punto actualizado", description: "En revision -> Activo", pointId: demoPoints[2].id },
  { id: "a5", time: "09:10", type: "system", title: "Tarea creada", description: "Revisar ubicacion", pointId: demoPoints[0].id },
];

export function getPointById(id: string) {
  return demoPoints.find((point) => point.id === id || point.slug === id);
}

export function getPointName(pointId?: string) {
  return demoPoints.find((point) => point.id === pointId)?.name ?? "Sin Punto Jet";
}
