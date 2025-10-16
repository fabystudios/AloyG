// ========================================
// SISTEMA DE EXPORTACIÓN PDF - RIFA OPTIMIZADO
// Versión mejorada: más compacto y atractivo
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
    // Filtrar y ordenar por número
    const participantes = rifaData
      .filter(item => item.state === 2 || item.state === 3)
      .sort((a, b) => {
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
    // ENCABEZADO OPTIMIZADO
    // ========================================
    doc.setFillColor(103, 80, 164);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Logo
    try {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      const logoPath = window.location.origin + '/img/IsoTipo-2-SanLuisGonzaga-Amarillo.png';
      
      await new Promise((resolve) => {
        logo.onload = () => {
          try {
            const imgRatio = logo.width / logo.height;
            let logoWidth = 100;
            let logoHeight = logoWidth / imgRatio;
            
            if (logoHeight > 18) {
              logoHeight = 18;
              logoWidth = logoHeight * imgRatio;
            }
            
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 3.5;
            
            doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
          } catch (e) {
            console.warn('Error al agregar logo:', e);
          }
          resolve();
        };
        logo.onerror = () => {
          console.warn('No se pudo cargar el logo');
          resolve();
        };
        logo.src = logoPath;
        setTimeout(() => resolve(), 3000);
      });
    } catch (e) {
      console.warn('Error cargando logo:', e);
    }

    // Info y fecha
    const fecha = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${fecha}`, 14, 29);

    // Estadísticas en el header
    const totalReservados = participantes.filter(p => p.state === 2).length;
    const totalPagados = participantes.filter(p => p.state === 3).length;
    const totalRecaudado = totalPagados * 20000;

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RIFA SOLIDARIA 2025', pageWidth / 2, 29, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Res: ${totalReservados} | Pag: ${totalPagados} | Recaudado: $${totalRecaudado.toLocaleString('es-AR')}`, 
      pageWidth - 14, 29, { align: 'right' });

    // ========================================
    // TABLA OPTIMIZADA - MÁS COMPACTA
    // ========================================
    const tableData = participantes.map(item => {
      // Truncar nombre si es muy largo
      let nombre = item.nombre || 'Sin nombre';
      if (nombre.length > 25) {
        nombre = nombre.substring(0, 22) + '...';
      }

      // Email truncado
      let email = item.email || '-';
      if (email.length > 28) {
        email = email.substring(0, 25) + '...';
      }

      // Nº Op con admin
      let nroOpCell = item.nro_op || '-';
      if (item.nro_op && item.admin_user) {
        const adminName = item.admin_user.split(' ')[0] || item.admin_user;
        nroOpCell = `${item.nro_op}\n(${adminName})`;
      }

      return [
        item.numero.toString().padStart(3, '0'),
        nombre,
        item.dni || '-',
        email,
        item.state === 3 ? 'Pagado' : 'Reserv.',
        nroOpCell,
        item.time ? new Date(item.time.seconds * 1000).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }) : '-'
      ];
    });

    doc.autoTable({
      startY: 34,
      head: [['#', 'Nombre', 'DNI', 'Email', 'Estado', 'Nº Op', 'Fecha']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1.5, // REDUCIDO a la mitad
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [103, 80, 164],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: 2 // Header un poco más espaciado
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5, // REDUCIDO a la mitad
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12, fontStyle: 'bold' }, // #
        1: { cellWidth: 42 }, // Nombre - más ancho
        2: { halign: 'center', cellWidth: 20 }, // DNI
        3: { cellWidth: 45, fontSize: 7 }, // Email - más ancho, letra más chica
        4: { halign: 'center', cellWidth: 18, fontStyle: 'bold' }, // Estado
        5: { halign: 'center', cellWidth: 18, fontSize: 7 }, // Nº Op - letra más chica
        6: { halign: 'center', cellWidth: 18, fontSize: 7 } // Fecha - letra más chica
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const rowData = participantes[data.row.index];
          
          // Colores según estado - más suaves
          if (data.column.index === 4) {
            if (rowData.state === 3) {
              // Pagado - Verde
              data.cell.styles.fillColor = [200, 230, 201];
              data.cell.styles.textColor = [27, 94, 32];
            } else {
              // Reservado - Naranja
              data.cell.styles.fillColor = [255, 224, 178];
              data.cell.styles.textColor = [230, 81, 0];
            }
          }

          // Color para el número
          if (data.column.index === 0) {
            data.cell.styles.textColor = [103, 80, 164];
          }

          // Texto más tenue para admin en Nº Op
          if (data.column.index === 5 && data.cell.text[0] && data.cell.text[0].includes('(')) {
            data.cell.styles.textColor = [100, 100, 100];
          }
        }
      },
      didDrawPage: function(data) {
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        
        // Línea decorativa
        doc.setDrawColor(103, 80, 164);
        doc.setLineWidth(0.3);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        
        // Número de página
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Página ${currentPage} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Info de contacto
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Parroquia San Luis Gonzaga - Villa Elisa', 14, pageHeight - 10);
        doc.text('www.sanluisgonzaga.ar', pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
    });

    // ========================================
    // RESUMEN FINAL COMPACTO
    // ========================================
    const finalY = doc.lastAutoTable.finalY + 8;
    
    // Verificar si hay espacio suficiente, sino nueva página
    if (finalY > pageHeight - 35) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFillColor(234, 221, 255);
    doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(103, 80, 164);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN FINAL', 20, finalY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Total Participantes: ${participantes.length}`, 20, finalY + 12);
    doc.text(`Reservados: ${totalReservados}`, 70, finalY + 12);
    doc.text(`Pagados: ${totalPagados}`, 120, finalY + 12);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Total Recaudado: $${totalRecaudado.toLocaleString('es-AR')}`, 20, finalY + 17);

    // ========================================
    // FINALIZAR Y ABRIR
    // ========================================
    Swal.close();

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (preview) {
      window.open(pdfUrl, '_blank');
    } else {
      const filename = `Rifa_SanLuisGonzaga_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Descargar
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Abrir en nueva pestaña
      // Abrir en nueva pestaña solo en desktop (no abrir automáticamente en mobile)
      const isMobile = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|BB10|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        setTimeout(() => {
          window.open(pdfUrl, '_blank');
        }, 500);
      } else {
        // En mobile dejamos que el usuario abra el PDF manualmente (o se descargue según navegador)
        console.log('Mobile detected: omitiendo apertura automática del PDF.');
      }
      Swal.fire({
        icon: 'success',
        title: 'PDF Generado Exitosamente',
        html: `
          <p style="font-size: 18px; margin: 16px 0;">
            <strong>Archivo descargado:</strong><br>
            <span style="color: #6750A4; font-size: 16px; font-weight: bold;">${filename}</span>
          </p>
          <p style="font-size: 14px; color: #666; margin-top: 12px;">
            ✓ ${participantes.length} participantes exportados<br>
            ✓ El PDF se abrirá automáticamente <br/>
            si están habilitados los pop-ups en su Browser.
          </p>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6750A4',
        timer: 50000,
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
// TABLA EN PANTALLA (optimizada)
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
    <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 13px;">
      <thead style="background: #6750A4; color: white;">
        <tr>
          <th style="padding: 8px; text-align: center;">#</th>
          <th style="padding: 8px;">Nombre</th>
          <th style="padding: 8px; text-align: center;">DNI</th>
          <th style="padding: 8px;">Email</th>
          <th style="padding: 8px; text-align: center;">Estado</th>
          <th style="padding: 8px; text-align: center;">Nº Op</th>
          <th style="padding: 8px; text-align: center;">Fecha</th>
        </tr>
      </thead>
      <tbody>
  `;

  participantes.forEach((item, index) => {
    const bgColor = item.state === 3 
      ? (index % 2 === 0 ? '#e8f5e9' : '#d4edda')
      : (index % 2 === 0 ? '#fff8e1' : '#ffecb3');
    
    const estadoText = item.state === 3 ? '✓ Pagado' : '⏰ Reservado';
    const estadoColor = item.state === 3 ? '#1b5e20' : '#e65100';
    const fecha = item.time ? new Date(item.time.seconds * 1000).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }) : '-';

    let nroOpDisplay = item.nro_op || '-';
    if (item.nro_op && item.admin_user) {
      const adminName = item.admin_user.split(' ')[0] || item.admin_user;
      nroOpDisplay = `${item.nro_op}<br><small style="color: #666; font-size: 10px;">(${adminName})</small>`;
    }

    html += `
      <tr style="background: ${bgColor}; transition: all 0.2s;" 
          onmouseover="this.style.transform='scale(1.005)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
        <td style="padding: 6px; text-align: center; font-weight: bold; color: #6750A4;">${item.numero.toString().padStart(3, '0')}</td>
        <td style="padding: 6px;">${item.nombre || 'Sin nombre'}</td>
        <td style="padding: 6px; text-align: center;">${item.dni || '-'}</td>
        <td style="padding: 6px; font-size: 11px;">${item.email || '-'}</td>
        <td style="padding: 6px; text-align: center; font-weight: bold; color: ${estadoColor};">${estadoText}</td>
        <td style="padding: 6px; text-align: center;">${nroOpDisplay}</td>
        <td style="padding: 6px; text-align: center; font-size: 11px;">${fecha}</td>
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

console.log('✅ Sistema de exportación PDF optimizado cargado');