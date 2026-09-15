import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCcw, Sparkles, Maximize2 
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  onIndexChange?: (newIndex: number) => void;
}

const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title,
  onIndexChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });

  // Update currentIndex when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const next = (currentIndex + 1) % images.length;
    setCurrentIndex(next);
    resetZoom();
    onIndexChange?.(next);
  }, [currentIndex, images.length, resetZoom, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    const prev = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prev);
    resetZoom();
    onIndexChange?.(prev);
  }, [currentIndex, images.length, resetZoom, onIndexChange]);

  const handleSelectIndex = (idx: number) => {
    setCurrentIndex(idx);
    resetZoom();
    onIndexChange?.(idx);
  };

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomScale > 1) {
      resetZoom();
    } else {
      setZoomScale(2);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, resetZoom]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.25, 3.5));
    } else {
      setZoomScale(prev => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Pan / Drag handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-white/10 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="bg-primary-600/90 text-gold-400 border border-gold-400/30 text-xs px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">
            {currentIndex + 1} / {images.length}
          </span>
          {title && (
            <h3 className="text-white text-sm font-bold truncate max-w-md hidden sm:block">
              {title}
            </h3>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-2xl p-1 border border-white/10">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 1}
              title="Diminuir Zoom (-)"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-mono font-bold text-white px-2.5 min-w-[52px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 3.5}
              title="Aumentar Zoom (+)"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ZoomIn size={18} />
            </button>
            {zoomScale > 1 && (
              <button
                type="button"
                onClick={resetZoom}
                title="Redefinir Zoom (0)"
                className="p-2 text-gold-400 hover:text-gold-300 hover:bg-white/10 rounded-xl transition-all border-l border-white/10"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Fechar (Esc)"
            className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-2xl transition-all border border-red-500/30 ml-2 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden cursor-default"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          // If clicked backdrop directly, close modal
          if (e.target === e.currentTarget && zoomScale <= 1) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              title="Foto Anterior (Seta Esquerda)"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/15 transition-all shadow-2xl active:scale-95 group"
            >
              <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              title="Próxima Foto (Seta Direita)"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/40 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/15 transition-all shadow-2xl active:scale-95 group"
            >
              <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}

        {/* Rendered Image */}
        <div
          className="relative max-w-full max-h-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onDoubleClick={handleToggleZoom}
        >
          <img
            src={currentImage}
            alt={title || `Foto ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* Zoom Hint Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/60 backdrop-blur-md text-white/80 text-[11px] font-medium px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          {zoomScale > 1 ? (
            <span>Arraste para mover • Duplo clique para redefinir</span>
          ) : (
            <span>Duplo clique ou use a roda do mouse para ampliar</span>
          )}
        </div>
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div className="p-4 bg-slate-900/70 border-t border-white/10 z-20 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-1">
            {images.map((img, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 border-2 ${
                    isSelected 
                      ? 'border-gold-500 ring-2 ring-gold-500/40 scale-105 opacity-100 shadow-lg' 
                      : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                  }`}
                  title={`Ver foto ${idx + 1}`}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-bold">
                    {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageLightboxModal;
