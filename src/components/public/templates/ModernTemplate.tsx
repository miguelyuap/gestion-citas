import React from 'react';
import { PublicNavbar } from '../shared/PublicNavbar';
import { PublicFooter } from '../shared/PublicFooter';
import { HeroSection } from '../sections/HeroSection';
import { ServicesSection } from '../sections/ServicesSection';
import { StaffSection } from '../sections/StaffSection';
import { AboutSection } from '../sections/AboutSection';
import { GallerySection } from '../sections/GallerySection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { BookingCTASection } from '../sections/BookingCTASection';
import { ContactSection } from '../sections/ContactSection';
import { Tenant, Service, Staff, WorkingHour } from '@/types/database';
import { CompleteTenantAppearance } from '@/types/theme';

interface TemplateProps {
  tenant: Tenant;
  appearance: CompleteTenantAppearance;
  services: Service[];
  staffList: Staff[];
  workingHours?: WorkingHour[];
  bookingUrl: string;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function ModernTemplate({
  tenant,
  appearance,
  services,
  staffList,
  workingHours,
  bookingUrl,
  deviceViewport,
}: TemplateProps) {
  const { settings, theme, sections, socials, gallery, testimonials } = appearance;
  const buttonStyle = theme.button_style || 'rounded';

  const sortedSections = [...sections]
    .filter((s) => s.is_enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const renderSection = (key: string) => {
    switch (key) {
      case 'hero':
        return (
          <HeroSection
            key="hero"
            settings={settings}
            bookingUrl={bookingUrl}
            buttonStyle={buttonStyle}
            variant="modern"
            deviceViewport={deviceViewport}
          />
        );
      case 'services':
        return (
          <ServicesSection
            key="services"
            services={services}
            bookingUrl={bookingUrl}
            buttonStyle={buttonStyle}
            deviceViewport={deviceViewport}
          />
        );
      case 'staff':
        return (
          <StaffSection
            key="staff"
            staffList={staffList}
            bookingUrl={bookingUrl}
            buttonStyle={buttonStyle}
            deviceViewport={deviceViewport}
          />
        );
      case 'about':
        return <AboutSection key="about" settings={settings} deviceViewport={deviceViewport} />;
      case 'gallery':
        return <GallerySection key="gallery" gallery={gallery} deviceViewport={deviceViewport} />;
      case 'testimonials':
        return <TestimonialsSection key="testimonials" testimonials={testimonials} deviceViewport={deviceViewport} />;
      case 'booking_cta':
        return (
          <BookingCTASection
            key="booking_cta"
            bookingUrl={bookingUrl}
            buttonStyle={buttonStyle}
          />
        );
      case 'contact':
        return (
          <ContactSection
            key="contact"
            tenant={tenant}
            socials={socials}
            workingHours={workingHours}
            deviceViewport={deviceViewport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar tenant={tenant} bookingUrl={bookingUrl} deviceViewport={deviceViewport} />
      <main className="flex-1">
        {sortedSections.map((sec) => renderSection(sec.section_key))}
      </main>
      <PublicFooter tenant={tenant} socials={socials} deviceViewport={deviceViewport} />
    </div>
  );
}
