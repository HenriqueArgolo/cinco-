import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, RefreshCw, Radio, PlayCircle, PauseCircle } from 'lucide-react';
import { MatchResponse, LogEntry, AppSettings } from './types';
import { MatchCard } from './components/MatchCard';
import { SettingsModal } from './components/SettingsModal';
import { LogPanel } from './components/LogPanel';
import { fetchLiveMatches } from './services/apiFootball';
import { sendDiscordNotification, sendGenericNotification } from './services/notification';
import { getSettings, saveSettings, getNotifiedMatchIds, addNotifiedMatchId, clearNotifiedMatchIds } from './services/storage';

const App: React.FC = () => {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Use refs for values needed inside intervals to avoid stale closures without full re-renders
  const settingsRef = useRef(settings);
  const notifiedIdsRef = useRef(getNotifiedMatchIds());

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      { id: Math.random().toString(36).substr(2, 9), timestamp: new Date(), message, type },
      ...prev.slice(0, 99) // Keep last 100 logs
    ]);
  }, []);

  const handleFetchMatches = useCallback(async () => {
    if (!settingsRef.current.apiKey) {
      addLog('API Key ausente. Configure no menu.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const liveMatches = await fetchLiveMatches(settingsRef.current.apiKey);
      setMatches(liveMatches);
      setLastUpdated(new Date());
      addLog(`${liveMatches.length} partidas ao vivo analisadas.`, 'info');

      // Check for blowouts
      liveMatches.forEach(async (match) => {
        const home = match.goals.home ?? 0;
        const away = match.goals.away ?? 0;
        const diff = Math.abs(home - away);
        const matchId = match.fixture.id;
        const threshold = settingsRef.current.goalDiffThreshold;

        // Debug log for matches with significant goal difference
        if (diff >= 3) {
          addLog(`Analisando: ${match.teams.home.name} ${home}-${away} ${match.teams.away.name} (Diff: ${diff}, Threshold: ${threshold}, ID: ${matchId})`, 'info');
        }

        if (diff >= threshold) {
          if (!notifiedIdsRef.current.has(matchId)) {
            // New Blowout Detected
            const leader = home > away ? match.teams.home.name : match.teams.away.name;
            addLog(`GOLEADA DETECTADA! ${leader} lidera por ${diff} gols. (ID: ${matchId})`, 'success');

            // Send Notifications
            if (settingsRef.current.discordWebhook) {
              sendDiscordNotification(settingsRef.current.discordWebhook, match)
                .then(() => addLog(`Notificação enviada ao Discord (Jogo ${matchId})`, 'success'))
                .catch((error) => {
                  addLog(`Falha ao enviar Discord (Jogo ${matchId}): ${error.message || 'Erro desconhecido'}`, 'error');
                  console.error('Erro ao enviar Discord:', error);
                });
            } else {
              addLog(`Webhook do Discord não configurado. Configure nas opções.`, 'warning');
            }
            if (settingsRef.current.genericWebhook) {
              sendGenericNotification(settingsRef.current.genericWebhook, match)
                .then(() => addLog(`Notificação enviada ao Webhook Genérico (Jogo ${matchId})`, 'success'))
                .catch((error) => {
                  addLog(`Falha ao enviar Webhook Genérico (Jogo ${matchId}): ${error.message || 'Erro desconhecido'}`, 'error');
                  console.error('Erro ao enviar Webhook Genérico:', error);
                });
            }

            // Persist notification state
            addNotifiedMatchId(matchId);
            notifiedIdsRef.current.add(matchId);
          } else {
            addLog(`Partida ${matchId} já foi notificada anteriormente.`, 'info');
          }
        } else if (diff >= 3) {
          addLog(`Diferença de ${diff} gols não atingiu o threshold de ${threshold} gols.`, 'info');
        }
      });

    } catch (error: any) {
      addLog(`Erro ao buscar jogos: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  // Polling Effect
  useEffect(() => {
    if (!isMonitoring) return;

    // Initial fetch if API key exists
    if (settings.apiKey) {
        handleFetchMatches();
    }

    const intervalId = setInterval(() => {
      handleFetchMatches();
    }, settings.refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [settings.refreshInterval, settings.apiKey, handleFetchMatches, isMonitoring]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    settingsRef.current = newSettings; // Update ref immediately
    saveSettings(newSettings);
    addLog(`Configurações salvas. Threshold de gols: ${newSettings.goalDiffThreshold}. Ciclo de monitoramento atualizado.`, 'info');
    
    // Clear notified IDs if API Key changes (optional logic, kept simple here to just reload)
    if (newSettings.apiKey !== settings.apiKey) {
      clearNotifiedMatchIds();
      notifiedIdsRef.current = new Set();
      setMatches([]);
      addLog('Cache de notificações limpo devido à mudança de API Key.', 'warning');
    }
  };

  const toggleMonitoring = () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    addLog(newState ? 'Monitoramento iniciado.' : 'Monitoramento pausado pelo usuário.', newState ? 'success' : 'warning');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-slate-700 p-4 flex justify-between items-center shrink-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${isMonitoring ? 'bg-red-600 animate-pulse-slow' : 'bg-slate-700'}`}>
              <Radio className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">5 OU + BOT</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                Status: {isLoading ? 'Atualizando...' : (isMonitoring ? 'Online' : 'Pausado')} 
                {lastUpdated && ` • Última: ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMonitoring}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isMonitoring 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30' 
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30'
              }`}
            >
              {isMonitoring ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              <span className="hidden sm:inline">{isMonitoring ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button 
              onClick={handleFetchMatches}
              disabled={isLoading || !isMonitoring}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
              title="Forçar atualização"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Configurar</span>
            </button>
          </div>
        </header>

        {/* Matches Grid */}
        <main className="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
          {!settings.apiKey ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Settings size={48} className="mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-slate-300 mb-2">Configuração Necessária</h2>
              <p className="max-w-md text-center mb-6">
                Para começar a monitorar, adicione sua API Key da API-Football nas configurações.
              </p>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Abrir Configurações
              </button>
            </div>
          ) : matches.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <div className="text-4xl mb-2 opacity-30">{isMonitoring ? '⚽' : '⏸️'}</div>
              <p className="text-slate-400">
                {isMonitoring 
                  ? 'Nenhuma partida ao vivo encontrada no momento.' 
                  : 'Monitoramento pausado.'}
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 ${!isMonitoring ? 'opacity-50 grayscale' : ''}`}>
              {matches
                .sort((a, b) => {
                   // Sort by goal diff descending, then by time elapsed
                   const diffA = Math.abs((a.goals.home||0) - (a.goals.away||0));
                   const diffB = Math.abs((b.goals.home||0) - (b.goals.away||0));
                   return diffB - diffA;
                })
                .map((match) => (
                <MatchCard key={match.fixture.id} match={match} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Logs Sidebar */}
      <div className="w-80 h-full shrink-0 border-l border-slate-700 hidden md:block z-20 shadow-xl">
        <LogPanel logs={logs} />
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;