export interface TenantBrandingInfo {
  name: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
}

/**
 * Servicio para exportar reportes en formatos Excel (.csv codificado UTF-8 BOM) y PDF
 */
export class ExportService {
  /**
   * Exporta a Excel (.csv con BOM UTF-8)
   */
  static exportToExcel(
    tabName: string,
    reportData: any,
    tenantInfo: TenantBrandingInfo,
    periodLabel: string,
    branchName?: string
  ) {
    let csvContent = '\uFEFF'; // BOM para compatibilidad con Excel

    // Encabezado de la Empresa
    csvContent += `"${tenantInfo.name.toUpperCase()} - REPORTE DE ${tabName.toUpperCase()}"\n`;
    if (branchName) {
      csvContent += `"Sucursal: ${branchName}"\n`;
    }
    csvContent += `"Período: ${periodLabel}"\n`;
    csvContent += `"Generado: ${new Date().toLocaleString('es-CO')}"\n`;
    if (tenantInfo.phone || tenantInfo.email) {
      csvContent += `"Contacto: ${tenantInfo.phone || ''} ${tenantInfo.email || ''}"\n`;
    }
    csvContent += `\n`;

    if (tabName === 'Citas') {
      const rows = reportData?.table || [];
      csvContent += `"Fecha y Hora","Cliente","Teléfono","Servicio","Profesional","Estado","Precio ($)"\n`;
      rows.forEach((r: any) => {
        csvContent += `"${r.fecha}","${r.cliente}","${r.telefono}","${r.servicio}","${r.profesional}","${r.estado}","${r.precio}"\n`;
      });
    } else if (tabName === 'Clientes') {
      const rows = reportData?.table || [];
      csvContent += `"Nombre del Cliente","Correo Electrónico","Teléfono","Total Citas","Total Gastado ($)","Fecha Registro"\n`;
      rows.forEach((r: any) => {
        csvContent += `"${r.nombre}","${r.email}","${r.telefono}","${r.citas}","${r.totalSpent}","${r.fechaRegistro}"\n`;
      });
    } else if (tabName === 'Ingresos') {
      const rows = reportData?.table || [];
      csvContent += `"Fecha y Hora","Servicio","Profesional","Cliente","Estado Pago","Monto ($)"\n`;
      rows.forEach((r: any) => {
        csvContent += `"${r.fecha}","${r.servicio}","${r.profesional}","${r.cliente}","${r.estado}","${r.monto}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `reporte_${tabName.toLowerCase()}_${tenantInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exporta a PDF mediante una ventana de impresión formateada con membrete oficial del negocio
   */
  static exportToPdf(
    tabName: string,
    reportData: any,
    tenantInfo: TenantBrandingInfo,
    periodLabel: string,
    branchName?: string
  ) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    let kpisHtml = '';
    let tableHtml = '';

    if (tabName === 'Citas') {
      const kpis = reportData || {};
      kpisHtml = `
        <div class="kpi-grid">
          <div class="kpi-card"><span class="kpi-label">TOTAL CITAS</span><span class="kpi-value">${kpis.total || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">COMPLETADAS</span><span class="kpi-value" style="color:#16a34a">${kpis.completadas || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">CANCELADAS</span><span class="kpi-value" style="color:#dc2626">${kpis.canceladas || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">TASA COMPLETITUD</span><span class="kpi-value" style="color:#2563eb">${kpis.tasaCompletitud || 0}%</span></div>
        </div>
      `;

      const rows = kpis.table || [];
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Servicio</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r: any) => `
              <tr>
                <td>${r.fecha}</td>
                <td><strong>${r.cliente}</strong></td>
                <td>${r.telefono}</td>
                <td>${r.servicio}</td>
                <td>${r.profesional}</td>
                <td><span class="badge ${r.estado === 'Completada' ? 'badge-success' : r.estado === 'Cancelada' ? 'badge-danger' : 'badge-info'}">${r.estado}</span></td>
                <td>$${Number(r.precio).toLocaleString('es-CO')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'Clientes') {
      const kpis = reportData || {};
      kpisHtml = `
        <div class="kpi-grid">
          <div class="kpi-card"><span class="kpi-label">NUEVOS ESTE MES</span><span class="kpi-value" style="color:#16a34a">${kpis.nuevos || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">RECURRENTES</span><span class="kpi-value" style="color:#2563eb">${kpis.recurrentes || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">INACTIVOS (+90 DÍAS)</span><span class="kpi-value" style="color:#94a3b8">${kpis.inactivos || 0}</span></div>
        </div>
      `;

      const rows = kpis.table || [];
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Citas Agendadas</th>
              <th>Total Gastado</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r: any) => `
              <tr>
                <td><strong>${r.nombre}</strong></td>
                <td>${r.email}</td>
                <td>${r.telefono}</td>
                <td>${r.citas} citas</td>
                <td>$${Number(r.totalSpent).toLocaleString('es-CO')}</td>
                <td>${r.fechaRegistro}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'Ingresos') {
      const kpis = reportData || {};
      kpisHtml = `
        <div class="kpi-grid">
          <div class="kpi-card"><span class="kpi-label">INGRESOS DEL PERÍODO</span><span class="kpi-value" style="color:#16a34a">$${Number(kpis.total || 0).toLocaleString('es-CO')}</span></div>
          <div class="kpi-card"><span class="kpi-label">PROMEDIO / CITA</span><span class="kpi-value" style="color:#2563eb">$${Number(kpis.promedioCita || 0).toLocaleString('es-CO')}</span></div>
          <div class="kpi-card"><span class="kpi-label">PRORECCIÓN MENSUAL</span><span class="kpi-value">$${Number(kpis.proyeccion || 0).toLocaleString('es-CO')}</span></div>
        </div>
      `;

      const rows = kpis.table || [];
      tableHtml = `
        <table>
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Servicio</th>
              <th>Profesional</th>
              <th>Cliente</th>
              <th>Estado Pago</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r: any) => `
              <tr>
                <td>${r.fecha}</td>
                <td><strong>${r.servicio}</strong></td>
                <td>${r.profesional}</td>
                <td>${r.cliente}</td>
                <td><span class="badge badge-success">${r.estado}</span></td>
                <td>$${Number(r.monto).toLocaleString('es-CO')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de ${tabName} - ${tenantInfo.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 30px; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
            .business-name { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
            .business-contact { font-size: 12px; color: #64748b; margin-top: 4px; }
            .report-title { font-size: 18px; font-weight: 700; color: #2563eb; margin: 0 0 4px 0; text-transform: uppercase; }
            .period-tag { display: inline-block; font-size: 12px; font-weight: 600; background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; margin-top: 6px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
            .kpi-label { display: block; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 4px; }
            .kpi-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10.5px; font-weight: 600; }
            .badge-success { background: #dcfce7; color: #15803d; }
            .badge-danger { background: #fee2e2; color: #b91c1c; }
            .badge-info { background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="business-name">${tenantInfo.name}</h1>
              <div class="business-contact">
                ${tenantInfo.address ? tenantInfo.address + ' • ' : ''}
                ${tenantInfo.phone ? 'Tel: ' + tenantInfo.phone + ' • ' : ''}
                ${tenantInfo.email ? tenantInfo.email : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <h2 class="report-title">Reporte de ${tabName}</h2>
              <span class="period-tag">Período: ${periodLabel}</span>
              ${branchName ? `<div style="font-size: 11.5px; font-weight: 600; color: #475569; margin-top: 4px;">Sucursal: ${branchName}</div>` : ''}
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Generado el ${new Date().toLocaleDateString('es-CO')}</div>
            </div>
          </div>

          ${kpisHtml}
          ${tableHtml}

          <div class="footer">
            Documento generado automáticamente por el sistema de gestión de citas OmniCitas para ${tenantInfo.name}.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }
}
