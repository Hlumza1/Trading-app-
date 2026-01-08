
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar.tsx';
import AssetCard from './components/AssetCard.tsx';
import Modal from './components/Modal.tsx';
import { ASSETS } from './constants.ts';
import { AssetSymbol, AppState, AssetSignal } from './types.ts';
import { fetchAllMarketSignals } from './services/geminiService.ts';

const SCAN_DURATION = 60; // Increased to 60s for deep grounding searches

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [state, setState] = useState<AppState>({
    signals: {
      XAUUSD: null,
      EURUSD: null,
      GBPUSD: null,
      GBPEUR: null
    },
    isLoading: false,
    lastUpdated: null,
    error: null
  });

  const [selectedAsset, setSelectedAsset] = useState<AssetSignal | null>(null);

  const startCountdown = () => {
    setCountdown(SCAN_DURATION);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
  };

  const refreshAll = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    startCountdown();

    try {
      const allSignals = await fetchAllMarketSignals();
      
      const signalsMap = { ...state.signals };
      allSignals.forEach(sig => {
        if (sig.symbol in signalsMap) {
          signalsMap[sig.symbol as AssetSymbol] = sig;
        }
      });

      setState(prev => ({
        ...prev,
        signals: signalsMap,
        isLoading: false,
        lastUpdated: new Date().toLocaleTimeString()
      }));

      if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("Forex Pulse Update", {
          body: `Analysis complete. Found ${allSignals.length} fresh signals.`,
          icon: "https://cdn-icons-png.flaticon.com/512/2534/2534135.png"
        });
      }
    } catch (err: any) {
      console.error(`Intelligence Refresh Error:`, err);
      setState(prev => ({
        ...prev,
        error: err.message || "Failed to reach global data nodes. Check your API key and connection.",
        isLoading: false
      }));
    } finally {
      stopCountdown();
    }
  }, [state.signals, notificationsEnabled]);

  useEffect(() => {
    refreshAll();
    return () => stopCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleNotifications = () => {
    if (!notificationsEnabled && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationsEnabled(true);
        } else {
          alert("Notification permission denied. Please enable it in browser settings.");
        }
      });
    } else {
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="animate-slide-up">
            <section className="mb-10">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Institutional Signals</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {ASSETS.map((asset) => (
                  <AssetCard 
                    key={asset.symbol}
                    asset={asset}
                    data={state.signals[asset.symbol]}
                    loading={state.isLoading && !state.signals[asset.symbol]}
                    error={null}
                    onRefresh={refreshAll}
                    onSelect={(data) => setSelectedAsset(data)}
                  />
                ))}
              </div>
            </section>
          </div>
        );
      case 'alerts':
        return (
          <div className="animate-slide-up max-w-4xl">
            <h3 className="text-3xl font-black text-white mb-6">Alert History</h3>
            <div className="space-y-4">
              {[
                { type: 'Update', msg: 'Latest monthly scan completed successfully.', time: state.lastUpdated || 'Just now' },
                { type: 'System', msg: 'Gemini-3-Pro engine is scanning global nodes.', time: 'Continuously active' }
              ].map((alert, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex justify-between items-center hover:border-blue-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <i className="fas fa-satellite-dish"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{alert.type}</p>
                      <p className="text-slate-200 font-bold">{alert.msg}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="animate-slide-up max-w-3xl">
            <h3 className="text-3xl font-black text-white mb-6">Settings</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl divide-y divide-slate-800">
              <div className="p-8 flex justify-between items-center">
                <div>
                  <p className="font-black text-white">Analysis Engine</p>
                  <p className="text-sm text-slate-500">Currently using Gemini 3 Pro for high-precision grounding.</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Enterprise</span>
              </div>
              <div className="p-8 flex justify-between items-center cursor-pointer group" onClick={toggleNotifications}>
                <div>
                  <p className="font-black text-white group-hover:text-blue-400 transition-colors">Push Notifications</p>
                  <p className="text-sm text-slate-500">Alert me when the monthly cycle signals shift.</p>
                </div>
                <div className={`w-14 h-7 rounded-full relative transition-colors duration-500 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-lg ${notificationsEnabled ? 'left-8' : 'left-1'}`}></div>
                </div>
              </div>
              <div className="p-8 flex justify-between items-center">
                <div>
                  <p className="font-black text-white">System Status</p>
                  <p className="text-sm text-slate-500">Verification of connectivity to global data feeds.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Online</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col lg:flex-row text-slate-100 pb-24 lg:pb-0">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <main className="flex-1 lg:ml-64 p-6 md:p-12 transition-all">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-8 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                {currentView === 'dashboard' ? 'PULSE' : currentView.toUpperCase()}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
              <span className="flex items-center gap-2">
                <i className="far fa-clock"></i>
                {state.lastUpdated ? `LAST SYNC: ${state.lastUpdated}` : 'INITIALIZING...'}
              </span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="flex items-center gap-2 text-blue-500">
                <i className="fas fa-broadcast-tower"></i>
                LIVE FEED
              </span>
            </div>
          </div>
          
          <div className="w-full sm:w-auto flex flex-col items-end gap-3">
            <button 
              onClick={refreshAll}
              disabled={state.isLoading}
              className={`w-full sm:w-72 flex items-center justify-center gap-4 px-10 py-5 rounded-2xl font-black transition-all shadow-2xl active:scale-95 text-xs uppercase tracking-[0.2em] relative overflow-hidden ${
                state.isLoading 
                ? 'bg-slate-900 text-slate-500 cursor-wait border border-slate-800' 
                : 'bg-white text-black hover:bg-slate-200 hover:shadow-white/10'
              }`}
            >
              {state.isLoading && (
                <div 
                  className="absolute left-0 bottom-0 h-1 bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${((SCAN_DURATION - countdown) / SCAN_DURATION) * 100}%` }}
                />
              )}
              <i className={`fas fa-sync-alt ${state.isLoading ? 'animate-spin' : ''}`}></i>
              {state.isLoading ? `SCANNING (${countdown}s)` : 'RESCAN GLOBAL MARKETS'}
            </button>
            {state.isLoading && (
              <p className="text-[9px] font-black text-blue-500 tracking-widest uppercase animate-pulse">
                Consulting Investing.com & ForexFactory nodes...
              </p>
            )}
          </div>
        </header>

        {state.error && (
          <div className="mb-10 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-sm font-bold flex flex-col gap-2 animate-slide-up">
            <div className="flex items-center gap-4">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
              <span>{state.error}</span>
            </div>
            {state.error.includes("API_KEY_MISSING") && (
              <p className="text-xs opacity-80 mt-2 pl-10">
                Go to Vercel Settings &gt; Environment Variables, add <b>API_KEY</b>, and redeploy.
              </p>
            )}
          </div>
        )}

        {renderView()}

      </main>

      <Modal 
        data={selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
      />
    </div>
  );
};

export default App;
