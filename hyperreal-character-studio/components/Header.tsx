import React from 'react';
import { Aperture, Rocket } from 'lucide-react';
import Button from './Button';

interface HeaderProps {
  onDeployClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDeployClick }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-900/50">
            <Aperture className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">HyperReal Studio</h1>
            <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">Imagen 3 Core / Medical Grade</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] text-zinc-500 font-mono uppercase">System Online</span>
           </div>
           
           <Button 
             variant="secondary" 
             onClick={onDeployClick}
             className="!py-1.5 !px-3 !text-xs gap-2 border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
             icon={<Rocket className="w-3 h-3" />}
           >
             Deploy
           </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;