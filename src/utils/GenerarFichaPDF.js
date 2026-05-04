import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Reemplaza esto con el código Base64 real de tu logo (puedes obtenerlo en b64.io)
const LOGO_MPA_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; 

export const generarFichaPDF = (data) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- ENCABEZADO CON LOGO ---
  try {
    // Posición: x=15, y=10, ancho=25, alto=25
    doc.addImage(LOGO_MPA_BASE64, 'PNG', 15, 10, 25, 25); 
  } catch (e) {
    console.warn("Logo no cargado, usando solo texto.");
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("MUNICIPALIDAD PROVINCIAL DE ACOBAMBA", 45, 18);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN (OTI)", 45, 23);
  doc.text("SISTEMA DE GESTIÓN DE ACTIVOS Y DIAGNÓSTICO - SIGEMAD", 45, 27);

  doc.setDrawColor(0, 168, 204);
  doc.setLineWidth(0.5);
  doc.line(15, 38, 195, 38); // Línea decorativa azul

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("FICHA DE MANTENIMIENTO TÉCNICO", pageWidth / 2, 48, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 168, 204); 
  doc.text(data.nro_orden, 195, 48, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // --- SECCIÓN 1 Y 2: DATOS DEL EQUIPO (Autocompletados por Cód. Patrimonial) ---
  doc.autoTable({
    startY: 55,
    head: [['DATOS DEL ACTIVO E IDENTIFICACIÓN']],
    body: [
      [`Cód. Patrimonial: ${data.codigo_patrimonial}`, `Marca/Modelo: ${data.marca} ${data.modelo}`],
      [`Procesador: ${data.procesador}`, `Memoria RAM: ${data.ram}`],
      [`Disco Duro: ${data.disco_duro}`, `S. Operativo: ${data.sistema_operativo}`],
      [`Área Destino: ${data.area}`, `Responsable: ${data.usuario_responsable}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 29, 37], fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 }
  });

  // --- SECCIÓN 5: DIAGNÓSTICO Y ACCIONES (Trazabilidad) ---
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 5,
    head: [['DIAGNÓSTICO TÉCNICO Y CONCLUSIONES']],
    body: [
      [`DIAGNÓSTICO ENTRADA:\n${data.diagnostico_entrada || '---'}`],
      [`ACTIVIDADES REALIZADAS:\n${data.actividades || '---'}`],
      [`CONCLUSIÓN / RECOMENDACIÓN:\n${data.conclusion || '---'}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 29, 37] },
    styles: { fontSize: 8 }
  });

  // --- SECCIÓN 6: FIRMAS DE RESPONSABILIDAD ---
  const sigY = 265;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  
  doc.line(20, sigY, 70, sigY);
  doc.text("TÉCNICO INFORMÁTICO", 45, sigY + 4, { align: 'center' });

  doc.line(80, sigY, 130, sigY);
  doc.text("ENCARGADO DEL ÁREA", 105, sigY + 4, { align: 'center' });

  doc.line(140, sigY, 190, sigY);
  doc.text("JEFE DE OTI", 165, sigY + 4, { align: 'center' });

  doc.save(`Ficha_Tecnica_${data.codigo_patrimonial}.pdf`);
};