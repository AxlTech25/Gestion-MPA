import React from 'react';
import { FichaTecnicaPanel } from './FichaTecnicaPanel';

export const FichaTecnicaModal = ({ equipoId, onClose }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden">
      <div className="overflow-y-auto flex-1">
        <FichaTecnicaPanel equipoId={equipoId} onClose={onClose} showHeader />
      </div>
    </div>
  </div>
);
