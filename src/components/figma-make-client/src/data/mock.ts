export const TENANT = {
  id: "studio-avara",
  name: "Studio Avara",
  tagline: "Tu espacio de bienestar",
  heroTitle: "Reserva tu próxima cita de forma fácil",
  heroSubtitle: "Elige tu servicio, especialista y horario en pocos pasos. Sin esperas, sin llamadas.",
  heroBadge: "Reservas online · Confirmación inmediata",
  heroCtaText: "Agendar cita",
  heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=1000&fit=crop&auto=format",
  address: "Calle 85 #15-34, Bogotá, Colombia",
  hours: "Lun–Vie: 8:00–19:00 · Sáb: 9:00–17:00",
  phone: "+57 300 123 4567",
  email: "hola@studioavara.com",
  website: "studioavara.com",
  instagram: "@studioavara",
  facebook: "StudioAvara",
};

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image: string;
  category: string;
  specialistIds: string[];
}

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo: string;
  serviceIds: string[];
  rating: number;
  reviews: number;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  specialistId: string;
  specialistName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  code: string;
}

export interface Notification {
  id: string;
  type: "confirmation" | "reminder" | "cancellation" | "rescheduled";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Corte de Cabello",
    description: "Corte personalizado con lavado, acondicionado y secado profesional.",
    duration: 45,
    price: 85000,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop&auto=format",
    category: "Cabello",
    specialistIds: ["sp1", "sp2"],
  },
  {
    id: "s2",
    name: "Coloración Completa",
    description: "Coloración de raíz a puntas con productos de alta calidad y sin daño.",
    duration: 120,
    price: 220000,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&auto=format",
    category: "Cabello",
    specialistIds: ["sp1"],
  },
  {
    id: "s3",
    name: "Keratina Brasileña",
    description: "Tratamiento alisador de larga duración que elimina el frizz y aporta brillo.",
    duration: 90,
    price: 180000,
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=300&fit=crop&auto=format",
    category: "Tratamientos",
    specialistIds: ["sp1", "sp2"],
  },
  {
    id: "s4",
    name: "Manicure + Pedicure",
    description: "Cuidado completo de manos y pies con esmalte semipermanente incluido.",
    duration: 60,
    price: 95000,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop&auto=format",
    category: "Uñas",
    specialistIds: ["sp3"],
  },
  {
    id: "s5",
    name: "Masaje Relajante",
    description: "Masaje corporal con aceites esenciales para liberar tensiones y estrés.",
    duration: 60,
    price: 120000,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop&auto=format",
    category: "Bienestar",
    specialistIds: ["sp3"],
  },
  {
    id: "s6",
    name: "Facial Profundo",
    description: "Limpieza facial profunda con hidratación, exfoliación y mascarilla nutritiva.",
    duration: 75,
    price: 150000,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format",
    category: "Facial",
    specialistIds: ["sp3"],
  },
];

export const SPECIALISTS: Specialist[] = [
  {
    id: "sp1",
    name: "Laura Martínez",
    specialty: "Especialista en Coloración",
    bio: "Más de 8 años de experiencia en técnicas de coloración avanzada. Certificada en balayage y colorimetría.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&auto=format",
    serviceIds: ["s1", "s2", "s3"],
    rating: 4.9,
    reviews: 127,
  },
  {
    id: "sp2",
    name: "Andrés García",
    specialty: "Estilista Principal",
    bio: "Especialista en cortes modernos y técnicas de degradado. Formado en Madrid y Ciudad de México.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format",
    serviceIds: ["s1", "s3"],
    rating: 4.8,
    reviews: 94,
  },
  {
    id: "sp3",
    name: "Valentina Ruiz",
    specialty: "Terapeuta de Bienestar",
    bio: "Especialista en tratamientos faciales, corporales y técnicas de relajación. Certificada en cosmetología avanzada.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&auto=format",
    serviceIds: ["s4", "s5", "s6"],
    rating: 5.0,
    reviews: 83,
  },
];

export const APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    serviceId: "s2",
    serviceName: "Coloración Completa",
    specialistId: "sp1",
    specialistName: "Laura Martínez",
    date: "2026-08-25",
    time: "10:00 AM",
    duration: 120,
    price: 220000,
    status: "confirmed",
    code: "OC-78423",
  },
  {
    id: "a2",
    serviceId: "s1",
    serviceName: "Corte de Cabello",
    specialistId: "sp2",
    specialistName: "Andrés García",
    date: "2026-09-02",
    time: "03:00 PM",
    duration: 45,
    price: 85000,
    status: "pending",
    code: "OC-78501",
  },
  {
    id: "a3",
    serviceId: "s6",
    serviceName: "Facial Profundo",
    specialistId: "sp3",
    specialistName: "Valentina Ruiz",
    date: "2026-09-10",
    time: "11:00 AM",
    duration: 75,
    price: 150000,
    status: "confirmed",
    code: "OC-78622",
  },
  {
    id: "a4",
    serviceId: "s3",
    serviceName: "Keratina Brasileña",
    specialistId: "sp1",
    specialistName: "Laura Martínez",
    date: "2026-07-15",
    time: "02:00 PM",
    duration: 90,
    price: 180000,
    status: "completed",
    code: "OC-77890",
  },
  {
    id: "a5",
    serviceId: "s5",
    serviceName: "Masaje Relajante",
    specialistId: "sp3",
    specialistName: "Valentina Ruiz",
    date: "2026-08-05",
    time: "04:00 PM",
    duration: 60,
    price: 120000,
    status: "cancelled",
    code: "OC-78100",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "reminder",
    title: "Recordatorio de cita",
    message: "Tienes una cita mañana a las 10:00 AM para Coloración Completa con Laura Martínez.",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: "n2",
    type: "confirmation",
    title: "Cita confirmada",
    message: "Tu cita para Corte de Cabello el 2 de septiembre a las 3:00 PM fue confirmada.",
    time: "Hace 1 día",
    read: false,
  },
  {
    id: "n3",
    type: "cancellation",
    title: "Cita cancelada",
    message: "Tu cita para Masaje Relajante del 5 de agosto fue cancelada. ¿Deseas reagendar?",
    time: "Hace 2 semanas",
    read: true,
  },
  {
    id: "n4",
    type: "rescheduled",
    title: "Cita reprogramada",
    message: "Tu especialista ha reprogramado la cita. Nueva fecha: 10 de septiembre a las 11:00 AM.",
    time: "Hace 3 semanas",
    read: true,
  },
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Sofía Herrera",
    comment: "Increíble experiencia. El proceso de reserva fue súper fácil y el servicio superó todas mis expectativas. ¡Ya agendé mi próxima cita!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format",
    service: "Coloración Completa",
  },
  {
    id: "t2",
    name: "Camila Torres",
    comment: "Me encanta poder agendar desde el celular en cualquier momento. Laura es espectacular, siempre sabe exactamente lo que quiero.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&auto=format",
    service: "Corte + Coloración",
  },
  {
    id: "t3",
    name: "María José Pinto",
    comment: "El mejor facial que he tenido. Valentina es una profesional increíble. La app me recuerda mis citas y eso es muy útil.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&auto=format",
    service: "Facial Profundo",
  },
];

export const AVAILABLE_TIMES = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

export const UNAVAILABLE_TIMES = ["09:30 AM", "11:30 AM", "03:00 PM"];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price);
