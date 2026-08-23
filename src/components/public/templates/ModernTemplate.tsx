import React from 'react';
import { PublicNavbar } from '../shared/PublicNavbar';
import { PublicFooter } from '../shared/PublicFooter';
import { HeroSection } from '../sections/HeroSection';
import { ServicesSection } from '../sections/ServicesSection';
import { StaffSection } from '../sections/StaffSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { AboutSection } from '../sections/AboutSection';
import { GallerySection } from '../sections/GallerySection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { BookingCTASection } from '../sections/BookingCTASection';
import { ContactSection } from '../sections/ContactSection';
import { Tenant, Service, Staff, WorkingHour, Branch } from '@/types/database';
import { CompleteTenantAppearance } from '@/types/theme';

interface TemplateProps {
  tenant: Tenant;
  appearance: CompleteTenantAppearance;
  services: Service[];
  staffList: Staff[];
  branches?: Branch[];
  workingHours?: WorkingHour[];
  bookingUrl: string;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
  hideHeaderFooter?: boolean;
  onNavigateView?: (
    view: 'landing' | 'booking' | 'appointments' | 'profile',
    options?: { serviceId?: string; staffId?: string; branchId?: string }
  ) => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  isAuthenticated?: boolean;
}

export function ModernTemplate({
  tenant,
  appearance,
  services,
  staffList,
  branches = [],
  workingHours,
  bookingUrl,
  deviceViewport,
  hideHeaderFooter = false,
  onNavigateView,
  onOpenAuth,
  isAuthenticated = false,
}: TemplateProps) {
  const { settings, theme, socials, testimonials } = appearance;
  const buttonStyle = theme.button_style || 'rounded';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && (
        <PublicNavbar tenant={tenant} bookingUrl={bookingUrl} deviceViewport={deviceViewport} />
      )}
      <main className="flex-1">
        <HeroSection
          settings={settings}
          bookingUrl={bookingUrl}
          buttonStyle={buttonStyle}
          variant="modern"
          deviceViewport={deviceViewport}
          onNavigateView={onNavigateView}
          onOpenAuth={onOpenAuth}
          isAuthenticated={isAuthenticated}
        />
        <ServicesSection
          services={services}
          bookingUrl={bookingUrl}
          buttonStyle={buttonStyle}
          deviceViewport={deviceViewport}
          onNavigateView={onNavigateView}
          onOpenAuth={onOpenAuth}
          isAuthenticated={isAuthenticated}
        />
        <StaffSection
          staffList={staffList}
          bookingUrl={bookingUrl}
          buttonStyle={buttonStyle}
          deviceViewport={deviceViewport}
          onNavigateView={onNavigateView}
          onOpenAuth={onOpenAuth}
          isAuthenticated={isAuthenticated}
        />
        <HowItWorksSection />
        <TestimonialsSection testimonials={testimonials} deviceViewport={deviceViewport} />
        <ContactSection
          tenant={tenant}
          settings={settings}
          socials={socials}
          branches={branches}
          workingHours={workingHours}
          deviceViewport={deviceViewport}
        />
      </main>
      {!hideHeaderFooter && (
        <PublicFooter tenant={tenant} socials={socials} deviceViewport={deviceViewport} />
      )}
    </div>
  );
}
