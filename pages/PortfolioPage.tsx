import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, LayoutGrid, Building2, Map, ShieldCheck, ChevronRight, 
  Filter, Sparkles, Ruler, Home, MapPin, Search, Calendar, 
  ExternalLink, Instagram, Award, CheckCircle2, Layers, HardHat
} from 'lucide-react';
import ServiceLetterModal from '../components/ServiceLetterModal';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { PortfolioProject, ProjectCategory } from '../types';
import { getStoredProjects, PORTFOLIO_CATEGORIES } from '../constants';

const STATS = [
  { value: '+10 Anos', label: 'Projetando no Sertão Central', icon: Award },
  { value: '+100 Obras', label: 'Projetos e Loteamentos Entregues', icon: Building2 },
  { value: '+50.000 m²', label: 'Área Projetada & Levantada', icon: Ruler },
  { value: '100% CREA', label: 'Rigor Normativo e ART', icon: ShieldCheck }
];

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProjectCategory>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Concluído' | 'Em Andamento'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getStoredProjects();
      setProjects(data);
    } catch (err) {
      console.error("Erro ao carregar projetos do portfólio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    window.addEventListener('portfolio-updated', loadProjects);
    return () => window.removeEventListener('portfolio-updated', loadProjects);
  }, []);

  const handleOpenDetails = (project: PortfolioProject) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const filteredProjects = projects.filter(p => {
    // Only show active projects for visitors
    if (p.active === false) return false;

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || 
                          (selectedStatus === 'Concluído' && p.status === 'Concluído') ||
                          (selectedStatus === 'Em Andamento' && p.status !== 'Concluído');
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-24">
      {/* Service Letter Modal */}
      <ServiceLetterModal 
        isOpen={isLetterModalOpen} 
        onClose={() => setIsLetterModalOpen(false)} 
      />

      {/* Technical Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* Hero Section */}
      <div className="relative bg-primary-600 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-primary-200 text-[10px] font-black uppercase tracking-widest mb-8 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-4 py-2 rounded-full border border-gold-500/30 mb-6">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Acervo Técnico Oficial • Idelcilio Vieira
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              Portfólio de <span className="text-gold-500">Engenharia & Arquitetura</span>
            </h1>
            <p className="text-primary-100 text-lg font-medium opacity-90 leading-relaxed max-w-2xl">
              Anos de trajetória projetando sonhos e concretizando empreendimentos residenciais, comerciais, topográficos e industriais em Madalena e em todo o Ceará.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100 flex items-center gap-4 group hover:border-gold-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {stat.value}
                  </h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-[80px] z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm mt-12">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex items-center gap-1.5 whitespace-nowrap">
              <Filter size={14} /> Categoria:
            </span>
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedCategory === cat 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-900/10' 
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search and Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Buscar projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] font-bold outline-none focus:border-primary-600 transition-colors"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[10px] font-black uppercase tracking-wider outline-none text-slate-600"
            >
              <option value="Todos">Todos Status</option>
              <option value="Concluído">Concluídos</option>
              <option value="Em Andamento">Em Andamento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 mt-16">
        {loading ? (
          <div className="py-24 text-center text-slate-400 font-bold">Carregando acervo de projetos...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[48px] border border-slate-100 p-12 max-w-2xl mx-auto shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <LayoutGrid size={36} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nenhum projeto encontrado</h3>
            <p className="text-slate-400 font-medium mt-2 text-sm">
              Tente redefinir o filtro de categoria ou os termos de busca para encontrar outros trabalhos.
            </p>
            <button 
              onClick={() => { setSelectedCategory('Todos'); setSearchTerm(''); setSelectedStatus('Todos'); }}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-md"
            >
              Ver todos os projetos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((project, idx) => (
              <div 
                key={project.id} 
                className="bg-white rounded-[44px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 group flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 cursor-pointer"
                style={{ animationDelay: `${idx * 80}ms` }}
                onClick={() => handleOpenDetails(project)}
              >
                {/* Image Header */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1200ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Category & Before/After badges */}
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2 z-10">
                    <span className="bg-white/95 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                      {project.category}
                    </span>
                    {project.beforeImage && project.afterImage && (
                      <span className="bg-purple-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl text-[8px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                        <Sparkles size={10} /> Antes & Depois
                      </span>
                    )}
                  </div>
                  
                  {/* Year and Status */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between z-10">
                    <div className="bg-primary-600/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">
                      Ano {project.year}
                    </div>

                    {project.status && (
                      <div className={`backdrop-blur-md px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider ${
                        project.status === 'Concluído'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}>
                        {project.status}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary-600 transition-colors tracking-tight line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} className="text-gold-500" /> {project.location}
                    </p>
                  </div>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {project.features.slice(0, 3).map((feat, fIdx) => (
                      <span key={fIdx} className="bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest">
                        {feat}
                      </span>
                    ))}
                    {project.features.length > 3 && (
                      <span className="bg-slate-50 text-slate-400 border border-slate-100 px-2 py-1 rounded-xl text-[8px] font-black">
                        +{project.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-8 pb-8 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(project);
                    }}
                    className="w-full py-4 bg-slate-50 text-slate-600 rounded-3xl font-black uppercase text-[9px] tracking-[0.25em] hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 group/btn"
                  >
                    Detalhes Técnicos
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 mt-32">
        <div className="bg-slate-900 rounded-[56px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 blur-[120px] rounded-full"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
              <Ruler size={32} className="text-gold-500" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Tem um projeto em mente?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10 text-base md:text-lg font-medium leading-relaxed">
              Agende uma consultoria técnica com o <strong className="text-white">Eng. Idelcilio Vieira</strong> e transforme sua ideia em um projeto seguro, econômico e aprovado pelos órgãos competentes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => {
                  const msg = encodeURIComponent("Prezado Eng. Idelcilio Vieira, estive olhando o portfólio de obras do seu site e gostaria de agendar uma consultoria para um novo projeto.");
                  window.open(`https://wa.me/5588992694661?text=${msg}`, '_blank');
                }}
                className="w-full sm:w-auto bg-gold-500 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gold-600 transition-all shadow-2xl shadow-gold-500/20 active:scale-95 hover:scale-105"
              >
                Solicitar Consultoria no WhatsApp
              </button>

              <a
                href="https://www.instagram.com/idelciliovieira"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Instagram size={16} /> Acompanhar no Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
