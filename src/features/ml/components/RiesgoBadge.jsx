import React from 'react';

const NIVEL_STYLES = {
  Bajo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medio: 'bg-amber-100 text-amber-700 border-amber-200',
  Alto: 'bg-orange-100 text-orange-700 border-orange-200',
  Critico: 'bg-red-100 text-red-700 border-red-200',
};

const NIVEL_LABEL = {
  Bajo: 'Bajo',
  Medio: 'Medio',
  Alto: 'Alto',
  Critico: 'Crítico',
};

export const RiesgoBadge = ({ nivel, score, compact = false }) => {
  if (!nivel) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-xs text-slate-400 border border-slate-200">
        N/D
      </span>
    );
  }

  const style = NIVEL_STYLES[nivel] || 'bg-slate-100 text-slate-600 border-slate-200';
  const label = NIVEL_LABEL[nivel] || nivel;

  if (compact) {
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}>
      <span>{label}</span>
      {score != null && <span className="text-[10px] font-normal opacity-80">{Number(score).toFixed(0)} pts</span>}
    </span>
  );
};
