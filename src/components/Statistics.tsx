
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Link2, Eye, Calendar } from 'lucide-react';
import { ShortenedUrl } from '@/types/url';

interface StatisticsProps {
  urls: ShortenedUrl[];
}

const Statistics = ({ urls }: StatisticsProps) => {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const averageClicks = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;
  
  // URLs les plus populaires
  const topUrls = [...urls]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 3);

  // URLs créées aujourd'hui
  const today = new Date();
  const todayUrls = urls.filter(url => {
    const urlDate = new Date(url.createdAt);
    return urlDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      title: "Total des liens",
      value: totalUrls,
      icon: Link2,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Total des clics",
      value: totalClicks,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Moyenne par lien",
      value: averageClicks,
      icon: TrendingUp,
      color: "text-amber-600",
    bgColor: "bg-amber-100"
    },
    {
      title: "Créés aujourd'hui",
      value: todayUrls.length,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart className="h-5 w-5 text-amber-600" />
            Statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {stat.title}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topUrls.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                Liens les plus populaires
              </h4>
              <div className="space-y-3">
                {topUrls.map((url, index) => (
                  <div
                    key={url.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <code className="text-sm font-mono bg-orange-200 text-orange-800 px-2 py-1 rounded border">
                          {url.shortCode}
                        </code>
                        <p className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                          {url.originalUrl}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {url.clicks}
                      </p>
                      <p className="text-xs text-gray-500">clics</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
