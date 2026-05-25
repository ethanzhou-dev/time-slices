import { useState } from 'react';
import EarthMap from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import { historicalEras } from './data/historicalData';
import { Globe2 } from 'lucide-react';

export default function App() {
  const [activeEraIndex, setActiveEraIndex] = useState(0);

  // We recommend using a real Mapbox token in .env.local for production.
  // This is a common public Mapbox token often found in mapbox examples for testing, 
  // but it is highly recommended to replace it.
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-amber-500/30">
      
      {/* Background Map */}
      <EarthMap 
        activeEra={historicalEras[activeEraIndex]} 
        mapboxToken={mapboxToken} 
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

      {/* Optional: A warning if the mapbox token is missing from env */}
      {!import.meta.env.VITE_MAPBOX_TOKEN && (
        <div className="absolute top-6 right-6 z-20 pointer-events-auto bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-xs backdrop-blur-md max-w-xs">
          <strong>Note:</strong> Mapbox token missing in <code>.env.local</code>. Using a temporary fallback token. Please add your own token for stability.
        </div>
      )}
    </div>
  );
}
