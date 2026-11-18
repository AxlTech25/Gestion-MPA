import api, { downloadPdf } from '../../../lib/api';

const codigoDe = (codigo) => encodeURIComponent(String(codigo).trim());

export const reportesService = {
  anios: () => api.get('/reportes/anios'),
  fichaTecnicaEquipo: (codigo) => downloadPdf(
    `/reportes/ficha-historial/${codigoDe(codigo)}`,
    `fichas_tecnicas_${codigo.trim()}.pdf`,
  ),
  fichasTecnicasAnio: (anio) => downloadPdf(
    `/reportes/fichas-tecnicas-anio/${anio}`,
    `fichas_tecnicas_${anio}.pdf`,
  ),
  fichasMantenimientoEquipo: (codigo) => downloadPdf(
    `/reportes/mantenimiento/historial/${codigoDe(codigo)}`,
    `fichas_mantenimiento_${codigo.trim()}.pdf`,
  ),
  fichasMantenimientoAnio: (anio) => downloadPdf(
    `/reportes/fichas-mantenimiento-anio/${anio}`,
    `fichas_mantenimiento_${anio}.pdf`,
  ),
};
