
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
// Added Key to the imports from lucide-react
import { Users, Home, TrendingUp, AlertCircle, Eye, Edit2, Trash2, ExternalLink, ShieldCheck, CheckCircle2, XCircle, Search, Calendar, Filter, MapPin, ArrowLeft, TrendingUp as ArrowUpRight, Clock, CheckCircle, HandCoins, Key, Loader2, HardHat, FolderKanban } from 'lucide-react';
import { getStoredProperties, deleteStoredProperty, saveProperty, LOGO_URL } from '../constants';
import { Property, TransactionType } from '../types';
import Tooltip from '../components/Tooltip';
import ServicesManager from '../components/ServicesManager';
import EmployeesManager from '../components/EmployeesManager';
import PortfolioManager from '../components/PortfolioManager';

const DATA_VISITS = [
  { name: 'Seg', visits: 420 },
  { name: 'Ter', visits: 380 },
  { name: 'Qua', visits: 610 },
  { name: 'Qui', visits: 490 },
  { name: 'Sex', visits: 720 },
  { name: 'Sab', visits: 980 },
  { name: 'Dom', visits: 850 },
];

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'rented'>('all');
  const [transFilter, setTransFilter] = useState<'all' | TransactionType>('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'portfolio' | 'services' | 'employees'>('properties');

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
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesTrans = transFilter === 'all' || p.transactionType === transFilter;
      return matchesSearch && matchesStatus && matchesTrans;
    });
  }, [searchTerm, statusFilter, transFilter, properties]);

  const stats = useMemo(() => {
    return [
      { name: 'Venda', count: properties.filter(p => p.transactionType === 'venda').length },
      { name: 'Aluguel', count: properties.filter(p => p.transactionType === 'aluguel').length },
    ];
  }, [properties]);

  const handleStatusChange = async (property: Property, newStatus: any) => {
    try {
      const updatedProperty = { ...property, status: newStatus };
      await saveProperty(updatedProperty);
      await fetchProperties();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      alert("Erro ao alterar status no Supabase.");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: 'Ativo', 
          color: 'bg-green-50 text-green-600 border-green-100/50',
          icon: <CheckCircle2 size={12} />
        };
      case 'pending':
        return { 
          label: 'Pendente', 
          color: 'bg-amber-50 text-amber-600 border-amber-100/50',
          icon: <Clock size={12} />
        };
      case 'sold':
        return { 
          label: 'Vendido', 
          color: 'bg-slate-100 text-slate-500 border-slate-200',
          icon: <CheckCircle size={12} />
        };
      case 'rented':
        return { 
          label: 'Alugado', 
          color: 'bg-blue-50 text-blue-600 border-blue-100/50',
          icon: <Key size={12} />
        };
      default:
        return { 
          label: 'Ativo', 
          color: 'bg-green-50 text-green-600 border-green-100/50',
          icon: <CheckCircle2 size={12} />
        };
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Excluir permanentemente?')) {
      try {
        await deleteStoredProperty(id);
        await fetchProperties();
      } catch (err) {
        console.error("Erro ao deletar imóvel:", err);
        alert("Erro ao excluir imóvel no Supabase.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-500">
      <div className="bg-primary-600 py-3 text-white">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck size={16} /> Sessão Administrativa Ativa
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
            {properties.length} Ativos Totais
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Painel de Gestão</h1>
            <p className="text-slate-500 text-sm font-medium">Controle total sobre o inventário de imóveis e serviços de engenharia.</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'properties' && (
              <button onClick={() => navigate('/create')} className="bg-gold-500 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gold-600 shadow-lg shadow-gold-500/20 transition-all active:scale-95">
                Cadastrar Imóvel
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200/80 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'properties'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <Home size={16} />
            <span>Imóveis & Loteamentos ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <FolderKanban size={16} />
            <span>Portfólio & Obras</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <HardHat size={16} />
            <span>Serviços Prestados</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'employees'
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
            }`}
          >
            <Users size={16} />
            <span>Equipe & Colaboradores</span>
          </button>
        </div>

        {activeTab === 'properties' ? (
          <>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp size={20} className="text-gold-500" /> Tráfego Diário
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA_VISITS}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="visits" stroke="#d4af37" strokeWidth={5} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col">
             <h3 className="text-lg font-black text-slate-900 mb-10 flex items-center gap-2 uppercase tracking-tight">
              <HandCoins size={20} className="text-primary-600" /> Venda vs Aluguel
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                   <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                     {stats.map((e, i) => <Cell key={i} fill={i === 0 ? "#0d1127" : "#d4af37"} />)}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
          <div className="px-10 py-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventário de Ativos</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Gerenciamento dinâmico de status e visibilidade</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <select value={transFilter} onChange={e => setTransFilter(e.target.value as any)} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                <option value="all">Venda & Aluguel</option>
                <option value="venda">Apenas Venda</option>
                <option value="aluguel">Apenas Aluguel</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                <option value="all">Todos Status</option>
                <option value="active">Ativos</option>
                <option value="pending">Pendentes</option>
                <option value="sold">Vendidos</option>
                <option value="rented">Alugados</option>
              </select>
              <div className="relative">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <input placeholder="Buscar imóvel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none w-64" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-10 py-6">Imóvel</th>
                  <th className="px-10 py-6">Tipo</th>
                  <th className="px-10 py-6">Gestão de Status</th>
                  <th className="px-10 py-6">Valor</th>
                  <th className="px-10 py-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="animate-spin text-gold-500" size={32} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Carregando Inventário do Supabase...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => {
                    const statusConfig = getStatusConfig(property.status);
                    return (
                      <tr key={property.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <img src={property.images[0]} className="w-16 h-12 rounded-xl object-cover" />
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-tight">{property.title}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{property.location}</p>
                              {property.agent?.name && (
                                <p className="text-[9px] text-gold-600 font-bold mt-1">
                                  Resp: {property.agent.name} {property.agent.phone ? `• ${property.agent.phone}` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${property.transactionType === 'venda' ? 'bg-primary-50 text-primary-600' : 'bg-gold-50 text-gold-600'}`}>
                            {property.transactionType}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.color} border shadow-sm w-fit`}>
                              {statusConfig.icon}
                              <select 
                                value={property.status}
                                onChange={(e) => handleStatusChange(property, e.target.value as any)}
                                className="bg-transparent outline-none cursor-pointer"
                              >
                                <option value="active">Ativo</option>
                                <option value="pending">Pendente</option>
                                {property.transactionType === 'venda' ? (
                                  <option value="sold">Vendido</option>
                                ) : (
                                  <option value="rented">Alugado</option>
                                )}
                              </select>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-sm font-black text-slate-900">R$ {property.price.toLocaleString('pt-BR')}</p>
                          {property.transactionType === 'aluguel' && <p className="text-[9px] text-slate-400 font-bold uppercase">Mensal</p>}
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center gap-2">
                             <button onClick={() => navigate(`/create?edit=${property.id}`)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 size={16} /></button>
                             <button onClick={() => handleDelete(property.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                      Nenhum imóvel cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    ) : activeTab === 'portfolio' ? (
      <PortfolioManager />
    ) : activeTab === 'services' ? (
      <ServicesManager />
    ) : (
      <EmployeesManager />
    )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
