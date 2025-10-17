import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe, LinkIcon, Users } from 'lucide-react';

interface Click {
  id: string;
  location_country: string;
  device: string;
  referrer: string;
  clicked_at: string;
}

interface AdvancedStatsProps {
  clicks: Click[];
  shortCode: string;
}

const AdvancedStats = ({ clicks, shortCode }: AdvancedStatsProps) => {
  // Visitors per link (if we had multiple links, this would show more data)
  const visitorsPerLink = clicks.length;

  // Platform analytics
  const platformCounts = clicks.reduce((acc, click) => {
    const device = click.device || 'Inconnu';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Visitors per domain
  const domainCounts = clicks.reduce((acc, click) => {
    const ref = click.referrer;
    let domain = 'Direct';
    if (ref && ref !== 'Direct') {
      try {
        domain = new URL(ref).hostname;
      } catch {
        domain = ref;
      }
    }
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Visitors per country
  const countryCounts = clicks.reduce((acc, click) => {
    const country = click.location_country || 'Inconnu';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Visitors Per Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-orange-600" />
            Visiteurs par Lien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span className="font-medium">/{shortCode}</span>
              <span className="text-lg font-bold text-orange-600">{visitorsPerLink}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Analytics par Plateforme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topPlatforms.map(([platform, count]) => (
              <div key={platform} className="flex justify-between items-center">
                <span className="text-sm">{platform}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / clicks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visitors Per Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Visiteurs par Domaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topDomains.map(([domain, count]) => (
              <div key={domain} className="flex justify-between items-center">
                <span className="text-sm truncate max-w-[150px]">{domain}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / clicks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visitors Per Country */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Visiteurs par Pays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCountries.map(([country, count]) => (
              <div key={country} className="flex justify-between items-center">
                <span className="text-sm">{country}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(count / clicks.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStats;
