import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import { ShortenedUrl } from '@/types/url';
import { Link, BarChart3, History, LogIn, BookOpen, Settings } from 'lucide-react';
import { saveUrlsSecurely, loadUrlsSecurely } from '@/utils/storageUtils';
import { useAuth } from '@/hooks/useAuth';

// Lazy load heavy components
const UrlShortener = lazy(() => import('@/components/UrlShortener'));
const UrlHistory = lazy(() => import('@/components/UrlHistory'));
const Statistics = lazy(() => import('@/components/Statistics'));
const LinksManager = lazy(() => import('./LinksManager'));
const Tutorials = lazy(() => import('./Tutorials'));

const Index = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupérer l'onglet depuis l'URL
  const defaultTab = searchParams.get('tab') || 'shortener';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load URLs securely from storage on startup
  useEffect(() => {
    const loadUrls = async () => {
      try {
        const loadedUrls = await loadUrlsSecurely();
        setUrls(loadedUrls);
      } catch (error) {
        console.error('Erreur lors du chargement des URLs:', error);
      }
    };
    
    loadUrls();
  }, []);

  // Save URLs securely to storage on every modification
  useEffect(() => {
    if (urls.length > 0) {
      saveUrlsSecurely(urls);
    }
  }, [urls]);

  const handleUrlShortened = useCallback((newUrl: ShortenedUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  }, []);

  const handleUrlClick = useCallback((clickedUrl: ShortenedUrl) => {
    setUrls(prev => 
      prev.map(url => 
        url.id === clickedUrl.id 
          ? { ...url, clicks: url.clicks + 1, lastClickedAt: new Date() }
          : url
      )
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
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
          <div className="ml-4">
            <UserMenu />
          </div>
        </div>

        {/* Interface avec onglets */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur-sm shadow-lg">
          <TabsTrigger 
            value="shortener" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <Link className="h-4 w-4" />
            Raccourcir
          </TabsTrigger>
          <TabsTrigger 
            value="linksmanager"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            Gérer
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
          <TabsTrigger 
            value="tutorials"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4" />
            Tutoriels
          </TabsTrigger>
        </TabsList>

          <TabsContent value="shortener" className="space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
              <UrlShortener onUrlShortened={handleUrlShortened} />
            </Suspense>
          </TabsContent>

          <TabsContent value="linksmanager" className="space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
              <LinksManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
              <UrlHistory urls={urls} onUrlClick={handleUrlClick} />
            </Suspense>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
              <Statistics urls={urls} />
            </Suspense>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
              <Tutorials />
            </Suspense>
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