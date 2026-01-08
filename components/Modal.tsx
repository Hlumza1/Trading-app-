
import React from 'react';
import { AssetSignal, SignalType } from '../types';

interface ModalProps {
  data: AssetSignal | null;
  onClose: () => void;
}

const getSignalColor = (signal: SignalType) => {
  switch (signal) {
    case SignalType.STRONG_BUY: return 'text-emerald-400';
    case SignalType.BUY: return 'text-green-400';
    case SignalType.NEUTRAL: return 'text-slate-400';
    case SignalType.SELL: return 'text-red-400';
    case SignalType.STRONG_SELL: return 'text-rose-400';
    default: return 'text-slate-400';
  }
};

const Modal: React.FC<ModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold">{data.symbol}</h2>
              <span className={`text-sm font-black uppercase tracking-widest ${getSignalColor(data.signal)}`}>
                {data.signal}
              </span>
            </div>
            <p className="text-slate-400">{data.name} — Monthly Analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors text-slate-400"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-400 font-semibold">
                <i className="fas fa-chart-area"></i>
                <h3>Technical Market Sentiment</h3>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-slate-300 leading-relaxed text-sm">
                {data.technicalSummary}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-amber-400 font-semibold">
                <i className="fas fa-globe-americas"></i>
                <h3>Fundamental Drivers</h3>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 text-slate-300 leading-relaxed text-sm">
                {data.fundamentalSummary}
              </div>
            </section>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold">
              <i className="fas fa-search"></i>
              <h3>Intelligence Grounding</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group"
                >
                  <span className="text-xs text-slate-400 truncate max-w-[200px] group-hover:text-blue-400">{source.title}</span>
                  <i className="fas fa-external-link-alt text-[10px] text-slate-600 group-hover:text-blue-400"></i>
                </a>
              ))}
              {data.sources.length === 0 && <p className="text-slate-500 text-sm">No external sources cited yet.</p>}
            </div>
          </section>
        </div>

        <div className="p-6 md:p-8 border-t border-slate-800 bg-slate-800/20 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-tighter">
            Disclaimer: Signals are AI-synthesized from web data. This is not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
