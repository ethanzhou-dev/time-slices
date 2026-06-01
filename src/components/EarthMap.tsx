import { useEffect, useRef, forwardRef, useImperativeHandle, memo, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import Supercluster from 'supercluster';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import { Fab, Paper, Box } from '@mui/material';
import { LocationOnIcon } from './Icons';
import type { WikiArticle } from '../services/wikipediaApi';

export interface EarthMapRef {
  getViewportBounds: () => { north: number, south: number, east: number, west: number } | null;
  resetToNorth: () => void;
}

interface EarthMapProps {
  articles: WikiArticle[];
  selectedArticleId: number | null;
  onArticleClick: (id: number) => void;
  onHeadingChange?: (headingDeg: number) => void;
}

const EarthMap = memo(forwardRef<EarthMapRef, EarthMapProps>(({ articles, selectedArticleId, onArticleClick, onHeadingChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const markerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // 性能优化：预计算缓存，避免每帧分配新对象
  const cachedPositionsRef = useRef<Map<string, { cartesian: Cesium.Cartesian3; normal: Cesium.Cartesian3 }>>(new Map());
  const scratchCartesian = useRef(new Cesium.Cartesian3());
  // 性能优化：用 ref 持有最新的回调，使 Cesium 事件处理器无需重建
  const onArticleClickRef = useRef(onArticleClick);
  onArticleClickRef.current = onArticleClick;
  const onHeadingChangeRef = useRef(onHeadingChange);
  onHeadingChangeRef.current = onHeadingChange;
  const lastHeadingRef = useRef(-1);

  const superclusterRef = useRef<Supercluster | null>(null);
  type MapCluster = {
    geometry: { coordinates: number[] };
    properties: Record<string, unknown> & {
      cluster?: boolean;
      cluster_id?: number;
      point_count?: number;
      pageid?: number;
      title?: string;
    };
  };
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const currentZoomRef = useRef(0);

  const updateClusters = useCallback(() => {
    const sc = superclusterRef.current;
    const viewer = viewerRef.current;
    if (!sc || !viewer) return;
    
    const height = viewer.camera.positionCartographic.height;
    // 修正的 Zoom 计算公式：Cesium 的高度和 Web Mercator Zoom 的换算
    // 之前算出的 zoom 偏小了 3 级，导致 supercluster 误以为处于极远的距离从而过度聚合
    let zoom = Math.floor(Math.log2(150000000 / height));
    zoom = Math.max(0, Math.min(zoom, 20));
    currentZoomRef.current = zoom;

    // Use a global bounding box for simplicity since max points is ~500
    const activeClusters = sc.getClusters([-180, -85, 180, 85], zoom);
    setClusters(activeClusters as MapCluster[]);
  }, []);


  useImperativeHandle(ref, () => ({
    getViewportBounds: () => {
      if (!viewerRef.current) return null;
      const viewer = viewerRef.current;
      const rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid, new Cesium.Rectangle());
      if (!rect) return null; // 无法计算包围盒（例如看到了地平线/太空）
      return {
        north: Cesium.Math.toDegrees(rect.north),
        south: Cesium.Math.toDegrees(rect.south),
        east: Cesium.Math.toDegrees(rect.east),
        west: Cesium.Math.toDegrees(rect.west)
      };
    },
    resetToNorth: () => {
      if (!viewerRef.current) return;
      const viewer = viewerRef.current;
      const camera = viewer.camera;
      // 平滑飞行回正北方向，保持当前位置和高度
      camera.flyTo({
        destination: camera.positionWC.clone(),
        orientation: {
          heading: 0, // 正北
          pitch: camera.pitch,
          roll: 0
        },
        duration: 0.5
      });
    }
  }));

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // 性能优化：按需渲染模式，仅在画面改变时重绘，大幅降低显卡和 CPU 占用
    const initViewer = () => {
      const viewer = new Cesium.Viewer(containerRef.current!, {
        animation: false,
        baseLayerPicker: false,
        baseLayer: false, // 我们将手动添加更高清且包含详细路网的图层
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: true,
        requestRenderMode: true, // 核心性能优化：不改变视角时不刷新画面
        maximumRenderTimeChange: Infinity
      });

      // 移除左下角 Logo 保持画面整洁
      viewer.cesiumWidget.creditContainer.setAttribute('style', 'display: none;');

      // 核心替换：使用 CartoDB Dark Matter 图层（深色极简风格，含极高精度 OSM 道路网和地名，完美解决 GCJ-02 偏移问题）
      const cartoDarkProvider = new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maximumLevel: 20
      });
      
      viewer.imageryLayers.addImageryProvider(cartoDarkProvider);

      // 设置默认视角为中国
      // 标准中心点通常取经度 105°E，纬度 35°N，高度约 20000 公里以总览全局
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(105.0, 35.0, 20000000.0)
      });

      // 禁用耗性能的视觉特效，保证地图流畅度
      viewer.scene.globe.enableLighting = false; 
      viewer.scene.globe.showWaterEffect = false;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.fog.enabled = false;
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
      if (viewer.scene.sun) viewer.scene.sun.show = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;

      // 性能优化：减少瓦片加载量（默认值为 2，提高到 4 减少约 50% 瓦片请求，视觉影响极小）
      viewer.scene.globe.maximumScreenSpaceError = 4;
      // 性能优化：高 DPI 屏幕自动降采样，Retina 屏渲染量降低约 44%
      if (window.devicePixelRatio > 1) {
        viewer.resolutionScale = 0.75;
      }
      // 性能优化：禁用 MSAA 抗锯齿（对 2D 地图瓦片收益极小，但 GPU 开销明显）
      viewer.scene.msaaSamples = 1;

      // 监听相机的移动来更新聚类
      viewer.camera.percentageChanged = 0.05; // 5%的视角变化就触发
      viewer.camera.changed.addEventListener(updateClusters);


      viewerRef.current = viewer;

      // 监听相机方向变化，通知父组件更新指南针
      // 使用 preRender 以便在 flyTo 动画期间也能平滑更新
      const reportHeading = () => {
        const headingDeg = Cesium.Math.toDegrees(viewer.camera.heading);
        // 直接上报，由父组件通过 DOM 操作实现每帧丝滑更新，无需节流
        if (headingDeg !== lastHeadingRef.current) {
          lastHeadingRef.current = headingDeg;
          onHeadingChangeRef.current?.(headingDeg);
        }
      };
      viewer.scene.preRender.addEventListener(reportHeading);
      // 初始报告一次
      reportHeading();
    };
    
    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [updateClusters]);

  // 当文章数据更新时，初始化 Supercluster
  useEffect(() => {
    const sc = new Supercluster({
      radius: 40, // 减小聚合半径，要求点靠得更近才合并
      maxZoom: 20,
    });
    
    const coordMap = new Map<string, number>();
    
    const points = articles.map(a => {
      // 取前5位小数（约等于 1.1 米精度）作为坐标指纹
      const key = `${a.lon.toFixed(5)},${a.lat.toFixed(5)}`;
      const count = coordMap.get(key) || 0;
      coordMap.set(key, count + 1);
      
      let lon = a.lon;
      let lat = a.lat;
      
      // 如果发现坐标完全一样（或者极近），以原始点为中心，做一个花瓣状/螺旋状散开微调
      if (count > 0) {
        const angle = count * (Math.PI * 2 / 8); // 每 8 个点绕一圈
        const radius = 0.00015 + Math.floor((count - 1) / 8) * 0.0001; // 约 15 米的半径，圈数越多半径越大
        lon += Math.cos(angle) * radius;
        lat += Math.sin(angle) * radius;
      }

      return {
        type: 'Feature' as const,
        properties: { ...a, isCluster: false },
        geometry: {
          type: 'Point' as const,
          coordinates: [lon, lat]
        }
      };
    });
    
    sc.load(points);
    superclusterRef.current = sc;
    updateClusters(); // 立即计算一次当前的 clusters
  }, [articles, updateClusters]);

  // 性能优化：clusters 变化时一次性预计算所有 Cartesian3 坐标和地表法线，缓存到 Map 中
  // 避免在每帧的 preRender 回调中反复 new Cesium.Cartesian3()，消除 GC 压力
  useEffect(() => {
    const cache = new Map<string, { cartesian: Cesium.Cartesian3; normal: Cesium.Cartesian3 }>();
    clusters.forEach(c => {
      const id = String(c.properties.cluster ? `cluster-${c.properties.cluster_id}` : c.properties.pageid);
      const lon = c.geometry.coordinates[0];
      const lat = c.geometry.coordinates[1];
      const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat);
      const normal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(cartesian, new Cesium.Cartesian3());
      cache.set(id, { cartesian, normal });
    });
    cachedPositionsRef.current = cache;
  }, [clusters]);

  // 动态更新 HTML 标记点位置
  useEffect(() => {
    if (!viewerRef.current || clusters.length === 0) return;
    const viewer = viewerRef.current;

    // 清除旧的实体
    viewer.entities.removeAll();

    const updatePositions = () => {
      const cache = cachedPositionsRef.current;
      const scratch = scratchCartesian.current;

      clusters.forEach(c => {
        const id = String(c.properties.cluster ? `cluster-${c.properties.cluster_id}` : c.properties.pageid);
        const el = markerRefs.current[id];
        if (!el) return;

        const cached = cache.get(id);
        if (!cached) return;

        // 检查点是否在地球背面（地平线剔除）
        // 复用 scratchCartesian 避免每帧分配新对象
        const toCamera = Cesium.Cartesian3.subtract(viewer.camera.positionWC, cached.cartesian, scratch);
        const isVisible = Cesium.Cartesian3.dot(cached.normal, toCamera) > 0;

        if (isVisible) {
          // 在较新的 Cesium 版本中，wgs84ToWindowCoordinates 已被重命名为 worldToWindowCoordinates
          const screenPosition = Cesium.SceneTransforms.worldToWindowCoordinates(viewer.scene, cached.cartesian);
          if (screenPosition) {
            // 核心性能优化：通过 translate3d 开启 GPU 硬件加速，并直接操作 DOM，避免 React 每帧渲染导致卡顿
            el.style.transform = `translate3d(${screenPosition.x}px, ${screenPosition.y}px, 0)`;
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
          } else {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
        } else {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
      });
    };

    // 监听渲染前事件，实时计算屏幕坐标
    viewer.scene.preRender.addEventListener(updatePositions);
    
    // 初始化时执行一次
    updatePositions();
    // 强制触发一次渲染以更新坐标
    viewer.scene.requestRender();

    return () => {
      viewer.scene.preRender.removeEventListener(updatePositions);
    };
  }, [clusters]);

  // 监听 selectedArticleId 变化，自动飞行到对应坐标
  useEffect(() => {
    if (!viewerRef.current || !superclusterRef.current || selectedArticleId === null) return;
    
    const targetArticle = articles.find(a => a.pageid === selectedArticleId);
    if (!targetArticle) return;

    const viewer = viewerRef.current;
    const sc = superclusterRef.current;
    
    const currentHeight = viewer.camera.positionCartographic.height;
    const currentZoom = currentZoomRef.current;
    
    // 寻找目标点正好分开为独立点的最小层级
    let targetZoom = currentZoom;
    let foundAsLeaf = false;
    
    for (; targetZoom <= 20; targetZoom++) {
      const clustersAtZ = sc.getClusters([-180, -85, 180, 85], targetZoom);
      if (clustersAtZ.some(c => !c.properties.cluster && c.properties.pageid === selectedArticleId)) {
        foundAsLeaf = true;
        break;
      }
    }
    
    if (!foundAsLeaf) {
      targetZoom = 20;
    }

    let targetHeight;
    if (targetZoom === currentZoom) {
      // 如果当前层级下已经是独立点，保持当前高度，或者如果太高的话稍微拉近一点以突出显示
      targetHeight = Math.min(currentHeight, 5000000); 
    } else {
      // 如果在当前层级是聚合的，计算需要放大的目标高度
      // 增加 0.5 缓冲，确保换算回 zoom 时必然触发解聚
      targetHeight = 150000000 / Math.pow(2, targetZoom + 0.5);
    }
    
    targetHeight = Math.max(targetHeight, 10);

    // 从坐标指纹中获取微调后的坐标（如果有重叠点）
    // 为了精准定位，我们可以在当前 targetZoom 下再查一次目标点的准确坐标
    const clustersAtTargetZ = sc.getClusters([-180, -85, 180, 85], targetZoom);
    const leaf = clustersAtTargetZ.find(c => !c.properties.cluster && c.properties.pageid === selectedArticleId);
    
    const lon = leaf ? leaf.geometry.coordinates[0] : targetArticle.lon;
    const lat = leaf ? leaf.geometry.coordinates[1] : targetArticle.lat;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, targetHeight),
      duration: 1.0, // 飞行时间
    });
    
  }, [selectedArticleId, articles]);

  return (
    <Box sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', bgcolor: 'black', overflow: 'hidden' }}>
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      
      {/* HTML Markers Overlay */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {clusters.map(c => {
          const isCluster = c.properties.cluster;
          const id = String(isCluster ? `cluster-${c.properties.cluster_id}` : c.properties.pageid);
          
          if (isCluster) {
            const pointCount = c.properties.point_count;
            return (
              <Box 
                key={id}
                ref={(el: HTMLDivElement | null) => { markerRefs.current[id] = el; }}
                sx={{ position: 'absolute', top: 0, left: 0, transition: 'opacity 0.15s', opacity: 0, pointerEvents: 'none', zIndex: 30, '&:hover .cluster-target': { transform: 'translate(-50%, -50%) scale(1.1)' } }}
              >
                <Box 
                  className="cluster-target"
                  sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', pointerEvents: 'auto', transition: 'transform 0.3s' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!viewerRef.current || !superclusterRef.current) return;
                    const expansionZoom = superclusterRef.current.getClusterExpansionZoom(c.properties.cluster_id as number);
                    const lon = c.geometry.coordinates[0];
                    const lat = c.geometry.coordinates[1];
                    // 增加 0.5 个层级的缓冲，确保计算出的 targetHeight 在换算回 zoom 时，
                    // 必定经过 Math.floor 后等于 expansionZoom，从而保证必定刚好分开。
                    let targetHeight = 150000000 / Math.pow(2, expansionZoom + 0.5);
                    
                    // 移除之前限制的 200，因为如果是 maxZoom (20)，高度大约是 143 米。
                    // 为了防止坐标完全相同导致的无限重合，设定极限最低高度 10 米。
                    targetHeight = Math.max(targetHeight, 10);

                    viewerRef.current.camera.flyTo({
                      destination: Cesium.Cartesian3.fromDegrees(lon, lat, targetHeight),
                      duration: 0.5,
                    });
                  }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      border: '2px solid',
                      borderColor: 'background.default',
                    }}
                  >
                    {pointCount}
                  </Paper>
                </Box>
              </Box>
            );
          }
          
          const a = c.properties;
          const isSelected = selectedArticleId === a.pageid;
          
          return (
            <Box 
              key={id}
              ref={(el: HTMLDivElement | null) => { markerRefs.current[id] = el; }}
              sx={{ position: 'absolute', top: 0, left: 0, transition: 'opacity 0.15s', opacity: 0, pointerEvents: 'none', zIndex: isSelected ? 50 : 10, '&:hover .marker-target': { opacity: 1, transform: 'scale(0.9)' } }}
            >
              {/* Marker Icon 容器（原点对齐到底部中心） */}
              <Box 
                sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onArticleClick(a.pageid as number);
                }}
              >
                <Box className={isSelected ? '' : 'marker-target'} sx={{ position: 'relative', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: 'bottom', transform: isSelected ? 'scale(1.1)' : 'scale(0.75)', opacity: isSelected ? 1 : 0.9 }}>
                  {isSelected ? (
                    <Fab size="small" color="primary" sx={{ pointerEvents: 'none', width: 40, height: 40, minHeight: 40 }}>
                      <LocationOnIcon />
                    </Fab>
                  ) : (
                    <Fab size="small" color="secondary" sx={{ pointerEvents: 'none', width: 40, height: 40, minHeight: 40 }}>
                      <LocationOnIcon />
                    </Fab>
                  )}
                  {/* 底部三角形指示器 (选中的才有) */}
                  {isSelected && (
                    <Box sx={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid', borderTopColor: 'primary.main' }} />
                  )}
                </Box>
              </Box>
              
              {/* Label 容器（原点对齐到顶部中心，保持显示） */}
              <Box 
                sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', mt: 0.75, cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onArticleClick(a.pageid as number);
                }}
              >
                <Paper
                  elevation={isSelected ? 4 : 1}
                  sx={{
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    px: isSelected ? 1.5 : 1,
                    py: isSelected ? 0.75 : 0.5,
                    borderRadius: isSelected ? 2 : 1,
                    fontSize: isSelected ? '0.875rem' : '0.75rem',
                    fontWeight: isSelected ? 'bold' : 'medium',
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    color: isSelected ? 'primary.contrastText' : 'text.secondary',
                    transform: isSelected ? 'scale(1)' : 'scale(0.95)',
                    opacity: isSelected ? 1 : 0.8,
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1)',
                    }
                  }}
                >
                  {a.title}
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}));

EarthMap.displayName = 'EarthMap';

export default EarthMap;
