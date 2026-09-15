
import React from 'react';
import { X, Printer, ShieldCheck, MapPin, Phone, Mail, CheckCircle2, FileText, Stamp, Instagram, Info, AlertCircle } from 'lucide-react';
import { LOGO_URL, AGENT_INFO } from '../constants';

interface ServiceLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceLetterModal: React.FC<ServiceLetterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm print:hidden" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between px-8 py-5 bg-slate-50 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 block">Documento Técnico Oficial</span>
              <div className="flex items-center gap-1.5 text-[9px] text-amber-600 font-bold uppercase">
                <Info size={10} /> 
                <span>Ative "Gráficos de Fundo" na impressão</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 active:scale-95"
            >
              <Printer size={16} /> Imprimir / PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-16 bg-slate-100/50 print:bg-white print:p-0 print:overflow-visible no-scrollbar">
          {/* Print Alert (Only visible on screen) */}
          <div className="max-w-[800px] mx-auto mb-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4 print:hidden">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1">Nota importante para impressão</p>
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                Para que o documento mantenha as cores, logotipos e formatação original ao imprimir ou salvar em PDF, certifique-se de que a opção <strong>"Gráficos de tela de fundo"</strong> (ou <strong>"Background Graphics"</strong>) esteja marcada nas configurações da janela de impressão do seu navegador.
              </p>
            </div>
          </div>

          <div 
            id="official-document-content"
            className="bg-white mx-auto shadow-2xl md:rounded-[20px] p-10 md:p-20 print:shadow-none print:border-none print:p-0 printable-document-area relative overflow-hidden"
            style={{ width: '100%', maxWidth: '800px', minHeight: '1000px' }}
          >
            {/* Watermark for professional look */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <img src={LOGO_URL} alt="" className="w-96 grayscale" />
            </div>

            {/* Document Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-16 border-b-2 border-slate-100 pb-12 gap-8">
              <div className="flex items-center gap-8">
                <div className="w-28 h-28 rounded-[36px] overflow-hidden border-2 border-slate-50 shadow-2xl bg-white">
                  <img src={LOGO_URL} alt="Idelcilio Vieira" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight mb-1">{AGENT_INFO.name}</h1>
                  <p className="text-[11px] font-black text-gold-600 uppercase tracking-[0.3em] mb-4">Engenheiro Civil & Gestor Imobiliário</p>
                  <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck size={14} className="text-primary-600" /> 
                      Registro Profissional: {AGENT_INFO.crea}
                    </span>
                    <span className="flex items-center gap-2.5">
                      <MapPin size={14} className="text-primary-600" /> 
                      Sede: Madalena, Ceará - BR
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Certificação Digital</p>
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-black text-slate-900">
                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="relative z-10 text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-6">Carta de Proposta de Serviços</h2>
              <div className="w-32 h-2 bg-gold-500 mx-auto rounded-full shadow-lg shadow-gold-500/20"></div>
            </div>

            {/* Document Body */}
            <div className="relative z-10 space-y-16">
              <section>
                <h3 className="text-[12px] font-black text-primary-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                   <div className="w-2 h-2 bg-gold-500 rounded-full"></div> 01. Declaração de Escopo Técnico
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg font-medium text-justify">
                  Através deste documento oficial, o Engenheiro Civil <strong>{AGENT_INFO.name}</strong> apresenta formalmente sua disponibilidade para o desenvolvimento de soluções técnicas integradas na cidade de Madalena/CE e região. Nossa metodologia de trabalho é fundamentada na conformidade normativa rígida, otimização de ativos e na valorização do patrimônio imobiliário através de rigorosa aplicação das normas de engenharia civil e gestão estratégica de negócios.
                </p>
              </section>

              <section>
                <h3 className="text-[12px] font-black text-primary-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                   <div className="w-2 h-2 bg-gold-500 rounded-full"></div> 02. Expertise e Áreas de Atuação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {[
                    { t: "Projetos Residenciais", d: "Arquitetura e cálculo estrutural focado em conforto térmico e eficiência." },
                    { t: "Projetos Comerciais", d: "Análise de viabilidade técnica para centros de negócios e galpões logísticos." },
                    { t: "Execução de Obras", d: "Gerenciamento integral de canteiro com foco em cronograma e qualidade." },
                    { t: "Topografia de Precisão", d: "Levantamentos planialtimétricos, demarcação e georreferenciamento." },
                    { t: "Regularização de Áreas", d: "Processos de Habite-se, averbações cartoriais e retificações." },
                    { t: "Consultoria Estratégica", d: "Pareceres técnicos para aquisição de ativos e perícias de inspeção." }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-5 items-start bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center shrink-0 mt-0.5 text-white shadow-md">
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-[15px] mb-1.5">{s.t}</h4>
                        <p className="text-slate-500 text-[12px] leading-relaxed font-medium">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Signature Area */}
              <div className="pt-24 flex flex-col items-center text-center">
                 <div className="mb-6 opacity-40">
                    <Stamp size={80} className="text-slate-400" />
                 </div>
                 <div className="w-80 h-[2px] bg-slate-200 mb-6"></div>
                 <p className="text-xl font-black text-slate-900 uppercase tracking-[0.2em] mb-1">{AGENT_INFO.name}</p>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Engenheiro Civil | CREA-CE: {AGENT_INFO.crea}</p>
              </div>
            </div>

            {/* Footer Row */}
            <div className="relative z-10 mt-32 pt-10 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Phone size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Contato</span>
                  <span className="text-[10px] font-black text-slate-700">{AGENT_INFO.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">E-mail</span>
                  <span className="text-[10px] font-black text-slate-700 truncate">{AGENT_INFO.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Instagram size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Instagram</span>
                  <span className="text-[10px] font-black text-slate-700">{AGENT_INFO.instagram}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Unidade</span>
                  <span className="text-[10px] font-black text-slate-700 uppercase">Madalena/CE</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{AGENT_INFO.address}</p>
            </div>
          </div>
        </div>

        {/* Global Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { 
              background: white !important; 
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #root > header, #root > footer, #root > main, .print\\:hidden {
              display: none !important;
            }
            .fixed { position: relative !important; }
            .absolute { position: relative !important; }
            
            /* Show only the modal content and override fixed/hidden */
            .fixed.inset-0 { 
              position: static !important; 
              display: block !important; 
              background: white !important;
            }
            .relative.bg-white { 
              box-shadow: none !important; 
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .printable-document-area {
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 auto !important;
              width: 100% !important;
              min-height: 0 !important;
              page-break-after: always;
            }

            /* Force display of what was hidden in modal structure */
            .overflow-y-auto { 
              overflow: visible !important; 
              height: auto !important; 
              background: white !important;
            }

            /* Ensure background images/colors print */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            @page {
              size: A4;
              margin: 15mm;
            }
          }
        `}} />
      </div>
    </div>
  );
};

export default ServiceLetterModal;
