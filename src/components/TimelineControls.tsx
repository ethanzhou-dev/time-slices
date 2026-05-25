import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';

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
  if (nodes.length === 0) return null;

  const handlePrev = () => {
    if (activeIndex > 0) onNodeChange(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < nodes.length - 1) onNodeChange(activeIndex + 1);
  };

  return (
    <div className="absolute right-6 top-24 bottom-24 w-24 bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-3xl flex flex-col items-center py-4 z-10 shadow-none animate-in fade-in duration-300">
      <md-icon-button 
        onClick={handlePrev} 
        disabled={activeIndex === 0 || undefined}
        className="mb-4"
      >
        <md-icon>keyboard_arrow_up</md-icon>
      </md-icon-button>

      <div className="flex-1 w-full relative flex flex-col items-center justify-between py-4">
        {/* Vertical Track Line */}
        <div className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-[var(--md-sys-color-surface-variant)] rounded-full"></div>
        
        {/* Nodes */}
        {nodes.map((node, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={node.id}
              onClick={() => onNodeChange(index)}
              className="relative w-full flex items-center justify-end px-2 group cursor-pointer bg-transparent border-none"
            >
              <span 
                className={`
                  text-xs mr-4 transition-colors duration-300 whitespace-nowrap
                  ${isActive ? 'text-[var(--md-sys-color-primary)] font-bold' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]'}
                `}
              >
                {node.label}
              </span>
              <div 
                className={`
                  absolute right-1/2 translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 z-10
                  ${isActive ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] scale-110 shadow-[0_0_8px_var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-surface-container-low)] border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-on-surface)]'}
                `}
              />
            </button>
          );
        })}
      </div>

      <md-icon-button 
        onClick={handleNext} 
        disabled={activeIndex === nodes.length - 1 || undefined}
        className="mt-4"
      >
        <md-icon>keyboard_arrow_down</md-icon>
      </md-icon-button>
    </div>
  );
}
