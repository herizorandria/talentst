
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UrlShortener from '@/components/UrlShortener';
import UrlHistory from '@/components/UrlHistory';
import Statistics from '@/components/Statistics';
import { ShortenedUrl } from '@/types/url';
import { Link, BarChart3, History } from 'lucide-react';

const Index = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);

  // Charger les URLs depuis le localStorage au démarrage
  useEffect(() => {
    const savedUrls = localStorage.getItem('shortenedUrls');
    if (savedUrls) {
      try {
        const parsedUrls = JSON.parse(savedUrls).map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          lastClickedAt: url.lastClickedAt ? new Date(url.lastClickedAt) : undefined
        }));
        setUrls(parsedUrls);
      } catch (error) {
        console.error('Erreur lors du chargement des URLs:', error);
      }
    }
  }, []);

  // Sauvegarder les URLs dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('shortenedUrls', JSON.stringify(urls));
  }, [urls]);

  const handleUrlShortened = (newUrl: ShortenedUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleUrlClick = (clickedUrl: ShortenedUrl) => {
    setUrls(prev => 
      prev.map(url => 
        url.id === clickedUrl.id 
          ? { ...url, clicks: url.clicks + 1, lastClickedAt: new Date() }
          : url
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Link className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              ShortLink Pro
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Raccourcissez vos URLs, suivez vos statistiques et gérez votre historique en toute simplicité
          </p>
        </div>

        {/* Interface avec onglets */}
        <Tabs defaultValue="shortener" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm shadow-lg">
            <TabsTrigger 
              value="shortener" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Link className="h-4 w-4" />
              Raccourcir
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger 
              value="statistics"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortener" className="space-y-6">
            <UrlShortener onUrlShortened={handleUrlShortened} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <UrlHistory urls={urls} onUrlClick={handleUrlClick} />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Statistics urls={urls} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 py-6 border-t border-purple-200">
          <p className="text-sm text-gray-500">
            © 2024 ShortLink Pro - Raccourcisseur d'URL professionnel
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
