import { useState, useMemo, useRef, useCallback } from 'react';
import EarthMap from './components/EarthMap';
import type { EarthMapRef } from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import type { TimelineNode } from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { fetchArticlesInBounds } from './services/wikipediaApi';
import type { WikiArticle, SearchStatus } from './services/wikipediaApi';

import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';

export default function App() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const earthMapRef = useRef<EarthMapRef>(null);

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

  // 性能优化：用 useCallback 稳定回调引用，避免子组件因引用变化而重渲染
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

  const handleTimelineChange = useCallback((index: number) => {
    // 通过函数式访问 timelineNodes，但 timelineNodes 是 useMemo 的，引用稳定
    if (timelineNodes[index]) {
      setSelectedArticleId(timelineNodes[index].articleId);
    }
  }, [timelineNodes]);

  const selectedArticle = useMemo(() => 
    articles.find(a => a.pageid === selectedArticleId) || null
  , [articles, selectedArticleId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      
      <EarthMap 
        ref={earthMapRef}
        articles={articles}
        selectedArticleId={selectedArticleId}
        onArticleClick={handleArticleClick}
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary shadow-[0_0_15px_rgba(208,188,255,0.5)]">
            <md-icon style={{ color: 'var(--md-sys-color-on-primary)' }}>public</md-icon>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white m-0">
              Terra<span className="text-primary">Chronos</span>
            </h1>
            <p className="text-outline font-bold tracking-widest text-xs uppercase m-0 mt-1">
              互动历史
            </p>
          </div>
        </div>
      </div>

      {/* Left Info Panel */}
      <InfoPanel 
        article={selectedArticle}
        articles={articles}
        onArticleClick={handleArticleClick}
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <md-fab 
          variant="primary"
          style={{ '--md-fab-label-text-tracking': '0.1px' } as any}
          label={searchStatus === 'loading' ? '正在扫描...' : '扫描当前屏幕区域'}
          onClick={handleScanViewport}
          disabled={searchStatus === 'loading' || undefined}
        >
          <md-icon slot="icon">search</md-icon>
        </md-fab>
      </div>

    </div>
  );
}
