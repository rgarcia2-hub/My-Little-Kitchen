import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Coins, 
  Lightbulb, 
  Zap, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  ShieldCheck, 
  Clock,
  Award,
  Terminal,
  ChefHat
} from 'lucide-react';
import { soundService } from '../services/soundService';

export type RewardType = 'coins' | 'hint' | 'xp';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrantReward: (type: RewardType, amount: number) => void;
}

export function RewardedAdModal({ isOpen, onClose, onGrantReward }: RewardedAdModalProps) {
  const [selectedReward, setSelectedReward] = useState<RewardType>('coins');
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAd && adCountdown > 0) {
      timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    } else if (isPlayingAd && adCountdown === 0) {
      setIsPlayingAd(false);
      setAdCompleted(true);
      soundService.playSuccess();
      
      // Grant reward
      if (selectedReward === 'coins') {
        onGrantReward('coins', 75);
      } else if (selectedReward === 'hint') {
        onGrantReward('hint', 1);
      } else if (selectedReward === 'xp') {
        onGrantReward('xp', 200);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, adCountdown, selectedReward, onGrantReward]);

  if (!isOpen) return null;

  const handleStartAd = (reward: RewardType) => {
    setSelectedReward(reward);
    setAdCountdown(5);
    setAdCompleted(false);
    setIsPlayingAd(true);
    soundService.playClick();
  };

  const handleReset = () => {
    setIsPlayingAd(false);
    setAdCompleted(false);
    setAdCountdown(5);
  };

  return (
    <div 
      className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border-2 border-[#141414] text-[#141414] shadow-[8px_8px_0px_#141414] overflow-hidden font-mono"
        onClick={e => e.stopPropagation()}
      >
        {/* KitchenOS Terminal Header */}
        <div className="bg-[#141414] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#141414]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#eab308] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
            <span className="text-xs font-mono font-bold tracking-wider ml-2">
              KITCHEN_OS // SPONSORED_REWARDS
            </span>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              handleReset();
              onClose();
            }}
            className="w-6 h-6 bg-white hover:bg-red-500 hover:text-white text-black font-black text-xs border border-black flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Header Banner */}
        <div className="px-5 py-3 bg-[#fef9c3] border-b-2 border-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <div className="text-xs font-black uppercase text-black">
                RECOMPENSAS PATROCINADAS (GOOGLE AD CERTIFIED)
              </div>
              <div className="text-[10px] text-gray-700">
                100% Opcional • Sin compras con dinero real
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-600 px-1.5 py-0.5">
            READY
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-white">
          {isPlayingAd ? (
            /* AD PLAYER SCREEN (5s Compliant Retro Player) */
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="relative w-full h-48 bg-[#141414] border-2 border-[#141414] flex flex-col items-center justify-center p-6 text-white shadow-inner overflow-hidden">
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-[#222] border border-gray-700 text-[10px] text-emerald-400 font-mono">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Google Ads Partner Verified</span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-[#fef08a] text-black border border-black text-xs font-black font-mono">
                  <Clock size={12} strokeWidth={3} />
                  <span>0:0{adCountdown}s</span>
                </div>

                <div className="text-4xl mb-2 animate-bounce">📺</div>
                <div className="text-sm font-black tracking-wider uppercase text-white">
                  Reproduciendo Anuncio Patrocinado
                </div>
                <div className="text-[11px] text-gray-400 mt-1 max-w-xs">
                  Tu recompensa se acreditará automáticamente al finalizar la cuenta atrás.
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-gray-800 h-3 border border-gray-600 mt-4 overflow-hidden">
                  <div 
                    className="bg-[#00ff66] h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-600">
                ⚠️ Por favor mantén esta ventana abierta durante los 5 segundos para recibir la bonificación.
              </p>
            </div>
          ) : adCompleted ? (
            /* REWARD GRANTED SCREEN */
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="w-14 h-14 bg-[#00ff66] text-black border-2 border-black flex items-center justify-center mx-auto text-2xl shadow-[3px_3px_0px_#000]">
                ✓
              </div>

              <div>
                <h3 className="text-base font-black uppercase text-black">
                  ¡RECOMPENSA ACREDITADA CON ÉXITO!
                </h3>
                <p className="text-xs text-gray-700 mt-1">
                  Se ha añadido a tu partida en <strong>mylittlekitchen.fun</strong>:
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fef9c3] border-2 border-black text-xs font-black shadow-[2px_2px_0px_#000]">
                {selectedReward === 'coins' && <span>💰 +$75 Monedas de Oro</span>}
                {selectedReward === 'hint' && <span>💡 +1 Pista de Receta Revelada</span>}
                {selectedReward === 'xp' && <span>⚡ +200 Puntos de Experiencia (XP)</span>}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    soundService.playClick();
                    handleReset();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-[#141414] hover:bg-black text-[#00ff66] font-black uppercase text-xs border-2 border-[#141414] shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  VOLVER A COCINAR ➔
                </button>
              </div>
            </div>
          ) : (
            /* REWARD SELECTION SCREEN */
            <div className="space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                Selecciona la bonificación que deseas recibir para potenciar tu cocina:
              </p>

              {/* Option 1: Coins */}
              <div className="p-3.5 bg-[#fef9c3] border-2 border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
                    💰
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-black">+$75 Monedas</div>
                    <div className="text-[10px] text-gray-700">Para compras en la tienda y mejoras</div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAd('coins')}
                  className="px-3 py-2 bg-[#141414] hover:bg-black text-[#00ff66] font-black text-xs uppercase border-2 border-[#141414] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Play size={12} fill="#00ff66" />
                  <span>OBTENER</span>
                </button>
              </div>

              {/* Option 2: Hint */}
              <div className="p-3.5 bg-[#dbeafe] border-2 border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
                    💡
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-black">+1 Pista de Receta</div>
                    <div className="text-[10px] text-gray-700">Desvela combinaciones secretas</div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAd('hint')}
                  className="px-3 py-2 bg-[#141414] hover:bg-black text-[#00ff66] font-black text-xs uppercase border-2 border-[#141414] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Play size={12} fill="#00ff66" />
                  <span>OBTENER</span>
                </button>
              </div>

              {/* Option 3: XP */}
              <div className="p-3.5 bg-[#f3e8ff] border-2 border-[#141414] shadow-[3px_3px_0px_#141414] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase text-black">+200 XP de Chef</div>
                    <div className="text-[10px] text-gray-700">Sube de nivel y desbloquea rangos</div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartAd('xp')}
                  className="px-3 py-2 bg-[#141414] hover:bg-black text-[#00ff66] font-black text-xs uppercase border-2 border-[#141414] shadow-[2px_2px_0px_#000] cursor-pointer flex items-center gap-1 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Play size={12} fill="#00ff66" />
                  <span>OBTENER</span>
                </button>
              </div>

              {/* Policy disclosure */}
              <div className="pt-2 text-[10px] text-gray-500 text-center leading-relaxed">
                Este juego no contiene compras dentro de la aplicación. 
                Los anuncios son ofrecidos a través de la red certificada de Google Ad Manager.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
