import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { TenantGalleryItem } from '@/types/theme';

interface GallerySectionProps {
  gallery: TenantGalleryItem[];
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function GallerySection({ gallery, deviceViewport }: GallerySectionProps) {
  if (!gallery || gallery.length === 0) {
    return null;
  }

  const gridColsClass =
    deviceViewport === 'mobile'
      ? 'grid-cols-1 gap-4'
      : deviceViewport === 'tablet'
      ? 'grid-cols-1 sm:grid-cols-2 gap-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <section id="gallery" className="py-12 sm:py-20 bg-[var(--background)]">
      <Container>
        <SectionHeading
          badge="Instalaciones"
          title="Galería de Fotos"
          subtitle="Explora nuestros espacios, trabajos y ambientes."
          className="mb-10 sm:mb-14"
        />

        <div className={`grid ${gridColsClass}`}>
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[var(--foreground)]/10 bg-[var(--surface)]"
            >
              <img
                src={item.image_url}
                alt={item.caption || 'Foto de galería'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {item.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 sm:p-6">
                  <p className="text-white text-xs sm:text-sm font-semibold">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
