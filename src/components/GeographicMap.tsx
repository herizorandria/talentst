import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface GeographicMapProps {
  clicks: Array<{
    location_country: string;
    location_city: string;
    clicked_at: string;
  }>;
}

const GeographicMap = ({ clicks }: GeographicMapProps) => {
  // Count clicks by country
  const countryClicks: Record<string, number> = {};
  clicks.forEach(click => {
    const country = click.location_country || 'Unknown';
    countryClicks[country] = (countryClicks[country] || 0) + 1;
  });

  // Sort countries by click count
  const sortedCountries = Object.entries(countryClicks)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Distribution Géographique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCountries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune donnée géographique disponible</p>
          ) : (
            sortedCountries.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-sm font-medium">{country}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / sortedCountries[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicMap;
