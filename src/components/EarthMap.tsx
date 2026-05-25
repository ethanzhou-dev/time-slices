import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import type { WikiArticle } from '../services/wikipediaApi';

interface EarthMapProps {
  articles: WikiArticle[];
  onGlobeClick: (lat: number, lng: number) => void;
  selectedArticleId: number | null;
  onArticleClick: (id: number) => void;
  onMouseMove?: (x: number, y: number) => void;
}

export default function EarthMap({ articles, onGlobeClick, selectedArticleId, onArticleClick, onMouseMove }: EarthMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

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

      // 禁用耗性能的视觉特效，保证地图流畅度
      viewer.scene.globe.enableLighting = false; 
      viewer.scene.globe.showWaterEffect = false;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.scene.fog.enabled = false;
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
      if (viewer.scene.sun) viewer.scene.sun.show = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;

      // Handle Map Clicks
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          if (pickedObject.id.name) {
            const pageId = parseInt(pickedObject.id.name);
            if (!isNaN(pageId)) {
              onArticleClick(pageId);
              return;
            }
          }
        }

        const earthPosition = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (Cesium.defined(earthPosition)) {
          const cartographic = Cesium.Cartographic.fromCartesian(earthPosition!);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          onGlobeClick(lat, lng);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 鼠标移动时更新 UI 扫描圈位置（通过 React state），同时为了保持性能，我们不需要在这里触发 Cesium 重绘
      handler.setInputAction((movement: any) => {
        if (onMouseMove) {
          onMouseMove(movement.endPosition.x, movement.endPosition.y);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      viewerRef.current = viewer;
    };
    
    initViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // 动态渲染历史事件标记点
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    viewer.entities.removeAll();

    if (articles.length > 0) {
      articles.forEach(a => {
        const isSelected = selectedArticleId === a.pageid;
        
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(a.lon, a.lat),
          name: a.pageid.toString(),
          point: {
            pixelSize: isSelected ? 12 : 8,
            color: isSelected ? Cesium.Color.RED : Cesium.Color.ORANGE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: a.title,
            font: isSelected ? 'bold 16px sans-serif' : '12px sans-serif',
            fillColor: isSelected ? Cesium.Color.RED : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 4,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -15),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
      });
      
      // 当数据更新时，由于启用了 requestRenderMode，需要手动触发一次渲染
      viewer.scene.requestRender();

      // 自动聚焦定位：平滑飞向扫描出的所有历史标记点
      viewer.flyTo(viewer.entities, {
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 15000) // 保持一定的倾斜视角和高度
      });
    }
  }, [articles, selectedArticleId]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black" style={{ cursor: 'none' }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
