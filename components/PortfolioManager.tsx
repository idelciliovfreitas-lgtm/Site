import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
  Search, ExternalLink, Sparkles, Image as ImageIcon, Star,
  Ruler, Calendar, MapPin, Eye, X, Save, Instagram, AlertCircle
} from 'lucide-react';
import { PortfolioProject, ProjectCategory } from '../types';
import { 
  getStoredProjects, saveProject, deleteStoredProject, 
  PORTFOLIO_CATEGORIES, INITIAL_PORTFOLIO 
} from '../constants';

const STATUS_OPTIONS: Array<'Concluído' | 'Em Andamento' | 'Projeto Aprovado' | 'Em Execução'> = [
  'Concluído',
  'Em Andamento',
  'Projeto Aprovado',
  'Em Execução'
];

const SUGGESTED_FEATURES = [
  'Cálculo Estrutural',
  'Projeto Arquitetônico 3D',
  'Topografia com Estação Total',
  'Georreferenciamento INCRA',
  'Instalações Elétricas & Hidráulicas',
  'Acompanhamento e Execução de Obra',
  'Prevenção e Combate a Incêndio (AVCB)',
  'Inspeção Predial & Laudo de Patologias',
  'Design de Interiores',
  'Estrutura Metálica de Grande Vão'
];

const PortfolioManager: React.FC = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ProjectCategory>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<PortfolioProject, 'id'>>({
    title: '',
    category: 'Residencial',
    location: 'Madalena - CE',
    description: '',
    image: '',
    gallery: [],
    year: String(new Date().getFullYear()),
    area: '',
    status: 'Concluído',
    features: [],
    instagramUrl: 'https://www.instagram.com/idelciliovieira',
    beforeImage: '',
    afterImage: '',
    responsibleName: 'Eng. Idelcilio Vieira (CREA 356611CE)',
    isFeatured: false,
    active: true
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getStoredProjects();
      setProjects(data);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    window.addEventListener('portfolio-updated', loadProjects);
    return () => window.removeEventListener('portfolio-updated', loadProjects);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      category: 'Residencial',
      location: 'Madalena - CE',
      description: '',
      image: '',
      gallery: [],
      year: String(new Date().getFullYear()),
      area: '',
      status: 'Concluído',
      features: ['Cálculo Estrutural', 'Projeto Arquitetônico 3D'],
      instagramUrl: 'https://www.instagram.com/idelciliovieira',
      beforeImage: '',
      afterImage: '',
      responsibleName: 'Eng. Idelcilio Vieira (CREA 356611CE)',
      isFeatured: false,
      active: true
    });
    setGalleryInput('');
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      location: project.location,
      description: project.description,
      image: project.image,
      gallery: project.gallery || (project.image ? [project.image] : []),
      year: project.year,
      area: project.area || '',
      status: project.status || 'Concluído',
      features: project.features || [],
      instagramUrl: project.instagramUrl || '',
      beforeImage: project.beforeImage || '',
      afterImage: project.afterImage || '',
      responsibleName: project.responsibleName || 'Eng. Idelcilio Vieira (CREA 356611CE)',
      isFeatured: project.isFeatured ?? false,
      active: project.active ?? true
    });
    setGalleryInput('');
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleAddGalleryImage = () => {
    if (!galleryInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), galleryInput.trim()]
    }));
    setGalleryInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = (feat: string) => {
    const trimmed = feat.trim();
    if (!trimmed || formData.features.includes(trimmed)) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, trimmed]
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Por favor, preencha pelo menos o título do projeto e a URL da imagem de capa.');
      return;
    }

    const projectToSave: PortfolioProject = {
      id: editingProject ? editingProject.id : Date.now(),
      title: formData.title.trim(),
      category: formData.category,
      location: formData.location.trim() || 'Madalena - CE',
      description: formData.description.trim(),
      image: formData.image.trim(),
      gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.image.trim()],
      year: formData.year.trim() || String(new Date().getFullYear()),
      area: formData.area?.trim() || '',
      status: formData.status,
      features: formData.features,
      instagramUrl: formData.instagramUrl?.trim() || '',
      beforeImage: formData.beforeImage?.trim() || '',
      afterImage: formData.afterImage?.trim() || '',
      responsibleName: formData.responsibleName?.trim() || 'Eng. Idelcilio Vieira (CREA 356611CE)',
      isFeatured: formData.isFeatured,
      active: formData.active,
      createdAt: editingProject?.createdAt || new Date().toISOString()
    };

    try {
      await saveProject(projectToSave);
      await loadProjects();
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar projeto:', err);
      alert('Erro ao salvar projeto.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este projeto do portfólio?')) {
      try {
        await deleteStoredProject(id);
        await loadProjects();
      } catch (err) {
        console.error('Erro ao excluir projeto:', err);
        alert('Erro ao excluir projeto.');
      }
    }
  };

  const handleToggleFeatured = async (project: PortfolioProject) => {
    const updated = { ...project, isFeatured: !project.isFeatured };
    await saveProject(updated);
    await loadProjects();
  };

  const handleToggleActive = async (project: PortfolioProject) => {
    const updated = { ...project, active: project.active === false ? true : false };
    await saveProject(updated);
    await loadProjects();
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-black">
              <FolderKanban size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portfólio de Obras & Projetos</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie o acervo de engenharia e arquitetura assinado por Idelcilio Vieira.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gold-500 hover:bg-gold-600 text-white px-7 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar projeto por título, localização ou memorial técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:border-gold-500 transition-colors"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <span className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-wider whitespace-nowrap border border-slate-200/50 dark:border-slate-700">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'Projeto' : 'Projetos'}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pt-1">
          {PORTFOLIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary-600 dark:bg-gold-500 border-primary-600 dark:border-gold-500 text-white dark:text-slate-950 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold">Carregando portfólio...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 text-center border border-slate-100 dark:border-slate-800">
          <FolderKanban size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Nenhum projeto encontrado</h3>
          <p className="text-slate-400 text-sm mt-1">Cadastre um novo projeto ou ajuste os termos de busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`bg-white dark:bg-slate-900 rounded-[28px] border overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col ${
                project.active === false ? 'opacity-60 border-dashed border-slate-300 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Image Preview with Badges */}
              <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-slate-900/90 text-white text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow">
                    {project.category}
                  </span>
                  {project.status && (
                    <span className="bg-slate-800/90 text-white text-[9px] font-bold px-2 py-1 rounded-xl uppercase tracking-wider">
                      {project.status}
                    </span>
                  )}
                </div>

                {/* Top Right Quick Toggles */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleFeatured(project)}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all shadow ${
                      project.isFeatured 
                        ? 'bg-gold-500 text-white' 
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 hover:text-gold-500'
                    }`}
                    title={project.isFeatured ? 'Remover dos Destaques da Home' : 'Destacar na Home'}
                  >
                    <Star size={14} className={project.isFeatured ? 'fill-current' : ''} />
                  </button>

                  <button
                    onClick={() => handleToggleActive(project)}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all shadow ${
                      project.active !== false
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                    title={project.active !== false ? 'Ocultar do site' : 'Exibir no site'}
                  >
                    {project.active !== false ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-gold-400 px-2.5 py-1 rounded-lg text-[9px] font-black">
                  Ano {project.year}
                </div>
              </div>

              {/* Card Body - Tight and Consistent */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug line-clamp-2 h-11 mb-1">
                  {project.title}
                </h3>
                
                <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mb-2.5">
                  <MapPin size={12} className="text-gold-500 flex-shrink-0" /> 
                  <span className="truncate">{project.location}</span>
                </p>

                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed h-8 overflow-hidden mb-3">
                  {project.description}
                </p>

                {/* Features Badges (Single Row) */}
                <div className="flex items-center gap-1.5 overflow-hidden h-7 mb-4">
                  {project.features.slice(0, 2).map((feat, idx) => (
                    <span key={idx} className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[9px] font-bold truncate max-w-[140px]">
                      {feat}
                    </span>
                  ))}
                  {project.features.length > 2 && (
                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded-lg text-[9px] font-bold flex-shrink-0">
                      +{project.features.length - 2}
                    </span>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    {project.beforeImage && project.afterImage && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">
                        Antes & Depois
                      </span>
                    )}
                    {project.instagramUrl && (
                      <a 
                        href={project.instagramUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                        title="Ver no Instagram"
                      >
                        <Instagram size={14} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative bg-white w-full max-w-3xl rounded-[36px] shadow-2xl overflow-hidden z-10 my-auto border border-slate-100 flex flex-col max-h-[92vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-600 flex items-center justify-center font-black">
                  <FolderKanban size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingProject ? 'Editar Projeto' : 'Novo Projeto no Portfólio'}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Preencha os detalhes técnicos da obra ou projeto
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Residência Contemporânea - Jardim"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProjectCategory }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  >
                    {PORTFOLIO_CATEGORIES.filter(c => c !== 'Todos').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Location, Year, Area, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Localização / Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Centro, Madalena - CE"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Ano
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Status da Obra
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Area & Responsible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Área / Dimensões
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 280 m² construídos ou 12 Hectares"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Responsável Técnico / CREA
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Eng. Idelcilio Vieira (CREA 356611CE)"
                    value={formData.responsibleName}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Image URL (Cover) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  URL da Imagem de Capa (Principal) *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                  {formData.image && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src={formData.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Additional Gallery Images */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Fotos Adicionais da Galeria (Renders, Canteiro, Fachada)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    placeholder="Cole a URL da foto e clique em Adicionar"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Gallery Thumbnails List */}
                {formData.gallery && formData.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.gallery.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Before & After (Optional) */}
              <div className="p-5 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-4">
                <div className="flex items-center gap-2 text-purple-900">
                  <Sparkles size={16} />
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Comparador Antes & Depois (Opcional - Ideal para Reformas)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      URL Foto do "Antes"
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.beforeImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, beforeImage: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      URL Foto do "Depois"
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.afterImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, afterImage: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Instagram URL */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Instagram size={14} className="text-pink-600" />
                  Link da Publicação no Instagram Oficial (@idelciliovieira)
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/p/..."
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                />
              </div>

              {/* Row 8: Features & Tags */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Disciplinas Técnicas & Diferenciais (Tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Digite uma tag e clique em Adicionar (ou escolha abaixo)"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:border-primary-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeature(featureInput)}
                    className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-800"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {SUGGESTED_FEATURES.filter(s => !formData.features.includes(s)).slice(0, 5).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddFeature(s)}
                      className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Selected Features */}
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feat, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-900 border border-primary-100 px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-primary-400 hover:text-primary-700"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 9: Technical Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Memorial Descritivo / Desafios Superados *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva detalhes como fundações, ventilação natural, soluções estruturais e satisfação do cliente..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium leading-relaxed focus:border-primary-600 outline-none"
                />
              </div>

              {/* Row 10: Checkboxes (Featured, Active) */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="w-5 h-5 rounded-lg text-gold-500 accent-gold-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Destacar na Página Inicial (Home)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-5 h-5 rounded-lg text-primary-600 accent-primary-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Projeto Ativo (Visível no site)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3.5 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gold-500 hover:bg-gold-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gold-500/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Save size={16} /> Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
