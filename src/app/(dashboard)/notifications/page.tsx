import React from 'react';
import { getNotificationsAction } from './actions';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export const metadata = {
  title: 'Centro de Notificaciones | OmniCitas',
  description: 'Historial de notificaciones persistentes de citas y eventos.',
};

export default async function NotificationsPage() {
  const { notifications, unreadCount } = await getNotificationsAction();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <NotificationCenter
        initialNotifications={notifications || []}
        initialUnreadCount={unreadCount || 0}
      />
    </div>
  );
}
