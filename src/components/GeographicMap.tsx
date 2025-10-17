import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface GeographicMapProps {
  clicks: Array<{
    location_country: string;
    location_city: string;
    clicked_at: string;
  }>;
}

const GeographicMap = ({ clicks }: GeographicMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  // Country coordinates for markers
  const countryCoordinates: Record<string, [number, number]> = {
    'France': [2.3522, 48.8566],
    'Madagascar': [47.5079, -18.8792],
    'USA': [-95.7129, 37.0902],
    'UK': [-0.1276, 51.5074],
    'Germany': [10.4515, 51.1657],
    'Spain': [-3.7038, 40.4168],
    'Italy': [12.5674, 41.8719],
    'Canada': [-106.3468, 56.1304],
    'Australia': [133.7751, -25.2744],
    'Japan': [138.2529, 36.2048],
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      zoom: 1.5,
      center: [20, 20],
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Count clicks by country
    const countryClicks: Record<string, number> = {};
    clicks.forEach(click => {
      const country = click.location_country || 'Unknown';
      countryClicks[country] = (countryClicks[country] || 0) + 1;
    });

    // Add markers for each country with clicks
    Object.entries(countryClicks).forEach(([country, count]) => {
      const coords = countryCoordinates[country];
      if (coords && map.current) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = '#f59e0b';
        el.style.width = `${Math.min(20 + count * 2, 50)}px`;
        el.style.height = `${Math.min(20 + count * 2, 50)}px`;
        el.style.borderRadius = '50%';
        el.style.opacity = '0.7';
        el.style.border = '2px solid white';

        new mapboxgl.Marker(el)
          .setLngLat(coords)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>${country}</strong><br/>${count} clics`)
          )
          .addTo(map.current);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [clicks, isTokenSet, mapboxToken]);

  if (!isTokenSet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Carte de Distribution Géographique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Pour afficher la carte interactive, veuillez entrer votre token Mapbox public.
            </p>
            <p className="text-xs text-gray-500">
              Obtenez votre token sur{' '}
              <a
                href="https://account.mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="pk.eyJ1Ijoi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <button
                onClick={() => setIsTokenSet(true)}
                disabled={!mapboxToken}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
              >
                Activer
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Distribution Géographique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainer} className="h-[400px] rounded-lg shadow-lg" />
      </CardContent>
    </Card>
  );
};

export default GeographicMap;
