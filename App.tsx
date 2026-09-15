
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
        
        <footer className="relative text-slate-300 py-8 overflow-hidden border-t border-slate-800">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80" 
              alt="Footer Background" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs"></div>
          </div>

          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="h-9 overflow-hidden flex items-center">
                  <img 
                    src={footerLogo} 
                    alt="Idelcilio Vieira Horizontal" 
                    className="h-full object-contain"
                    onError={() => setFooterLogo('/logo-horizontal.png')}
                  />
                </div>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-slate-300 font-normal">
                Soluções completas em Engenharia Civil e Negócios Imobiliários. Projetos, execução de obras e consultoria técnica em Madalena/CE.
              </p>
              <div className="flex items-center gap-3 mt-3">
                 <a href={`https://instagram.com/${AGENT_INFO.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all border border-white/10 shrink-0 text-slate-200">
                    <Instagram size={16} />
                 </a>
                 <a href={`https://instagram.com/${AGENT_INFO.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-gold-400 transition-colors">
                    {AGENT_INFO.instagram}
                 </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3">Navegação</h4>
              <ul className="space-y-1.5 text-xs font-medium">
                <li><Link to="/about" className="text-slate-300 hover:text-gold-400 transition-colors">A Cidade</Link></li>
                <li><Link to="/listings" className="text-slate-300 hover:text-gold-400 transition-colors">Imóveis</Link></li>
                <li><Link to="/services" className="text-slate-300 hover:text-gold-400 transition-colors">Serviços</Link></li>
                <li><Link to="/portfolio" className="text-slate-300 hover:text-gold-400 transition-colors">Portfólio</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3">Atendimento</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2 text-slate-200">
                  <Phone size={14} className="text-gold-400 shrink-0" /> {AGENT_INFO.phone}
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-gold-400 shrink-0" /> {AGENT_INFO.email}
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" /> 
                  <span className="leading-snug">{AGENT_INFO.address}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto px-4 mt-6 pt-4 border-t border-slate-800/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center relative z-10">
            &copy; {new Date().getFullYear()} Idelcilio Vieira - Engenharia & Negócios Imobiliários | CREA: {AGENT_INFO.crea}
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
