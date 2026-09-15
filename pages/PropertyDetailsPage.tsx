
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, MapPin, Phone, Mail, MessageCircle, 
  Share2, ExternalLink, Sparkles, Maximize2, Minimize2, Navigation, 
  TrendingUp, ZoomIn 
} from 'lucide-react';
import { getStoredProperties, saveProperty, formatWhatsAppNumber, LOGO_URL, sanitizeAvatarUrl } from '../constants';
import { Property } from '../types';
import GoogleMap from '../components/GoogleMap';
import ImageLightboxModal from '../components/ImageLightboxModal';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const hasIncremented = useRef(false);

  useEffect(() => {
    setSelectedImageIndex(0);
    const fetchPropertyData = async () => {
      try {
        const properties = await getStoredProperties();
        const found = properties.find(p => p.id === Number(id));
        
        if (found) {
          if (!hasIncremented.current) {
            hasIncremented.current = true;
            const updatedProperty = { ...found, views: (found.views || 0) + 1 };
            saveProperty(updatedProperty).catch(err => console.error("Error saving view increment:", err));
            setProperty(updatedProperty);
          } else {
            setProperty(found);
          }
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error("Error fetching property detail:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase text-slate-300 animate-pulse">Analisando Ativo...</div>;

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-xl border border-slate-100 max-w-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Imóvel não encontrado</h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">O anúncio que você procura pode ter sido removido ou o código de referência está incorreto.</p>
          <Link to="/" className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95">Voltar para o início</Link>
        </div>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const agentName = property.agent?.name || "Vimobi";
    const rawPhone = property.agent?.phone || "5588992694661";
    const phone = formatWhatsAppNumber(rawPhone);
    const msg = encodeURIComponent(`Olá ${agentName}, tenho interesse no anúncio "${property.title}" (Ref #${property.id}) visualizado na Vimobi. Gostaria de mais informações!`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    const agentName = property.agent?.name || "Vimobi";
    const email = property.agent?.email || "contato@vimobi.com.br";
    window.location.href = `mailto:${email}?subject=Interesse no anúncio: ${property.title} (Ref: #${property.id})&body=Olá ${agentName}, vi o anúncio na Vimobi e gostaria de saber mais detalhes sobre este imóvel.`;
  };

  const handleShare = async () => {
    // Garante que a URL seja absoluta e válida
    const shareUrl = window.location.origin + window.location.pathname + window.location.search + window.location.hash;
    
    const shareData = {
      title: property.title,
      text: `Confira este imóvel em Madalena: ${property.title}`,
      url: shareUrl,
    };

    try {
      // Verifica se o navegador suporta o compartilhamento e se os dados são válidos
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share not supported or invalid data');
      }
    } catch (err) {
      // Fallback para copiar para a área de transferência se o share falhar ou não existir
      if ((err as Error).name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert("Link do imóvel copiado para a área de transferência!");
        } catch (clipboardErr) {
          console.error("Erro ao copiar para clipboard:", clipboardErr);
        }
      }
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-12">
      <div className="bg-white border-b sticky top-[80px] z-40 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/listings" className="flex items-center text-slate-400 hover:text-gold-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
            <ChevronLeft size={16} className="mr-1" />
            Explorar Catálogo de Madalena
          </Link>
          {property.views > 100 && (
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
               <TrendingUp size={12} className="text-orange-500" />
               <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Este imóvel está recebendo muitas buscas</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            {/* Gallery Section */}
            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100/60 p-3">
               <div 
                 onClick={() => setIsLightboxOpen(true)}
                 className="aspect-video bg-slate-900/5 relative rounded-[32px] overflow-hidden group cursor-pointer"
                 title="Clique para ampliar e dar zoom nesta imagem"
               >
                 <img 
                   src={property.images[selectedImageIndex] || property.images[0]} 
                   alt={`${property.title} - Foto ${selectedImageIndex + 1}`} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none" 
                 />

                 {/* Top Controls: Zoom / Ampliar Button on Left & Share on Right */}
                 <div className="absolute top-6 left-6 flex gap-3 z-10">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      title="Visualização maior / Zoom"
                      className="bg-slate-950/80 hover:bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-xl transition-all flex items-center gap-2 active:scale-95 hover:border-gold-500/50"
                    >
                      <ZoomIn size={14} className="text-gold-400" />
                      <span>Ampliar / Zoom</span>
                    </button>
                 </div>

                 <div className="absolute top-6 right-6 flex gap-3 z-10">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      title="Compartilhar Imóvel"
                      className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl hover:bg-white text-slate-900 transition-all shadow-xl active:scale-95 border border-slate-100"
                    >
                      <Share2 size={20} />
                    </button>
                 </div>

                 {/* Prev / Next Arrows on Main Image */}
                 {property.images.length > 1 && (
                   <>
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedImageIndex(prev => (prev - 1 + property.images.length) % property.images.length);
                       }}
                       title="Foto Anterior"
                       className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/40 hover:bg-black/75 text-white rounded-full backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90 opacity-80 hover:opacity-100"
                     >
                       <ChevronLeft size={22} />
                     </button>
                     <button
                       type="button"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedImageIndex(prev => (prev + 1) % property.images.length);
                       }}
                       title="Próxima Foto"
                       className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/40 hover:bg-black/75 text-white rounded-full backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90 opacity-80 hover:opacity-100"
                     >
                       <ChevronRight size={22} />
                     </button>
                   </>
                 )}

                 {/* Bottom Badges */}
                 <div className="absolute bottom-6 left-6 flex gap-2 z-10 pointer-events-none">
                    <span className="bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl border border-white/10">Ref: #{property.id}</span>
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/10 flex items-center gap-2">
                      <TrendingUp size={12} className="text-gold-500" /> {property.views} Acessos
                    </span>
                 </div>

                 {/* Counter badge */}
                 {property.images.length > 1 && (
                   <div className="absolute bottom-6 right-6 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-2xl border border-white/10 shadow-lg z-10 pointer-events-none">
                     Foto {selectedImageIndex + 1} de {property.images.length}
                   </div>
                 )}
               </div>

               {/* Thumbnail Selector */}
               <div className="p-6 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                 {property.images.map((img, idx) => {
                   const isSelected = selectedImageIndex === idx;
                   return (
                     <button
                       key={idx}
                       type="button"
                       onClick={() => setSelectedImageIndex(idx)}
                       className={`w-40 md:w-48 aspect-video rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-300 border-2 relative text-left group ${
                         isSelected
                           ? 'border-gold-500 ring-4 ring-gold-500/30 shadow-lg scale-[1.03] opacity-100'
                           : 'border-slate-200/80 opacity-60 hover:opacity-100 hover:border-gold-400/50'
                       }`}
                       title={`Selecionar foto ${idx + 1}`}
                     >
                       <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg border border-white/10">
                         {idx + 1}
                       </div>
                       {isSelected && (
                         <div className="absolute top-2 left-2 bg-gold-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                           Selecionada
                         </div>
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Info Section */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100/60">
               <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-10">
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-6">
                     <span className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-900/10">
                       {property.type}
                     </span>
                     {property.isFeatured && (
                        <span className="bg-gold-50 text-gold-600 px-5 py-2.5 rounded-full text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] border border-gold-200/40 shadow-sm">
                          <Sparkles size={12} className="text-gold-500" /> Ativo Estratégico
                        </span>
                     )}
                   </div>
                   <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">{property.title}</h1>
                   <div className="flex items-center text-slate-400 text-base font-bold bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-fit">
                     <MapPin size={20} className="mr-2 text-gold-500" />
                     {property.location}
                   </div>
                 </div>
                 <div className="bg-primary-600 p-10 rounded-[40px] text-center md:text-right min-w-[260px] shadow-2xl shadow-primary-900/40 border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
                   <p className="text-[10px] text-primary-200 font-black uppercase tracking-[0.3em] mb-3 relative z-10">Investimento Total</p>
                   <p className="text-4xl font-black text-white relative z-10 tracking-tighter">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
                     {property.transactionType === 'aluguel' && <span className="text-sm">/mês</span>}
                   </p>
                 </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-slate-50">
                  <div className="text-center p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:bg-white transition-all">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Dimensões</p>
                    <p className="text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{property.area} <span className="text-xs">m²</span></p>
                  </div>
                  {property.bedrooms && (
                    <div className="text-center p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:bg-white transition-all">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Dormitórios</p>
                      <p className="text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="text-center p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:bg-white transition-all">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Suítes</p>
                      <p className="text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{property.bathrooms}</p>
                    </div>
                  )}
                  <div className="text-center p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 group hover:bg-white transition-all">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Interesse</p>
                    <p className="text-3xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{property.views}</p>
                  </div>
               </div>

               <div className="mt-12">
                 <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-gold-500 rounded-full"></div>
                    Descrição do Ativo
                 </h3>
                 <p className="text-slate-600 leading-[1.7] text-lg font-medium whitespace-pre-wrap">
                   {property.description}
                 </p>
               </div>
            </div>

            {/* Map Section */}
            <div className={`bg-white rounded-[40px] p-10 shadow-sm border border-slate-100/60 transition-all duration-700 ${isMapExpanded ? 'lg:-mx-20' : ''}`}>
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                  <MapPin className="text-gold-500" /> Entorno Geográfico
                </h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${property.coordinates.lat},${property.coordinates.lng}`, '_blank')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-lg active:scale-95"
                  >
                    <Navigation size={14} /> Traçar Rota
                  </button>
                  <button 
                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                    className="flex items-center gap-2 bg-white border border-slate-100 text-slate-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                  >
                    {isMapExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    {isMapExpanded ? 'Minimizar' : 'Expandir'}
                  </button>
                </div>
              </div>
              <div className={`relative transition-all duration-700 ${isMapExpanded ? 'h-[700px]' : 'h-[450px]'}`}>
                <GoogleMap 
                  center={property.coordinates} 
                  markers={[{ ...property.coordinates, title: property.title, price: property.price }]}
                  className="h-full w-full rounded-[32px] border-4 border-slate-50 shadow-inner" 
                  isExpanded={isMapExpanded}
                  interactive={true}
                />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Agent Sidebar */}
            <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/60 border border-slate-50 sticky top-32">
              <div className="flex items-center gap-6 mb-12">
                <div className="relative">
                  <img 
                    src={sanitizeAvatarUrl(property.agent?.avatar)} 
                    alt={property.agent?.name || "Vimobi"} 
                    className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl bg-slate-100" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <Sparkles size={14} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {property.agent?.name?.toLowerCase().includes('vimobi') ? 'Atendimento Oficial' : 'Agente Responsável'}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {property.agent?.name || "Vimobi - Atendimento Central"}
                  </h3>
                  {property.agent?.role && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                      {property.agent.role}
                    </span>
                  )}
                  {property.agent?.phone && (
                    <p className="text-xs font-bold text-gold-600 mt-1.5 flex items-center gap-1.5">
                      <Phone size={13} /> {property.agent.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1ebc56] text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-green-900/10 active:scale-95 group"
                >
                  <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                  Falar no WhatsApp
                </button>
                <button 
                  onClick={handleEmail}
                  className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl shadow-slate-900/10 active:scale-95 border border-white/5"
                >
                  <Mail size={20} />
                  Enviar Proposta
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50">
                 <div className="flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                   <span>Publicado em</span>
                   <span className="text-slate-500">{new Date(property.createdAt).toLocaleDateString('pt-BR')}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {property && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={property.images}
          initialIndex={selectedImageIndex}
          title={`${property.title} (Ref #${property.id})`}
          onIndexChange={(idx) => setSelectedImageIndex(idx)}
        />
      )}
    </div>
  );
};

export default PropertyDetailsPage;
