import { useState, useEffect } from 'react';
import EarthMap from './components/EarthMap';
import TimelineControls from './components/TimelineControls';
import InfoPanel from './components/InfoPanel';
import { historicalEras } from './data/historicalData';
import { Globe2 } from 'lucide-react';
import { fetchNearbyHistoricalArticles } from './services/wikipediaApi';
import type { WikiArticle } from './services/wikipediaApi';

export default function App() {
  const [activeEraIndex, setActiveEraIndex] = useState(0);
  
  // Wikipedia integration states
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'empty'>('idle');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  // Handle clicking on the globe
  const handleGlobeClick = async (lat: number, lng: number) => {
    setSearchStatus('loading');
    setArticles([]);
    setSelectedArticleId(null);
    
    // Fetch articles within a 10km radius
    const fetchedArticles = await fetchNearbyHistoricalArticles(lat, lng, 10000);
    setArticles(fetchedArticles);
    
    if (fetchedArticles.length > 0) {
      // Auto-select the first article
      setSelectedArticleId(fetchedArticles[0].pageid);
      setSearchStatus('success');
    } else {
      setSearchStatus('empty');
    }
  };

  // Auto-select an article based on the timeline era if possible
  useEffect(() => {
    if (articles.length > 0) {
      const eraYear = historicalEras[activeEraIndex].year;
      
      // Try to find an article whose yearHint is closest to the eraYear
      let closestArticle = articles[0];
      let minDiff = Infinity;
      
      for (const article of articles) {
        if (article.yearHint) {
          const diff = Math.abs(article.yearHint - eraYear);
          if (diff < minDiff) {
            minDiff = diff;
            closestArticle = article;
          }
        }
      }
      
      setSelectedArticleId(closestArticle.pageid);
    }
  }, [activeEraIndex, articles]);

  const selectedArticle = articles.find(a => a.pageid === selectedArticleId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans selection:bg-amber-500/30">
      
      <EarthMap 
        activeEra={historicalEras[activeEraIndex]} 
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
              Interactive History
            </p>
          </div>
        </div>
      </header>

      {/* Left Info Panel */}
      <InfoPanel 
        article={selectedArticle}
        searchStatus={searchStatus}
      />

      {/* Right Timeline Controls */}
      <TimelineControls 
        eras={historicalEras}
        activeEraIndex={activeEraIndex}
        onEraChange={setActiveEraIndex}
      />

      {/* Instructions Banner */}
      {searchStatus === 'idle' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-full pointer-events-none z-10">
          <p className="text-zinc-300 text-sm font-medium animate-pulse">
            👆 Click anywhere on the globe to explore local history
          </p>
        </div>
      )}
    </div>
  );
}
