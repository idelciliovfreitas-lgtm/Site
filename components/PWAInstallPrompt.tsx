import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Verificar se já está rodando como PWA instalado (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Verificar se o usuário já dispensou recentemente (nos últimos 4 dias)
    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    const isDismissed = dismissedUntil && Date.now() < Number(dismissedUntil);

    // 3. Detectar iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = isAppleDevice && /safari/.test(userAgent) && !/crios|fxios|optios/.test(userAgent);
    
    if (isAppleDevice) {
      setIsIOS(true);
    }

    // 4. Capturar evento padrão do Chrome/Android/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        // Exibe após 2.5 segundos para não sobrecarregar o usuário na entrada
        setTimeout(() => setIsVisible(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Se for iOS e não dispensado, também oferece a dica após 3 segundos
    if (isAppleDevice && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    // 5. Escuta evento manual de clique no menu "Instalar App"
    const handleManualTrigger = () => {
      setIsVisible(true);
      if (isAppleDevice) {
        setShowIOSGuide(true);
      }
    };
    window.addEventListener('open-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Erro ao acionar prompt de instalação:', err);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    // Não incomodar novamente por 4 dias
    localStorage.setItem('pwa_prompt_dismissed_until', String(Date.now() + 4 * 24 * 60 * 60 * 1000));
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <aside 
      aria-label="Instalação do Aplicativo"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-6 duration-500"
    >
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <img 
            src="/favicon.jpg" 
            alt="Ícone Idelcilio Vieira" 
            className="w-12 h-12 rounded-2xl object-cover border-2 border-gold-500/50 shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={11} /> App Oficial
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
            Instalar Idelcilio Vieira
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Acesse imóveis, portfólio de obras e orçamentos direto da sua tela inicial, rápido e leve.
          </p>
        </div>

        <button 
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Guia interativo para iOS (Safari) */}
      {showIOSGuide ? (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 -mx-5 -mb-5 p-4 rounded-b-3xl space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CheckCircle2 size={16} className="text-gold-500 shrink-0" />
            <span>Como instalar no iPhone ou iPad:</span>
          </div>
          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-6 list-decimal">
            <li className="flex items-center gap-1.5">
              Toque no botão de <strong>Compartilhar</strong> <Share size={13} className="text-primary-600 dark:text-gold-400 inline" /> na barra inferior do Safari.
            </li>
            <li className="flex items-center gap-1.5">
              Role e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={13} className="text-primary-600 dark:text-gold-400 inline" />.
            </li>
            <li>Toque em <strong>"Adicionar"</strong> no topo direito. Pronto!</li>
          </ol>
          <button 
            onClick={handleDismiss}
            className="w-full mt-2 py-2.5 bg-gold-500 text-white dark:text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider hover:bg-gold-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download size={14} />
            {isIOS ? 'Ver como Instalar' : 'Instalar Aplicativo'}
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          >
            Depois
          </button>
        </div>
      )}
    </aside>
  );
};

export default PWAInstallPrompt;
