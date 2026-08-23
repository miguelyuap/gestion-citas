import React from 'react';
import Agenda from '@/components/figma-make/pages/Agenda';

export const metadata = {
  title: 'Gestión de Citas | Dashboard',
  description: 'Administración completa de citas, agenda, disponibilidades, confirmaciones y cancelaciones.',
};

export default async function AppointmentsPage() {
  return <Agenda />;
}
