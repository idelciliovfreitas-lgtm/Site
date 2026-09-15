import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
  MessageCircle, Phone, Mail, Award, X, Save, Search, 
  Camera, Building, Briefcase, Sparkles, Filter 
} from 'lucide-react';
import { 
  getStoredEmployees, saveEmployee, deleteStoredEmployee, 
  formatWhatsAppNumber, EMPLOYEE_AREAS, LOGO_URL, sanitizeAvatarUrl 
} from '../constants';
import { Employee } from '../types';

const EmployeesManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    name: '',
    role: 'Corretor de Imóveis',
    area: EMPLOYEE_AREAS[0],
    creciOrCrea: '',
    phone: '(88) 99269-4661',
    email: '',
    avatar: LOGO_URL,
    active: true
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getStoredEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    window.addEventListener('employees-updated', loadEmployees);
    return () => window.removeEventListener('employees-updated', loadEmployees);
  }, []);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: 'Corretor de Imóveis',
      area: EMPLOYEE_AREAS[0],
      creciOrCrea: '',
      phone: '(88) 99269-4661',
      email: '',
      avatar: LOGO_URL,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      role: emp.role,
      area: emp.area || EMPLOYEE_AREAS[0],
      creciOrCrea: emp.creciOrCrea || '',
      phone: emp.phone || '(88) 99269-4661',
      email: emp.email || '',
      avatar: emp.avatar || LOGO_URL,
      active: emp.active !== false
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      alert("Por favor, preencha o nome e o cargo do colaborador.");
      return;
    }

    const employeeToSave: Employee = {
      id: editingEmployee ? editingEmployee.id : Date.now(),
      name: formData.name.trim(),
      role: formData.role.trim(),
      area: formData.area || EMPLOYEE_AREAS[0],
      creciOrCrea: formData.creciOrCrea?.trim() || undefined,
      phone: formData.phone.trim() || '(88) 99269-4661',
      email: formData.email?.trim() || undefined,
      avatar: formData.avatar || LOGO_URL,
      active: formData.active,
      createdAt: editingEmployee?.createdAt || new Date().toISOString()
    };

    try {
      await saveEmployee(employeeToSave);
      handleCloseModal();
      await loadEmployees();
    } catch (err) {
      console.error("Erro ao salvar colaborador:", err);
      alert("Erro ao salvar colaborador.");
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (window.confirm(`Tem certeza que deseja remover ${emp.name} da equipe?`)) {
      try {
        await deleteStoredEmployee(emp.id);
        await loadEmployees();
      } catch (err) {
        console.error("Erro ao excluir colaborador:", err);
        alert("Erro ao excluir colaborador.");
      }
    }
  };

  const handleToggleActive = async (emp: Employee) => {
    try {
      await saveEmployee({ ...emp, active: emp.active === false ? true : false });
      await loadEmployees();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.creciOrCrea && emp.creciOrCrea.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = selectedArea === 'Todas' || emp.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Actions */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-black text-gold-600 uppercase tracking-widest bg-gold-50 px-3 py-1.5 rounded-lg border border-gold-200/50 mb-2 inline-block">
            Quadro de Profissionais
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Equipe, Colaboradores & Especialistas
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Cadastre engenheiros, arquitetos, cadistas, topógrafos e corretores de imóveis da empresa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Buscar colaborador ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:border-gold-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} /> Cadastrar Profissional
          </button>
        </div>
      </div>

      {/* Filter by Area */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setSelectedArea('Todas')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            selectedArea === 'Todas'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          Todas as Áreas ({employees.length})
        </button>
        {EMPLOYEE_AREAS.map(area => {
          const count = employees.filter(e => e.area === area).length;
          return (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedArea === area
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {area} ({count})
            </button>
          );
        })}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const isEmpActive = emp.active !== false;
          return (
            <div
              key={emp.id}
              className={`bg-white rounded-[36px] p-7 border transition-all duration-300 shadow-sm flex flex-col justify-between ${
                isEmpActive 
                  ? 'border-slate-100 hover:shadow-xl hover:-translate-y-1' 
                  : 'border-slate-200 bg-slate-50/50 opacity-70'
              }`}
            >
              <div>
                {/* Header with Avatar & Status */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={sanitizeAvatarUrl(emp.avatar)}
                      alt={emp.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gold-500 text-white p-1 rounded-lg shadow-sm border border-white">
                      <Briefcase size={10} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(emp)}
                      title={isEmpActive ? "Ocultar da seleção de anúncios" : "Ativar colaborador"}
                      className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1 transition-all ${
                        isEmpActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isEmpActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {isEmpActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>

                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg inline-block mb-2">
                  {emp.area}
                </span>

                <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">
                  {emp.name}
                </h3>
                
                <p className="text-sm font-bold text-gold-600 mb-4">
                  {emp.role}
                </p>

                {emp.creciOrCrea && (
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 w-fit mb-4">
                    <Award size={13} className="text-gold-500" />
                    <span>{emp.creciOrCrea}</span>
                  </div>
                )}
              </div>

              {/* Contact Info & Actions */}
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Phone size={13} className="text-green-600 shrink-0" />
                    <span>{emp.phone || '(88) 99269-4661'}</span>
                  </div>
                  {emp.email && (
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px] truncate">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => {
                      const phone = formatWhatsAppNumber(emp.phone);
                      const msg = encodeURIComponent(`Olá ${emp.name}, teste de contato da plataforma Vimobi.`);
                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                    }}
                    title="Testar WhatsApp"
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-green-200"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(emp)}
                    title="Editar colaborador"
                    className="p-2.5 bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-600 rounded-xl transition-all shadow-xs"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    title="Remover colaborador"
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

      {filteredEmployees.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-[40px] text-center border border-slate-100 shadow-sm">
          <Users size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-800 mb-2">Nenhum profissional encontrado</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">
            Nenhum colaborador coincide com os filtros selecionados. Cadastre um novo membro para a equipe.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-gold-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gold-600 shadow-lg shadow-gold-500/20"
          >
            Cadastrar Profissional
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
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingEmployee ? 'Editar Colaborador' : 'Novo Membro da Equipe'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Cadastre os dados de contato e atuação profissional.
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
              {/* Photo Upload & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="relative group">
                  <img
                    src={sanitizeAvatarUrl(formData.avatar)}
                    alt="Pré-visualização"
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-lg bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-black uppercase transition-opacity"
                  >
                    <Camera size={18} className="mb-1" />
                    Alterar
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-black text-slate-800">Foto do Representante</h4>
                  <p className="text-xs text-slate-500">
                    Envie uma foto profissional ou use a logo oficial da empresa como padrão.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-primary-700 transition-all shadow-sm"
                    >
                      Enviar Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: LOGO_URL }))}
                      className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
                    >
                      Usar Logo Vimobi
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Nome Completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: João Ferreira de Lima"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Cargo / Especialidade *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Ex: Corretor de Imóveis, Cadista, Engenheiro..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Área de Atuação
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 outline-none focus:border-gold-500 transition-all"
                  >
                    {EMPLOYEE_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Registro Profissional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.creciOrCrea}
                    onChange={(e) => setFormData(prev => ({ ...prev, creciOrCrea: e.target.value }))}
                    placeholder="Ex: CRECI 12345-F / CREA 356611CE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Celular / WhatsApp (com DDD) *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(88) 99269-4661"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@vimobi.com.br"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="empActive"
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  className="w-5 h-5 text-gold-500 rounded-lg accent-gold-500 cursor-pointer"
                />
                <label htmlFor="empActive" className="text-xs font-black text-slate-700 uppercase tracking-wider cursor-pointer">
                  Disponível para seleção em novos anúncios de imóveis
                </label>
              </div>

              {/* Buttons */}
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
                  <span>{editingEmployee ? 'Salvar Alterações' : 'Cadastrar Colaborador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManager;
