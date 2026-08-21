'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '../shared/ThemeProvider';
import { PublicNavbar } from '../shared/PublicNavbar';
import { PublicFooter } from '../shared/PublicFooter';
import { PublicBottomNav } from '../shared/PublicBottomNav';
import { PublicPageRenderer } from '../templates/PublicPageRenderer';
import { TimeSlotPicker } from '../../booking/TimeSlotPicker';
import { ClientAppointmentsView } from './ClientAppointmentsView';
import { ClientProfileView } from './ClientProfileView';
import { ClientAuthModal } from '../auth/ClientAuthModal';
import { useRouter } from 'next/navigation';
import { Tenant, Service, Staff, WorkingHour, Branch, Appointment } from '@/types/database';
import { CompleteTenantAppearance } from '@/types/theme';

interface ClientPortalContainerProps {
  tenant: Tenant;
  appearance: CompleteTenantAppearance;
  services: Service[];
  staffList: Staff[];
  branches: Branch[];
  workingHours: WorkingHour[];
  appointments: Appointment[];
  initialClientData: {
    authenticated: boolean;
    user: any;
    client: any;
  };
  initialView?: 'landing' | 'booking' | 'appointments' | 'profile';
  initialStaffId?: string;
  initialServiceId?: string;
  initialBranchId?: string;
}

export function ClientPortalContainer({
  tenant,
  appearance,
  services,
  staffList,
  branches,
  workingHours,
  appointments,
  initialClientData,
  initialView = 'landing',
  initialStaffId,
  initialServiceId,
  initialBranchId,
}: ClientPortalContainerProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'landing' | 'booking' | 'appointments' | 'profile'>(initialView);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [clientData, setClientData] = useState(initialClientData);

  React.useEffect(() => {
    setClientData(initialClientData);
  }, [initialClientData]);

  React.useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [router]);

  const { theme, socials } = appearance;

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleNavigateView = (view: 'landing' | 'booking' | 'appointments' | 'profile') => {
    if ((view === 'booking' || view === 'appointments' || view === 'profile') && !clientData.authenticated) {
      handleOpenAuth('login');
      return;
    }
    if (view === 'landing') {
      if (typeof window !== 'undefined' && (window.location.pathname.includes('/book') || window.location.search)) {
        window.location.href = `/${tenant.slug}`;
        return;
      }
    }
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const newUrl = view === 'landing' ? `/${tenant.slug}` : `/${tenant.slug}?view=${view}`;
      window.history.pushState({ view }, '', newUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/${tenant.slug}`;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col min-h-screen bg-[var(--background,#F9F8F6)] text-[var(--foreground,#18181B)] font-[var(--font-sans)] transition-colors duration-200">
        {/* Navbar */}
        <PublicNavbar
          tenant={tenant}
          authenticatedClient={clientData.authenticated ? clientData.client : null}
          activeView={currentView}
          onNavigateView={handleNavigateView}
          onOpenAuth={handleOpenAuth}
        />

        {/* Dynamic Main view */}
        <main className="flex-1 pb-20 md:pb-0">
          {currentView === 'landing' && (
            <PublicPageRenderer
              tenant={tenant}
              appearance={appearance}
              services={services}
              staffList={staffList}
              branches={branches}
              workingHours={workingHours}
              bookingUrl={`/${tenant.slug}/book`}
              hideHeaderFooter={true}
            />
          )}

          {currentView === 'booking' && (
            <div className="max-w-4xl mx-auto py-8 px-4">
              <div className="bg-[var(--card,#ffffff)] p-4 sm:p-8 rounded-3xl border border-[var(--border,#E4E2EC)] shadow-xl">
                <TimeSlotPicker
                  tenantSlug={tenant.slug}
                  businessName={tenant.name}
                  businessPhone={tenant.phone || undefined}
                  service={services[0]}
                  services={services}
                  branches={branches}
                  staffMembers={staffList}
                  workingHours={workingHours}
                  allAppointments={appointments}
                  currentClient={clientData.client}
                  onViewAppointments={() => handleNavigateView('appointments')}
                  onNavigateHome={handleNavigateHome}
                  onOpenAuth={handleOpenAuth}
                  initialStaffId={initialStaffId}
                  initialServiceId={initialServiceId}
                  initialBranchId={initialBranchId}
                />
              </div>
            </div>
          )}

          {currentView === 'appointments' && (
            <div className="py-8 px-4">
              <ClientAppointmentsView
                tenantSlug={tenant.slug}
                businessName={tenant.name}
                businessPhone={tenant.phone || undefined}
                workingHours={workingHours}
                allAppointments={appointments}
                onOpenBooking={() => handleNavigateView('booking')}
              />
            </div>
          )}

          {currentView === 'profile' && (
            <div className="py-8 px-4">
              <ClientProfileView
                tenantSlug={tenant.slug}
                client={clientData.client}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <PublicFooter tenant={tenant} socials={socials} onNavigateView={handleNavigateView} />

        {/* Mobile Bottom Navigation */}
        <PublicBottomNav
          activeView={currentView}
          isAuthenticated={clientData.authenticated}
          onNavigateView={handleNavigateView}
          onOpenAuth={handleOpenAuth}
        />

        {/* Client Auth Modal */}
        <ClientAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          tenantSlug={tenant.slug}
          defaultTab={authModalTab}
          onSuccess={(u, c) => {
            setClientData({
              authenticated: true,
              user: u || null,
              client: c || {
                id: '',
                name: u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'Cliente',
                email: u?.email || '',
                phone: u?.user_metadata?.phone || '',
                tenant_id: tenant.id,
              },
            });
            router.refresh();
          }}
        />
      </div>
    </ThemeProvider>
  );
}

