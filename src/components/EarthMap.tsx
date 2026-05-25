import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { HistoricalEra } from '../data/historicalData';
import type { WikiArticle } from '../services/wikipediaApi';

interface EarthMapProps {
  activeEra: HistoricalEra;
  articles: WikiArticle[];
  onGlobeClick: (lat: number, lng: number) => void;
  selectedArticleId: number | null;
  onArticleClick: (id: number) => void;
}

export default function EarthMap({ activeEra, articles, onGlobeClick, selectedArticleId, onArticleClick }: EarthMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When era changes, and we have NO custom articles, fly to era center
  // If we have custom articles, we let the user control the camera
  useEffect(() => {
    if (globeRef.current && articles.length === 0) {
      const [lng, lat] = activeEra.center;
      const altitude = Math.max(1.0, 3.5 - activeEra.zoom * 0.5); 
      globeRef.current.pointOfView({ lat, lng, altitude }, 2000);
    }
  }, [activeEra, articles.length]);

  // Points to render: if we have articles, show them. Otherwise show default era places.
  const pointsData = useMemo(() => {
    if (articles.length > 0) {
      return articles.map(a => ({
        id: a.pageid,
        lat: a.lat,
        lng: a.lon,
        size: selectedArticleId === a.pageid ? 0.2 : 0.08,
        color: selectedArticleId === a.pageid ? '#ef4444' : '#fbbf24', // red if selected, amber otherwise
        name: a.title
      }));
    }

    return activeEra.places.features.map((f: any) => ({
      id: f.properties.name, // fallback id
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      size: f.properties.type === 'capital' ? 0.15 : 0.08,
      color: f.properties.type === 'capital' ? '#fbbf24' : '#fef3c7',
      name: f.properties.name
    }));
  }, [activeEra, articles, selectedArticleId]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black cursor-crosshair">
      <Globe
        ref={globeRef as any}
        width={dimensions.width}
        height={dimensions.height}
        
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
        
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        pointsMerge={false}
        onPointClick={(point: any) => onArticleClick(point.id)}
        
        htmlElementsData={pointsData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          const isSelected = selectedArticleId === d.id;
          el.innerHTML = `
            <div style="
              color: ${isSelected ? '#ef4444' : 'white'}; 
              font-weight: bold; 
              font-size: ${isSelected ? '16px' : '12px'}; 
              text-shadow: 0px 0px 4px black, 0px 0px 8px black; 
              background: rgba(0,0,0,0.4); 
              padding: 2px 6px; 
              border-radius: 4px; 
              pointer-events: none;
              transition: all 0.3s;
              border: ${isSelected ? '1px solid #ef4444' : 'none'};
            ">
              ${d.name}
            </div>
          `;
          return el;
        }}
        htmlAltitude={0.05}
        
        // Handle globe click
        onGlobeClick={({ lat, lng }) => {
          onGlobeClick(lat, lng);
        }}
      />
    </div>
  );
}
