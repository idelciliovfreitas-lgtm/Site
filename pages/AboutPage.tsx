
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, TrendingUp, Users, Landmark, Droplets, Camera, ArrowRight, X, ZoomIn } from 'lucide-react';
import { AGENT_INFO } from '../constants';

const slides = [
  { src: '/imagens/madalena-antiga.jpeg', label: 'Madalena Antiga' },
  { src: '/imagens/madalena-2025.jpg', label: 'Madalena 2025' },
];

const AboutPage: React.FC = () => {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  const openLightbox = (src: string, alt: string) => {
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeLightbox]);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-24">

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxSrc}
            alt={lightboxAlt}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* Hero */}
      <div
        className="relative h-[550px] overflow-hidden cursor-zoom-in"
        onClick={() => openLightbox('/imagens/madalena.jpg', 'Açude de Madalena CE')}
      >
        <img
          src="/imagens/madalena.jpg"
          alt="Açude de Madalena CE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-2 rounded-full border border-gold-500/30 mb-8 backdrop-blur-md">
               <Droplets size={14} />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Riqueza Hídrica do Sertão Central</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">Madalena: O Coração Estratégico do Ceará</h1>
            <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed">Uma cidade em pleno desenvolvimento, com localização privilegiada na BR-020 e oportunidades únicas para investimento imobiliário.</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-24">
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8">
            <div className="inline-block">
               <h2 className="text-sm font-black text-primary-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                 <div className="w-8 h-[2px] bg-gold-500"></div> Geopolítica & Negócios
               </h2>
               <h3 className="text-4xl font-black text-slate-900 tracking-tight">Um polo de conexão entre a Capital e o Interior</h3>
            </div>

            <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
              <p>
                Localizada a aproximadamente **180km de Fortaleza**, Madalena destaca-se como um importante polo comercial e de serviços estrategicamente posicionado às margens da rodovia federal **BR-020**.
              </p>
              <p>
                A cidade vive um momento de expansão urbana sem precedentes. Com um mercado imobiliário aquecido por novos loteamentos e a chegada de empresas de logística, Madalena atrai investidores que buscam segurança técnica e valorização real de patrimônio.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group hover:border-gold-500 transition-colors">
                <p className="text-gold-500 font-black text-4xl mb-2 tracking-tighter">180km</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Distância de Fortaleza</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group hover:border-primary-600 transition-colors">
                <p className="text-primary-600 font-black text-4xl mb-2 tracking-tighter">BR-020</p>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Eixo de Desenvolvimento</p>
              </div>
            </div>
          </div>

          {/* Alternating portrait card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gold-500/10 rounded-[60px] blur-2xl group-hover:bg-gold-500/20 transition-all duration-700"></div>
            <div
              className="relative aspect-[4/5] bg-slate-100 rounded-[56px] overflow-hidden shadow-2xl border-8 border-white cursor-zoom-in"
              onClick={() => openLightbox(slides[slideIndex].src, slides[slideIndex].label)}
            >
              {slides.map((slide, i) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.label}
                  className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <div className="absolute top-6 right-6 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={18} />
              </div>
              <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-8 rounded-[32px] shadow-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-slate-900 font-black text-lg">{slides[slideIndex].label}</p>
                  <div className="flex gap-2">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={e => { e.stopPropagation(); setSlideIndex(i); }}
                        className={`w-2 h-2 rounded-full transition-colors ${i === slideIndex ? 'bg-slate-900' : 'bg-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-medium">Clique para ver em tamanho completo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Pillars */}
        <div className="mb-32">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-black text-gold-600 uppercase tracking-[0.4em] mb-4">Por que Madalena?</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Pilares da Valorização Local</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: TrendingUp,
                title: 'Valorização Acelerada',
                desc: 'Novos vetores de crescimento urbano e comercial garantem retornos sólidos para ativos de terra e construção.'
              },
              {
                icon: MapPin,
                title: 'Logística Privilegiada',
                desc: 'A BR-020 é o principal corredor de fluxo entre o Nordeste e o Centro-Oeste, transformando Madalena em parada estratégica.'
              },
              {
                icon: Users,
                title: 'Infraestrutura em Expansão',
                desc: 'Investimentos públicos em saneamento, saúde e lazer fortalecem a demanda por moradias de qualidade.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 hover:shadow-2xl transition-all group">
                <div className="bg-slate-50 text-slate-900 w-20 h-20 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                  <item.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tourism & Culture */}
        <div className="bg-slate-900 rounded-[64px] p-10 md:p-24 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 blur-[150px] rounded-full"></div>
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-10">
                <div>
                  <h2 className="text-gold-500 font-black text-xs uppercase tracking-[0.4em] mb-4">Cultura e Identidade</h2>
                  <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Patrimônio Histórico e Paisagístico</h3>
                  <p className="text-slate-400 text-lg leading-relaxed font-medium">Madalena preserva ícones que são o orgulho de sua gente e atraem visitantes de todo o estado.</p>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6 items-start group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold-500 shrink-0 group-hover:bg-gold-500 group-hover:text-white transition-all">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2">Igreja Matriz de Madalena</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Com sua arquitetura imponente e tonalidade amarela vibrante, a matriz é o centro espiritual e social da cidade, um marco da engenharia histórica local.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                      <Droplets size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-xl mb-2">O Açude de Madalena</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">Principal recurso hídrico e cartão-postal. Suas margens oferecem potencial para empreendimentos de lazer e condomínios de alto padrão com vista privilegiada.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`https://www.google.com/search?q=turismo+madalena+ceara`, '_blank')}
                  className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all flex items-center gap-4 group"
                >
                  Descobrir Madalena <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>

             <div className="grid grid-cols-2 gap-6 h-[500px]">
               <div
                 className="relative rounded-[40px] overflow-hidden group shadow-2xl cursor-zoom-in"
                 onClick={() => openLightbox('/imagens/igreja-matriz.jpg', 'Igreja Matriz de Madalena')}
               >
                 <img
                    src="/imagens/igreja-matriz.jpg"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt="Igreja Matriz de Madalena"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ZoomIn size={16} />
                 </div>
                 <span className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-white/80">Igreja Matriz</span>
               </div>
               <div className="flex flex-col gap-6">
                  <div
                    className="relative flex-1 rounded-[40px] overflow-hidden group shadow-2xl cursor-zoom-in"
                    onClick={() => openLightbox('/imagens/acude-umari.webp', 'Açude Umari')}
                  >
                    <img
                      src="/imagens/acude-umari.webp"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      alt="Açude Umari"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={16} />
                    </div>
                    <span className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-white/80">Açude Umari</span>
                  </div>
                  <div className="bg-gold-500 rounded-[40px] p-8 flex flex-col justify-end group hover:bg-white transition-all duration-500">
                     <Camera size={32} className="text-white group-hover:text-gold-500 mb-6 transition-colors" />
                     <p className="text-slate-900 font-black text-xl leading-tight">Explore a cidade através de nossos olhos.</p>
                  </div>
               </div>
             </div>
           </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
           <div className="w-20 h-20 bg-primary-600 rounded-[24px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary-900/20">
             <MapPin className="text-white" size={32} />
           </div>
           <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Madalena espera por você.</h2>
           <p className="text-slate-500 max-w-xl mx-auto mb-12 font-medium">
             Seja para morar ou investir, conte com a consultoria técnica do Sr. Idelcilio Vieira para encontrar o melhor ativo nesta cidade promissora.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button
                onClick={() => window.open(`https://wa.me/${AGENT_INFO.whatsapp}?text=Olá Idelcilio, gostaria de saber mais sobre as oportunidades de investimento em Madalena.`, '_blank')}
                className="bg-primary-600 text-white px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-500 transition-all shadow-2xl active:scale-95"
              >
               Falar com um Especialista Local
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
