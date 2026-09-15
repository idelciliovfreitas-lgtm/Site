
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ChevronLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { LOGO_URL } from '../constants';
import { supabase } from '../supabase';

const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setIsLoading(false);
        setError(authError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : authError.message);
        return;
      }

      if (data.user) {
        const mockUser = {
          name: data.user.email?.split('@')[0] || "Administrador",
          email: data.user.email || email,
          avatar: LOGO_URL,
          role: 'admin'
        };
        localStorage.setItem('madalena_user', JSON.stringify(mockUser));
        setIsLoading(false);

        // Notificar outros componentes sobre a mudança de auth sem refresh
        window.dispatchEvent(new Event('auth-change'));

        // Navegar para onde o usuário estava tentando ir ou para o admin
        const target = from === '/' ? '/admin' : from;
        navigate(target, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setError("Erro ao se conectar ao servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-all"
      >
        <ChevronLeft size={20} /> Voltar ao Início
      </button>

      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px] border border-slate-100">
        {/* Lado Esquerdo - Visual */}
        <div className="w-full md:w-5/12 bg-slate-900 relative p-10 md:p-14 text-white flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-primary-500/30 mb-10 border-2 border-white/20">
              <img src={LOGO_URL} alt="Idelcilio Vieira Engenharia" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-black mb-6 leading-tight">
              Acesso Restrito ao Painel Administrativo.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Esta área é exclusiva para a gestão da plataforma Idelcilio Vieira.
            </p>
          </div>

          <div className="relative z-10">
            {/* Espaço reservado */}
          </div>
        </div>

        {/* Lado Direito - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Bem-vindo!</h1>
            <p className="text-sm text-slate-400 font-medium">
              Faça login para gerenciar os anúncios da plataforma Idelcilio Vieira.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">E-mail Administrativo</label>
              <div className="relative">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-5 py-3.5 bg-slate-50 border ${error ? 'border-red-200' : 'border-slate-100'} rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-medium`}
                  placeholder="seu-email@exemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Senha</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-5 py-3.5 bg-slate-50 border ${error ? 'border-red-200' : 'border-slate-100'} rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:bg-white transition-all text-sm font-medium`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
              Acesso público desativado. Contate o suporte para novos acessos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
