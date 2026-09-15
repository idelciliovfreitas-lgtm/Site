import React, { useState, useEffect } from 'react';
import { 
  HardHat, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
  MessageCircle, Phone, User, Tag, X, Save, Search, 
  DraftingCompass, Building2, Ruler, FileCheck, ClipboardList,
  ExternalLink, Sparkles
} from 'lucide-react';
import { getStoredServices, saveService, deleteStoredService, formatWhatsAppNumber } from '../constants';
import { EngineeringService } from '../types';

const ICON_OPTIONS = [
  { id: 'DraftingCompass', label: 'Projetos / Arquitetura', icon: DraftingCompass },
  { id: 'Building2', label: 'Comercial / Edificações', icon: Building2 },
  { id: 'HardHat', label: 'Execução / Obras', icon: HardHat },
  { id: 'Ruler', label: 'Topografia / Medições', icon: Ruler },
  { id: 'FileCheck', label: 'Laudos / Perícias', icon: FileCheck },
  { id: 'ClipboardList', label: 'Regularização / Habite-se', icon: ClipboardList }
];

const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<EngineeringService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EngineeringService | null>(null);

  const [formData, setFormData] = useState<Omit<EngineeringService, 'id'>>({
    title: '',
    description: '',
    tag: '',
    responsibleName: 'Idelcilio Vieira',
    phone: '(88) 99269-4661',
    message: '',
    iconName: 'HardHat',
    active: true
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getStoredServices();
      setServices(data);
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

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      tag: 'Engenharia Civil',
      responsibleName: 'Idelcilio Vieira',
      phone: '(88) 99269-4661',
      message: '',
      iconName: 'HardHat',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: EngineeringService) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      tag: service.tag,
      responsibleName: service.responsibleName || 'Idelcilio Vieira',
      phone: service.phone || '(88) 99269-4661',
      message: service.message || '',
      iconName: service.iconName || 'HardHat',
      active: service.active !== false
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Por favor, preencha o título e a descrição do serviço.");
      return;
    }

    const serviceToSave: EngineeringService = {
      id: editingService ? editingService.id : Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      tag: formData.tag.trim() || 'Serviço Técnico',
      responsibleName: formData.responsibleName?.trim() || 'Idelcilio Vieira',
      phone: formData.phone.trim() || '(88) 99269-4661',
      message: formData.message?.trim() || `Olá ${formData.responsibleName}, gostaria de mais informações sobre o serviço "${formData.title}".`,
      iconName: formData.iconName || 'HardHat',
      active: formData.active
    };

    try {
      await saveService(serviceToSave);
      handleCloseModal();
      await loadServices();
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      alert("Erro ao salvar serviço.");
    }
  };

  const handleDelete = async (service: EngineeringService) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.title}"?`)) {
      try {
        await deleteStoredService(service.id);
        await loadServices();
      } catch (err) {
        console.error("Erro ao deletar serviço:", err);
        alert("Erro ao excluir serviço.");
      }
    }
  };

  const handleToggleActive = async (service: EngineeringService) => {
    try {
      await saveService({ ...service, active: service.active === false ? true : false });
      await loadServices();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const filteredServices = services.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(term) || 
           s.tag.toLowerCase().includes(term) || 
           (s.responsibleName && s.responsibleName.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Action Header */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1.5 rounded-lg border border-gold-200/50 mb-2 inline-block">
            Módulo de Serviços & Equipe
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Serviços do Escritório & Parceiros
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Cadastre os serviços oferecidos e defina o número de celular/WhatsApp de quem atenderá cada demanda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar serviço ou profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:border-gold-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gold-500/20 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> Novo Serviço
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const matchedIcon = ICON_OPTIONS.find(i => i.id === service.iconName);
          const IconCmp = matchedIcon ? matchedIcon.icon : HardHat;
          const isServiceActive = service.active !== false;

          return (
            <div 
              key={service.id}
              className={`bg-white rounded-[36px] p-8 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                isServiceActive 
                  ? 'border-slate-100 hover:shadow-xl hover:-translate-y-1' 
                  : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-600 border border-slate-100">
                    <IconCmp size={26} strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(service)}
                      title={isServiceActive ? "Desativar serviço do site" : "Ativar serviço no site"}
                      className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1 transition-all ${
                        isServiceActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isServiceActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {isServiceActive ? 'No Ar' : 'Oculto'}
                    </button>
                  </div>
                </div>

                <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1 rounded-lg border border-gold-200/40 inline-block mb-3">
                  {service.tag}
                </span>

                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                  {service.title}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                  {service.description}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 space-y-3">
                {/* Professional & Phone */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-2 text-slate-800 text-xs font-black truncate">
                    <User size={14} className="text-gold-500 shrink-0" />
                    <span>{service.responsibleName || 'Idelcilio Vieira'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold mt-1">
                    <Phone size={13} className="text-green-600 shrink-0" />
                    <span>{service.phone || '(88) 99269-4661'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => {
                      const phone = formatWhatsAppNumber(service.phone);
                      const msg = encodeURIComponent(service.message || `Olá ${service.responsibleName}, teste de contato sobre ${service.title}.`);
                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                    }}
                    title="Testar envio pelo WhatsApp"
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-green-200"
                  >
                    <MessageCircle size={13} />
                    <span>Testar WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(service)}
                    title="Editar serviço"
                    className="p-2.5 bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-600 rounded-xl transition-all shadow-xs"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    title="Excluir serviço"
                    className="p-2.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all shadow-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-[40px] text-center border border-slate-100 shadow-sm">
          <HardHat size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum serviço encontrado</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
            Não foram encontrados serviços com o termo pesquisado. Crie um novo serviço ou altere a busca.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-gold-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gold-600 shadow-lg shadow-gold-500/20"
          >
            Cadastrar Serviço
          </button>
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <HardHat size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingService ? 'Editar Serviço Prestado' : 'Cadastrar Novo Serviço'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure as informações e o contato direto para este serviço.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Título do Serviço *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Topografia e Georreferenciamento"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Categoria / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    placeholder="Ex: Precisão Técnica, Regularização, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Descrição Detalhada do Serviço *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explique o que é feito, benefícios para o cliente e área de atendimento em Madalena..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-medium text-slate-700 outline-none focus:border-gold-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Responsável & WhatsApp */}
              <div className="bg-gold-50/50 p-6 rounded-3xl border border-gold-200/60 space-y-4">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gold-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-gold-700">
                    Profissional / Terceiro Responsável pelo Atendimento
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Se este serviço for executado por um parceiro ou profissional específico do escritório, informe o nome e o WhatsApp dele para que os contatos caiam direto nele.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Nome do Profissional
                    </label>
                    <input
                      type="text"
                      value={formData.responsibleName}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                      placeholder="Ex: Idelcilio Vieira ou Nome do Parceiro"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Celular / WhatsApp (com DDD)
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(88) 99269-4661"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-gold-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Mensagem Personalizada Pré-formatada para o WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ex: Olá, gostaria de solicitar um orçamento para..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-700 outline-none focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              {/* Ícone & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Ícone Representativo
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-gold-500 transition-all"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="serviceActive"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-5 h-5 text-gold-500 rounded-lg accent-gold-500 cursor-pointer"
                  />
                  <label htmlFor="serviceActive" className="text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer">
                    Visível publicamente no site (/services)
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-900/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={16} />
                  <span>{editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
