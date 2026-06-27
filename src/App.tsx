import { useState, useMemo, useRef, useCallback } from 'react';
import EarthMap from './components/EarthMap';
import type { EarthMapRef } from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import type { TimelineNode } from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { fetchArticlesInBounds } from './services/wikipediaApi';
import type { WikiArticle, SearchStatus } from './services/wikipediaApi';

import { Box, Stack, Fab, Typography } from '@mui/material';
import { PublicIcon, ExploreIcon, SearchIcon } from './components/Icons';

export default function App() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const earthMapRef = useRef<EarthMapRef>(null);
  const compassIconRef = useRef<SVGSVGElement>(null);
  const currentRotationRef = useRef(0);

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
    if (timelineNodes.length === 0 || !selectedArticleId) return -1;
    const index = timelineNodes.findIndex(n => n.articleId === selectedArticleId);
    return index;
  }, [timelineNodes, selectedArticleId]);

  const handleArticleClick = useCallback((id: number) => {
    setSelectedArticleId(id);
  }, []);

  const handleScanViewport = useCallback(async () => {
    if (!earthMapRef.current) return;
    
    const bounds = earthMapRef.current.getViewportBounds();
    if (!bounds) {
      setSearchStatus('too_large');
      return;
    }

    setSearchStatus('loading');
    setArticles([]);
    setSelectedArticleId(null);
    
    const result = await fetchArticlesInBounds(bounds.north, bounds.west, bounds.south, bounds.east);
    
    if (result.status === 'success' && result.data.length > 0) {
      setArticles(result.data);
      setSelectedArticleId(result.data[0].pageid);
      setSearchStatus('success');
    } else {
      setSearchStatus(result.status);
    }
  }, []);

  const handleHeadingChange = useCallback((headingDeg: number) => {
    if (!compassIconRef.current) return;
    
    let delta = headingDeg - (currentRotationRef.current % 360);
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    
    currentRotationRef.current += delta;
    
    const ICON_OFFSET = -45; 
    
    compassIconRef.current.style.transform = `rotate(${-currentRotationRef.current + ICON_OFFSET}deg)`;
  }, []);

  const handleResetNorth = useCallback(() => {
    earthMapRef.current?.resetToNorth();
  }, []);

  const handleTimelineChange = useCallback((index: number) => {
    if (timelineNodes[index]) {
      setSelectedArticleId(timelineNodes[index].articleId);
    }
  }, [timelineNodes]);

  const selectedArticle = useMemo(() => 
    articles.find(a => a.pageid === selectedArticleId) || null
  , [articles, selectedArticleId]);

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
      
      <EarthMap 
        ref={earthMapRef}
        articles={articles}
        selectedArticleId={selectedArticleId}
        onArticleClick={handleArticleClick}
        onHeadingChange={handleHeadingChange}
      />

      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', pointerEvents: 'auto', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: '0 0 15px rgba(208,188,255,0.5)' }}>
            <PublicIcon sx={{ color: 'primary.contrastText' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, color: 'white', m: 0 }}>
              Time<Box component="span" sx={{ color: 'primary.main' }}> Slices</Box>
            </Typography>
            <Typography variant="caption" sx={{ color: 'divider', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', mt: 0.5 }}>
              历史地图
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ pointerEvents: 'auto' }}>
          <Fab
            size="small"
            color="secondary"
            aria-label="指南针 - 点击回正朝北"
            onClick={handleResetNorth}
          >
            <ExploreIcon
              ref={compassIconRef}
              sx={{ transform: 'rotate(-45deg)' }}
            />
          </Fab>
        </Box>
      </Box>

      <InfoPanel 
        article={selectedArticle}
        articles={articles}
        onArticleClick={handleArticleClick}
        searchStatus={searchStatus}
      />

      {timelineNodes.length > 0 && (
        <TimelineControls 
          nodes={timelineNodes}
          activeIndex={activeTimelineIndex}
          onNodeChange={handleTimelineChange}
        />
      )}

      <Box sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <Fab 
          variant="extended"
          color="primary"
          onClick={handleScanViewport}
          disabled={searchStatus === 'loading'}
          sx={{ letterSpacing: '0.1px' }}
        >
          <SearchIcon sx={{ mr: 1 }} />
          {searchStatus === 'loading' ? '正在扫描...' : '扫描当前屏幕区域'}
        </Fab>
      </Box>

    </Box>
  );
}
