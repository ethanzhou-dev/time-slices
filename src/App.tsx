import { useState } from 'react';
import EarthMap from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import { historicalEras } from './data/historicalData';
import { Globe2 } from 'lucide-react';

export default function App() {
  const [activeEraIndex, setActiveEraIndex] = useState(0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-amber-500/30">
      
      {/* Background Map - Now 100% Free & Tokenless using Globe.gl */}
      <EarthMap 
        activeEra={historicalEras[activeEraIndex]} 
      />

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-center justify-between z-10 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="p-2 bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Globe2 className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">
              Terra<span className="text-amber-400">Chronos</span>
            </h1>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-[0.2em] mt-1">
              Historical Earth Viewer
            </p>
          </div>
        </div>
      </header>

      {/* Timeline Controls */}
      <TimelineControls 
        eras={historicalEras}
        activeEraIndex={activeEraIndex}
        onEraChange={setActiveEraIndex}
      />
    </div>
  );
}
