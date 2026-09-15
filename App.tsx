
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { Instagram, MapPin, Mail, Phone } from 'lucide-react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import CreateListingPage from './pages/CreateListingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ListingsPage from './pages/ListingsPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import { LOGO_FOOTER_URL, LOGO_FALLBACK, getStoredProperties, AGENT_INFO } from './constants';

const ProtectedRoute = ({ children, requireAdmin = false }: { children?: React.ReactNode, requireAdmin?: boolean }) => {
  const userStr = localStorage.getItem('madalena_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [footerLogo, setFooterLogo] = useState(LOGO_FOOTER_URL);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-secondary dark:bg-[#0b0f19] dark:text-slate-100 transition-colors duration-300">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/property/:id" element={<PropertyDetailsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="relative text-slate-400 py-16 overflow-hidden border-t border-slate-800">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
              alt="Footer Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm"></div>
          </div>

          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-16 overflow-hidden flex items-center">
                  <img 
                    src={footerLogo} 
                    alt="Idelcilio Vieira Horizontal" 
                    className="h-full object-contain"
                    onError={() => setFooterLogo('/logo-horizontal.png')}
                  />
                </div>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500 font-medium">
                Soluções completas em Engenharia Civil e Negócios Imobiliários. Projetos, execução de obras e consultoria técnica em Madalena/CE.
              </p>
              <div className="flex items-center gap-4 mt-6">
                 <a href={`https://instagram.com/${AGENT_INFO.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all border border-white/10 shrink-0">
                    <Instagram size={20} />
                 </a>
                 <a href={`https://instagram.com/${AGENT_INFO.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 hover:text-gold-500 transition-colors">
                    {AGENT_INFO.instagram}
                 </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Navegação</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link to="/about" className="hover:text-gold-500 transition-colors">A Cidade</Link></li>
                <li><Link to="/listings" className="hover:text-gold-500 transition-colors">Imóveis</Link></li>
                <li><Link to="/services" className="hover:text-gold-500 transition-colors">Serviços</Link></li>
                <li><Link to="/portfolio" className="hover:text-gold-500 transition-colors">Portfólio</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Atendimento</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li className="flex items-center gap-3 text-slate-200">
                  <Phone size={16} className="text-gold-500" /> {AGENT_INFO.phone}
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <Mail size={16} className="text-gold-500" /> {AGENT_INFO.email}
                </li>
                <li className="flex items-start gap-3 text-slate-500">
                  <MapPin size={16} className="text-gold-500 shrink-0 mt-1" /> 
                  <span className="text-xs leading-tight">{AGENT_INFO.address}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800/50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-center relative z-10">
            &copy; {new Date().getFullYear()} Idelcilio Vieira - Engenharia & Negócios Imobiliários | CREA: {AGENT_INFO.crea}
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
