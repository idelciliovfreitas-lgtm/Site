import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

/**
 * Componente de Tooltip inspirado no shadcn/ui.
 * Oferece uma interface simples para adicionar dicas flutuantes com animação.
 */
const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-md shadow-md whitespace-nowrap font-semibold animate-in fade-in zoom-in-95 duration-200 origin-bottom border border-slate-800/50">
            {content}
          </div>
          {/* Seta do Tooltip */}
          <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-800/50"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;