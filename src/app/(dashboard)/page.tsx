import React from 'react';
import { createClient } from '@/lib/supabase/server';
import App from '@/components/figma-make/App';
import { getTenantIdForUser } from '@/lib/services/tenant-context.service';

const formatLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Obtener sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tenantName = 'Mi Negocio';
  let logoUrl: string | null = null;
  let userName = user?.email ? user.email.split('@')[0] : 'Administrador';
  let tenantId = '';

  if (user) {
    tenantId = (await getTenantIdForUser(supabase, user)) || '';

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, tenants(*)')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      if (profile.full_name) userName = profile.full_name;
      const tenantObj = profile.tenants as any;
      if (tenantObj) {
        tenantName = tenantObj.name || tenantName;
        logoUrl = tenantObj.logo_url || null;
      }
    }
  }

  // 2. Fechas para Cálculos Reales en Hora Local
  const now = new Date();
  const todayDateStr = formatLocalDateString(now);

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayDateStr = formatLocalDateString(yesterday);

  // Mes Actual y Anterior
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Esta Semana (Lunes a Domingo)
  const currentDayOfWeek = now.getDay();
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const startThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
  const endThisWeek = new Date(startThisWeek);
  endThisWeek.setDate(endThisWeek.getDate() + 6);
  endThisWeek.setHours(23, 59, 59, 999);

  // 3. Variables de métricas
  let todayAppointmentsCount = 0;
  let yesterdayAppointmentsCount = 0;
  let pendingAppointmentsCount = 0;
  let clientsThisMonthCount = 0;
  let clientsLastMonthCount = 0;
  let incomeThisMonthVal = 0;
  let incomeLastMonthVal = 0;

  let citasHoyList: Array<any> = [];

  let chartDataHoy: Array<{ dia: string; citas: number }> = [
    { dia: '08:00', citas: 0 },
    { dia: '10:00', citas: 0 },
    { dia: '12:00', citas: 0 },
    { dia: '14:00', citas: 0 },
    { dia: '16:00', citas: 0 },
    { dia: '18:00', citas: 0 },
    { dia: '20:00', citas: 0 },
  ];

  let chartDataSemana: Array<{ dia: string; citas: number }> = [
    { dia: 'Lun', citas: 0 },
    { dia: 'Mar', citas: 0 },
    { dia: 'Mié', citas: 0 },
    { dia: 'Jue', citas: 0 },
    { dia: 'Vie', citas: 0 },
    { dia: 'Sáb', citas: 0 },
    { dia: 'Dom', citas: 0 },
  ];

  let chartDataMes: Array<{ dia: string; citas: number }> = [
    { dia: 'Sem 1', citas: 0 },
    { dia: 'Sem 2', citas: 0 },
    { dia: 'Sem 3', citas: 0 },
    { dia: 'Sem 4', citas: 0 },
  ];

  let pieStatusData = [
    { name: 'Confirmadas', value: 0, color: '#2563eb' },
    { name: 'Completadas', value: 0, color: '#16a34a' },
    { name: 'Pendientes',  value: 0, color: '#eab308' },
    { name: 'Canceladas',  value: 0, color: '#dc2626' },
  ];

  try {
    const [
      { count: curClientsCount },
      { count: prevClientsCount },
      { data: completedThisMonth },
      { data: completedLastMonth },
      { data: allTenantAppointments },
    ] = await Promise.all([
      // Clientes creados este mes
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startThisMonth.toISOString()),
      // Clientes creados el mes anterior
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startLastMonth.toISOString())
        .lte('created_at', endLastMonth.toISOString()),
      // Ingresos de citas completadas este mes
      supabase
        .from('appointments')
        .select('total_price')
        .eq('tenant_id', tenantId)
        .eq('status', 'completed')
        .gte('start_time', startThisMonth.toISOString())
        .lte('start_time', endThisMonth.toISOString()),
      // Ingresos de citas completadas el mes anterior
      supabase
        .from('appointments')
        .select('total_price')
        .eq('tenant_id', tenantId)
        .eq('status', 'completed')
        .gte('start_time', startLastMonth.toISOString())
        .lte('start_time', endLastMonth.toISOString()),
      // Obtenemos el listado completo de citas para el tenant (Idéntico a Agenda.tsx)
      supabase
        .from('appointments')
        .select('*, services(name, price), clients(name), staff(name)')
        .eq('tenant_id', tenantId)
        .order('start_time', { ascending: true }),
    ]);

    const allApps = allTenantAppointments || [];

    // 1. Filtrado exacto de Citas de Hoy para la fecha actual
    const todayAppointments = allApps.filter((item: any) => {
      if (!item.start_time) return false;
      return formatLocalDateString(new Date(item.start_time)) === todayDateStr;
    });

    // 2. Filtrado exacto de Citas de Ayer
    const yesterdayAppointments = allApps.filter((item: any) => {
      if (!item.start_time) return false;
      return formatLocalDateString(new Date(item.start_time)) === yesterdayDateStr;
    });

    todayAppointmentsCount = todayAppointments.length;
    yesterdayAppointmentsCount = yesterdayAppointments.length;
    pendingAppointmentsCount = allApps.filter((item: any) => item.status === 'pending').length;

    clientsThisMonthCount = curClientsCount || 0;
    clientsLastMonthCount = prevClientsCount || 0;

    incomeThisMonthVal = (completedThisMonth || []).reduce(
      (acc, item) => acc + (Number(item.total_price) || 0),
      0
    );
    incomeLastMonthVal = (completedLastMonth || []).reduce(
      (acc, item) => acc + (Number(item.total_price) || 0),
      0
    );

    // Mapear Citas de hoy (incluyendo el PRECIO)
    if (todayAppointments.length > 0) {
      const estadoMap: Record<string, string> = {
        confirmed: 'Confirmada',
        pending: 'Pendiente',
        cancelled: 'Cancelada',
        completed: 'Completada',
      };

      citasHoyList = todayAppointments.map((item: any, idx: number) => {
        const startDate = item.start_time ? new Date(item.start_time) : new Date();
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        const horaStr = `${hours}:${minutes}`;
        const itemPrice = Number(item.total_price || item.services?.price || 0);

        return {
          id: item.id || idx + 1,
          hora: horaStr,
          cliente: item.clients?.name || 'Cliente General',
          servicio: item.services?.name || 'Servicio General',
          profesional: item.staff?.name || 'Especialista',
          precio: itemPrice,
          estado: estadoMap[item.status] || 'Confirmada',
          raw_start: item.start_time,
        };
      });
    }

    // Gráfico de Evolución HOY por horas (08:00 a 20:00)
    const hoursSlots = [
      { dia: '08:00', citas: 0 },
      { dia: '10:00', citas: 0 },
      { dia: '12:00', citas: 0 },
      { dia: '14:00', citas: 0 },
      { dia: '16:00', citas: 0 },
      { dia: '18:00', citas: 0 },
      { dia: '20:00', citas: 0 },
    ];
    todayAppointments.forEach((item: any) => {
      if (item.start_time) {
        const h = new Date(item.start_time).getHours();
        if (h < 9) hoursSlots[0].citas++;
        else if (h < 11) hoursSlots[1].citas++;
        else if (h < 13) hoursSlots[2].citas++;
        else if (h < 15) hoursSlots[3].citas++;
        else if (h < 17) hoursSlots[4].citas++;
        else if (h < 19) hoursSlots[5].citas++;
        else hoursSlots[6].citas++;
      }
    });
    chartDataHoy = hoursSlots;

    // Gráfico de Evolución ESTA SEMANA (Lunes a Domingo)
    const weekApps = allApps.filter((item: any) => {
      if (!item.start_time) return false;
      const d = new Date(item.start_time);
      return d >= startThisWeek && d <= endThisWeek;
    });

    const countsByDay: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };
    weekApps.forEach((item: any) => {
      const day = new Date(item.start_time).getDay();
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    });
    chartDataSemana = [
      { dia: 'Lun', citas: countsByDay[1] || 0 },
      { dia: 'Mar', citas: countsByDay[2] || 0 },
      { dia: 'Mié', citas: countsByDay[3] || 0 },
      { dia: 'Jue', citas: countsByDay[4] || 0 },
      { dia: 'Vie', citas: countsByDay[5] || 0 },
      { dia: 'Sáb', citas: countsByDay[6] || 0 },
      { dia: 'Dom', citas: countsByDay[0] || 0 },
    ];

    // Gráfico de Evolución ESTE MES (Semana 1 a 4)
    const monthApps = allApps.filter((item: any) => {
      if (!item.start_time) return false;
      const d = new Date(item.start_time);
      return d >= startThisMonth && d <= endThisMonth;
    });

    const weeksSlots = [
      { dia: 'Sem 1', citas: 0 },
      { dia: 'Sem 2', citas: 0 },
      { dia: 'Sem 3', citas: 0 },
      { dia: 'Sem 4', citas: 0 },
    ];
    monthApps.forEach((item: any) => {
      const dayOfMonth = new Date(item.start_time).getDate();
      if (dayOfMonth <= 7) weeksSlots[0].citas++;
      else if (dayOfMonth <= 14) weeksSlots[1].citas++;
      else if (dayOfMonth <= 21) weeksSlots[2].citas++;
      else weeksSlots[3].citas++;
    });
    chartDataMes = weeksSlots;

    // Gráfico de Torta por Estado real
    let countConfirmed = 0;
    let countCompleted = 0;
    let countPending = 0;
    let countCancelled = 0;

    allApps.forEach((item: any) => {
      if (item.status === 'confirmed') countConfirmed++;
      else if (item.status === 'completed') countCompleted++;
      else if (item.status === 'pending') countPending++;
      else if (item.status === 'cancelled') countCancelled++;
    });

    pieStatusData = [
      { name: 'Confirmadas', value: countConfirmed, color: '#2563eb' },
      { name: 'Completadas', value: countCompleted, color: '#16a34a' },
      { name: 'Pendientes',  value: countPending,   color: '#eab308' },
      { name: 'Canceladas',  value: countCancelled, color: '#dc2626' },
    ];
  } catch (err) {
    // Fallback silencioso
  }

  // Porcentajes reales
  const getPctChange = (current: number, previous: number) => {
    if (previous > 0) {
      const pct = Math.round(((current - previous) / previous) * 100);
      return { change: `${pct >= 0 ? '+' : ''}${pct}%`, positive: pct >= 0 };
    }
    if (current > 0) {
      return { change: '+100%', positive: true };
    }
    return { change: '0%', positive: true };
  };

  const todayKpiPct = getPctChange(todayAppointmentsCount, yesterdayAppointmentsCount);
  const clientsKpiPct = getPctChange(clientsThisMonthCount, clientsLastMonthCount);
  const incomeKpiPct = getPctChange(incomeThisMonthVal, incomeLastMonthVal);

  const kpis = {
    todayAppointments: todayAppointmentsCount,
    todayChange: todayKpiPct.change,
    todayPositive: todayKpiPct.positive,

    pendingAppointments: pendingAppointmentsCount,

    clientsCount: clientsThisMonthCount,
    clientsChange: clientsKpiPct.change,
    clientsPositive: clientsKpiPct.positive,

    totalIncome: `$${incomeThisMonthVal.toLocaleString('es-CO')}`,
    incomeChange: incomeKpiPct.change,
    incomePositive: incomeKpiPct.positive,

    chartDataHoy,
    chartDataSemana,
    chartDataMes,
    pieStatusData,
  };

  return (
    <App
      initialLoggedIn={true}
      tenantName={tenantName}
      userName={userName}
      logoUrl={logoUrl}
      kpis={kpis}
      citasHoyData={citasHoyList}
    />
  );
}
