import React, { useState, useEffect } from 'react';
import { AppSettings, Visitor } from '../types';
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  LayoutGrid,
  Square,
  Sparkles,
  Heart,
  Church,
  X,
  Sliders,
  Check,
} from 'lucide-react';

interface ProjectionViewProps {
  visitors: Visitor[];
  settings: AppSettings;
  onClose: () => void;
  onToggleProjected: (id: string) => void;
}

export const ProjectionView: React.FC<ProjectionViewProps> = ({
  visitors,
  settings,
  onClose,
  onToggleProjected,
}) => {
  const projectedVisitors = visitors.filter((v) => v.projected);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayMode, setDisplayMode] = useState<'single' | 'grid'>('single');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [theme, setTheme] = useState<'gold_navy' | 'midnight' | 'sanctuary_white' | 'emerald'>(
    'gold_navy'
  );

  // Auto rotation in single mode
  useEffect(() => {
    if (!isPlaying || displayMode !== 'single' || projectedVisitors.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projectedVisitors.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, displayMode, projectedVisitors.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % (projectedVisitors.length || 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + (projectedVisitors.length || 1)) % (projectedVisitors.length || 1));
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectedVisitors.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentVisitor = projectedVisitors[currentIndex] || projectedVisitors[0];

  // Theme styling definitions
  const getThemeClasses = () => {
    switch (theme) {
      case 'gold_navy':
        return {
          wrapper: 'bg-gradient-to-b from-[#091124] via-[#0d1b3e] to-[#080d1a] text-slate-100',
          accent: 'text-amber-400',
          title: 'text-amber-300 font-cinzel',
          border: 'border-amber-500/20',
          card: 'bg-slate-900/60 backdrop-blur-md border-amber-500/30 text-white shadow-2xl shadow-amber-950/40',
          glow: 'from-amber-500/10 via-amber-400/5 to-transparent',
          verse: 'text-amber-200/90 font-instrument italic',
        };
      case 'midnight':
        return {
          wrapper: 'bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100',
          accent: 'text-sky-400',
          title: 'text-white font-cinzel',
          border: 'border-slate-800',
          card: 'bg-slate-900/80 border-slate-700/60 text-white shadow-2xl',
          glow: 'from-sky-500/10 to-transparent',
          verse: 'text-slate-300 font-instrument italic',
        };
      case 'sanctuary_white':
        return {
          wrapper: 'bg-gradient-to-b from-amber-50/80 via-white to-amber-100/50 text-slate-900',
          accent: 'text-amber-800',
          title: 'text-amber-950 font-cinzel',
          border: 'border-amber-200',
          card: 'bg-white/90 border-amber-200 text-slate-900 shadow-xl shadow-amber-900/5',
          glow: 'from-amber-200/20 to-transparent',
          verse: 'text-amber-900/90 font-instrument italic',
        };
      case 'emerald':
        return {
          wrapper: 'bg-gradient-to-b from-[#061d15] via-[#0a2f22] to-[#04140e] text-emerald-50',
          accent: 'text-emerald-300',
          title: 'text-emerald-200 font-cinzel',
          border: 'border-emerald-500/20',
          card: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-50 shadow-2xl',
          glow: 'from-emerald-400/10 to-transparent',
          verse: 'text-emerald-200/90 font-instrument italic',
        };
    }
  };

  const themeStyles = getThemeClasses();

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden flex flex-col justify-between ${themeStyles.wrapper}`}>
      
      {/* Background Decorative Ambient Radial Lighting */}
      <div className={`absolute inset-0 bg-radial ${themeStyles.glow} pointer-events-none`}></div>
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>

      {/* Top Bar / Church Header & Tech Team Controls */}
      <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between">
        
        {/* Church Title & Scripture */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
            <Church className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase font-cinzel">
              {settings.churchName || 'Comunidade da Graça'}
            </h2>
            <p className="text-xs text-amber-300/80 tracking-widest uppercase">
              Boas-Vindas aos Visitantes
            </p>
          </div>
        </div>

        {/* Floating Quick Projection Controls */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-lg">
          
          {/* Display Mode Toggle */}
          <button
            type="button"
            onClick={() => setDisplayMode(displayMode === 'single' ? 'grid' : 'single')}
            className={`p-2 rounded-xl text-xs font-medium transition-colors ${
              displayMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-300 hover:text-white'
            }`}
            title={displayMode === 'single' ? 'Mudar para Visualização em Mosaico' : 'Mudar para Destaque Individual'}
          >
            {displayMode === 'single' ? <LayoutGrid className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>

          {/* Play/Pause Timer */}
          {displayMode === 'single' && projectedVisitors.length > 1 && (
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                isPlaying ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
              title={isPlaying ? 'Pausar rotação automática' : 'Iniciar rotação automática'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}

          {/* Theme Palette Switcher */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="bg-black/50 text-xs text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none hover:bg-black/70"
          >
            <option value="gold_navy">Dourado Real & Noturno</option>
            <option value="midnight">Minimalista Midnight</option>
            <option value="sanctuary_white">Santuário Claro</option>
            <option value="emerald">Paz Esmeralda</option>
          </select>

          {/* Manage Queue Drawer Trigger */}
          <button
            type="button"
            onClick={() => setShowDrawer(true)}
            className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors relative"
            title="Gerenciar lista de nomes no telão"
          >
            <Sliders className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
              {projectedVisitors.length}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="Alternar Tela Cheia (Tecla F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Projection */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-rose-400 rounded-xl transition-colors"
            title="Sair da Projeção (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-4">
        
        {projectedVisitors.length === 0 ? (
          /* Empty Projection State */
          <div className="text-center max-w-lg space-y-4 p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-300 mx-auto flex items-center justify-center">
              <Church className="w-8 h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-cinzel">
              Nenhum visitante marcado para projeção
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Marque os visitantes desejados no painel ou clique no botão de gerenciar para selecionar quem deve aparecer no telão.
            </p>
            <button
              onClick={() => setShowDrawer(true)}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg transition-colors"
            >
              Selecionar Visitantes
            </button>
          </div>
        ) : displayMode === 'single' ? (
          /* Single Visitor Spotlight Mode (Clean & Huge Typography) */
          <div className="w-full max-w-4xl text-center space-y-8 animate-in fade-in duration-300">
            
            {/* Top Subtitle */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-amber-400/90">
                <Sparkles className="w-4 h-4" />
                Seja Muito Bem-Vindo(a)!
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-cinzel drop-shadow-md">
                {currentVisitor?.name}
              </h1>
            </div>

            {/* Visitor Details Card (City / Inviter / First time) */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-lg font-medium opacity-90">
              {currentVisitor?.isFirstTime && (
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full">
                  ✨ 1ª Vez Conosco
                </span>
              )}
              {currentVisitor?.neighborhood && (
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
                  📍 {currentVisitor.neighborhood}
                </span>
              )}
              {currentVisitor?.invitedBy && (
                <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
                  🤝 Convidado por {currentVisitor.invitedBy}
                </span>
              )}
            </div>

            {/* Custom Welcome Message / Subtitle */}
            <p className="text-base sm:text-2xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
              {settings.projectionSubtitle ||
                'A sua presença alegra o nosso coração e honra a nossa igreja!'}
            </p>

            {/* Pagination Controls */}
            {projectedVisitors.length > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev - 1 + projectedVisitors.length) % projectedVisitors.length
                    )
                  }
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                  title="Anterior (Seta Esquerda)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <span className="text-sm font-mono tracking-widest opacity-80">
                  {currentIndex + 1} / {projectedVisitors.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev + 1) % projectedVisitors.length)
                  }
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                  title="Próximo (Seta Direita / Espaço)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Multi-Visitor Grid / Mosaic Mode */
          <div className="w-full max-w-6xl space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold text-amber-400">
                Culto de Boas-Vindas
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-cinzel">
                Nossos Queridos Visitantes
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
              {projectedVisitors.map((vis) => (
                <div
                  key={vis.id}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${themeStyles.card}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                        Visitante
                      </span>
                      {vis.isFirstTime && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-medium">
                          1ª Vez
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-cinzel leading-snug">
                      {vis.name}
                    </h3>
                  </div>

                  {(vis.neighborhood || vis.invitedBy) && (
                    <div className="mt-4 pt-3 border-t border-white/10 text-xs opacity-75 space-y-0.5">
                      {vis.neighborhood && <p>📍 {vis.neighborhood}</p>}
                      {vis.invitedBy && <p>🤝 {vis.invitedBy}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Scripture Banner */}
      <footer className="relative z-10 px-6 py-4 text-center border-t border-white/10 bg-black/20 backdrop-blur-md">
        <p className={`text-sm sm:text-base ${themeStyles.verse}`}>
          "{settings.welcomeVerse || 'Alegrei-me quando me disseram: Vamos à casa do Senhor.'}"
        </p>
        <span className="text-xs tracking-wider uppercase opacity-75 font-sans mt-0.5 inline-block">
          {settings.welcomeVerseReference || 'Salmos 122:1'}
        </span>
      </footer>

      {/* Tech Team Side Drawer (Manage Projected Visitors Live) */}
      {showDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-700 flex flex-col p-5 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white">Controle de Nomes no Telão</h3>
              <p className="text-xs text-slate-400">
                Ative ou desative quem aparece no telão agora
              </p>
            </div>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {visitors.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Nenhum visitante cadastrado no sistema ainda.
              </p>
            ) : (
              visitors.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onToggleProjected(v.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    v.projected
                      ? 'bg-amber-950/40 border-amber-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{v.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {v.cultoName} · {v.shift}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      v.projected
                        ? 'bg-amber-500 border-amber-400 text-black'
                        : 'border-slate-600 bg-slate-700'
                    }`}
                  >
                    {v.projected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 text-center">
            Atalhos: [Espaço / Seta] Avança nome · [F] Tela Cheia
          </div>
        </div>
      )}
    </div>
  );
};
