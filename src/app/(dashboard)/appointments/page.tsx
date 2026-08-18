import React from 'react';
import { getAppointmentsDataAction } from './actions';
import AppointmentsClient from './AppointmentsClient';

export const metadata = {
  title: 'Gestión de Citas | Dashboard Multi-Tenant',
  description: 'Administración completa de citas, agenda, disponibilidades, confirmaciones y cancelaciones.',
};

export default async function AppointmentsPage() {
  const { appointments, staffList, servicesList, clientsList, workingHoursList } =
    await getAppointmentsDataAction();

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      staffList={staffList}
      servicesList={servicesList}
      clientsList={clientsList}
      workingHoursList={workingHoursList}
    />
  );
}
