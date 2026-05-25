import type { HistoricalEra } from '../data/historicalData';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TimelineControlsProps {
  eras: HistoricalEra[];
  activeEraIndex: number;
  onEraChange: (index: number) => void;
}

export default function TimelineControls({ eras, activeEraIndex, onEraChange }: TimelineControlsProps) {
  const handlePrev = () => {
    if (activeEraIndex > 0) onEraChange(activeEraIndex - 1);
  };

  const handleNext = () => {
    if (activeEraIndex < eras.length - 1) onEraChange(activeEraIndex + 1);
  };

  return (
    <div className="absolute right-6 top-24 bottom-24 w-16 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-full shadow-2xl flex flex-col items-center justify-between py-6 pointer-events-auto z-10">
      
      <button 
        onClick={handlePrev}
        disabled={activeEraIndex === 0}
        className="p-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronUp size={20} />
      </button>

      {/* Vertical Track */}
      <div className="flex-1 relative w-2 my-4 bg-zinc-800 rounded-full flex flex-col items-center">
        {/* Active progress bar */}
        <div 
          className="absolute top-0 w-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
          style={{ height: `${(activeEraIndex / (eras.length - 1)) * 100}%` }}
        />

        {/* Era Stops */}
        {eras.map((era, index) => (
          <div 
            key={era.id} 
            className="absolute transform -translate-y-1/2 flex items-center cursor-pointer group"
            style={{ top: `${(index / (eras.length - 1)) * 100}%` }}
            onClick={() => onEraChange(index)}
          >
            <div 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 absolute left-1/2 -translate-x-1/2
                ${index <= activeEraIndex ? 'bg-amber-500 border-black' : 'bg-zinc-700 border-zinc-900'}
                group-hover:scale-125
              `}
            />
            {/* Tooltip on hover */}
            <span className="absolute right-8 px-2 py-1 bg-zinc-900 text-amber-400 text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-800">
              {era.label}
            </span>
          </div>
        ))}
      </div>

      <button 
        onClick={handleNext}
        disabled={activeEraIndex === eras.length - 1}
        className="p-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}
