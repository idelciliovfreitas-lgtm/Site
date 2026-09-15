
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Map, LayoutGrid, Maximize2, Minimize2, Sparkles, Navigation, ChevronDown, Key, HandCoins, ArrowRight, MapPin, Building2, Ruler, FolderKanban } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getStoredProperties, PROPERTY_TYPES, getStoredProjects } from '../constants';
import { FilterState, PropertyType, Property, SortOption, TransactionType, PortfolioProject } from '../types';
import GoogleMap from '../components/GoogleMap';
import ProjectDetailsModal from '../components/ProjectDetailsModal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'Todos',
    transactionType: 'Todos',
    minPrice: 0,
    maxPrice: 2000000,
    search: '',
    sortBy: 'popularity'
  });

  const fetchProperties = async () => {
    try {
      const data = await getStoredProperties();
      setProperties(data);
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getStoredProjects();
      setProjects(data);
    } catch (err) {
      console.error("Error loading portfolio projects:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchProjects();
    window.addEventListener('properties-updated', fetchProperties);
    window.addEventListener('portfolio-updated', fetchProjects);
    return () => {
      window.removeEventListener('properties-updated', fetchProperties);
      window.removeEventListener('portfolio-updated', fetchProjects);
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                            p.location.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'Todos' || p.type === filters.type;
      const matchesTrans = filters.transactionType === 'Todos' || p.transactionType === filters.transactionType;
      const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
      const isActive = p.status === 'active';
      return matchesSearch && matchesType && matchesTrans && matchesPrice && isActive;
    });

    return filtered.sort((a, b) => {
      if (filters.sortBy === 'popularity') return (b.views || 0) - (a.views || 0);
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });
  }, [filters, properties]);

  const mapMarkers = useMemo(() => {
    return filteredProperties.map(p => ({
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      title: p.title,
      id: p.id,
      price: p.price
    }));
  }, [filteredProperties]);

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      {/* Hero Section */}
      {viewMode === 'grid' && (
        <div className="bg-primary-600 text-white relative overflow-hidden transition-all duration-500">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-700 via-primary-600/70 to-transparent" />
          
          <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gold-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Inovação Imobiliária</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                Encontre seu imóvel ideal em <span className="text-gold-500">Madalena</span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 mb-8 font-medium">
                A maior plataforma de negócios imobiliários da região Sertão Central.
              </p>

              <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-white/20">
                <div className="flex-1 flex items-center px-4 bg-slate-50 rounded-xl">
                  <Search className="text-slate-400 mr-2" size={20} />
                  <input 
                    type="text"
                    placeholder="Buscar bairro ou rua..."
                    className="bg-transparent w-full py-4 text-slate-800 focus:outline-none font-bold text-sm"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <button className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-xl font-black transition-all uppercase text-[10px] tracking-widest shadow-xl shadow-gold-500/30">
                  Buscar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Toggle Bar */}
      <div className="bg-white border-b sticky top-[80px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-fit">
            {(['Todos', 'venda', 'aluguel'] as Array<'Todos' | TransactionType>).map(t => (
              <button
                key={t}
                onClick={() => setFilters(f => ({...f, transactionType: t}))}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.transactionType === t ? 'bg-white text-primary-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t === 'Todos' ? 'Tudo' : t === 'venda' ? 'Venda' : 'Aluguel'}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
             {PROPERTY_TYPES.map(type => (
               <button
                 key={type}
                 onClick={() => setFilters(prev => ({ ...prev, type: type as PropertyType | 'Todos' }))}
                 className={`px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                   filters.type === type ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'
                 }`}
               >
                 {type}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase">Ordem:</span>
                 <select 
                   value={filters.sortBy}
                   onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value as SortOption}))}
                   className="bg-transparent text-[9px] font-black uppercase tracking-widest text-primary-600 outline-none"
                 >
                   <option value="popularity">Relevantes</option>
                   <option value="price-asc">Menor Preço</option>
                   <option value="price-desc">Maior Preço</option>
                   <option value="newest">Recentes</option>
                 </select>
              </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {filteredProperties.length} Oportunidades 
            <span className="text-[10px] font-black text-gold-500 uppercase bg-gold-50 px-3 py-1 rounded-full border border-gold-100 tracking-widest">Madalena</span>
          </h2>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => { setViewMode('grid'); setIsMapExpanded(false); }}
              className={`px-6 py-2.5 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest ${viewMode === 'grid' ? 'text-primary-600 bg-slate-50 shadow-inner' : 'text-slate-400'}`}
            >
               <LayoutGrid size={16} className="inline mr-2" /> Grid
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-6 py-2.5 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest ${viewMode === 'map' ? 'text-primary-600 bg-slate-50 shadow-inner' : 'text-slate-400'}`}
            >
              <Map size={16} className="inline mr-2" /> Mapa
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProperties.map(property => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="h-[600px] rounded-[48px] overflow-hidden border-[12px] border-white shadow-2xl">
             <GoogleMap markers={mapMarkers} className="h-full" isExpanded={isMapExpanded} interactive={true} />
          </div>
        )}
      </div>

      {/* Featured Engineering & Architecture Projects Showcase */}
      {projects.length > 0 && (
        <div className="container mx-auto px-4 mt-20 mb-12">
          <div className="bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 rounded-[44px] p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 blur-[130px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gold-500/20 text-gold-400 px-3.5 py-1.5 rounded-full border border-gold-500/30 text-[9px] font-black uppercase tracking-widest mb-4">
                    <Sparkles size={12} />
                    <span>Engenharia & Arquitetura de Precisão</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Obras e Projetos <span className="text-gold-500">Idelcilio Vieira</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium mt-2 max-w-xl leading-relaxed">
                    Mais de uma década de projetos residenciais, comerciais, topográficos e cálculo estrutural com rigor técnico e aprovação garantida.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/portfolio')}
                  className="bg-white/10 hover:bg-white/20 text-white px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/15 w-fit active:scale-95"
                >
                  Ver Portfólio Completo <ArrowRight size={16} />
                </button>
              </div>

              {/* Showcase Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {projects.filter(p => p.active !== false).slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj);
                      setIsDetailsOpen(true);
                    }}
                    className="bg-white/5 rounded-[32px] overflow-hidden border border-white/10 hover:border-gold-500/50 transition-all duration-500 group flex flex-col cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider">
                          {proj.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-gold-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-wider">
                        Ano {proj.year}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-white group-hover:text-gold-400 transition-colors line-clamp-1 mb-1">
                        {proj.title}
                      </h3>
                      <p className="text-slate-400 text-[11px] font-bold flex items-center gap-1 mb-3">
                        <MapPin size={12} className="text-gold-500" /> {proj.location}
                      </p>
                      <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-medium mb-4">
                        {proj.description}
                      </p>

                      <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gold-400 group-hover:text-gold-300">
                        <span>Ver Ficha Técnica</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default HomePage;
