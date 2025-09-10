
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Link2, Eye, Calendar, Clock, Target } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StatisticsProps {
  urls?: never; // Remove urls prop - we'll fetch from database
}

const Statistics = () => {
  const { urls, loading } = useDatabase();
  const { user } = useAuth();
  const [clicksLast7Days, setClicksLast7Days] = useState(0);
  const [clicksToday, setClicksToday] = useState(0);
  const [loading7Days, setLoading7Days] = useState(true);

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

  // Récupérer les statistiques de clics des 7 derniers jours
  useEffect(() => {
    const fetchRecentClickStats = async () => {
      if (!user) return;
      
      setLoading7Days(true);
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Récupérer tous les IDs des URLs de l'utilisateur
        const userUrlIds = urls.map(url => url.id);
        
        if (userUrlIds.length === 0) {
          setClicksLast7Days(0);
          setClicksToday(0);
          setLoading7Days(false);
          return;
        }

        // Clics des 7 derniers jours
        const { data: weekClicks, error: weekError } = await supabase
          .from('url_clicks')
          .select('id')
          .in('short_url_id', userUrlIds)
          .gte('clicked_at', sevenDaysAgo.toISOString());

        // Clics d'aujourd'hui
        const { data: todayClicksData, error: todayError } = await supabase
          .from('url_clicks')
          .select('id')
          .in('short_url_id', userUrlIds)
          .gte('clicked_at', todayStart.toISOString());

        if (!weekError && weekClicks) {
          setClicksLast7Days(weekClicks.length);
        }
        
        if (!todayError && todayClicksData) {
          setClicksToday(todayClicksData.length);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des stats de clics:', error);
      } finally {
        setLoading7Days(false);
      }
    };

    fetchRecentClickStats();
  }, [user, urls]);

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
      title: "Clics (7 derniers jours)",
      value: loading7Days ? "..." : clicksLast7Days,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Clics aujourd'hui",
      value: loading7Days ? "..." : clicksToday,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Moyenne par lien",
      value: averageClicks,
      icon: BarChart,
      color: "text-yellow-400",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black shadow-lg border-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-yellow-400">
            <BarChart className="h-5 w-5 text-yellow-400" />
            Statistiques des clics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gray-900 border border-gray-700 hover:border-yellow-400/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
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
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">
                Liens les plus populaires
              </h4>
              <div className="space-y-3">
                {topUrls.map((url, index) => (
                  <div
                    key={url.id}
                    className="flex items-center justify-between p-3 bg-gray-800 border border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 text-black rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <code className="text-sm font-mono bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded border border-yellow-400/30">
                          {url.shortCode}
                        </code>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                          {url.originalUrl}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        {url.clicks}
                      </p>
                      <p className="text-xs text-gray-400">clics</p>
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
