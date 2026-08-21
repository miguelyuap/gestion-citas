'use client';

import React from 'react';
import { ThemeProvider } from '../shared/ThemeProvider';
import { ModernTemplate } from './ModernTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { BoldTemplate } from './BoldTemplate';
import { Tenant, Service, Staff, WorkingHour, Branch } from '@/types/database';
import { CompleteTenantAppearance } from '@/types/theme';

interface PublicPageRendererProps {
  tenant: Tenant;
  appearance: CompleteTenantAppearance;
  services: Service[];
  staffList: Staff[];
  branches?: Branch[];
  workingHours?: WorkingHour[];
  bookingUrl?: string;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
  hideHeaderFooter?: boolean;
}

export function PublicPageRenderer({
  tenant,
  appearance,
  services,
  staffList,
  branches = [],
  workingHours,
  bookingUrl = `/${tenant.slug}/book`,
  deviceViewport,
  hideHeaderFooter = false,
}: PublicPageRendererProps) {
  const { settings, theme } = appearance;
  const templateType = settings.template || 'modern';

  const renderTemplate = () => {
    switch (templateType) {
      case 'elegant':
        return (
          <ElegantTemplate
            tenant={tenant}
            appearance={appearance}
            services={services}
            staffList={staffList}
            workingHours={workingHours}
            bookingUrl={bookingUrl}
            deviceViewport={deviceViewport}
            hideHeaderFooter={hideHeaderFooter}
          />
        );
      case 'bold':
        return (
          <BoldTemplate
            tenant={tenant}
            appearance={appearance}
            services={services}
            staffList={staffList}
            workingHours={workingHours}
            bookingUrl={bookingUrl}
            deviceViewport={deviceViewport}
            hideHeaderFooter={hideHeaderFooter}
          />
        );
      case 'modern':
      default:
        return (
          <ModernTemplate
            tenant={tenant}
            appearance={appearance}
            services={services}
            staffList={staffList}
            branches={branches}
            workingHours={workingHours}
            bookingUrl={bookingUrl}
            deviceViewport={deviceViewport}
            hideHeaderFooter={hideHeaderFooter}
          />
        );
    }
  };

  return <ThemeProvider theme={theme}>{renderTemplate()}</ThemeProvider>;
}
