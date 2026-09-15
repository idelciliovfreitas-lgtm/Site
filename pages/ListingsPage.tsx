
import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Grid, List, MapPin, Sparkles, Bed, Bath, Expand, Eye, ArrowRight, X, Filter, Home, Key, HandCoins, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoredProperties, PROPERTY_TYPES } from '../constants';
import PropertyCard from '../components/PropertyCard';
import { FilterState, PropertyType, Property, TransactionType } from '../types';

// Componente de Card para visualização em Lista (Horizontal)
const PropertyListCard: React.FC<{ property: Property }> = ({ property }) => (
  <div className="bg-white rounded-[40px] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100 overflow-hidden group flex flex-col md:flex-row h-auto md:h-72">
    <div className="relative w-full md:w-[380px] h-56 md:h-full overflow-hidden flex-shrink-0">
      <img 
        src={property.images[0]} 
        alt={property.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <span className={`backdrop-blur-md text-white text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 border border-white/10 ${
          property.transactionType === 'venda' ? 'bg-primary-600/90' : 'bg-gold-500/90'
        }`}>
          {property.transactionType === 'venda' ? <HandCoins size={12} /> : <Key size={12} />}
          {property.transactionType}
        </span>
      </div>
    </div>

    <div className="p-8 md:p-10 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1 rounded-lg">
              {property.type}
            </span>
            {property.isFeatured && <Sparkles size={12} className="text-gold-500" />}
          </div>
          <h3 className="text-2xl font-black text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors tracking-tight">
            {property.title}
          </h3>
          <p className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            <MapPin size={14} className="mr-2 text-primary-500" /> {property.location}
          </p>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">
             {property.transactionType === 'venda' ? 'Investimento' : 'Aluguel Mensal'}
           </span>
           <span className="text-3xl font-black text-slate-900 tracking-tighter">
             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}
             {property.transactionType === 'aluguel' && <span className="text-sm">/mês</span>}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-6 py-6 border-y border-slate-50 mb-auto">
         {property.type !== 'Terreno' && (
           <div className="flex items-center gap-2">
              <Bed size={18} className="text-slate-300" />
              <span className="text-sm font-black text-slate-700">{property.bedrooms || 0} <span className="text-[10px] text-slate-400 uppercase">Dorm.</span></span>
           </div>
         )}
         <div className="flex items-center gap-2">
            <Expand size={18} className="text-slate-300" />
            <span className="text-sm font-black text-slate-700">{property.area} <span className="text-[10px] text-slate-400 uppercase">m²</span></span>
         </div>
         <div className="ml-auto flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Eye size={12} /> {property.views}
         </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={property.agent.avatar} className="w-8 h-8 rounded-full border-2 border-slate-50 shadow-sm" alt="" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{property.agent.name}</span>
        </div>
        <Link 
          to={`/property/${property.id}`} 
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl active:scale-95"
        >
          Explorar Detalhes <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </div>
);

const ListingsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    type: 'Todos' as PropertyType | 'Todos',
    transactionType: 'Todos' as TransactionType | 'Todos',
    maxPrice: 2000000,
    search: '',
    bedrooms: 'Todos' as number | 'Todos',
    bathrooms: 'Todos' as number | 'Todos',
  });

  const fetchProperties = async () => {
    try {
      const data = await getStoredProperties();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    window.addEventListener('properties-updated', fetchProperties);
    return () => window.removeEventListener('properties-updated', fetchProperties);
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                            p.location.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'Todos' || p.type === filters.type;
      const matchesTrans = filters.transactionType === 'Todos' || p.transactionType === filters.transactionType;
      const matchesPrice = p.price <= filters.maxPrice;
      const matchesBed = filters.bedrooms === 'Todos' || p.bedrooms === filters.bedrooms;
      const matchesBath = filters.bathrooms === 'Todos' || p.bathrooms === filters.bathrooms;
      const isActive = p.status === 'active';
      
      return matchesSearch && matchesType && matchesTrans && matchesPrice && matchesBed && matchesBath && isActive;
    });
  }, [filters, properties]);

  const resetFilters = () => {
    setFilters({
      type: 'Todos',
      transactionType: 'Todos',
      maxPrice: 2000000,
      search: '',
      bedrooms: 'Todos',
      bathrooms: 'Todos',
    });
  };

  const hasActiveFilters = filters.type !== 'Todos' || filters.transactionType !== 'Todos' || filters.search !== '' || filters.maxPrice < 2000000 || filters.bedrooms !== 'Todos';

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Catálogo Oficial Madalena/CE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Imóveis Disponíveis</h1>
          <div className="flex items-center gap-4 mt-8">
            <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors">Início</Link>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Listagens</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar de Filtros - ULTRA MODERNA */}
          <aside className="w-full lg:w-[340px] shrink-0 space-y-8">
            <div className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-100/60 sticky top-32">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Filter size={18} className="text-gold-500" /> Refinar Busca
                </h3>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                    <X size={12} /> Limpar
                  </button>
                )}
              </div>
              
              <div className="space-y-10">
                {/* Campo de Busca */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Palavra-chave</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text" 
                      placeholder="Bairro ou rua..."
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/5 focus:bg-white transition-all placeholder:text-slate-300"
                      value={filters.search}
                      onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Tipo de Negócio */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Finalidade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Todos', 'venda', 'aluguel'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters(f => ({...f, transactionType: t as any}))}
                        className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                          filters.transactionType === t 
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                            : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorias */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Categorias</label>
                  <div className="flex flex-col gap-2">
                    {PROPERTY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilters(f => ({...f, type: type as any}))}
                        className={`text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between border ${
                          filters.type === type 
                            ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-sm' 
                            : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {type === 'Todos' ? <Grid size={14} /> : <Home size={14} />}
                          {type}
                        </span>
                        {filters.type === type && <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dormitórios */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Dormitórios</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Todos', 1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFilters(f => ({...f, bedrooms: n as any}))}
                        className={`py-3 rounded-xl text-[10px] font-black border transition-all ${
                          filters.bedrooms === n 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                            : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {n === 'Todos' ? 'T' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div>
                  <div className="flex justify-between items-end mb-4 ml-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Orçamento Máx.</label>
                    <span className="text-[10px] font-black text-primary-600">R$ {(filters.maxPrice/1000).toFixed(0)}k</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="2000000" 
                    step="10000"
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-gold-500"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(f => ({...f, maxPrice: Number(e.target.value)}))}
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-300 mt-2 uppercase tracking-widest px-1">
                    <span>Mín</span>
                    <span>R$ 2M+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Listagem */}
          <div className="flex-1 space-y-10">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white px-10 py-6 rounded-[32px] shadow-sm border border-slate-100/60">
               <div className="flex items-center gap-4">
                 <div className="bg-primary-50 px-4 py-2 rounded-2xl border border-primary-100/50">
                    <span className="text-slate-900 font-black text-lg">{filteredProperties.length}</span>
                    <span className="text-primary-600 text-[10px] font-black uppercase tracking-widest ml-2">Resultados Encontrados</span>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-500'}`}
                 >
                   <Grid size={16} /> Grid
                 </button>
                 <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-500'}`}
                 >
                   <List size={16} /> Lista
                 </button>
               </div>
            </div>

            {/* Grid/List de Imóveis */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="animate-spin text-gold-500" size={48} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Carregando Acervo Imobiliário...</span>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700"
                : "flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700"
              }>
                {filteredProperties.map(property => (
                  viewMode === 'grid' 
                    ? <PropertyCard key={property.id} property={property} />
                    : <PropertyListCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-32 rounded-[64px] text-center border-4 border-dashed border-slate-100 flex flex-col items-center">
                 <div className="bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                   <Search className="text-slate-200" size={48} />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Nenhum resultado</h3>
                 <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">
                   Não encontramos ativos com estes critérios exatos. Tente remover alguns filtros ou buscar por termos mais amplos.
                 </p>
                 <button 
                  onClick={resetFilters}
                  className="bg-slate-900 text-white px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-2xl shadow-slate-200 active:scale-95"
                 >
                   Resetar Catálogo
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;
