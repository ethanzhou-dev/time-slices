import { useState } from 'react';
import type { WikiArticle, SearchStatus } from '../services/wikipediaApi';

import '@material/web/progress/circular-progress.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/icon/icon.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';

interface InfoPanelProps {
  article: WikiArticle | null;
  articles?: WikiArticle[];
  onArticleClick?: (id: number) => void;
  searchStatus: SearchStatus;
}

export default function InfoPanel({ article, articles = [], onArticleClick, searchStatus }: InfoPanelProps) {
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const baseCardClasses = "absolute left-6 top-24 bottom-24 w-80 bg-surface-container-low border border-outline-variant rounded-3xl overflow-hidden shadow-none";

  if (searchStatus === 'loading') {
    return (
      <div className={`${baseCardClasses} flex items-center justify-center animate-in fade-in duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <md-circular-progress indeterminate></md-circular-progress>
          <span className="text-sm text-on-surface-variant">正在扫描历史档案...</span>
        </div>
      </div>
    );
  }

  if (searchStatus === 'empty') {
    return (
      <div className={`${baseCardClasses} flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300`}>
        <md-icon style={{ fontSize: 48, color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 16, width: 48, height: 48 }}>search_off</md-icon>
        <h6 className="text-xl font-bold mb-2">未找到记录</h6>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          我们在该地点方圆 10 公里内未找到重大历史记录。请尝试点击靠近已知历史名城或地标的位置。
        </p>
      </div>
    );
  }

  if (searchStatus === 'too_large') {
    return (
      <div className={`${baseCardClasses} flex flex-col items-center justify-center p-6 text-center border-error animate-in fade-in duration-300`}>
        <md-icon style={{ fontSize: 48, color: 'var(--md-sys-color-primary)', marginBottom: 16, width: 48, height: 48 }}>search_off</md-icon>
        <h6 className="text-xl font-bold mb-2 text-primary">视野过大</h6>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          当前屏幕显示的物理范围超过了 10 公里，维基百科接口限制无法一次性扫描如此广阔的区域。请放大地图（滚动鼠标滚轮）至具体城市或街区后，再次点击扫描。
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className={`${baseCardClasses} flex flex-col justify-center p-8 animate-in fade-in duration-300`}>
        <md-icon style={{ fontSize: 40, color: 'var(--md-sys-color-primary)', marginBottom: 16, width: 40, height: 40 }}>travel_explore</md-icon>
        <h5 className="text-2xl font-bold mb-2">探索世界</h5>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          移动和缩放地图，找到你感兴趣的区域，然后点击底部的“扫描当前屏幕区域”按钮，即可发现该区域的历史事件。
        </p>
      </div>
    );
  }

  return (
    <div className={`${baseCardClasses} flex flex-col animate-in fade-in duration-300`}>
      {article.thumbnail && (
        <div className="relative w-full h-48 shrink-0">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-low" />
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto p-0 flex flex-col">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            <md-assist-chip 
              label={article.yearHint ? (article.yearHint < 0 ? `约公元前${Math.abs(article.yearHint)}年` : `约${article.yearHint}年`) : '历史遗迹'} 
            />
            <span className="text-xs font-mono text-on-surface-variant">
              距离 {(article.distance / 1000).toFixed(1)} km
            </span>
          </div>
          
          <h5 className="text-2xl font-bold mb-2 text-on-surface">
            {article.title}
          </h5>
          
          <p className="text-sm leading-relaxed mb-6 text-on-surface-variant">
            {article.extract}
          </p>

          <md-filled-button 
            onClick={() => window.open(`https://zh.wikipedia.org/?curid=${article.pageid}`, '_blank')}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            <md-icon slot="icon">auto_stories</md-icon>
            在维基百科上阅读全文
          </md-filled-button>
        </div>

        {articles.length > 0 && (
          <div className="mt-auto border-t border-outline-variant">
            <button 
              className="w-full flex items-center justify-between p-4 bg-transparent border-none cursor-pointer hover:bg-surface-variant/30 transition-colors"
              onClick={() => setDirectoryOpen(!directoryOpen)}
            >
              <div className="flex items-center gap-2 text-on-surface">
                <md-icon>format_list_bulleted</md-icon>
                <span className="font-bold text-sm">扫描结果目录 ({articles.length})</span>
              </div>
              <md-icon className="text-on-surface-variant transition-transform duration-300" style={{ transform: directoryOpen ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </md-icon>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out bg-surface-container-lowest`}
              style={{ maxHeight: directoryOpen ? '300px' : '0' }}
            >
              <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                <md-list>
                  {articles.map((a) => (
                    <md-list-item 
                      key={a.pageid}
                      type="button"
                      onClick={() => {
                        if (onArticleClick) onArticleClick(a.pageid);
                      }}
                      className={a.pageid === article.pageid ? 'bg-primary/10' : ''}
                    >
                      <div slot="headline" className={a.pageid === article.pageid ? 'text-primary font-bold' : ''}>
                        {a.title}
                      </div>
                      <div slot="supporting-text" className="text-xs">
                        {a.yearHint ? (a.yearHint < 0 ? `公元前${Math.abs(a.yearHint)}年` : `${a.yearHint}年`) : '未知年份'} · {(a.distance / 1000).toFixed(1)}km
                      </div>
                      <md-icon slot="end" style={{ opacity: a.pageid === article.pageid ? 1 : 0, color: 'var(--md-sys-color-primary)' }}>
                        check
                      </md-icon>
                    </md-list-item>
                  ))}
                </md-list>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
