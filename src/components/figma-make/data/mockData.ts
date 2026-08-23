export const EMPRESA = {
  nombre: "Mi Negocio",
  logo: "MN",
  color: "#2563eb",
  plan: "Profesional",
  sucursalActiva: "Sucursal Centro",
};

export const SUCURSALES = [
  { id: 1, nombre: "Sucursal Centro", direccion: "Av. Principal 123, Piso 2", telefono: "+56 9 1234 5678", estado: "Activa", profesionales: 3 },
  { id: 2, nombre: "Sucursal Norte", direccion: "Calle Norte 456", telefono: "+56 9 8765 4321", estado: "Activa", profesionales: 2 },
  { id: 3, nombre: "Sucursal Sur", direccion: "Av. Sur 789", telefono: "+56 9 5555 1234", estado: "Inactiva", profesionales: 1 },
];

export const PROFESIONALES = [
  { id: 1, nombre: "Laura Martínez", especialidad: "Estilista", servicios: ["Corte de cabello", "Tratamiento facial"], sucursal: "Sucursal Centro", estado: "Activo", avatar: "LM", citas: 142 },
  { id: 2, nombre: "Carlos Rodríguez", especialidad: "Barbero", servicios: ["Corte de cabello", "Barba"], sucursal: "Sucursal Centro", estado: "Activo", avatar: "CR", citas: 98 },
  { id: 3, nombre: "Andrea Gómez", especialidad: "Especialista", servicios: ["Manicure", "Masaje", "Consulta"], sucursal: "Sucursal Norte", estado: "Activo", avatar: "AG", citas: 215 },
  { id: 4, nombre: "Felipe Herrera", especialidad: "Masajista", servicios: ["Masaje"], sucursal: "Sucursal Norte", estado: "Inactivo", avatar: "FH", citas: 67 },
];

export const SERVICIOS = [
  { id: 1, nombre: "Corte de cabello", descripcion: "Corte profesional con lavado incluido", duracion: 45, precio: 15000, categoria: "Cabello", estado: "Activo" },
  { id: 2, nombre: "Manicure", descripcion: "Manicure completo con esmaltado", duracion: 60, precio: 18000, categoria: "Uñas", estado: "Activo" },
  { id: 3, nombre: "Consulta", descripcion: "Consulta de asesoría especializada", duracion: 30, precio: 25000, categoria: "Salud", estado: "Activo" },
  { id: 4, nombre: "Masaje", descripcion: "Masaje relajante de cuerpo completo", duracion: 90, precio: 35000, categoria: "Bienestar", estado: "Activo" },
  { id: 5, nombre: "Tratamiento facial", descripcion: "Limpieza y tratamiento facial profundo", duracion: 75, precio: 28000, categoria: "Facial", estado: "Activo" },
  { id: 6, nombre: "Barba", descripcion: "Diseño y perfilado de barba", duracion: 30, precio: 10000, categoria: "Cabello", estado: "Inactivo" },
];

export const CLIENTES = [
  { id: 1, nombre: "Ana", apellido: "Torres", telefono: "+56 9 1111 2222", correo: "ana.torres@email.com", citas: 12, ultimaCita: "2025-08-14", estado: "Activo" },
  { id: 2, nombre: "Marcos", apellido: "Silva", telefono: "+56 9 3333 4444", correo: "marcos.silva@email.com", citas: 5, ultimaCita: "2025-08-10", estado: "Activo" },
  { id: 3, nombre: "Valentina", apellido: "López", telefono: "+56 9 5555 6666", correo: "valentina.lopez@email.com", citas: 23, ultimaCita: "2025-08-15", estado: "Activo" },
  { id: 4, nombre: "Diego", apellido: "Morales", telefono: "+56 9 7777 8888", correo: "diego.morales@email.com", citas: 3, ultimaCita: "2025-07-28", estado: "Activo" },
  { id: 5, nombre: "Camila", apellido: "Fernández", telefono: "+56 9 9999 0000", correo: "camila.fernandez@email.com", citas: 18, ultimaCita: "2025-08-12", estado: "Activo" },
  { id: 6, nombre: "Rodrigo", apellido: "Jiménez", telefono: "+56 9 2222 3333", correo: "rodrigo.jimenez@email.com", citas: 7, ultimaCita: "2025-08-01", estado: "Inactivo" },
  { id: 7, nombre: "Sofía", apellido: "Vargas", telefono: "+56 9 4444 5555", correo: "sofia.vargas@email.com", citas: 31, ultimaCita: "2025-08-16", estado: "Activo" },
  { id: 8, nombre: "Ignacio", apellido: "Castro", telefono: "+56 9 6666 7777", correo: "ignacio.castro@email.com", citas: 2, ultimaCita: "2025-07-15", estado: "Activo" },
];

export const CITAS_HOY: Cita[] = [
  { id: 1, hora: "09:00", horaFin: "09:45", cliente: "Ana Torres", servicio: "Corte de cabello", profesional: "Laura Martínez", estado: "Confirmada", duracion: 45 },
  { id: 2, hora: "09:30", horaFin: "10:30", cliente: "Marcos Silva", servicio: "Masaje", profesional: "Andrea Gómez", estado: "Pendiente", duracion: 60 },
  { id: 3, hora: "10:00", horaFin: "10:45", cliente: "Valentina López", servicio: "Manicure", profesional: "Andrea Gómez", estado: "Confirmada", duracion: 45 },
  { id: 4, hora: "11:00", horaFin: "11:30", cliente: "Diego Morales", servicio: "Consulta", profesional: "Laura Martínez", estado: "Completada", duracion: 30 },
  { id: 5, hora: "14:00", horaFin: "15:15", cliente: "Camila Fernández", servicio: "Tratamiento facial", profesional: "Laura Martínez", estado: "Confirmada", duracion: 75 },
  { id: 6, hora: "15:00", horaFin: "15:45", cliente: "Sofía Vargas", servicio: "Corte de cabello", profesional: "Carlos Rodríguez", estado: "Pendiente", duracion: 45 },
  { id: 7, hora: "16:30", horaFin: "17:00", cliente: "Rodrigo Jiménez", servicio: "Barba", profesional: "Carlos Rodríguez", estado: "Cancelada", duracion: 30 },
];

export interface Cita {
  id: number;
  hora: string;
  horaFin: string;
  cliente: string;
  servicio: string;
  profesional: string;
  estado: string;
  duracion: number;
}

export const CHART_DATA = [
  { dia: "Lun", citas: 8, ingresos: 142000 },
  { dia: "Mar", citas: 12, ingresos: 218000 },
  { dia: "Mié", citas: 6, ingresos: 98000 },
  { dia: "Jue", citas: 15, ingresos: 287000 },
  { dia: "Vie", citas: 18, ingresos: 324000 },
  { dia: "Sáb", citas: 22, ingresos: 405000 },
  { dia: "Dom", citas: 4, ingresos: 72000 },
];

export const USUARIOS = [
  { id: 1, nombre: "Administrador General", correo: "admin@minegocio.com", rol: "Administrador", ultimoAcceso: "Hace 2 minutos", estado: "Activo" },
  { id: 2, nombre: "María Gonzalez", correo: "maria@agendapro.cl", rol: "Gerente", ultimoAcceso: "Hace 1 hora", estado: "Activo" },
  { id: 3, nombre: "Laura Martínez", correo: "laura@agendapro.cl", rol: "Profesional", ultimoAcceso: "Hace 3 horas", estado: "Activo" },
  { id: 4, nombre: "Carlos Rodríguez", correo: "carlos@agendapro.cl", rol: "Profesional", ultimoAcceso: "Ayer", estado: "Activo" },
  { id: 5, nombre: "Juana Medina", correo: "juana@agendapro.cl", rol: "Recepción", ultimoAcceso: "Hace 30 min", estado: "Activo" },
];

export const NOTIFICACIONES = [
  { id: 1, tipo: "cita", mensaje: "Nueva cita: Ana Torres - 09:00", tiempo: "Hace 5 min", leida: false },
  { id: 2, tipo: "cancelacion", mensaje: "Rodrigo Jiménez canceló su cita", tiempo: "Hace 20 min", leida: false },
  { id: 3, tipo: "pago", mensaje: "Pago recibido: $35.000", tiempo: "Hace 1 hora", leida: true },
  { id: 4, tipo: "cliente", mensaje: "Nuevo cliente registrado: Ignacio Castro", tiempo: "Hace 2 horas", leida: true },
  { id: 5, tipo: "suscripcion", mensaje: "Tu suscripción vence en 7 días", tiempo: "Hace 3 horas", leida: false },
];
