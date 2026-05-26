import { useEffect, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

import '@material/web/fab/fab.js';
import '@material/web/elevation/elevation.js';
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
  const markerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // 性能优化：预计算缓存，避免每帧分配新对象
  const cachedPositionsRef = useRef<Map<number, { cartesian: Cesium.Cartesian3; normal: Cesium.Cartesian3 }>>(new Map());
  const scratchCartesian = useRef(new Cesium.Cartesian3());
  // 性能优化：用 ref 持有最新的回调，使 Cesium 事件处理器无需重建
  const onArticleClickRef = useRef(onArticleClick);
  onArticleClickRef.current = onArticleClick;
  const onHeadingChangeRef = useRef(onHeadingChange);
  onHeadingChangeRef.current = onHeadingChange;
  const lastHeadingRef = useRef(-1);

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

      // Handle Map Clicks
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          if (pickedObject.id.name) {
            const pageId = parseInt(pickedObject.id.name);
            if (!isNaN(pageId)) {
              onArticleClickRef.current(pageId);
              return;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;

      // 监听相机方向变化，通知父组件更新指南针
      // 使用 preRender 以便在 flyTo 动画期间也能平滑更新
      const reportHeading = () => {
        const headingDeg = Cesium.Math.toDegrees(viewer.camera.heading);
        // 只在变化超过 0.5 度时才更新，避免不必要的 setState
        if (Math.abs(headingDeg - lastHeadingRef.current) > 0.5) {
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
  }, []);

  // 性能优化：articles 变化时一次性预计算所有 Cartesian3 坐标和地表法线，缓存到 Map 中
  // 避免在每帧的 preRender 回调中反复 new Cesium.Cartesian3()，消除 GC 压力
  useEffect(() => {
    const cache = new Map<number, { cartesian: Cesium.Cartesian3; normal: Cesium.Cartesian3 }>();
    articles.forEach(a => {
      const cartesian = Cesium.Cartesian3.fromDegrees(a.lon, a.lat);
      const normal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(cartesian, new Cesium.Cartesian3());
      cache.set(a.pageid, { cartesian, normal });
    });
    cachedPositionsRef.current = cache;
  }, [articles]);

  // 动态更新 HTML 标记点位置
  useEffect(() => {
    if (!viewerRef.current || articles.length === 0) return;
    const viewer = viewerRef.current;

    // 清除旧的实体
    viewer.entities.removeAll();

    const updatePositions = () => {
      const cache = cachedPositionsRef.current;
      const scratch = scratchCartesian.current;

      articles.forEach(a => {
        const el = markerRefs.current[a.pageid];
        if (!el) return;

        const cached = cache.get(a.pageid);
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
  }, [articles]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden relative">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* HTML Markers Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {articles.map(a => {
          const isSelected = selectedArticleId === a.pageid;
          
          return (
            <div 
              key={a.pageid}
              ref={(el: HTMLDivElement | null) => { markerRefs.current[a.pageid] = el; }}
              className={`absolute top-0 left-0 transition-opacity duration-150 opacity-0 pointer-events-none group ${isSelected ? 'z-50' : 'z-10'}`}
            >
              {/* Marker Icon 容器（原点对齐到底部中心） */}
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onArticleClick(a.pageid);
                }}
              >
                <div className={`relative transition-all duration-300 flex items-center justify-center ${isSelected ? 'scale-110' : 'scale-75 origin-bottom opacity-90 hover:scale-90 hover:opacity-100'}`}>
                  {isSelected ? (
                    <md-fab size="small" variant="primary" class="pointer-events-none">
                      <md-icon slot="icon">location_on</md-icon>
                    </md-fab>
                  ) : (
                    <md-fab size="small" variant="secondary" class="pointer-events-none">
                      <md-icon slot="icon">location_on</md-icon>
                    </md-fab>
                  )}
                  {/* 底部三角形指示器 (选中的才有) */}
                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[var(--md-sys-color-primary)]"></div>
                  )}
                </div>
              </div>
              
              {/* Label 容器（原点对齐到顶部中心，保持显示） */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-1.5 cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onArticleClick(a.pageid);
                }}
              >
                <div className={`transition-all duration-300 relative overflow-hidden whitespace-nowrap ${
                  isSelected 
                    ? 'px-3 py-1.5 rounded-lg text-sm font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-lg scale-100' 
                    : 'px-2 py-1 rounded-md text-xs font-medium bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] shadow-sm border border-[var(--md-sys-color-outline-variant)] scale-95 opacity-80 hover:opacity-100 hover:scale-100'
                }`}>
                  <md-elevation level={isSelected ? 3 : 1}></md-elevation>
                  {a.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}));

EarthMap.displayName = 'EarthMap';

export default EarthMap;
