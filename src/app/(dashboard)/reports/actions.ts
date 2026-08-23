'use server';

import { createClient } from '@/lib/supabase/server';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';

export interface ReportsFilterInput {
  periodFilter: 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all_time';
  branchId?: string;
}

export async function getReportsDataAction(periodFilter: string = 'this_month', branchId: string = 'all') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuario no autenticado');
  }

  const tenantId = await getTenantIdForUser(supabase, user);
  if (!tenantId) {
    throw new Error('Negocio no encontrado para el usuario activo');
  }

  // 1. Cargar información de la empresa, sucursales y configuración
  const [
    { data: tenant },
    { data: settings },
    { data: rawBranches },
  ] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle(),
    supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('branches').select('id, name').eq('tenant_id', tenantId).eq('is_active', true).order('name', { ascending: true }),
  ]);

  const branches = rawBranches || [];
  let selectedBranchName = 'Todas las sucursales';
  if (branchId && branchId !== 'all') {
    const foundBranch = branches.find((b) => b.id === branchId);
    if (foundBranch) {
      selectedBranchName = foundBranch.name;
    }
  }

  const tenantInfo = {
    name: tenant?.name || 'Mi Negocio',
    logoUrl: tenant?.logo_url || null,
    phone: tenant?.phone || '',
    email: tenant?.email || '',
    address: tenant?.address || '',
    city: tenant?.city || '',
  };

  // 2. Definir rango de fechas según el filtro de período
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let periodLabel = 'Mes Actual';

  switch (periodFilter) {
    case 'this_month': {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      periodLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      break;
    }
    case 'last_month': {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      periodLabel = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
      break;
    }
    case 'last_3_months': {
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      periodLabel = 'Últimos 3 Meses';
      break;
    }
    case 'last_6_months': {
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
      periodLabel = 'Últimos 6 Meses';
      break;
    }
    case 'this_year': {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      periodLabel = `Año ${now.getFullYear()}`;
      break;
    }
    case 'all_time':
    default: {
      startDate = null;
      periodLabel = 'Todo el Historial';
      break;
    }
  }

  // 3. Consultar Citas en el tenant (filtradas opcionalmente por Sucursal)
  let appointmentsQuery = supabase
    .from('appointments')
    .select(`
      *,
      service:services(id, name, price, duration_minutes),
      staff:staff(id, name, email),
      client:clients(id, name, email, phone),
      branch:branches(id, name)
    `)
    .eq('tenant_id', tenantId)
    .order('start_time', { ascending: false });

  if (branchId && branchId !== 'all') {
    appointmentsQuery = appointmentsQuery.eq('branch_id', branchId);
  }

  if (startDate) {
    appointmentsQuery = appointmentsQuery.gte('start_time', startDate.toISOString());
  }
  appointmentsQuery = appointmentsQuery.lte('start_time', endDate.toISOString());

  const { data: rawAppointments } = await appointmentsQuery;
  const appointments = rawAppointments || [];

  // 4. Consultar Clientes en el tenant
  let clientsQuery = supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const { data: rawClients } = await clientsQuery;
  const clients = rawClients || [];

  // --- MÉTRICAS DE CITAS ---
  const totalAppointments = appointments.length;
  const completedAppointmentsList = appointments.filter((a) => a.status === 'completed' || a.status === 'confirmed');
  const completedAppointmentsCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledAppointmentsCount = appointments.filter((a) => a.status === 'cancelled').length;
  const completionRate = totalAppointments > 0 ? Math.round((completedAppointmentsCount / totalAppointments) * 100) : 0;

  // Gráfico de Citas por Día
  const dayCountsMap: Record<string, number> = {};
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Inicializar días de la semana
  dayNames.forEach((d) => { dayCountsMap[d] = 0; });

  appointments.forEach((a) => {
    const d = new Date(a.start_time);
    const dayName = dayNames[d.getDay()];
    dayCountsMap[dayName] = (dayCountsMap[dayName] || 0) + 1;
  });

  const appointmentsByDayChart = dayNames.map((dia) => ({
    dia,
    citas: dayCountsMap[dia] || 0,
  }));

  // --- MÉTRICAS DE CLIENTES ---
  // Clientes nuevos registrados en el período
  const newClientsCount = clients.filter((c) => {
    if (!startDate) return true;
    const cDate = new Date(c.created_at);
    return cDate >= startDate && cDate <= endDate;
  }).length;

  // Mapa de citas por cliente
  const clientAppCountMap: Record<string, { count: number; totalSpent: number; client: any }> = {};
  clients.forEach((c) => {
    clientAppCountMap[c.id] = { count: 0, totalSpent: 0, client: c };
  });

  appointments.forEach((a) => {
    if (a.client?.id) {
      if (!clientAppCountMap[a.client.id]) {
        clientAppCountMap[a.client.id] = { count: 0, totalSpent: 0, client: a.client };
      }
      clientAppCountMap[a.client.id].count += 1;
      if (a.status === 'completed' || a.status === 'confirmed') {
        const price = a.service?.price ? Number(a.service.price) : 0;
        clientAppCountMap[a.client.id].totalSpent += price;
      }
    }
  });

  const clientStatsList = Object.values(clientAppCountMap);
  const recurringClientsCount = clientStatsList.filter((c) => c.count > 1).length;
  const inactiveClientsCount = clientStatsList.filter((c) => c.count === 0).length;

  const totalClientsCount = clients.length || 1;
  const recurringPct = Math.round((recurringClientsCount / totalClientsCount) * 100);
  const newPct = Math.round((newClientsCount / totalClientsCount) * 100);
  const inactivePct = Math.max(0, 100 - recurringPct - newPct);

  const clientSegmentationChart = [
    { name: 'Recurrentes', value: recurringPct, color: '#2563eb' },
    { name: 'Nuevos', value: newPct, color: '#16a34a' },
    { name: 'Inactivos', value: inactivePct, color: '#94a3b8' },
  ];

  // Top Clientes
  const topClients = [...clientStatsList]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((c) => ({
      name: c.client?.name || 'Cliente',
      citas: c.count,
      totalSpent: c.totalSpent,
    }));

  // --- MÉTRICAS DE INGRESOS ---
  let totalRevenue = 0;
  appointments.forEach((a) => {
    if (a.status === 'completed' || a.status === 'confirmed') {
      const price = Number(a.total_price) || (a.service?.price ? Number(a.service.price) : 0);
      totalRevenue += price;
    }
  });

  const avgRevenuePerAppointment = completedAppointmentsList.length > 0
    ? Math.round(totalRevenue / completedAppointmentsList.length)
    : 0;

  const projectedMonthlyRevenue = Math.round(totalRevenue * 1.15);

  // Gráfico de Ingresos por Mes (Últimos 6 Meses)
  const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const revenueByMonthMap: Record<string, number> = {};

  // Inicializar los últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNamesShort[d.getMonth()]}`;
    revenueByMonthMap[label] = 0;
  }

  appointments.forEach((a) => {
    if (a.status === 'completed' || a.status === 'confirmed') {
      const d = new Date(a.start_time);
      const label = `${monthNamesShort[d.getMonth()]}`;
      if (revenueByMonthMap[label] !== undefined) {
        const price = Number(a.total_price) || (a.service?.price ? Number(a.service.price) : 0);
        revenueByMonthMap[label] += price;
      }
    }
  });

  const revenueByMonthChart = Object.keys(revenueByMonthMap).map((mes) => ({
    mes,
    ingresos: revenueByMonthMap[mes],
  }));

  // Desglose por Servicio
  const revenueByServiceMap: Record<string, number> = {};
  appointments.forEach((a) => {
    if ((a.status === 'completed' || a.status === 'confirmed') && a.service?.name) {
      const srvName = a.service.name;
      const price = Number(a.total_price) || (a.service?.price ? Number(a.service.price) : 0);
      revenueByServiceMap[srvName] = (revenueByServiceMap[srvName] || 0) + price;
    }
  });

  const revenueByServiceList = Object.entries(revenueByServiceMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Desglose por Profesional
  const revenueByStaffMap: Record<string, number> = {};
  appointments.forEach((a) => {
    if ((a.status === 'completed' || a.status === 'confirmed') && a.staff?.name) {
      const stfName = a.staff.name;
      const price = Number(a.total_price) || (a.service?.price ? Number(a.service.price) : 0);
      revenueByStaffMap[stfName] = (revenueByStaffMap[stfName] || 0) + price;
    }
  });

  const revenueByStaffList = Object.entries(revenueByStaffMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // --- TABLAS PARA EXPORTACIÓN Y VISTA DETALLADA ---
  const appointmentsTable = appointments.map((a) => ({
    id: a.id,
    fecha: new Date(a.start_time).toLocaleDateString('es-CO') + ' ' + new Date(a.start_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    cliente: a.client?.name || 'N/A',
    telefono: a.client?.phone || 'N/A',
    servicio: a.service?.name || 'N/A',
    profesional: a.staff?.name || 'N/A',
    estado: a.status === 'completed' ? 'Completada' : a.status === 'cancelled' ? 'Cancelada' : 'Confirmada',
    precio: a.service?.price ? Number(a.service.price) : 0,
  }));

  const clientsTable = clients.map((c) => {
    const stat = clientAppCountMap[c.id] || { count: 0, totalSpent: 0 };
    return {
      id: c.id,
      nombre: c.name || 'Sin nombre',
      email: c.email || 'N/A',
      telefono: c.phone || 'N/A',
      citas: stat.count,
      totalSpent: stat.totalSpent,
      fechaRegistro: new Date(c.created_at).toLocaleDateString('es-CO'),
    };
  });

  const revenueTable = appointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .map((a) => ({
      id: a.id,
      fecha: new Date(a.start_time).toLocaleDateString('es-CO') + ' ' + new Date(a.start_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      servicio: a.service?.name || 'Servicio',
      profesional: a.staff?.name || 'Profesional',
      cliente: a.client?.name || 'Cliente',
      monto: Number(a.total_price) || (a.service?.price ? Number(a.service.price) : 0),
      estado: 'Pagado / Confirmado',
    }));

  return {
    tenantInfo,
    periodLabel,
    selectedBranchName,
    branches,
    kpis: {
      citas: {
        total: totalAppointments,
        completadas: completedAppointmentsCount,
        canceladas: cancelledAppointmentsCount,
        tasaCompletitud: completionRate,
        chartByDay: appointmentsByDayChart,
        table: appointmentsTable,
      },
      clientes: {
        nuevos: newClientsCount,
        recurrentes: recurringClientsCount,
        inactivos: inactiveClientsCount,
        segmentationChart: clientSegmentationChart,
        topClients,
        table: clientsTable,
      },
      ingresos: {
        total: totalRevenue,
        promedioCita: avgRevenuePerAppointment,
        proyeccion: projectedMonthlyRevenue,
        chartByMonth: revenueByMonthChart,
        byService: revenueByServiceList,
        byStaff: revenueByStaffList,
        table: revenueTable,
      },
    },
  };
}
