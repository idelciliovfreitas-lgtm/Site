import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, MapPin, Calendar, Maximize2, Ruler, CheckCircle2, 
  Sparkles, ExternalLink, Instagram, MessageCircle, ChevronLeft, ChevronRight,
  Layers, ShieldCheck, ArrowRight
} from 'lucide-react';
import { PortfolioProject } from '../types';
import { formatWhatsAppNumber } from '../constants';

interface ProjectDetailsModalProps {
  project: PortfolioProject | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, isOpen, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeView, setActiveView] = useState<'gallery' | 'beforeAfter'>('gallery');
  const [sliderPosition, setSliderPosition] = useState(50);

  const images = React.useMemo(() => {
    if (!project) return [];
    if (project.gallery && project.gallery.length > 0) return project.gallery;
    return project.image ? [project.image] : [];
  }, [project]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setActiveView('gallery');
    setSliderPosition(50);
  }, [project]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (activeView === 'gallery' && images.length > 1) {
      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  }, [onClose, activeView, images.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !project) return null;

  const hasBeforeAfter = Boolean(project.beforeImage && project.afterImage);

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Olá Eng. Idelcilio Vieira! Estive no seu site e gostei muito do projeto "*${project.title}*" (${project.category}). Gostaria de agendar uma consultoria técnica para um projeto similar.`
    );
    window.open(`https://wa.me/5588992694661?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white w-full max-w-5xl rounded-[36px] sm:rounded-[44px] shadow-2xl overflow-hidden z-10 my-auto border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="bg-primary-600 text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
              {project.category}
            </span>
            {project.status && (
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                project.status === 'Concluído' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {project.status}
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          {/* Main Visual: Gallery vs Before/After Toggle */}
          <div className="space-y-4">
            {hasBeforeAfter && (
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveView('gallery')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeView === 'gallery'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Galeria do Projeto ({images.length})
                </button>
                <button
                  onClick={() => setActiveView('beforeAfter')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeView === 'beforeAfter'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={14} className="text-gold-400" />
                  Comparador Antes & Depois
                </button>
              </div>
            )}

            {/* View 1: Gallery View */}
            {activeView === 'gallery' ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-100 group shadow-inner">
                  <img 
                    src={images[selectedImageIndex]} 
                    alt={project.title}
                    className="w-full h-full object-cover select-none transition-all duration-500"
                  />

                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button 
                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-lg"
                      >
                        <ChevronRight size={22} />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-24 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImageIndex === idx 
                            ? 'border-primary-600 ring-2 ring-primary-600/30 scale-105' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* View 2: Interactive Before/After Slider */
              <div className="space-y-2">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900 select-none border border-slate-200">
                  {/* After Image (Background) */}
                  <img 
                    src={project.afterImage} 
                    alt="Depois" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-600/90 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                    Depois (Concluído)
                  </div>

                  {/* Before Image (Clipped by slider percentage) */}
                  <div 
                    className="absolute inset-0 overflow-hidden" 
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img 
                      src={project.beforeImage} 
                      alt="Antes" 
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                      Antes (Início)
                    </div>
                  </div>

                  {/* Vertical Divider Bar */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-800 text-xs font-black">
                      ↔
                    </div>
                  </div>

                  {/* Invisible Range Control */}
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  />
                </div>
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Arraste o divisor horizontalmente para comparar o Antes e o Depois
                </p>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
            {/* Left 2 Cols: Title, Description, Features */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {project.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-primary-600">
                    <MapPin size={14} className="text-gold-500" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    Ano {project.year}
                  </span>
                  {project.area && (
                    <span className="flex items-center gap-1.5">
                      <Ruler size={14} className="text-slate-400" />
                      {project.area}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Memorial Descritivo & Desafios Técnicos
                </h4>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  {project.description}
                </p>
              </div>

              {/* Technical Features & Disciplines */}
              {project.features && project.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Disciplinas e Diferenciais de Engenharia
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {project.features.map((feat, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-2 bg-primary-50 text-primary-900 border border-primary-100/60 px-3.5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider"
                      >
                        <CheckCircle2 size={12} className="text-primary-600" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Technical Signature & Conversion Actions */}
            <div className="space-y-5">
              {/* Technical Responsible Box */}
              <div className="bg-slate-900 text-white p-6 rounded-[32px] space-y-4 shadow-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30 font-black text-sm">
                    IV
                  </div>
                  <div>
                    <h5 className="font-black text-sm tracking-tight text-white">
                      {project.responsibleName || 'Eng. Idelcilio Vieira'}
                    </h5>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gold-400">
                      Responsável Técnico
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Emissão de ART / CREA Garantida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-blue-400" />
                    <span>Conformidade com Normas ABNT</span>
                  </div>
                </div>

                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gold-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  <MessageCircle size={16} />
                  Quero um Projeto Assim
                </button>
              </div>

              {/* Instagram Official Link Box */}
              {project.instagramUrl && (
                <a
                  href={project.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 hover:from-pink-500/20 hover:to-indigo-500/20 border border-purple-200/50 rounded-[28px] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                        <Instagram size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-900">
                          Instagram Oficial
                        </p>
                        <p className="text-xs font-black text-slate-800 group-hover:text-purple-700 transition-colors">
                          Ver publicação do projeto
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
