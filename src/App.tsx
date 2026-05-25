import { useState, useMemo, useRef } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Avatar, Fab } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import EarthMap from './components/EarthMap';
import type { EarthMapRef } from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import type { TimelineNode } from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { fetchArticlesInBounds } from './services/wikipediaApi';
import type { WikiArticle, SearchStatus } from './services/wikipediaApi';
import { md3Theme } from './theme';

export default function App() {
  // Wikipedia integration states
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const earthMapRef = useRef<EarthMapRef>(null);

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

  const handleScanViewport = async () => {
    if (!earthMapRef.current) return;
    
    const bounds = earthMapRef.current.getViewportBounds();
    if (!bounds) {
      setSearchStatus('too_large');
      return;
    }

    setSearchStatus('loading');
    setArticles([]);
    setSelectedArticleId(null);
    
    // Fetch articles strictly within current bounds (max 100)
    const result = await fetchArticlesInBounds(bounds.north, bounds.west, bounds.south, bounds.east);
    
    if (result.status === 'success' && result.data.length > 0) {
      setArticles(result.data);
      // Auto-select the first article
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
    <ThemeProvider theme={md3Theme}>
      <CssBaseline />
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        
        <EarthMap 
          ref={earthMapRef}
          articles={articles}
          selectedArticleId={selectedArticleId}
          onArticleClick={setSelectedArticleId}
        />

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

        {/* Floating Scan Button */}
        <Box sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          <Fab
            variant="extended"
            color="primary"
            onClick={handleScanViewport}
            disabled={searchStatus === 'loading'}
            sx={{
              px: 4,
              py: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <SearchIcon sx={{ mr: 1 }} />
            {searchStatus === 'loading' ? '正在扫描...' : '扫描当前屏幕区域'}
          </Fab>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
