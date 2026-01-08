
import React from 'react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: 'fa-th-large', label: 'Home' },
    { id: 'alerts', icon: 'fa-bell', label: 'Alerts' },
    { id: 'settings', icon: 'fa-cog', label: 'Settings' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-slate-950 border-r border-slate-900 flex-col py-8 fixed left-0 top-0 z-50">
        <div className="px-8 mb-12 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">
              PULSE
            </h1>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">Markets</p>
          </div>
        </div>

        <nav className="w-full space-y-2 px-4">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900'
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6 text-center`}></i>
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-6 w-full">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-slate-500 mb-3 tracking-widest uppercase">Connectivity</p>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-black text-slate-200 tracking-tighter">NODE_ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 z-[100] px-6 pb-safe">
        <div className="flex justify-around items-center py-4">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                currentView === item.id ? 'text-blue-500 scale-110' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <i className={`fas ${item.icon} text-xl`}></i>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
