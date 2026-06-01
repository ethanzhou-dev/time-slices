import { useState, memo } from 'react';
import type { WikiArticle, SearchStatus } from '../services/wikipediaApi';
import { Box, Paper, CircularProgress, Typography, Chip, Button, List, ListItemButton, ListItemText, ListItemIcon, Collapse, Fade } from '@mui/material';
import { FormatListBulletedIcon, ExpandMoreIcon, CheckIcon, SearchOffIcon, TravelExploreIcon, AutoStoriesIcon } from './Icons';

interface InfoPanelProps {
  article: WikiArticle | null;
  articles?: WikiArticle[];
  onArticleClick?: (id: number) => void;
  searchStatus: SearchStatus;
}

const InfoPanel = memo(function InfoPanel({ article, articles = [], onArticleClick, searchStatus }: InfoPanelProps) {
  const [directoryOpen, setDirectoryOpen] = useState(false);
  
  const isDirectoryVisible = articles.length > 0 && !['loading', 'empty', 'too_large'].includes(searchStatus);
  
  const paperSx = {
    position: 'absolute',
    left: 24,
    width: 320,
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
    zIndex: 10,
    borderRadius: '28px', // equivalent to md-sys-shape-corner-extra-large
  };

  const renderDirectoryPanel = () => {
    if (!isDirectoryVisible) return null;
    return (
      <Fade in={true} timeout={300}>
        <Paper elevation={3} sx={{ ...paperSx, top: 96, zIndex: 20, display: 'flex', flexDirection: 'column' }}>
          <Button 
            fullWidth
            onClick={() => setDirectoryOpen(!directoryOpen)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 0,
              color: 'text.primary',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormatListBulletedIcon />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>扫描结果目录 ({articles.length})</Typography>
            </Box>
            <ExpandMoreIcon sx={{ color: 'text.secondary', transform: directoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </Button>
          
          <Collapse in={directoryOpen} timeout="auto" unmountOnExit>
            <Box sx={{ maxHeight: 400, overflowY: 'auto', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <List disablePadding>
                {articles.map((a) => {
                  const isSelected = a.pageid === article?.pageid;
                  return (
                    <ListItemButton 
                      key={a.pageid}
                      onClick={() => {
                        if (onArticleClick) onArticleClick(a.pageid);
                        setDirectoryOpen(false); // 选中后自动收起
                      }}
                      sx={{ bgcolor: isSelected ? 'action.selected' : 'transparent' }}
                    >
                      <ListItemText 
                        primary={<Typography sx={{ color: isSelected ? 'primary.main' : 'text.primary', fontWeight: isSelected ? 'bold' : 'normal' }}>{a.title}</Typography>}
                        secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>{`${a.yearHint ? (a.yearHint < 0 ? `公元前${Math.abs(a.yearHint)}年` : `${a.yearHint}年`) : '未知年份'} · ${Math.abs(a.lat).toFixed(2)}°${a.lat >= 0 ? 'N' : 'S'}, ${Math.abs(a.lon).toFixed(2)}°${a.lon >= 0 ? 'E' : 'W'}`}</Typography>}
                      />
                      {isSelected && (
                        <ListItemIcon sx={{ minWidth: 'auto', color: 'primary.main' }}>
                          <CheckIcon />
                        </ListItemIcon>
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          </Collapse>
        </Paper>
      </Fade>
    );
  };

  const renderContent = () => {
    const bottomPos = 96; // bottom-24
    const topPos = isDirectoryVisible ? 172 : 96;

    if (searchStatus === 'loading') {
      return (
        <Fade in={true} timeout={300}>
          <Paper sx={{ ...paperSx, bottom: bottomPos, top: topPos, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'top 0.3s' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">正在扫描历史档案...</Typography>
            </Box>
          </Paper>
        </Fade>
      );
    }

    if (searchStatus === 'empty') {
      return (
        <Fade in={true} timeout={300}>
          <Paper sx={{ ...paperSx, bottom: bottomPos, top: topPos, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center', transition: 'top 0.3s' }}>
            <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>未找到记录</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              我们在该地点方圆 10 公里内未找到重大历史记录。请尝试点击靠近已知历史名城或地标的位置。
            </Typography>
          </Paper>
        </Fade>
      );
    }

    if (searchStatus === 'too_large') {
      return (
        <Fade in={true} timeout={300}>
          <Paper sx={{ ...paperSx, bottom: bottomPos, top: topPos, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center', borderColor: 'error.main', transition: 'top 0.3s' }}>
            <SearchOffIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>视野过大</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              当前屏幕显示的物理范围超过了 10 公里，维基百科接口限制无法一次性扫描如此广阔的区域。请放大地图（滚动鼠标滚轮）至具体城市或街区后，再次点击扫描。
            </Typography>
          </Paper>
        </Fade>
      );
    }

    if (!article) {
      return (
        <Fade in={true} timeout={300}>
          <Paper sx={{ ...paperSx, bottom: bottomPos, top: topPos, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 4, transition: 'top 0.3s' }}>
            <TravelExploreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>探索世界</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              移动和缩放地图，找到你感兴趣的区域，然后点击底部的“扫描当前屏幕区域”按钮，即可发现该区域的历史事件。
            </Typography>
          </Paper>
        </Fade>
      );
    }

    return (
      <Fade in={true} timeout={300}>
        <Paper sx={{ ...paperSx, bottom: bottomPos, top: topPos, display: 'flex', flexDirection: 'column', transition: 'top 0.3s' }}>
          {article.thumbnail && (
            <Box sx={{ position: 'relative', width: '100%', height: 192, flexShrink: 0 }}>
              <Box component="img" src={article.thumbnail} alt={article.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #211F26)' }} />
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1, p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 3, pb: 1, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Chip 
                  label={article.yearHint ? (article.yearHint < 0 ? `约公元前${Math.abs(article.yearHint)}年` : `约${article.yearHint}年`) : '历史遗迹'} 
                  size="small"
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {Math.abs(article.lat).toFixed(2)}°{article.lat >= 0 ? 'N' : 'S'}, {Math.abs(article.lon).toFixed(2)}°{article.lon >= 0 ? 'E' : 'W'}
                </Typography>
              </Box>
              
              <Typography variant="h5" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                {article.title}
              </Typography>
            </Box>
              
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                {article.extract}
              </Typography>
            </Box>

            <Box sx={{ px: 3, pb: 3, pt: 1, flexShrink: 0 }}>
              <Button 
                variant="contained"
                fullWidth
                onClick={() => window.open(`https://zh.wikipedia.org/?curid=${article.pageid}`, '_blank')}
                startIcon={<AutoStoriesIcon />}
              >
                在维基百科上阅读全文
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    );
  };

  return (
    <>
      {renderDirectoryPanel()}
      {renderContent()}
    </>
  );
});

export default InfoPanel;
