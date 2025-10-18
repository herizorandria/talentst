import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

interface GeographicMapProps {
  clicks: Array<{
    location_country: string;
    location_city: string;
    clicked_at: string;
  }>;
}

const GeographicMap = ({ clicks }: GeographicMapProps) => {
  // Count clicks by country and city
  const countryClicks: Record<string, number> = {};
  const cityClicks: Record<string, { country: string; count: number }> = {};
  
  clicks.forEach(click => {
    const country = click.location_country || 'Inconnu';
    const city = click.location_city || 'Ville inconnue';
    const cityKey = `${city}, ${country}`;
    
    countryClicks[country] = (countryClicks[country] || 0) + 1;
    
    if (!cityClicks[cityKey]) {
      cityClicks[cityKey] = { country, count: 0 };
    }
    cityClicks[cityKey].count++;
  });

  // Sort countries and cities by click count
  const sortedCountries = Object.entries(countryClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
    
  const sortedCities = Object.entries(cityClicks)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);

  const maxCountryClicks = sortedCountries.length > 0 ? sortedCountries[0][1] : 1;
  const maxCityClicks = sortedCities.length > 0 ? sortedCities[0][1].count : 1;

  // ✅ Définir les coordonnées des pays
  const countryCoordinates: Record<string, [number, number]> = {
    France: [48.8566, 2.3522],
    Madagascar: [-18.8792, 47.5079],
    USA: [37.0902, -95.7129],
    UK: [51.5074, -0.1276],
    Germany: [51.1657, 10.4515],
    Spain: [40.4168, -3.7038],
    Italy: [41.8719, 12.5674],
    Canada: [56.1304, -106.3468],
    Australia: [-25.2744, 133.7751],
    Japan: [36.2048, 138.2529],
  };

 // Custom icon for markers to fix default icon issue with webpack
const customIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Countries Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Pays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedCountries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
            ) : (
              sortedCountries.map(([country, count], index) => (
                <div key={country} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{country}</span>
                    </div>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(count / maxCountryClicks) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cities Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Villes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedCities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune donnée disponible
              </p>
            ) : (
              sortedCities.map(([cityKey, data], index) => (
                <div key={cityKey} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{cityKey}</span>
                    </div>
                    <span className="text-sm font-semibold">{data.count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${(data.count / maxCityClicks) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ Carte Leaflet */}
      <MapContainer
        center={[20, 20]}
        zoom={2}
        style={{ height: '400px', width: '200%' }}
        className="rounded-lg shadow-lg z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
    </div>
  );
};

export default GeographicMap;
