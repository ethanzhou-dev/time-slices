import { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import type { HistoricalEra } from '../data/historicalData';

interface EarthMapProps {
  activeEra: HistoricalEra;
  mapboxToken: string;
}

export default function EarthMap({ activeEra, mapboxToken }: EarthMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      mapRef.current.flyTo({
        center: activeEra.center,
        zoom: activeEra.zoom,
        duration: 3000,
        essential: true,
      });
    }
  }, [activeEra, mapLoaded]);

  // We are using a generic style. If users have a specific mapbox studio style they can swap it.
  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: activeEra.center[0],
          latitude: activeEra.center[1],
          zoom: activeEra.zoom,
          pitch: 45, // Add a bit of pitch for the 3D globe effect
        }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        projection={{ name: 'globe' }} // This enables the 3D globe
        onLoad={() => setMapLoaded(true)}
        fog={{
          range: [0.8, 8],
          color: '#242B4B',
          'horizon-blend': 0.3,
          'high-color': '#161B36',
          'space-color': '#0B0D17',
          'star-intensity': 0.8 // Adds stars to the background
        }}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
      >
        {/* Add terrain source */}
        <Source
          id="mapbox-dem"
          type="raster-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={512}
          maxzoom={14}
        />

        {/* Current Era Data Points */}
        <Source id={`places-${activeEra.id}`} type="geojson" data={activeEra.places}>
          {/* Outer glow for points */}
          <Layer
            id="places-glow"
            type="circle"
            paint={{
              'circle-radius': 12,
              'circle-color': '#fbbf24', // amber-400
              'circle-opacity': 0.4,
              'circle-blur': 0.5,
            }}
          />
          {/* Inner point */}
          <Layer
            id="places-point"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#fef3c7', // amber-50
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fbbf24',
            }}
          />
          {/* Labels */}
          <Layer
            id="places-label"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 14,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
            }}
            paint={{
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 2,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
