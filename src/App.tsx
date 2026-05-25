import { useState, useMemo } from 'react';
import EarthMap from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import type { TimelineNode } from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { Globe2 } from 'lucide-react';
import { fetchNearbyHistoricalArticles } from './services/wikipediaApi';
import type { WikiArticle } from './services/wikipediaApi';

export default function App() {
  // Wikipedia integration states
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'empty'>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

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
    const fetchedArticles = await fetchNearbyHistoricalArticles(lat, lng, 10000);
    setArticles(fetchedArticles);
    
    if (fetchedArticles.length > 0) {
      // Auto-select the first article (which is the oldest if it has a year)
      setSelectedArticleId(fetchedArticles[0].pageid);
      setSearchStatus('success');
    } else {
      setSearchStatus('empty');
    }
  };

  const handleTimelineChange = (index: number) => {
    if (timelineNodes[index]) {
      setSelectedArticleId(timelineNodes[index].articleId);
    }
  };

  const selectedArticle = articles.find(a => a.pageid === selectedArticleId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-amber-500/30">
      
      <EarthMap 
        articles={articles}
        onGlobeClick={handleGlobeClick}
        selectedArticleId={selectedArticleId}
        onArticleClick={setSelectedArticleId}
      />

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="p-2 bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Globe2 className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
              Terra<span className="text-amber-400">Chronos</span>
            </h1>
            <p className="text-zinc-400 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] mt-1">
              互动历史
            </p>
          </div>
        </div>
      </header>

      {/* Left Info Panel */}
      <InfoPanel 
        article={selectedArticle}
        searchStatus={searchStatus}
      />

      {/* Right Timeline Controls - Only show if we have local history nodes */}
      {timelineNodes.length > 0 && (
        <TimelineControls 
          nodes={timelineNodes}
          activeIndex={activeTimelineIndex}
          onNodeChange={handleTimelineChange}
        />
      )}

      {/* Instructions Banner */}
      {searchStatus === 'idle' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-full pointer-events-none z-10">
          <p className="text-zinc-300 text-sm font-medium animate-pulse">
            👆 点击地球上的任意位置探索当地历史
          </p>
        </div>
      )}
    </div>
  );
}
