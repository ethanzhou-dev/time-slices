import type { WikiArticle } from '../services/wikipediaApi';

interface InfoPanelProps {
  article: WikiArticle | null;
  searchStatus: 'idle' | 'loading' | 'success' | 'empty';
}

export default function InfoPanel({ article, searchStatus }: InfoPanelProps) {
  if (searchStatus === 'loading') {
    return (
      <div className="absolute left-6 top-24 bottom-24 w-80 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl flex items-center justify-center pointer-events-auto z-10">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">正在扫描历史档案...</p>
        </div>
      </div>
    );
  }

  if (searchStatus === 'empty') {
    return (
      <div className="absolute left-6 top-24 bottom-24 w-80 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center pointer-events-auto z-10 transition-all duration-500">
        <h3 className="text-xl font-bold text-white mb-2">未找到记录</h3>
        <p className="text-zinc-400 text-sm text-center leading-relaxed">
          我们在该地点方圆 10 公里内未找到重大历史记录。请尝试点击靠近已知历史名城或地标的位置。
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="absolute left-6 top-24 bottom-24 w-80 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 shadow-2xl flex flex-col justify-center pointer-events-auto z-10 transition-all duration-500">
        <h3 className="text-xl font-bold text-white mb-2">探索世界</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          点击地球上的任意位置，发现附近的历史事件、古代遗址和重要地点。拖动时间轴可按时代筛选。
        </p>
      </div>
    );
  }

  return (
    <div className="absolute left-6 top-24 bottom-24 w-80 lg:w-96 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto z-10 transform transition-all duration-500">
      {article.thumbnail && (
        <div className="relative w-full h-48 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent z-10"></div>
          <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wider">
            {article.yearHint ? (article.yearHint < 0 ? `约公元前${Math.abs(article.yearHint)}年` : `约${article.yearHint}年`) : '历史遗迹'}
          </span>
          <span className="text-xs font-mono text-zinc-500">
            距离 {(article.distance / 1000).toFixed(1)} km
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
          {article.title}
        </h2>
        
        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
          {article.extract}
        </p>

        <a 
          href={`https://zh.wikipedia.org/?curid=${article.pageid}`} 
          target="_blank" 
          rel="noreferrer"
          className="inline-block mt-6 text-amber-400 text-sm hover:text-amber-300 hover:underline transition-colors"
        >
          在维基百科上阅读全文 &rarr;
        </a>
      </div>
    </div>
  );
}
