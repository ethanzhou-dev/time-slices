import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';
import type { HistoricalEra } from '../data/historicalData';

interface EarthMapProps {
  activeEra: HistoricalEra;
}

export default function EarthMap({ activeEra }: EarthMapProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When era changes, rotate camera to the center coordinate
  useEffect(() => {
    if (globeRef.current) {
      const [lng, lat] = activeEra.center;
      // Adjust the altitude depending on zoom level (lower zoom = higher altitude)
      // Mapbox zoom 2-4 roughly translates to altitude 1.5 to 2.5 in globe.gl
      const altitude = Math.max(1.0, 3.5 - activeEra.zoom * 0.5); 
      
      globeRef.current.pointOfView({ lat, lng, altitude }, 2000);
    }
  }, [activeEra]);

  // Extract points from GeoJSON for Globe.gl
  const pointsData = useMemo(() => {
    return activeEra.places.features.map((f: any) => ({
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      size: f.properties.type === 'capital' ? 0.15 : 0.08,
      color: f.properties.type === 'capital' ? '#fbbf24' : '#fef3c7',
      name: f.properties.name
    }));
  }, [activeEra]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <Globe
        ref={globeRef as any}
        width={dimensions.width}
        height={dimensions.height}
        
        // Use free high-res textures from unpkg
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Atmosphere settings for realism
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
        
        // Points config (our historical places)
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.02}
        pointRadius="size"
        pointsMerge={false}
        
        // Custom HTML labels above points
        htmlElementsData={pointsData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div style="color: white; font-weight: bold; font-size: 14px; text-shadow: 0px 0px 4px black, 0px 0px 8px black; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; pointer-events: none;">
              ${d.name}
            </div>
          `;
          return el;
        }}
        htmlAltitude={0.05}
      />
    </div>
  );
}
