import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DraftingCompass, HardHat, FileCheck, ClipboardList, Ruler, 
  ArrowRight, MessageCircle, Building2, Sparkles, User, Phone 
} from 'lucide-react';
import { AGENT_INFO, getStoredServices, formatWhatsAppNumber } from '../constants';
import { EngineeringService } from '../types';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string; strokeWidth?: number }>> = {
  DraftingCompass,
  Building2,
  HardHat,
  Ruler,
  FileCheck,
  ClipboardList
};

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<EngineeringService[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      const data = await getStoredServices();
      setServices(data.filter(s => s.active !== false));
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    window.addEventListener('services-updated', loadServices);
    return () => window.removeEventListener('services-updated', loadServices);
  }, []);

  const handleGeneralContact = () => {
    const msg = encodeURIComponent(`Prezado Sr. Idelcilio Vieira, gostaria de solicitar uma consultoria técnica sobre os serviços de engenharia.`);
    window.open(`https://wa.me/${AGENT_INFO.whatsapp}?text=${msg}`, '_blank');
  };

  const handleServiceContact = (service: EngineeringService) => {
    const phone = formatWhatsAppNumber(service.phone || AGENT_INFO.whatsapp);
    const responsible = service.responsibleName || AGENT_INFO.name;
    const defaultMsg = `Olá ${responsible}, tenho interesse no serviço "${service.title}" anunciado pelo escritório. Gostaria de solicitar um orçamento/consultoria técnica.`;
    const msg = encodeURIComponent(service.message || defaultMsg);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-24">
      {/* Hero Banner */}
      <div className="relative bg-primary-600 pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-2 rounded-full border border-gold-500/30 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">CREA: {AGENT_INFO.crea}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Segurança Técnica para o seu <span className="text-gold-500">Patrimônio</span>
          </h1>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Projetos, execução de obras e consultoria especializada em Madalena/CE.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <button 
              onClick={handleGeneralContact} 
              className="bg-gold-500 hover:bg-gold-600 text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-gold-500/20 hover:shadow-gold-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
             >
               <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" /> Solicitar Orçamento Geral
             </button>
             <button 
              onClick={() => navigate('/portfolio')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest backdrop-blur-md transition-all hover:scale-105 hover:border-white/40 active:scale-95"
             >
               Ver Portfólio de Projetos
             </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = (service.iconName && ICON_MAP[service.iconName]) || HardHat;
            return (
              <div key={service.id || index} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 text-primary-600">
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1.5 rounded-lg inline-block border border-gold-200/40">
                      {service.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium mb-8">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                      <User size={13} className="text-gold-500" />
                      <span>{service.responsibleName || AGENT_INFO.name}</span>
                    </div>
                    {service.phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold mt-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{service.phone}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleServiceContact(service)} 
                    className="w-full flex items-center justify-center gap-2.5 bg-slate-50 hover:bg-primary-600 text-primary-600 hover:text-white py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:shadow-md active:scale-95"
                  >
                    <MessageCircle size={15} />
                    <span>Falar no WhatsApp</span>
                    <ArrowRight size={14} className="ml-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 mt-32 text-center">
         <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Pronto para iniciar seu projeto?</h2>
         <p className="text-slate-500 mb-12 max-w-xl mx-auto font-medium">Oferecemos consultoria completa para quem busca segurança técnica em seus ativos imobiliários.</p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <button onClick={handleGeneralContact} className="bg-primary-600 text-white px-12 py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] hover:bg-gold-500 transition-all shadow-2xl active:scale-95 hover:scale-105">
             Agendar Consultoria Gratuita
           </button>
         </div>
         <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{AGENT_INFO.address}</p>
      </div>
    </div>
  );
};

export default ServicesPage;
