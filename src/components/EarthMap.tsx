import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import type { WikiArticle } from '../services/wikipediaApi';

interface EarthMapProps {
  articles: WikiArticle[];
  onGlobeClick: (lat: number, lng: number) => void;
  selectedArticleId: number | null;
  onArticleClick: (id: number) => void;
}

export default function EarthMap({ articles, onGlobeClick, selectedArticleId, onArticleClick }: EarthMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const initViewer = async () => {
      const viewer = new Cesium.Viewer(containerRef.current!, {
        animation: false,
        baseLayerPicker: false,
        baseLayer: false, // Don't add default imagery
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
        scene3DOnly: true
      });

      // Remove credits for a cleaner UI
      viewer.cesiumWidget.creditContainer.setAttribute('style', 'display: none;');

      try {
        // 1. High-Res Satellite Imagery
        const baseProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        );
        viewer.imageryLayers.addImageryProvider(baseProvider);

        // 2. Add Boundaries and Places Overlay
        const overlayProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer'
        );
        viewer.imageryLayers.addImageryProvider(overlayProvider);

        // 3. Add Roads and Transportation Overlay
        const roadsProvider = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer'
        );
        viewer.imageryLayers.addImageryProvider(roadsProvider);
      } catch (e) {
        console.error("Failed to load Esri layers", e);
      }

      // Post-processing for a sci-fi/cinematic look
      viewer.scene.globe.enableLighting = true;
      viewer.scene.highDynamicRange = true;

      // Handle Globe Clicks
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        // Check if we clicked on an entity (marker)
        const pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          // User clicked a marker
          if (pickedObject.id.name) { // Use name field as the pageid for articles
            const pageId = parseInt(pickedObject.id.name);
            if (!isNaN(pageId)) {
              onArticleClick(pageId);
              return;
            }
          }
        }

        // User clicked on the globe itself
        const earthPosition = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
        if (Cesium.defined(earthPosition)) {
          const cartographic = Cesium.Cartographic.fromCartesian(earthPosition!);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          onGlobeClick(lat, lng);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      viewerRef.current = viewer;
    };
    
    initViewer();

    return () => {
      if (viewerRef.current) {
        // Destroy handler is handled by viewer.destroy() usually, but let's be safe
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Handle articles update (markers)
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    // Clear existing markers
    viewer.entities.removeAll();

    if (articles.length > 0) {
      // Render Wikipedia articles as markers
      articles.forEach(a => {
        const isSelected = selectedArticleId === a.pageid;
        
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(a.lon, a.lat),
          name: a.pageid.toString(), // store pageid in name field
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

      // Optional: don't fly to bounds automatically every time, 
      // let user control camera, just update highlights.
    }
  }, [articles, selectedArticleId]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black cursor-crosshair">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
