import type { HistoricalEra } from '../data/historicalData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineControlsProps {
  eras: HistoricalEra[];
  activeEraIndex: number;
  onEraChange: (index: number) => void;
}

export default function TimelineControls({ eras, activeEraIndex, onEraChange }: TimelineControlsProps) {
  const activeEra = eras[activeEraIndex];

  const handlePrev = () => {
    if (activeEraIndex > 0) onEraChange(activeEraIndex - 1);
  };

  const handleNext = () => {
    if (activeEraIndex < eras.length - 1) onEraChange(activeEraIndex + 1);
  };

  return (
    <div className="absolute bottom-0 inset-x-0 pb-8 pt-24 px-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none flex flex-col items-center justify-end z-10">
      
      {/* Info Panel */}
      <div className="w-full max-w-4xl pointer-events-auto bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl flex flex-col md:flex-row gap-6 items-start md:items-center transform transition-all duration-500">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-sm font-semibold tracking-wider">
              {activeEra.label}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {activeEra.title}
          </h2>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
            {activeEra.description}
          </p>
        </div>
      </div>

      {/* Timeline Navigation */}
      <div className="w-full max-w-4xl pointer-events-auto flex items-center gap-4">
        <button 
          onClick={handlePrev}
          disabled={activeEraIndex === 0}
          className="p-2 rounded-full bg-zinc-900/80 text-white border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Track */}
        <div className="flex-1 relative h-2 bg-zinc-800 rounded-full flex items-center">
          {/* Active progress bar */}
          <div 
            className="absolute left-0 h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${(activeEraIndex / (eras.length - 1)) * 100}%` }}
          />

          {/* Era Stops */}
          {eras.map((era, index) => (
            <div 
              key={era.id} 
              className="absolute transform -translate-x-1/2 flex flex-col items-center cursor-pointer group"
              style={{ left: `${(index / (eras.length - 1)) * 100}%` }}
              onClick={() => onEraChange(index)}
            >
              <div 
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 
                  ${index <= activeEraIndex ? 'bg-amber-500 border-black' : 'bg-zinc-700 border-zinc-900'}
                  group-hover:scale-125
                `}
              />
              <span className={`absolute top-6 text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300
                ${index === activeEraIndex ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}
              `}>
                {era.label}
              </span>
            </div>
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={activeEraIndex === eras.length - 1}
          className="p-2 rounded-full bg-zinc-900/80 text-white border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
}
