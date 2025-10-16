// ========================================
// SISTEMA DE EXPORTACIÓN PDF - RIFA
// Versión mejorada sin emojis y con auto-apertura
// ========================================

// FUNCIONES PRINCIPALES
// ========================================

// Función para generar el PDF
async function generarPDF(preview = false) {
  const { jsPDF } = window.jspdf;
  
  if (!jsPDF) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Librería',
      html: '<p style="font-size: 15px; margin: 12px 0;">No se pudo cargar la librería jsPDF.<br>Verifica tu conexión a internet.</p>',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#B3261E'
    });
    return;
  }

  // Mostrar loading
  Swal.fire({
    title: 'Generando PDF...',
    html: '<div class="spinner"></div><p style="margin-top: 16px;">Procesando datos...</p>',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    // Filtrar solo reservados y pagados, ordenar SOLO por número
    const participantes = rifaData
      .filter(item => item.state === 2 || item.state === 3)
      .sort((a, b) => {
        // Convertir a número para asegurar orden correcto
        const numA = parseInt(a.numero) || 0;
        const numB = parseInt(b.numero) || 0;
        return numA - numB;
      });

    if (participantes.length === 0) {
      Swal.close();
      Swal.fire({
        icon: 'info',
        title: 'Sin Datos para Exportar',
        html: '<p style="font-size: 15px; margin: 12px 0;">No hay rifas reservadas o pagadas para exportar al PDF.</p>',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6750A4'
      });
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ========================================
    // ENCABEZADO CON LOGO (REDUCIDO)
    // ========================================
    doc.setFillColor(103, 80, 164); // Color primario MD3
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Cargar y agregar logo más grande
    try {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      
      // Usar ruta absoluta desde el dominio
      const logoPath = window.location.origin + '/img/IsoTipo-2-SanLuisGonzaga-Amarillo.png';
      
      await new Promise((resolve) => {
        logo.onload = () => {
          try {
            // Calcular proporciones reales de la imagen
            const imgRatio = logo.width / logo.height;
            
            // Tamaño máximo deseado (más grande)
            let logoWidth = 120; // ancho en mm (aumentado de 60)
            let logoHeight = logoWidth / imgRatio; // altura proporcional
            
            // Si la altura es muy grande, ajustar por altura
            if (logoHeight > 22) {
              logoHeight = 22;
              logoWidth = logoHeight * imgRatio;
            }
            
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 3;
            
            doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
            console.log('✅ Logo agregado al PDF con proporciones:', logoWidth, 'x', logoHeight);
          } catch (e) {
            console.warn('Error al agregar logo:', e);
          }
          resolve();
        };
        logo.onerror = () => {
          console.warn('No se pudo cargar el logo desde:', logoPath);
          resolve(); // Continuar sin logo
        };
        logo.src = logoPath;
        
        // Timeout de 3 segundos
        setTimeout(() => resolve(), 3000);
      });
    } catch (e) {
      console.warn('Error cargando logo:', e);
    }

    // Fecha y hora de generación
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const fecha = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado: ${fecha}`, 14, 35);

    // Estadísticas
    const totalReservados = participantes.filter(p => p.state === 2).length;
    const totalPagados = participantes.filter(p => p.state === 3).length;
    const totalRecaudado = totalPagados * 20000; // $20.000 por número

    doc.setTextColor(103, 80, 164);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Rifa Solidaria - Listado por Numero', pageWidth / 2, 35, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reservados: ${totalReservados} | Pagados: ${totalPagados} | Recaudado: ${totalRecaudado.toLocaleString('es-AR')}`, pageWidth - 14, 35, { align: 'right' });

    // ========================================
    // TABLA
    // ========================================
    const tableData = participantes.map(item => [
      item.numero.toString().padStart(3, '0'),
      item.nombre || 'Sin nombre',
      item.dni || '-',
      item.email || '-',
      item.state === 3 ? 'Pagado' : 'Reservado',
      item.nro_op || '-',
      item.time ? new Date(item.time.seconds * 1000).toLocaleDateString('es-AR') : '-'
    ]);

    doc.autoTable({
      startY: 40,
      head: [['#', 'Nombre', 'DNI', 'Email', 'Estado', 'N° Op', 'Fecha']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [103, 80, 164],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { halign: 'center', cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'center', cellWidth: 25 }
      },
      didParseCell: function(data) {
        // Alternar colores de fondo para mejor legibilidad
        if (data.section === 'body') {
          const rowData = participantes[data.row.index];
          
          // Color según estado
          if (rowData.state === 3) {
            // Pagado - Verde suave
            data.cell.styles.fillColor = [232, 245, 233];
          } else {
            // Reservado - Amarillo suave
            data.cell.styles.fillColor = [255, 248, 225];
          }

          // Interlineado alternado (más oscuro)
          if (data.row.index % 2 === 0) {
            const currentColor = data.cell.styles.fillColor;
            data.cell.styles.fillColor = [
              Math.max(currentColor[0] - 10, 0),
              Math.max(currentColor[1] - 10, 0),
              Math.max(currentColor[2] - 10, 0)
            ];
          }
        }
      },
      didDrawPage: function(data) {
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Pagina ${currentPage} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );

        // Línea decorativa
        doc.setDrawColor(103, 80, 164);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
      }
    });

    // ========================================
    // RESUMEN FINAL
    // ========================================
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFillColor(234, 221, 255); // Color contenedor primario MD3
    doc.roundedRect(14, finalY, pageWidth - 28, 25, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(103, 80, 164);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 20, finalY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Reservados: ${totalReservados}`, 20, finalY + 15);
    doc.text(`Pagados: ${totalPagados}`, 60, finalY + 15);
    doc.text(`Total Recaudado: $${totalRecaudado.toLocaleString('es-AR')}`, 100, finalY + 15);

    // ========================================
    // FINALIZAR Y ABRIR AUTOMÁTICAMENTE
    // ========================================
    Swal.close();

    // Generar el PDF como blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (preview) {
      // Solo vista previa en nueva ventana
      window.open(pdfUrl, '_blank');
    } else {
      // Descargar Y abrir automáticamente
      const filename = `Rifa_SanLuisGonzaga_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // 1. Descargar el archivo
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 2. Abrir en nueva pestaña después de un breve delay
      setTimeout(() => {
        window.open(pdfUrl, '_blank');
      }, 500);
      
    Swal.fire({
      icon: 'success',
      title: 'PDF Generado Exitosamente',
      html: `
        <p style="font-size: 18px; margin: 16px 0;">
        <strong style="font-size: 20px; font-weight: bold;">Archivo descargado:</strong><br>
        <span style="color: #6750A4; font-size: 18px; font-weight: bold;">${filename}</span>
        </p>
        <strong style="font-size: 16px; color: #450acdff; margin-top: 12px;">
        El PDF se abrirá automáticamente en una nueva pestaña
        </strong>
      `,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#6750A4',
      timer: 100000,
      timerProgressBar: true
    });
    }

  } catch (error) {
    console.error('Error al generar PDF:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Generar PDF',
      html: `
        <p style="font-size: 15px; margin: 12px 0;">
          Ocurrió un error al generar el PDF.
        </p>
        <p style="font-size: 13px; color: #666; margin-top: 8px;">
          <strong>Detalle:</strong> ${error.message}
        </p>
      `,
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#B3261E',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    });
  }
}

// ========================================
// TABLA EN PANTALLA (ordenada por número)
// ========================================
function mostrarTablaParticipantes() {
  const participantes = rifaData
    .filter(item => item.state === 2 || item.state === 3)
    .sort((a, b) => {
      const numA = parseInt(a.numero) || 0;
      const numB = parseInt(b.numero) || 0;
      return numA - numB;
    });

  if (participantes.length === 0) {
    document.getElementById('tabla-participantes').style.display = 'none';
    return;
  }

  let html = `
    <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <thead style="background: #6750A4; color: white;">
        <tr>
          <th style="padding: 12px; text-align: center;">#</th>
          <th style="padding: 12px;">Nombre</th>
          <th style="padding: 12px; text-align: center;">DNI</th>
          <th style="padding: 12px;">Email</th>
          <th style="padding: 12px; text-align: center;">Estado</th>
          <th style="padding: 12px; text-align: center;">N° Op</th>
          <th style="padding: 12px; text-align: center;">Fecha</th>
        </tr>
      </thead>
      <tbody>
  `;

  participantes.forEach((item, index) => {
    const bgColor = item.state === 3 
      ? (index % 2 === 0 ? '#e8f5e9' : '#c8e6c9')
      : (index % 2 === 0 ? '#fff8e1' : '#ffecb3');
    
    const estadoText = item.state === 3 ? 'Pagado' : 'Reservado';
    const fecha = item.time ? new Date(item.time.seconds * 1000).toLocaleDateString('es-AR') : '-';

    html += `
      <tr style="background: ${bgColor}; transition: all 0.2s;" 
          onmouseover="this.style.transform='scale(1.01)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
        <td style="padding: 10px; text-align: center; font-weight: bold;">${item.numero.toString().padStart(3, '0')}</td>
        <td style="padding: 10px;">${item.nombre || 'Sin nombre'}</td>
        <td style="padding: 10px; text-align: center;">${item.dni || '-'}</td>
        <td style="padding: 10px; font-size: 12px;">${item.email || '-'}</td>
        <td style="padding: 10px; text-align: center;">${estadoText}</td>
        <td style="padding: 10px; text-align: center;">${item.nro_op || '-'}</td>
        <td style="padding: 10px; text-align: center; font-size: 12px;">${fecha}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';

  document.getElementById('tabla-lista').innerHTML = html;
  document.getElementById('tabla-participantes').style.display = 'block';
}

// ========================================
// BÚSQUEDA EN TIEMPO REAL
// ========================================
function setupBuscador() {
  const searchInput = document.getElementById('search-participantes');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#tabla-lista tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

// ========================================
// EVENT LISTENERS
// ========================================
document.getElementById('btn-export-pdf')?.addEventListener('click', () => generarPDF(false));
document.getElementById('btn-preview-pdf')?.addEventListener('click', () => generarPDF(true));

// Actualizar tabla cuando cambian los datos
const originalRenderRifaGrid = renderRifaGrid;
window.renderRifaGrid = function(adminMode) {
  originalRenderRifaGrid(adminMode);
  if (adminMode) {
    mostrarTablaParticipantes();
    setupBuscador();
  }
};

console.log('✅ Sistema de exportación PDF cargado');