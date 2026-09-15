
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Settings, Heart, List, ShieldCheck, LogOut } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('madalena_user');
    if (!savedUser) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('madalena_user');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-[32px] overflow-hidden bg-slate-100 border-4 border-white shadow-xl">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-xl shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-slate-900 mb-1">{user.name}</h1>
              <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} /> {user.email}
              </p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Membro desde 2024
                </span>
                <span className="bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {user.role === 'admin' ? 'Administrador' : 'Usuário Padrão'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-primary-600 transition-colors shadow-sm">
                <Settings size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
              >
                <LogOut size={20} /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Heart size={20} className="text-red-500" /> Meus Favoritos
              </h3>
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
                <p className="font-bold">Você ainda não salvou nenhum imóvel.</p>
                <button onClick={() => navigate('/listings')} className="mt-2 text-primary-600 text-sm font-black hover:underline">Explorar Anúncios</button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <List size={20} className="text-primary-600" /> Atividade Recente
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">Login efetuado com sucesso</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Hoje</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-primary-600 p-8 rounded-[32px] text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-lg font-black mb-2">Anunciar em Madalena</h4>
                <p className="text-sm text-primary-100 mb-6 opacity-80 leading-relaxed">
                  Tem um terreno ou casa para vender? Nossa plataforma é a mais acessada da região.
                </p>
                <button 
                  onClick={() => navigate('/create')}
                  className="w-full bg-white text-primary-600 py-3 rounded-xl font-black text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  Criar Anúncio Grátis
                </button>
              </div>
              <MapPin className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
