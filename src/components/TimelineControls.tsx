import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import { useEffect, useRef } from 'react';

export interface TimelineNode {
  id: number;
  label: string;
  articleId: number;
}

interface TimelineControlsProps {
  nodes: TimelineNode[];
  activeIndex: number;
  onNodeChange: (index: number) => void;
}

export default function TimelineControls({ nodes, activeIndex, onNodeChange }: TimelineControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll active item into view
    if (containerRef.current) {
      const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (nodes.length === 0) return null;

  const handlePrev = () => {
    if (activeIndex > 0) onNodeChange(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < nodes.length - 1) onNodeChange(activeIndex + 1);
  };

  return (
    <div 
      className="absolute right-6 top-24 bottom-24 w-28 bg-surface-container-low border border-outline-variant flex flex-col items-center py-4 z-10 animate-in fade-in duration-300"
      style={{ borderRadius: 'var(--md-sys-shape-corner-extra-large)' }}
    >
      <md-icon-button 
        onClick={handlePrev} 
        disabled={activeIndex === 0 || undefined}
        className="mb-2 shrink-0"
      >
        <md-icon>keyboard_arrow_up</md-icon>
      </md-icon-button>

      <div className="flex-1 w-full relative flex flex-col overflow-y-auto no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        
        {/* Nodes */}
        <div ref={containerRef} className="flex flex-col gap-6 w-full relative z-10 py-4">
          {/* Vertical Track Line */}
          <div className="absolute right-[20px] top-4 bottom-4 w-1 translate-x-1/2 bg-surface-variant rounded-full -z-10"></div>
          {nodes.map((node, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={node.id}
                onClick={() => onNodeChange(index)}
                className="relative w-full flex items-center justify-end pr-[20px] group cursor-pointer bg-transparent border-none shrink-0"
              >
                <span 
                  className={`
                    text-xs mr-4 transition-colors duration-300 whitespace-nowrap
                    ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-on-surface'}
                  `}
                >
                  {node.label}
                </span>
                <div 
                  className={`
                    absolute right-[20px] translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-primary border-primary scale-110 shadow-[0_0_8px_var(--md-sys-color-primary)]' : 'bg-surface-container-low border-outline group-hover:border-on-surface'}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>

      <md-icon-button 
        onClick={handleNext} 
        disabled={activeIndex === nodes.length - 1 || undefined}
        className="mt-2 shrink-0"
      >
        <md-icon>keyboard_arrow_down</md-icon>
      </md-icon-button>
    </div>
  );
}
