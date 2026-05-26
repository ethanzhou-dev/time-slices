import { useEffect, useRef, memo } from 'react';
import { Box, Stack, IconButton, Icon, Fade, Paper, Typography } from '@mui/material';

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

const TimelineControls = memo(function TimelineControls({ nodes, activeIndex, onNodeChange }: TimelineControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll active item into view (skip when no selection)
    if (containerRef.current && activeIndex >= 0) {
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
    if (activeIndex < nodes.length - 1) onNodeChange(activeIndex < 0 ? 0 : activeIndex + 1);
  };

  return (
    <Fade in={true} timeout={300}>
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          right: 24,
          top: 96,
          bottom: 96,
          width: 112,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          zIndex: 10,
          borderRadius: 7, // matches md-sys-shape-corner-extra-large
        }}
      >
        <IconButton 
          onClick={handlePrev} 
          disabled={activeIndex <= 0}
          sx={{ mb: 1, flexShrink: 0 }}
        >
          <Icon>keyboard_arrow_up</Icon>
        </IconButton>

        <Box 
          sx={{ 
            flexGrow: 1, 
            width: '100%', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            overflowY: 'auto', 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {/* Nodes */}
          <Stack ref={containerRef} spacing={3} sx={{ width: '100%', position: 'relative', zIndex: 10, py: 2 }}>
            {/* Vertical Track Line */}
            <Box sx={{ position: 'absolute', right: 20, top: 16, bottom: 16, width: 4, transform: 'translateX(50%)', bgcolor: 'divider', borderRadius: 2, zIndex: -1 }} />
            
            {nodes.map((node, index) => {
              const isActive = index === activeIndex;
              return (
                <Box
                  key={node.id}
                  component="button"
                  onClick={() => onNodeChange(index)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: '20px',
                    cursor: 'pointer',
                    bgcolor: 'transparent',
                    border: 'none',
                    flexShrink: 0,
                    '&:hover .timeline-dot': {
                      borderColor: 'text.primary',
                    },
                    '&:hover .timeline-label': {
                      color: 'text.primary',
                    }
                  }}
                >
                  <Typography
                    className="timeline-label"
                    sx={{
                      fontSize: '0.75rem',
                      mr: 2,
                      transition: 'color 0.3s',
                      whiteSpace: 'nowrap',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 'bold' : 'normal',
                    }}
                  >
                    {node.label}
                  </Typography>
                  <Box 
                    className="timeline-dot"
                    sx={{
                      position: 'absolute',
                      right: 20,
                      transform: 'translateX(50%)',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: '2px solid',
                      transition: 'all 0.3s',
                      ...(isActive ? {
                        bgcolor: 'primary.main',
                        borderColor: 'primary.main',
                        transform: 'translateX(50%) scale(1.1)',
                        boxShadow: '0 0 8px rgba(208,188,255,0.5)',
                      } : {
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                      })
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>

        <IconButton 
          onClick={handleNext} 
          disabled={activeIndex === nodes.length - 1}
          sx={{ mt: 1, flexShrink: 0 }}
        >
          <Icon>keyboard_arrow_down</Icon>
        </IconButton>
      </Paper>
    </Fade>
  );
});

export default TimelineControls;
