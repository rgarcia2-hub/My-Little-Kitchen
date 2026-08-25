import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BookOpen, 
  Mail, 
  Lock, 
  Cookie, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Utensils, 
  ArrowLeft, 
  Send, 
  AlertCircle,
  ExternalLink,
  Globe,
  Terminal,
  ChefHat,
  Tv,
  Coins,
  Cpu,
  Layers,
  HelpCircle,
  Check,
  FileText
} from 'lucide-react';
import { soundService } from '../services/soundService';

export type PolicyRoute = 'about' | 'how-to-play' | 'developer' | 'privacy' | 'terms-cookies';

interface StandalonePolicyPageProps {
  currentRoute: PolicyRoute;
  onNavigate: (route: PolicyRoute | 'game') => void;
  onOpenRewardedAds?: () => void;
}

export function StandalonePolicyPage({ currentRoute, onNavigate, onOpenRewardedAds }: StandalonePolicyPageProps) {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTopic, setContactTopic] = useState('feedback');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Cookies Settings State
  const [cookieConsent, setCookieConsent] = useState(() => {
    try {
      const saved = localStorage.getItem('cookie_consent_preferences');
      return saved ? JSON.parse(saved) : { essential: true, analytics: true, rewardedAds: true };
    } catch {
      return { essential: true, analytics: true, rewardedAds: true };
    }
  });
  const [cookieSavedToast, setCookieSavedToast] = useState(false);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  const getUrlPath = (route: PolicyRoute) => {
    switch (route) {
      case 'about': return 'mylittlekitchen.fun/sobre-el-juego';
      case 'how-to-play': return 'mylittlekitchen.fun/como-jugar';
      case 'developer': return 'mylittlekitchen.fun/contacto';
      case 'privacy': return 'mylittlekitchen.fun/politica-privacidad';
      case 'terms-cookies': return 'mylittlekitchen.fun/terminos-y-cookies';
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    
    soundService.playSuccess();
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 2000);
  };

  const handleSaveCookiePreferences = () => {
    try {
      localStorage.setItem('cookie_consent_preferences', JSON.stringify(cookieConsent));
      soundService.playSuccess();
      setCookieSavedToast(true);
      setTimeout(() => setCookieSavedToast(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full font-mono text-[#141414] pb-16">
      
      {/* 1. TOP KITCHENOS HEADER BAR */}
      <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('game');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#fef08a] hover:bg-[#fde047] text-[#141414] font-black text-xs uppercase tracking-wider border-2 border-[#141414] shadow-[2px_2px_0px_#141414] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            title="Volver a la estación de cocina"
          >
            <ArrowLeft size={15} strokeWidth={3} />
            <span>Volver al Juego</span>
          </button>

          <div className="h-6 w-[2px] bg-[#141414] hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-xl">🍳</span>
            <span className="font-black text-[#141414] text-base tracking-tight font-sans">
              My little Kitchen
            </span>
          </div>
        </div>

        {/* Center/Right: Simulated URL Address Bar */}
        <div className="flex items-center gap-2 bg-[#f4f4f4] border-2 border-[#141414] px-3 py-1 text-xs font-mono text-[#141414] w-full sm:w-auto shadow-inner">
          <Globe size={13} className="text-emerald-600 shrink-0" />
          <span className="text-gray-500 select-none">https://</span>
          <span className="text-black font-black select-all">{getUrlPath(currentRoute)}</span>
          <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-500 font-bold px-1 py-0.2">
            ONLINE
          </span>
        </div>

        {/* Fast Action: Rewarded Modal Trigger */}
        {onOpenRewardedAds && (
          <button
            onClick={() => {
              soundService.playClick();
              onOpenRewardedAds();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-xs uppercase border-2 border-[#141414] shadow-[2px_2px_0px_#141414] cursor-pointer"
            title="Abrir Centro de Recompensas Opcionales"
          >
            <span>🎁</span>
            <span className="hidden md:inline">RECOMPENSAS</span>
          </button>
        )}
      </div>

      {/* 2. MODULE SELECTOR TABS (KitchenOS Style) */}
      <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-1.5 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <div className="px-3 py-1 text-xs font-black uppercase text-[#141414] tracking-wider hidden lg:flex items-center gap-1.5">
            <Terminal size={14} />
            <span>KITCHEN_OS // SYSTEM_DOCS</span>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('about');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer ${
              currentRoute === 'about'
                ? 'bg-[#141414] text-[#00ff66] border-[#141414] shadow-[2px_2px_0px_#000]'
                : 'bg-white text-[#141414] border-transparent hover:border-[#141414] hover:bg-[#f4f4f4]'
            }`}
          >
            <span>ℹ️</span>
            <span>Sobre el Juego</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('how-to-play');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer ${
              currentRoute === 'how-to-play'
                ? 'bg-[#141414] text-[#00ff66] border-[#141414] shadow-[2px_2px_0px_#000]'
                : 'bg-white text-[#141414] border-transparent hover:border-[#141414] hover:bg-[#f4f4f4]'
            }`}
          >
            <span>📖</span>
            <span>Cómo Jugar</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('developer');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer ${
              currentRoute === 'developer'
                ? 'bg-[#141414] text-[#00ff66] border-[#141414] shadow-[2px_2px_0px_#000]'
                : 'bg-white text-[#141414] border-transparent hover:border-[#141414] hover:bg-[#f4f4f4]'
            }`}
          >
            <span>✉️</span>
            <span>Contacto & Desarrollador</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('privacy');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer ${
              currentRoute === 'privacy'
                ? 'bg-[#141414] text-[#00ff66] border-[#141414] shadow-[2px_2px_0px_#000]'
                : 'bg-white text-[#141414] border-transparent hover:border-[#141414] hover:bg-[#f4f4f4]'
            }`}
          >
            <span>🛡️</span>
            <span>Política de Privacidad</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('terms-cookies');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase border-2 transition-all cursor-pointer ${
              currentRoute === 'terms-cookies'
                ? 'bg-[#141414] text-[#00ff66] border-[#141414] shadow-[2px_2px_0px_#000]'
                : 'bg-white text-[#141414] border-transparent hover:border-[#141414] hover:bg-[#f4f4f4]'
            }`}
          >
            <span>📜</span>
            <span>Términos & Cookies</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="space-y-6">

        {/* ======================================================== */}
        {/* ROUTE 1: SOBRE EL JUEGO (mylittlekitchen.fun/sobre-el-juego) */}
        {/* ======================================================== */}
        {currentRoute === 'about' && (
          <div className="space-y-6">
            
            {/* Terminal Window Header Card (Classic Kitchen Protocol Layout) */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
              {/* Terminal Top Bar */}
              <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                  <span className="text-xs font-mono font-bold tracking-wider ml-2">
                    KITCHEN_PROTOCOL // ABOUT_MODULE v1.0
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#00ff66] font-bold tracking-widest hidden sm:block">
                  SYSTEM READY
                </div>
              </div>

              {/* Split Protocol Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#141414]">
                {/* Left Side: Hero Title */}
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#141414] leading-tight font-sans tracking-tight mb-3">
                    MY LITTLE KITCHEN
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-mono">
                    Bienvenido al entorno de simulación gastronómica y alquimia culinaria. 
                    El motor <strong>KitchenOS</strong> combina modelos de lenguaje de última generación 
                    (Google Gemini) con técnicas de cocina del mundo real para desbloquear 
                    más de 130 ingredientes y recetas legendarias.
                  </p>
                </div>

                {/* Right Side: Quick Highlights Grid */}
                <div className="bg-[#141414] text-white p-6 grid grid-cols-2 gap-4">
                  <div className="border border-gray-800 p-3">
                    <div className="text-[10px] text-[#00ff66] font-mono font-bold">01 MOTOR</div>
                    <div className="text-sm font-black font-sans mt-1">KitchenOS</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">Alquimia en tiempo real</div>
                  </div>

                  <div className="border border-gray-800 p-3">
                    <div className="text-[10px] text-[#00ff66] font-mono font-bold">02 INTELIGENCIA</div>
                    <div className="text-sm font-black font-sans mt-1">Gemini AI</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">Combinatoria infinita</div>
                  </div>

                  <div className="border border-gray-800 p-3">
                    <div className="text-[10px] text-[#00ff66] font-mono font-bold">03 ECONOMÍA</div>
                    <div className="text-sm font-black font-sans mt-1">100% Justa</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">Sin micropagos agresivos</div>
                  </div>

                  <div className="border border-gray-800 p-3">
                    <div className="text-[10px] text-[#00ff66] font-mono font-bold">04 DOMINIO</div>
                    <div className="text-sm font-black font-sans mt-1">mylittlekitchen.fun</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">Acceso web universal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Dive Pillars (3 Neo-Brutalist Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5">
                <div className="w-10 h-10 bg-[#fef08a] border-2 border-[#141414] flex items-center justify-center text-xl mb-3 shadow-[2px_2px_0px_#000]">
                  🍳
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">Alquimia Libre</h3>
                <p className="text-xs text-gray-700 leading-relaxed font-mono">
                  Selecciona hasta 3 ingredientes elementales de tu despensa, pásalos a la mesa de operaciones (OPERATIONAL_TABLE) 
                  y aplica técnicas culinarias como hornear, freír, batir, cortar o fermentar para descubrir nuevos elementos.
                </p>
              </div>

              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5">
                <div className="w-10 h-10 bg-emerald-100 border-2 border-[#141414] flex items-center justify-center text-xl mb-3 shadow-[2px_2px_0px_#000]">
                  📋
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">Comandas & Clientes</h3>
                <p className="text-xs text-gray-700 leading-relaxed font-mono">
                  Atiende pedidos con diferentes niveles de dificultad (EASY, INTERMEDIATE, HARD, MASTER). 
                  Completa los pedidos a tiempo para ganar dinero, acumular puntos de experiencia (XP) y mantener tu racha activa.
                </p>
              </div>

              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5">
                <div className="w-10 h-10 bg-[#fca5a5] border-2 border-[#141414] flex items-center justify-center text-xl mb-3 shadow-[2px_2px_0px_#000]">
                  🏆
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">Progresión & Tienda</h3>
                <p className="text-xs text-gray-700 leading-relaxed font-mono">
                  Desbloquea 25 logros, 24 mejoras permanentes de cocina y cosméticos en la Tienda Visual. 
                  Todo el progreso se almacena localmente de forma segura en tu navegador.
                </p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-[#fef9c3] border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black uppercase text-[#141414] mb-1">¿Listo para encender los fogones?</h4>
                <p className="text-xs text-gray-800 font-mono m-0">Regresa a tu cocina y comienza a despachar comandas ahora mismo.</p>
              </div>
              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('game');
                }}
                className="px-5 py-2.5 bg-[#141414] hover:bg-black text-[#00ff66] font-black text-xs uppercase border-2 border-[#141414] shadow-[3px_3px_0px_#141414] cursor-pointer whitespace-nowrap"
              >
                ENTRAR A COCINAR ➔
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROUTE 2: CÓMO JUGAR (mylittlekitchen.fun/como-jugar) */}
        {/* ======================================================== */}
        {currentRoute === 'how-to-play' && (
          <div className="space-y-6">
            {/* Terminal Top Bar */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
              <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                  <span className="text-xs font-mono font-bold tracking-wider ml-2">
                    KITCHEN_OS // CHEF_MANUAL_PROTOCOL
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#00ff66] font-bold tracking-widest hidden sm:block">
                  GUIDE_LOADED
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#141414] mb-2 font-sans">
                  MANUAL OFICIAL DEL CHEF
                </h1>
                <p className="text-xs sm:text-sm text-gray-700 font-mono">
                  Sigue los protocolos operativos paso a paso para dominar la producción culinaria y satisfacer a tus comensales.
                </p>
              </div>
            </div>

            {/* 5 Sequential KitchenOS Step Cards */}
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#141414] text-[#00ff66] font-black text-lg flex items-center justify-center border-2 border-[#141414] shrink-0 font-mono shadow-[2px_2px_0px_#000]">
                    01
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                      PASO 1 // INITIATE_ORDER
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#141414] mt-0.5">
                      Acepta un Pedido de la Cola de Comandas
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 font-mono">
                      Revisa las tarjetas de pedidos en la parte superior. Haz clic en <strong>"Start"</strong> para activar un pedido. 
                      Verás los ingredientes necesarios sugeridos y el valor monetario de recompensa.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-[#f4f4f4] border border-[#141414] text-xs font-mono shrink-0">
                  Tag: <span className="text-emerald-700 font-bold">EASY / INTERMEDIATE</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#141414] text-[#00ff66] font-black text-lg flex items-center justify-center border-2 border-[#141414] shrink-0 font-mono shadow-[2px_2px_0px_#000]">
                    02
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                      PASO 2 // INVENTORY_SCAN
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#141414] mt-0.5">
                      Selecciona los Ingredientes de tu Inventario
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 font-mono">
                      En el panel izquierdo <strong>DATA_SOURCE_01 // INVENTORY</strong>, haz clic en hasta 3 ingredientes para moverlos a la mesa operativa. 
                      Puedes usar el buscador con <kbd className="bg-gray-200 px-1 border border-black text-[10px]">SCAN_POOL</kbd> para encontrar ingredientes rápido.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-[#f4f4f4] border border-[#141414] text-xs font-mono shrink-0">
                  Límite: <span className="font-bold text-black">1 - 3 Ingredientes</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#141414] text-[#00ff66] font-black text-lg flex items-center justify-center border-2 border-[#141414] shrink-0 font-mono shadow-[2px_2px_0px_#000]">
                    03
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                      PASO 3 // CULINARY_TECHNIQUE
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#141414] mt-0.5">
                      Aplica una Técnica Culinaria (Tool Action)
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 font-mono">
                      Selecciona una acción en la botonera: <strong>BAKE</strong> (Hornear), <strong>CHOP</strong> (Cortar), 
                      <strong>BOIL</strong> (Hervir), <strong>FRY</strong> (Freír), <strong>BLEND</strong> (Licuar), etc. 
                      El motor computará la transformación molecular al instante.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-[#f4f4f4] border border-[#141414] text-xs font-mono shrink-0">
                  Técnicas: <span className="font-bold text-black">20+ Acciones</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#141414] text-[#00ff66] font-black text-lg flex items-center justify-center border-2 border-[#141414] shrink-0 font-mono shadow-[2px_2px_0px_#000]">
                    04
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                      PASO 4 // EXECUTE_SERVE
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#141414] mt-0.5">
                      Sirve el Plato con el Botón SERVE
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 font-mono">
                      Cuando el plato resultante coincida con el pedido solicitado en comanda, pulsa el botón 
                      <strong>SERVE</strong> (o atajo de teclado <kbd className="bg-gray-200 px-1.5 border border-black font-bold text-[10px]">S</kbd>). 
                      Recibirás tus propinas, bonus por velocidad y experiencia.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-[#fef08a] border-2 border-[#141414] font-black text-xs font-mono shrink-0 shadow-[2px_2px_0px_#000]">
                  Atajo: <span className="text-black">Tecla [ S ]</span>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#141414] text-[#00ff66] font-black text-lg flex items-center justify-center border-2 border-[#141414] shrink-0 font-mono shadow-[2px_2px_0px_#000]">
                    05
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">
                      PASO 5 // ALCHEMY_DISCOVERY
                    </div>
                    <h3 className="text-sm font-black uppercase text-[#141414] mt-0.5">
                      Experimenta y Descubre Nuevos Ingredientes
                    </h3>
                    <p className="text-xs text-gray-700 mt-1 font-mono">
                      Si no estás en un pedido activo, puedes combinar libremente. Las combinaciones creativas exitosas 
                      desbloquearán ingredientes permanentes que se añadirán a tu despensa para siempre.
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-[#f4f4f4] border border-[#141414] text-xs font-mono shrink-0">
                  Desbloqueos: <span className="font-bold text-amber-700">136+ Items</span>
                </div>
              </div>

            </div>

            {/* Quick Keyboard Shortcuts Reference */}
            <div className="bg-[#141414] text-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-5">
              <div className="text-xs font-bold text-[#00ff66] uppercase mb-3 flex items-center gap-2">
                <Terminal size={14} />
                <span>ATAJOS DE TECLADO RÁPIDOS (PRO CHEF PROTOCOL)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#222222] border border-gray-700 p-2.5 text-center">
                  <kbd className="bg-white text-black px-2 py-0.5 font-bold border border-black">S</kbd>
                  <div className="text-gray-300 mt-1.5">Servir Plato</div>
                </div>
                <div className="bg-[#222222] border border-gray-700 p-2.5 text-center">
                  <kbd className="bg-white text-black px-2 py-0.5 font-bold border border-black">M</kbd>
                  <div className="text-gray-300 mt-1.5">Ver Manifiesto</div>
                </div>
                <div className="bg-[#222222] border border-gray-700 p-2.5 text-center">
                  <kbd className="bg-white text-black px-2 py-0.5 font-bold border border-black">ESC</kbd>
                  <div className="text-gray-300 mt-1.5">Limpiar Mesa</div>
                </div>
                <div className="bg-[#222222] border border-gray-700 p-2.5 text-center">
                  <kbd className="bg-white text-black px-2 py-0.5 font-bold border border-black">ESPACIO</kbd>
                  <div className="text-gray-300 mt-1.5">Última Acción</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROUTE 3: CONTACTO & DESARROLLADOR (mylittlekitchen.fun/contacto) */}
        {/* ======================================================== */}
        {currentRoute === 'developer' && (
          <div className="space-y-6">
            {/* Terminal Header */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
              <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                  <span className="text-xs font-mono font-bold tracking-wider ml-2">
                    SYS_COMM // DEVELOPER_CONTACT
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#00ff66] font-bold tracking-widest hidden sm:block">
                  CHANNEL_OPEN
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#141414] mb-2 font-sans">
                  CONTACTO & SOPORTE TÉCNICO
                </h1>
                <p className="text-xs sm:text-sm text-gray-700 font-mono">
                  ¿Tienes sugerencias para nuevas recetas, reportes de bugs culinarios o consultas comerciales? 
                  Estamos siempre disponibles para la comunidad de <strong>mylittlekitchen.fun</strong>.
                </p>
              </div>
            </div>

            {/* Split Info & Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Studio Info Card */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6 space-y-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">
                  FICHA DEL DESARROLLADOR
                </div>

                <div className="border-b-2 border-[#141414] pb-4">
                  <div className="text-xs text-gray-500 font-mono">ESTUDIO / AUTOR:</div>
                  <div className="text-base font-black text-[#141414] font-sans">My Little Kitchen Studio</div>
                  <div className="text-xs text-gray-600 font-mono mt-0.5">KitchenOS Interactive Labs</div>
                </div>

                <div className="border-b-2 border-[#141414] pb-4">
                  <div className="text-xs text-gray-500 font-mono">CORREO OFICIAL:</div>
                  <a 
                    href="mailto:support@mylittlekitchen.fun"
                    className="text-sm font-black text-blue-700 hover:underline font-mono"
                  >
                    support@mylittlekitchen.fun
                  </a>
                </div>

                <div className="border-b-2 border-[#141414] pb-4">
                  <div className="text-xs text-gray-500 font-mono">DOMINIO PRINCIPAL:</div>
                  <div className="text-sm font-black text-black font-mono">https://mylittlekitchen.fun</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-mono">HORARIO DE RESPUESTA:</div>
                  <div className="text-xs text-gray-700 font-mono mt-0.5">
                    Lunes a Viernes (09:00 - 18:00 UTC) • Tiempo promedio de respuesta &lt; 24h.
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono mb-4">
                  ENVIAR MENSAJE DIRECTO
                </div>

                {contactSent ? (
                  <div className="bg-emerald-100 border-2 border-emerald-800 p-4 text-center font-mono">
                    <CheckCircle2 size={24} className="text-emerald-700 mx-auto mb-2" />
                    <div className="font-black text-sm text-emerald-900">¡MENSAJE ENVIADO!</div>
                    <div className="text-xs text-emerald-800 mt-1">Hemos registrado tu mensaje en la cola de soporte.</div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">Tu Nombre:</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        placeholder="Chef Alex..."
                        className="w-full bg-[#f8f8f8] border-2 border-[#141414] p-2 text-xs font-mono text-black focus:bg-white outline-none shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">Correo Electrónico:</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="chef@ejemplo.com"
                        className="w-full bg-[#f8f8f8] border-2 border-[#141414] p-2 text-xs font-mono text-black focus:bg-white outline-none shadow-inner"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">Asunto:</label>
                      <select
                        value={contactTopic}
                        onChange={e => setContactTopic(e.target.value)}
                        className="w-full bg-[#f8f8f8] border-2 border-[#141414] p-2 text-xs font-mono text-black focus:bg-white outline-none"
                      >
                        <option value="feedback">💡 Sugerencia de Receta / Idea</option>
                        <option value="bug">🐛 Reporte de Error o Bug</option>
                        <option value="business">💼 Consulta Comercial / Ads</option>
                        <option value="privacy">🛡️ Privacidad & Datos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1 uppercase">Mensaje:</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        placeholder="Describe detalladamente tu mensaje..."
                        className="w-full bg-[#f8f8f8] border-2 border-[#141414] p-2 text-xs font-mono text-black focus:bg-white outline-none shadow-inner resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#141414] hover:bg-black text-[#00ff66] font-black uppercase text-xs border-2 border-[#141414] shadow-[3px_3px_0px_#141414] cursor-pointer flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Send size={13} />
                      <span>TRANSMITIR MENSAJE ➔</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROUTE 4: POLÍTICA DE PRIVACIDAD (mylittlekitchen.fun/politica-privacidad) */}
        {/* ======================================================== */}
        {currentRoute === 'privacy' && (
          <div className="space-y-6">
            {/* Terminal Header */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
              <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                  <span className="text-xs font-mono font-bold tracking-wider ml-2">
                    LEGAL_PROTOCOL // PRIVACY_POLICY_RGPD_CCPA
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#00ff66] font-bold tracking-widest hidden sm:block">
                  COMPLIANT_V2.4
                </div>
              </div>

              <div className="p-6">
                <div className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-500 font-bold px-2 py-0.5 text-[10px] uppercase mb-2">
                  Última actualización: 25 de Agosto de 2026 • Dominio: mylittlekitchen.fun
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#141414] font-sans">
                  POLÍTICA DE PRIVACIDAD GLOBAL
                </h1>
                <p className="text-xs text-gray-700 font-mono mt-1">
                  En <strong>My Little Kitchen</strong> (disponible en <strong>mylittlekitchen.fun</strong>), respetamos y protegemos la privacidad de nuestros usuarios de acuerdo con el Reglamento General de Protección de Datos (RGPD / GDPR) de la Unión Europea y la Ley de Privacidad del Consumidor de California (CCPA).
                </p>
              </div>
            </div>

            {/* Legal Sections */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6 space-y-6 text-xs text-gray-800 font-mono leading-relaxed">
              
              <div>
                <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1 mb-2">
                  1. RESPONSABLE DEL TRATAMIENTO DE DATOS
                </h3>
                <p>
                  El responsable del tratamiento de los datos es <strong>My Little Kitchen Interactive Labs</strong>. 
                  Para cualquier consulta, ejercicio de derechos o solicitud de supresión de datos, puedes contactarnos en:
                  <strong className="text-black ml-1">privacy@mylittlekitchen.fun</strong> o <strong className="text-black">support@mylittlekitchen.fun</strong>.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1 mb-2">
                  2. INFORMACIÓN QUE RECOPILAMOS Y FINALIDAD
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Progreso de Juego Local:</strong> Nivel de chef, monedas virtuales, recetas descubiertas y configuración de sonido. Esta información se almacena 100% en el <em>LocalStorage</em> de tu navegador.</li>
                  <li><strong>Datos Técnicos No Identificables:</strong> Tipo de navegador, resolución de pantalla y país aproximado para optimizar el rendimiento del motor gráfico.</li>
                  <li><strong>Comunicaciones Voluntarias:</strong> Dirección de correo y nombre proporcionados en el formulario de contacto oficial.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1 mb-2">
                  3. INTELIGENCIA ARTIFICIAL & MODELOS GEMINI
                </h3>
                <p>
                  My Little Kitchen utiliza la API de Google Gemini para la generación de combinaciones culinarias dinámicas. 
                  Las peticiones enviadas al modelo contienen exclusivamente nombres de ingredientes y técnicas culinarias 
                  (por ejemplo: <em>"Tomate + Albahaca + Aceite"</em>). <strong>Nunca</strong> se transmite información personal o identificable del usuario a los modelos de IA.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1 mb-2">
                  4. PUBLICIDAD Y POLÍTICAS DE GOOGLE ADS (REWARDED ADS)
                </h3>
                <p>
                  Este sitio web cumple con las directrices de <strong>Google Publisher Policies</strong> y los estándares de anuncios bonificados (Rewarded Ads):
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Los anuncios bonificados son <strong>100% opcionales</strong>. El jugador decide explícitamente cuándo iniciar una visualización a cambio de una recompensa clara en el juego.</li>
                  <li>No se fuerza la visualización de publicidad intrusiva ni interstitials inesperados durante la cocción.</li>
                  <li>Los proveedores de anuncios certificados de Google pueden utilizar cookies de terceros de acuerdo con tus preferencias de consentimiento.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1 mb-2">
                  5. TUS DERECHOS (ACCESO, RECTIFICACIÓN Y SUPRESIÓN)
                </h3>
                <p>
                  Tienes derecho a acceder a tus datos, rectificarlos, solicitar su portabilidad o eliminarlos en cualquier momento. 
                  Puedes restablecer todo tu progreso y borrar los datos locales desde el menú de opciones del juego o limpiando la memoria caché de tu navegador.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROUTE 5: TÉRMINOS & COOKIES (mylittlekitchen.fun/terminos-y-cookies) */}
        {/* ======================================================== */}
        {currentRoute === 'terms-cookies' && (
          <div className="space-y-6">
            {/* Terminal Header */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] overflow-hidden">
              <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
                  <span className="text-xs font-mono font-bold tracking-wider ml-2">
                    SYS_TERMS // COOKIES_AND_CONDITIONS
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#00ff66] font-bold tracking-widest hidden sm:block">
                  LEGAL_TERMS_ACTIVE
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#141414] font-sans">
                  TÉRMINOS DE SERVICIO & PANEL DE COOKIES
                </h1>
                <p className="text-xs text-gray-700 font-mono mt-1">
                  Condiciones de uso y centro de gestión de almacenamiento local para <strong>mylittlekitchen.fun</strong>.
                </p>
              </div>
            </div>

            {/* Interactive Cookie Manager (KitchenOS Style) */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#141414] pb-2">
                <div className="text-xs font-bold text-gray-700 uppercase font-mono flex items-center gap-2">
                  <Cookie size={16} />
                  <span>PANEL DE PREFERENCIAS DE COOKIES & ALMACENAMIENTO</span>
                </div>
                {cookieSavedToast && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 border border-emerald-600 font-mono">
                    ✓ PREFERENCIAS GUARDADAS
                  </span>
                )}
              </div>

              {/* Cookie item 1 */}
              <div className="p-3 bg-[#f8f8f8] border-2 border-[#141414] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-black">Cookies Técnicas Esenciales (Obligatorias)</div>
                  <div className="text-[11px] text-gray-600 font-mono mt-0.5">
                    Permiten guardar tu partida, monedas, progreso de nivel y recetas en LocalStorage.
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#141414] text-white px-2 py-1 uppercase font-mono">
                  Siempre Activas
                </span>
              </div>

              {/* Cookie item 2 */}
              <div className="p-3 bg-[#f8f8f8] border-2 border-[#141414] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-black">Analítica de Rendimiento (Telemetry)</div>
                  <div className="text-[11px] text-gray-600 font-mono mt-0.5">
                    Ayuda a detectar errores de carga y latencia en el motor culinario.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCookieConsent((prev: any) => ({ ...prev, analytics: !prev.analytics }))}
                  className={`px-3 py-1 text-xs font-black uppercase font-mono border-2 border-[#141414] cursor-pointer shadow-[2px_2px_0px_#000] ${
                    cookieConsent.analytics ? 'bg-[#00ff66] text-black' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cookieConsent.analytics ? 'ACTIVO [ON]' : 'INACTIVO [OFF]'}
                </button>
              </div>

              {/* Cookie item 3 */}
              <div className="p-3 bg-[#f8f8f8] border-2 border-[#141414] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-black">Anuncios Bonificados Opcionales (Google Ads)</div>
                  <div className="text-[11px] text-gray-600 font-mono mt-0.5">
                    Permite la carga de recompensas patrocinadas bajo petición del usuario.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCookieConsent((prev: any) => ({ ...prev, rewardedAds: !prev.rewardAds }))}
                  className={`px-3 py-1 text-xs font-black uppercase font-mono border-2 border-[#141414] cursor-pointer shadow-[2px_2px_0px_#000] ${
                    cookieConsent.rewardedAds ? 'bg-[#00ff66] text-black' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cookieConsent.rewardedAds ? 'ACTIVO [ON]' : 'INACTIVO [OFF]'}
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveCookiePreferences}
                  className="px-5 py-2 bg-[#141414] hover:bg-black text-[#00ff66] font-black text-xs uppercase font-mono border-2 border-[#141414] shadow-[3px_3px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
                >
                  GUARDAR CONFIGURACIÓN ➔
                </button>
              </div>
            </div>

            {/* Terms Content */}
            <div className="bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-6 space-y-4 text-xs text-gray-800 font-mono leading-relaxed">
              <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-1">
                TÉRMINOS Y CONDICIONES DE USO
              </h3>
              <p>
                1. <strong>Uso Gratuito:</strong> El acceso a <strong>My Little Kitchen</strong> en mylittlekitchen.fun es completamente libre y gratuito para fines de entretenimiento personal.
              </p>
              <p>
                2. <strong>Propiedad Intelectual:</strong> Los algoritmos de cocina, diseño KitchenOS, logotipos, sprites y código fuente son propiedad exclusiva de My Little Kitchen Studio.
              </p>
              <p>
                3. <strong>Moneda Virtual:</strong> Las monedas y créditos dentro del juego carecen de valor monetario real en el mundo físico y no son canjeables por dinero en efectivo.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* 4. FOOTER (KitchenOS Console Footer) */}
      <footer className="mt-12 bg-white border-2 border-[#141414] shadow-[4px_4px_0px_#141414] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-700">
        <div>
          © 2026 <strong>My Little Kitchen</strong> (mylittlekitchen.fun) • KitchenOS Engine v2.4
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              soundService.playClick();
              onNavigate('game');
            }}
            className="font-bold text-black hover:underline"
          >
            ➔ Volver al Juego
          </button>
          <span className="text-emerald-700 font-black">● SISTEMA OPERATIVO</span>
        </div>
      </footer>

    </div>
  );
}
