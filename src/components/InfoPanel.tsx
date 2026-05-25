import { Card, CardContent, Typography, CircularProgress, Chip, Button, Box, Fade } from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import type { WikiArticle, SearchStatus } from '../services/wikipediaApi';

interface InfoPanelProps {
  article: WikiArticle | null;
  searchStatus: SearchStatus;
}

export default function InfoPanel({ article, searchStatus }: InfoPanelProps) {
  if (searchStatus === 'loading') {
    return (
      <Fade in={true}>
        <Card 
          sx={{ 
            position: 'absolute', left: 24, top: 96, bottom: 96, width: 320, 
            bgcolor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary">正在扫描历史档案...</Typography>
          </Box>
        </Card>
      </Fade>
    );
  }

  if (searchStatus === 'empty') {
    return (
      <Fade in={true}>
        <Card 
          sx={{ 
            position: 'absolute', left: 24, top: 96, bottom: 96, width: 320, 
            bgcolor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, p: 3, textAlign: 'center'
          }}
        >
          <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>未找到记录</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            我们在该地点方圆 10 公里内未找到重大历史记录。请尝试点击靠近已知历史名城或地标的位置。
          </Typography>
        </Card>
      </Fade>
    );
  }

  if (searchStatus === 'too_many') {
    return (
      <Fade in={true}>
        <Card 
          sx={{ 
            position: 'absolute', left: 24, top: 96, bottom: 96, width: 320, 
            bgcolor: 'rgba(9, 9, 11, 0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, p: 3, textAlign: 'center'
          }}
        >
          <SearchOffIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>信息过载</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            该区域（如市中心）历史遗迹过于密集。为保证体验流畅并防止信息爆炸，系统已熔断扫描。请尝试点击非市中心的具体边缘区域。
          </Typography>
        </Card>
      </Fade>
    );
  }

  if (!article) {
    return (
      <Fade in={true}>
        <Card 
          sx={{ 
            position: 'absolute', left: 24, top: 96, bottom: 96, width: 320, 
            bgcolor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderRadius: 4, p: 4
          }}
        >
          <TravelExploreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>探索世界</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            点击地球上的任意位置，发现附近的历史事件、古代遗址和重要地点。拖动时间轴可按时代筛选。
          </Typography>
        </Card>
      </Fade>
    );
  }

  return (
    <Fade in={true}>
      <Card 
        sx={{ 
          position: 'absolute', left: 24, top: 96, bottom: 96, width: 320, 
          bgcolor: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', flexDirection: 'column',
          borderRadius: 4, overflow: 'hidden'
        }}
      >
        {article.thumbnail && (
          <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
            <Box 
              component="img"
              src={article.thumbnail}
              alt={article.title}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(9, 9, 11, 1))' }} />
          </Box>
        )}
        
        <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Chip 
              label={article.yearHint ? (article.yearHint < 0 ? `约公元前${Math.abs(article.yearHint)}年` : `约${article.yearHint}年`) : '历史遗迹'} 
              color="primary" 
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              距离 {(article.distance / 1000).toFixed(1)} km
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {article.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
            {article.extract}
          </Typography>

          <Box sx={{ mt: 'auto' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AutoStoriesIcon />}
              href={`https://zh.wikipedia.org/?curid=${article.pageid}`}
              target="_blank"
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              在维基百科上阅读全文
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}
