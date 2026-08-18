import React from 'react';
import { getSchedulesDataAction } from './actions';
import { ScheduleManager } from './ScheduleManager';

export const metadata = {
  title: 'Horarios de Atención | OmniCitas',
  description: 'Configura horarios de atención generales, descansos y turnos específicos por profesional.',
};

export default async function SchedulesPage() {
  const { workingHours, staffList, error } = await getSchedulesDataAction();

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 text-sm">
        <p className="font-bold">Error al cargar los horarios:</p>
        <p>{error}</p>
      </div>
    );
  }

  return <ScheduleManager initialWorkingHours={workingHours} staffList={staffList} />;
}
