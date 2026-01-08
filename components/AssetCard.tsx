
import React from 'react';
import { AssetSignal, SignalType } from '../types.ts';

interface AssetCardProps {
  asset: { symbol: string; name: string };
  data: AssetSignal | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelect: (data: AssetSignal) => void;
}

const getSignalStyles = (signal: SignalType) => {
  switch (signal) {
    case SignalType.STRONG_BUY: 
      return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40 animate-glow-green scale-105';
    case SignalType.BUY: 
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case SignalType.NEUTRAL: 
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    case SignalType.SELL: 
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case SignalType.STRONG_SELL: 
      return 'text-rose-400 bg-rose-500/20 border-rose-500/40 animate-glow-red scale-105';
    default: 
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};

const AssetCard: React.FC<AssetCardProps> = ({ asset, data, loading, onSelect }) => {
  return (
    <div 
      className={`bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col h-full hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 relative overflow-hidden ${loading ? 'pointer-events-none' : ''}`}
      onClick={() => data && onSelect(data)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">
            {asset.symbol}
          </h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{asset.name.split(' / ')[0]}</p>
        </div>
        {loading && <i className="fas fa-circle-notch animate-spin text-blue-500 text-lg"></i>}
      </div>

      <div className="flex-1 flex flex-col justify-center py-2">
        {data ? (
          <div className="animate-slide-up">
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-black tracking-widest border transition-all duration-500 ${getSignalStyles(data.signal)} mb-4 shadow-sm`}>
              {data.signal}
            </div>
            <div className="text-white font-black text-2xl mb-2 flex items-baseline gap-2">
              <span className="text-slate-500 text-sm font-medium">PRICE</span>
              {data.lastPrice !== "Live Web Data" ? data.lastPrice : 'N/A'}
            </div>
            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
              {data.justification}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-full"></div>
            <div className="h-4 w-full bg-slate-800 animate-pulse rounded-lg"></div>
            <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded-lg"></div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-800/40 flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Monthly Outlook</span>
        </div>
        <span className="text-[10px] text-slate-600 font-mono font-bold tracking-tighter italic">
          {data?.lastUpdated ? data.lastUpdated.split(', ')[1] : '--:--'}
        </span>
      </div>
    </div>
  );
};

export default AssetCard;
