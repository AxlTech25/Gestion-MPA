import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarPDFMantenimiento = (data) => {
  const doc = new jsPDF({ format: 'a4' });
  const margin = 20;

  // 1. Encabezado
  doc.setFontSize(10);
  doc.text("MUNICIPALIDAD PROVINCIAL DE ACOBAMBA", margin, 15);
  doc.text("OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN", margin, 20);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FICHA DE MANTENIMIENTO TÉCNICO", 105, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(data.nro_orden, 190, 35, { align: "right" });

  // 2. Sección 1 y 2: Datos en Tabla
  doc.autoTable({
    startY: 45,
    head: [['DATOS GENERALES Y DEL EQUIPO']],
    body: [
      [`Fecha: ${data.fecha}`, `Área: ${data.area}`],
      [`Código Patrimonial: ${data.equipo.codigo_patrimonial}`, `Marca/Modelo: ${data.equipo.marca} ${data.equipo.modelo}`],
      [`Procesador: ${data.equipo.procesador}`, `RAM: ${data.equipo.ram}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 29, 37] }
  });

  // 3. Diagnóstico
  doc.setFontSize(10);
  doc.text("DIAGNÓSTICO Y ACTIVIDADES:", margin, doc.lastAutoTable.finalY + 10);
  doc.setFont("helvetica", "normal");
  doc.text(data.diagnostico_entrada, margin, doc.lastAutoTable.finalY + 18, { maxWidth: 170 });

  // 4. Firmas al final de la página
  const footerY = 260;
  doc.line(20, footerY, 70, footerY);
  doc.text("TÉCNICO", 45, footerY + 5, { align: "center" });
  
  doc.line(80, footerY, 130, footerY);
  doc.text("ENCARGADO ÁREA", 105, footerY + 5, { align: "center" });

  doc.line(140, footerY, 190, footerY);
  doc.text("JEFE INFORMÁTICA", 165, footerY + 5, { align: "center" });

  doc.save(`Ficha_${data.nro_orden}.pdf`);
};