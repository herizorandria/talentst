import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';

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
              <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
            ) : (
              sortedCountries.map(([country, count], index) => (
                <div key={country} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-6">#{index + 1}</span>
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
              <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
            ) : (
              sortedCities.map(([cityKey, data], index) => (
                <div key={cityKey} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-6">#{index + 1}</span>
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
    </div>
  );
};

export default GeographicMap;
