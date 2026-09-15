import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, LayoutGrid, Building2, Map, ShieldCheck, ChevronRight, 
  Filter, Sparkles, Ruler, Home, MapPin, Search, Calendar, 
  ExternalLink, Instagram, Award, CheckCircle2, Layers, HardHat, X
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

  const hasActiveFilters = selectedCategory !== 'Todos' || selectedStatus !== 'Todos' || searchTerm.trim() !== '';

  const resetFilters = () => {
    setSelectedCategory('Todos');
    setSelectedStatus('Todos');
    setSearchTerm('');
  };

  const filteredProjects = projects.filter(p => {
    if (p.active === false) return false;

    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || 
                          (selectedStatus === 'Concluído' && p.status === 'Concluído') ||
                          (selectedStatus === 'Em Andamento' && p.status !== 'Concluído');
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
                          p.title.toLowerCase().includes(term) ||
                          p.location.toLowerCase().includes(term) ||
                          p.description.toLowerCase().includes(term) ||
                          p.features.some(f => f.toLowerCase().includes(term));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-[#fcfcfd] dark:bg-[#0b0f19] min-h-screen pb-24 transition-colors">
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
      <div className="relative bg-primary-600 dark:bg-slate-900 pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-primary-200 hover:text-white text-[10px] font-black uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar aos Serviços
          </button>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-3.5 py-1.5 rounded-full border border-gold-500/30 mb-4">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Acervo Técnico Oficial • Idelcilio Vieira
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-[1.15]">
              Portfólio de <span className="text-gold-500">Engenharia & Arquitetura</span>
            </h1>
            <p className="text-primary-100 dark:text-slate-300 text-base font-medium opacity-90 leading-relaxed max-w-2xl">
              Mais de uma década de projetos residenciais, comerciais, topografia de precisão e cálculo estrutural com rigor técnico e conformidade com órgãos competentes em Madalena e região.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:border-gold-500/40 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
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

      {/* Cohesive, Proportional Filter & Search Control Center */}
      <div className="sticky top-[80px] z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm mt-10 transition-colors">
        <div className="container mx-auto px-6 py-4 space-y-3">
          {/* Row 1: Expansive Search Bar + Status Filter + Count Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar projeto por título, localização, disciplina ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Select */}
            <div className="w-full sm:w-52 flex-shrink-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider outline-none text-slate-700 dark:text-slate-200 focus:border-gold-500 transition-colors cursor-pointer"
              >
                <option value="Todos">Todos os Status</option>
                <option value="Concluído">Concluídos</option>
                <option value="Em Andamento">Em Andamento</option>
              </select>
            </div>

            {/* Results Count & Clear Filter */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider whitespace-nowrap border border-slate-200/50 dark:border-slate-700">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'Projeto' : 'Projetos'}
              </span>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1 border border-red-200 dark:border-red-900/50"
                  title="Limpar todos os filtros"
                >
                  <X size={12} /> Limpar
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Pills with Dedicated Full Width */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
              <Filter size={13} /> Categorias:
            </span>
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border flex-shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-primary-600 dark:bg-gold-500 border-primary-600 dark:border-gold-500 text-white dark:text-slate-950 shadow-md font-black' 
                    : 'bg-white dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid with Balanced, Snug Proportions */}
      <div className="container mx-auto px-6 mt-10">
        {loading ? (
          <div className="py-24 text-center text-slate-400 font-bold">Carregando acervo de projetos...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[36px] border border-slate-100 dark:border-slate-800 p-10 max-w-xl mx-auto shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
              <LayoutGrid size={28} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Nenhum projeto encontrado</h3>
            <p className="text-slate-400 font-medium mt-1.5 text-xs">
              Nenhum trabalho corresponde aos filtros aplicados. Tente ajustar os termos de pesquisa.
            </p>
            <button 
              onClick={resetFilters}
              className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-md"
            >
              Ver todos os projetos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <div 
                key={project.id} 
                className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 group flex flex-col cursor-pointer"
                onClick={() => handleOpenDetails(project)}
              >
                {/* Image Header - Aspect 16/10 (Sleek Architectural Proportion) */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow">
                      {project.category}
                    </span>

                    {project.beforeImage && project.afterImage && (
                      <span className="bg-purple-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                        <Sparkles size={10} /> Antes & Depois
                      </span>
                    )}
                  </div>
                  
                  {/* Bottom Strip on Image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                    <div className="bg-slate-900/90 backdrop-blur-md text-gold-400 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider shadow">
                      Ano {project.year}
                    </div>

                    {project.status && (
                      <div className={`backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider shadow ${
                        project.status === 'Concluído'
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}>
                        {project.status}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Body - Snug, Consistent Spacing (No Giant Holes) */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title with Consistent Height across Cards */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-2 h-14 flex items-start group-hover:text-gold-500 transition-colors tracking-tight leading-snug mb-1">
                    {project.title}
                  </h3>

                  {/* Metadata Row (Location & Area) */}
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mb-3">
                    <span className="flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin size={12} className="text-gold-500 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </span>
                    {project.area && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 pl-3">
                        <Ruler size={11} className="text-slate-400" />
                        <span>{project.area.split(' ')[0]} {project.area.includes('m²') ? 'm²' : 'ha'}</span>
                      </span>
                    )}
                  </div>

                  {/* Description with Controlled Height */}
                  <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed h-9 overflow-hidden mb-4 font-medium">
                    {project.description}
                  </p>

                  {/* Disciplines / Tags - Neat Single Row with Max 2 Chips + Extra Counter */}
                  <div className="flex items-center gap-1.5 overflow-hidden h-7 mb-5">
                    {project.features.slice(0, 2).map((feat, fIdx) => (
                      <span 
                        key={fIdx} 
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[9px] font-bold truncate max-w-[150px]"
                        title={feat}
                      >
                        {feat}
                      </span>
                    ))}
                    {project.features.length > 2 && (
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700 px-2 py-1 rounded-lg text-[9px] font-black flex-shrink-0">
                        +{project.features.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(project);
                      }}
                      className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] group-hover:bg-primary-600 group-hover:text-white dark:group-hover:bg-gold-500 dark:group-hover:text-slate-950 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      <span>Detalhes Técnicos</span>
                      <ChevronRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 mt-24">
        <div className="bg-slate-900 dark:bg-[#111827] rounded-[44px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Ruler size={28} className="text-gold-500" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Tem um projeto em mente?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8 text-sm md:text-base font-medium leading-relaxed">
              Agende uma consultoria técnica com o <strong className="text-white">Eng. Idelcilio Vieira</strong> e transforme sua ideia em um projeto seguro, econômico e aprovado pelos órgãos competentes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => {
                  const msg = encodeURIComponent("Prezado Eng. Idelcilio Vieira, estive olhando o portfólio de obras do seu site e gostaria de agendar uma consultoria para um novo projeto.");
                  window.open(`https://wa.me/5588992694661?text=${msg}`, '_blank');
                }}
                className="w-full sm:w-auto bg-gold-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold-600 transition-all shadow-xl shadow-gold-500/20 active:scale-95 hover:scale-105"
              >
                Solicitar Consultoria no WhatsApp
              </button>

              <a
                href="https://www.instagram.com/idelciliovieira"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Instagram size={15} /> Acompanhar no Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
