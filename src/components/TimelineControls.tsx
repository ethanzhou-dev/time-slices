import { Box, Slider, Typography, Fade, Paper, IconButton } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

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

  const marks = nodes.map((node, index) => ({
    value: index,
    label: (
      <Typography 
        variant="caption" 
        sx={{ 
          color: index === activeIndex ? 'primary.main' : 'text.secondary',
          fontWeight: index === activeIndex ? 'bold' : 'normal',
          transition: 'color 0.3s',
          whiteSpace: 'nowrap',
          mr: 1
        }}
      >
        {node.label}
      </Typography>
    )
  }));

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    onNodeChange(newValue as number);
  };

  const handlePrev = () => {
    if (activeIndex > 0) onNodeChange(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < nodes.length - 1) onNodeChange(activeIndex + 1);
  };

  return (
    <Fade in={true}>
      <Paper 
        elevation={24}
        sx={{
          position: 'absolute', right: 24, top: 96, bottom: 96, width: 80,
          bgcolor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8, display: 'flex', flexDirection: 'column',
          alignItems: 'center', py: 2, zIndex: 10
        }}
      >
        <IconButton 
          onClick={handlePrev} 
          disabled={activeIndex === 0}
          color="primary"
          sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <KeyboardArrowUpIcon />
        </IconButton>

        <Box sx={{ flex: 1, my: 2 }}>
          <Slider
            orientation="vertical"
            value={activeIndex}
            min={0}
            max={nodes.length - 1}
            step={1}
            marks={marks}
            onChange={handleSliderChange}
            color="primary"
            sx={{
              '& .MuiSlider-markLabel': {
                left: '-16px', // Move labels to the left of the slider
                transform: 'translateX(-100%) translateY(50%)',
              },
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
              }
            }}
          />
        </Box>

        <IconButton 
          onClick={handleNext} 
          disabled={activeIndex === nodes.length - 1}
          color="primary"
          sx={{ mt: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Paper>
    </Fade>
  );
}
