import type * as GeoJSON from 'geojson';

export interface HistoricalEra {
  id: string;
  year: number;
  label: string;
  title: string;
  description: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  places: GeoJSON.FeatureCollection;
}

export const historicalEras: HistoricalEra[] = [
  {
    id: 'roman',
    year: 117,
    label: '117 AD',
    title: 'Peak of the Roman Empire',
    description: 'Under Emperor Trajan, the Roman Empire reaches its greatest territorial extent, stretching from Britain to the Persian Gulf.',
    center: [15.0, 41.9], // Rome approx
    zoom: 3,
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [12.4922, 41.8902] },
          properties: { name: 'Rome', type: 'capital' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [28.9784, 41.0082] },
          properties: { name: 'Byzantium', type: 'city' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-0.1276, 51.5072] },
          properties: { name: 'Londinium', type: 'city' },
        }
      ]
    }
  },
  {
    id: 'mongol',
    year: 1279,
    label: '1279 AD',
    title: 'The Mongol Empire',
    description: 'The Mongol Empire becomes the largest contiguous land empire in history, spanning from Eastern Europe to the Sea of Japan.',
    center: [103.8, 36.0], // Asia
    zoom: 2.5,
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [102.26, 47.21] },
          properties: { name: 'Karakorum', type: 'capital' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [116.4, 39.9] },
          properties: { name: 'Khanbaliq (Beijing)', type: 'city' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [44.3, 33.3] },
          properties: { name: 'Baghdad', type: 'city' },
        }
      ]
    }
  },
  {
    id: 'age-of-discovery',
    year: 1492,
    label: '1492 AD',
    title: 'Age of Discovery',
    description: 'Christopher Columbus reaches the Americas, initiating widespread global exploration and the first major era of globalization.',
    center: [-40.0, 30.0], // Atlantic Ocean
    zoom: 2.5,
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-6.9, 37.2] },
          properties: { name: 'Palos de la Frontera', type: 'departure' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-74.0, 24.0] },
          properties: { name: 'San Salvador', type: 'arrival' },
        }
      ]
    }
  },
  {
    id: 'industrial',
    year: 1889,
    label: '1889 AD',
    title: 'Industrial Revolution',
    description: 'The completion of the Eiffel Tower symbolizes the peak of the Industrial Revolution, marked by rapid technological and architectural advancements.',
    center: [2.35, 48.85], // Paris
    zoom: 4,
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2.2945, 48.8584] },
          properties: { name: 'Eiffel Tower', type: 'monument' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-2.24, 53.48] },
          properties: { name: 'Manchester (Cottonopolis)', type: 'city' },
        }
      ]
    }
  },
  {
    id: 'space-age',
    year: 1969,
    label: '1969 AD',
    title: 'The Space Age',
    description: 'Apollo 11 lands on the Moon. Humanity looks beyond Earth as the Cold War drives massive leaps in aerospace engineering.',
    center: [-80.6, 28.5], // Cape Canaveral
    zoom: 4,
    places: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-80.6077, 28.6083] },
          properties: { name: 'Kennedy Space Center', type: 'launch' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [46.0, 63.0] }, // Baikonur approx
          properties: { name: 'Baikonur Cosmodrome', type: 'launch' },
        }
      ]
    }
  }
];
