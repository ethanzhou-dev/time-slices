import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Avatar } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import EarthMap from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import type { TimelineNode } from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { fetchNearbyHistoricalArticles } from './services/wikipediaApi';
import type { WikiArticle, SearchStatus } from './services/wikipediaApi';

// Create a dark MD3 theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b', // Amber 500
    },
    background: {
      default: '#000000',
      paper: '#09090b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI overlay
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    }
  }
});

export default function App() {
  // Wikipedia integration states
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

  // Generate dynamic timeline nodes based on fetched articles that have years
  const timelineNodes = useMemo<TimelineNode[]>(() => {
    if (articles.length === 0) return [];
    
    return articles
      .filter(a => a.yearHint !== undefined)
      .map((a, idx) => ({
        id: idx,
        articleId: a.pageid,
        label: a.yearHint! < 0 ? `公元前${Math.abs(a.yearHint!)}年` : `${a.yearHint}年`,
      }));
  }, [articles]);

  const activeTimelineIndex = useMemo(() => {
    if (timelineNodes.length === 0 || !selectedArticleId) return 0;
    const index = timelineNodes.findIndex(n => n.articleId === selectedArticleId);
    return index !== -1 ? index : 0;
  }, [timelineNodes, selectedArticleId]);

  // Handle clicking on the globe
  const handleGlobeClick = async (lat: number, lng: number) => {
    setSearchStatus('loading');
    setArticles([]);
    setSelectedArticleId(null);
    
    // Fetch articles within a 10km radius from zh.wikipedia
    const result = await fetchNearbyHistoricalArticles(lat, lng, 10000);
    
    if (result.status === 'success' && result.data.length > 0) {
      setArticles(result.data);
      // Auto-select the first article (which is the oldest if it has a year)
      setSelectedArticleId(result.data[0].pageid);
      setSearchStatus('success');
    } else {
      setSearchStatus(result.status);
    }
  };

  const handleTimelineChange = (index: number) => {
    if (timelineNodes[index]) {
      setSelectedArticleId(timelineNodes[index].articleId);
    }
  };

  const selectedArticle = articles.find(a => a.pageid === selectedArticleId) || null;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        <EarthMap 
          articles={articles}
          onGlobeClick={handleGlobeClick}
          selectedArticleId={selectedArticleId}
          onArticleClick={setSelectedArticleId}
          onMouseMove={(x, y) => setMousePos({ x, y })}
        />

        {/* Mouse Radar Cursor */}
        {mousePos && (
          <Box sx={{
            position: 'absolute',
            left: mousePos.x,
            top: mousePos.y,
            width: 120, // 视觉上较大的圆圈
            height: 120,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            pointerEvents: 'none',
            zIndex: 5, // 低于 UI 层，高于地图层
            transition: 'opacity 0.2s',
            opacity: searchStatus === 'loading' ? 0 : 1, // 扫描时隐藏雷达圈
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 4,
              height: 4,
              backgroundColor: 'rgba(245, 158, 11, 0.8)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)'
            }
          }} />
        )}

        {/* Header Overlay */}
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', p: 3, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pointerEvents: 'auto' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, boxShadow: '0 0 15px rgba(245,158,11,0.5)' }}>
              <PublicIcon sx={{ color: 'black' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: 'white' }}>
                Terra<Box component="span" sx={{ color: 'primary.main' }}>Chronos</Box>
              </Typography>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold', letterSpacing: 3, lineHeight: 1.5 }}>
                互动历史
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Left Info Panel */}
        <InfoPanel 
          article={selectedArticle}
          searchStatus={searchStatus}
        />

        {/* Right Timeline Controls */}
        {timelineNodes.length > 0 && (
          <TimelineControls 
            nodes={timelineNodes}
            activeIndex={activeTimelineIndex}
            onNodeChange={handleTimelineChange}
          />
        )}

        {/* Instructions Banner */}
        {searchStatus === 'idle' && (
          <Box sx={{ 
            position: 'absolute', top: 96, left: '50%', transform: 'translateX(-50%)',
            px: 3, py: 1.5, bgcolor: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8,
            pointerEvents: 'none', zIndex: 10,
            animation: 'pulse 2s infinite'
          }}>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>
              👆 点击地球上的任意位置探索当地历史
            </Typography>
            <style>
              {`
                @keyframes pulse {
                  0% { opacity: 0.7; }
                  50% { opacity: 1; }
                  100% { opacity: 0.7; }
                }
              `}
            </style>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
