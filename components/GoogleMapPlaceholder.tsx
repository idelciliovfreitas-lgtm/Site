import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

interface GoogleMapPlaceholderProps {
  interactive?: boolean;
  className?: string;
}

const GoogleMapPlaceholder: React.FC<GoogleMapPlaceholderProps> = ({ interactive = false, className = "h-64" }) => {
  return (
    <div className={`w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group ${className}`}>
      {/* Fake Map Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="z-10 flex flex-col items-center text-center p-6">
        <div className="bg-red-500/10 p-4 rounded-full mb-3 animate-bounce">
          <MapPin className="text-red-500 w-8 h-8" />
        </div>
        <h3 className="font-semibold text-gray-700">Mapa de Localização</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          O mapa do Google será renderizado aqui.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <AlertTriangle size={12} />
          <span>API Key necessária no .env.local</span>
        </div>
        
        {interactive && (
           <p className="text-xs text-gray-400 mt-4 italic">
             (Em produção: Permite desenhar perímetro e calcular área)
           </p>
        )}
      </div>
      
      {interactive && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-xs text-gray-500">
          Ferramentas de Desenho (Simulação)
        </div>
      )}
    </div>
  );
};

export default GoogleMapPlaceholder;
