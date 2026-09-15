
import React, { useState, useRef, useEffect } from 'react';
import { Home, PlusCircle, User, Settings, Menu, LogOut, ChevronDown, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LOGO_URL, LOGO_FALLBACK } from '../constants';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [logoSrc, setLogoSrc] = useState(LOGO_URL);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('theme-change'));
  };

  const loadUser = () => {
    const savedUser = localStorage.getItem('madalena_user');
    setUser(savedUser ? JSON.parse(savedUser) : null);
  };

  useEffect(() => {
    loadUser();
    const handleAuthChange = () => loadUser();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [location.pathname]);

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@madalena.com';
  
  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `px-5 py-2 rounded-full text-xs font-black transition-all duration-300 uppercase tracking-widest ${
      isActive 
        ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' 
        : 'text-slate-500 hover:text-primary-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-gold-400 dark:hover:bg-slate-800'
    }`;
  };

  const handleLogout = () => {
    localStorage.removeItem('madalena_user');
    setUser(null);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary-900/20 group-hover:scale-105 transition-transform duration-300 border-2 border-slate-50 bg-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <img 
              src={logoSrc} 
              alt="Vimobi - Investimentos Imobiliários" 
              className="w-full h-full object-cover"
              onError={() => setLogoSrc(LOGO_FALLBACK)}
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight">Vimobi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investimentos Imobiliários</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link to="/" className={navLinkClass('/')}>Início</Link>
          <Link to="/listings" className={navLinkClass('/listings')}>Anúncios</Link>
          <Link to="/portfolio" className={navLinkClass('/portfolio')}>Portfólio</Link>
          <Link to="/services" className={navLinkClass('/services')}>Serviços</Link>
          <Link to="/about" className={navLinkClass('/about')}>Sobre Madalena</Link>
        </nav>

        {/* User Actions Section */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-gold-400 bg-slate-50 dark:bg-slate-800 transition-all active:scale-95 shadow-sm"
            title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro (Descanso para a vista)"}
            aria-label="Alternar modo escuro/claro"
          >
            {isDarkMode ? (
              <Sun size={18} className="text-gold-400" />
            ) : (
              <Moon size={18} className="text-slate-600" />
            )}
          </button>

          {isAdmin && (
            <Link 
              to="/create" 
              className="hidden md:flex items-center gap-3 bg-gold-500 text-white px-7 py-3 rounded-full hover:bg-gold-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-gold-500/30 group active:scale-95"
            >
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span>Anunciar</span>
            </Link>
          )}

          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => user ? setIsProfileOpen(!isProfileOpen) : navigate('/auth')}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-100 dark:border-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 group"
            >
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-primary-200">
                 {user ? (
                   <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <User size={18} />
                 )}
              </div>
              <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 mr-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && user && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 mb-1">
                  <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.email}</p>
                </div>
                
                <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                  <User size={16} /> Meu Perfil
                </Link>
                
                {isAdmin && (
                  <>
                    <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-colors" onClick={() => setIsProfileOpen(false)}>
                      <Settings size={16} /> Painel Administrativo
                    </Link>
                  </>
                )}
                
                <div className="border-t border-slate-50 dark:border-slate-800 mt-1 pt-1">
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={16} /> Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <Link to="/" className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>Início</Link>
          <Link to="/listings" className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>Anúncios</Link>
          <Link to="/portfolio" className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>Portfólio</Link>
          <Link to="/services" className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>Serviços</Link>
          <Link to="/about" className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white" onClick={() => setIsMenuOpen(false)}>Sobre Madalena</Link>
          
          <button
            onClick={() => {
              toggleDarkMode();
              setIsMenuOpen(false);
            }}
            className="flex items-center justify-between px-5 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDarkMode ? <Sun size={18} className="text-gold-400" /> : <Moon size={18} className="text-slate-600" />}
              <span>{isDarkMode ? "Modo Claro" : "Modo Escuro (Descanso para a vista)"}</span>
            </span>
            <span className="text-xs font-black uppercase text-gold-500">Alternar</span>
          </button>

          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2"></div>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 px-5 py-4 rounded-xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-300 font-bold text-sm" onClick={() => setIsMenuOpen(false)}>
              <Shield size={18} /> Painel Administrativo
            </Link>
          )}
          <button 
            onClick={user ? handleLogout : () => navigate('/auth')} 
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-xl"
          >
            <User size={18} /> {user ? "Sair da Conta" : "Acesso Administrativo"}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
