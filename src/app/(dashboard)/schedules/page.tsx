import React from 'react';
import Horarios from '@/components/figma-make/pages/Horarios';

export const metadata = {
  title: 'Horarios de Atención | Dashboard',
  description: 'Configura horarios de atención generales, descansos y turnos específicos por profesional o sucursal.',
};

export default async function SchedulesPage() {
  return <Horarios />;
}
