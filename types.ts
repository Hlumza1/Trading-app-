
export enum SignalType {
  STRONG_BUY = 'STRONG BUY',
  BUY = 'BUY',
  NEUTRAL = 'NEUTRAL',
  SELL = 'SELL',
  STRONG_SELL = 'STRONG SELL'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AssetSignal {
  symbol: string;
  name: string;
  signal: SignalType;
  lastPrice: string;
  technicalSummary: string;
  fundamentalSummary: string;
  justification: string;
  lastUpdated: string;
  sources: GroundingSource[];
}

export type AssetSymbol = 'XAUUSD' | 'EURUSD' | 'GBPUSD' | 'GBPEUR';

export interface AppState {
  signals: Record<AssetSymbol, AssetSignal | null>;
  isLoading: boolean;
  lastUpdated: string | null;
  error: string | null;
}

export interface BatchSignalResponse {
  signals: AssetSignal[];
}
