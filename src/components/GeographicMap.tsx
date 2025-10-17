import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Icon } from 'leaflet';

interface GeographicMapProps {
  clicks: Array<{
    location_country: string;
    location_city: string;
    clicked_at: string;
  }>;
}

// Custom icon for markers to fix default icon issue with webpack
const customIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const GeographicMap = ({ clicks }: GeographicMapProps) => {
  // Country coordinates for markers [lat, lng]
  const countryCoordinates: Record<string, [number, number]> = {
    'France': [48.8566, 2.3522],
    'Madagascar': [-18.8792, 47.5079],
    'USA': [37.0902, -95.7129],
    'UK': [51.5074, -0.1276],
    'Germany': [51.1657, 10.4515],
    'Spain': [40.4168, -3.7038],
    'Italy': [41.8719, 12.5674],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'Japan': [36.2048, 138.2529],
  };

  // Count clicks by country
  const countryClicks: Record<string, number> = {};
  clicks.forEach(click => {
    const country = click.location_country || 'Unknown';
    countryClicks[country] = (countryClicks[country] || 0) + 1;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Distribution Géographique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MapContainer center={[20, 20]} zoom={2} style={{ height: '400px', width: '100%' }} className="rounded-lg shadow-lg z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {Object.entries(countryClicks).map(([country, count]) => {
            const coords = countryCoordinates[country];
            if (coords) {
              return (
                <Marker key={country} position={coords} icon={customIcon}>
                  <Popup>
                    <strong>{country}</strong>
                    <br />
                    {count} clics
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </CardContent>
    </Card>
  );
};

export default GeographicMap;