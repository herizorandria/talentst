import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    BarChart3,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Calendar,
    TrendingUp,
    Users,
    Eye,
    Filter,
    Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Click {
    id: string;
    ip: string;
    location_city: string;
    location_country: string;
    device: string;
    browser: string;
    os: string;
    referrer: string;
    clicked_at: string;
}

interface UrlInfo {
    id: string;
    original_url: string;
    short_code: string;
    description: string;
    created_at: string;
    clicks: number;
}

const UrlAnalytics = () => {
    const { shortCode } = useParams<{ shortCode: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);
    const [clicks, setClicks] = useState<Click[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('7'); // derniers 7 jours par défaut
    const [countryFilter, setCountryFilter] = useState('');
    const [deviceFilter, setDeviceFilter] = useState('');

    useEffect(() => {
        if (!user || !shortCode) {
            navigate('/auth');
            return;
        }
        fetchAnalytics();
    }, [user, shortCode, dateFilter]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Récupérer les infos de l'URL
            const { data: urlData, error: urlError } = await supabase
                .from('shortened_urls')
                .select('id, original_url, short_code, description, created_at, clicks')
                .eq('short_code', shortCode)
                .eq('user_id', user?.id)
                .single();

            if (urlError || !urlData) {
                toast({
                    title: "Erreur",
                    description: "URL non trouvée ou accès non autorisé",
                    variant: "destructive"
                });
                navigate('/?tab=linksmanager');
                return;
            }

            setUrlInfo(urlData);

            // Calculer la date de début selon le filtre
            const now = new Date();
            const daysAgo = parseInt(dateFilter);
            const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

            // Récupérer les clics
            let query = supabase
                .from('url_clicks')
                .select('*')
                .eq('short_url_id', urlData.id)
                .gte('clicked_at', startDate.toISOString())
                .order('clicked_at', { ascending: false });

            const { data: clicksData, error: clicksError } = await query;

            if (clicksError) {
                console.error('Erreur lors de la récupération des clics:', clicksError);
            } else {
                setClicks(clicksData || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les analytics",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Fonctions utilitaires pour les analytics
    const getTopCounts = (arr: Click[], key: keyof Click, topN = 5) => {
        const counts = arr.reduce((acc, item) => {
            const val = item[key] || 'Inconnu';
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);
    };

    const getHourlyData = () => {
        const hours = Array(24).fill(0);
        clicks.forEach(click => {
            const hour = new Date(click.clicked_at).getHours();
            hours[hour]++;
        });
        return hours;
    };

    const getDailyData = () => {
        const days = {} as Record<string, number>;
        clicks.forEach(click => {
            const date = new Date(click.clicked_at).toLocaleDateString('fr-FR');
            days[date] = (days[date] || 0) + 1;
        });
        return Object.entries(days).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    };

    // Filtrer les clics
    const filteredClicks = clicks.filter(click => {
        if (countryFilter && click.location_country !== countryFilter) return false;
        if (deviceFilter && click.device !== deviceFilter) return false;
        return true;
    });

    const topCountries = getTopCounts(filteredClicks, 'location_country');
    const topDevices = getTopCounts(filteredClicks, 'device');
    const topBrowsers = getTopCounts(filteredClicks, 'browser');
    const topOS = getTopCounts(filteredClicks, 'os');
    const hourlyData = getHourlyData();
    const dailyData = getDailyData();

    // Listes pour les filtres
    const countries = Array.from(new Set(clicks.map(c => c.location_country).filter(Boolean)));
    const devices = Array.from(new Set(clicks.map(c => c.device).filter(Boolean)));

    const getDeviceIcon = (device: string) => {
        if (device?.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
        if (device?.toLowerCase().includes('tablet')) return <Tablet className="h-4 w-4" />;
        return <Monitor className="h-4 w-4" />;
    };

    const exportData = () => {
        const csvContent = [
            ['Date/Heure', 'Pays', 'Ville', 'Appareil', 'Navigateur', 'OS', 'Référent'].join(','),
            ...filteredClicks.map(click => [
                new Date(click.clicked_at).toLocaleString('fr-FR'),
                click.location_country || '',
                click.location_city || '',
                click.device || '',
                click.browser || '',
                click.os || '',
                click.referrer || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${shortCode}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleBackToManager = () => {
        navigate('/?tab=linksmanager');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement des analytics...</p>
                </div>
            </div>
        );
    }

    if (!urlInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <p className="text-gray-600 mb-4">URL non trouvée</p>
                        <Button onClick={handleBackToManager}>
                            Retour à la gestion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        onClick={handleBackToManager}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la gestion
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Analytics - /{shortCode}
                        </h1>
                        <p className="text-gray-600 break-all">{urlInfo.original_url}</p>
                        {urlInfo.description && (
                            <p className="text-sm text-gray-500 mt-1">{urlInfo.description}</p>
                        )}
                    </div>
                </div>

                {/* Filtres */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-1">Période</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="1">Dernières 24h</option>
                                    <option value="7">7 derniers jours</option>
                                    <option value="30">30 derniers jours</option>
                                    <option value="90">90 derniers jours</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pays</label>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => setCountryFilter(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="">Tous les pays</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Appareil</label>
                                <select
                                    value={deviceFilter}
                                    onChange={(e) => setDeviceFilter(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="">Tous les appareils</option>
                                    {devices.map(device => (
                                        <option key={device} value={device}>{device}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={exportData} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Métriques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{filteredClicks.length}</p>
                                    <p className="text-sm text-gray-600">Clics (période)</p>
                                </div>
                                <Eye className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-green-600">{urlInfo.clicks}</p>
                                    <p className="text-sm text-gray-600">Total clics</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">{topCountries.length}</p>
                                    <p className="text-sm text-gray-600">Pays uniques</p>
                                </div>
                                <Globe className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {filteredClicks.length > 0 ? Math.round(filteredClicks.length / Math.max(1, parseInt(dateFilter))) : 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Clics/jour moy.</p>
                                </div>
                                <Calendar className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Pays */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Top Pays
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topCountries.map(([country, count], index) => (
                                    <div key={country} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">#{index + 1}</span>
                                            <span>{country}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${(count / filteredClicks.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Appareils */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                Top Appareils
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topDevices.map(([device, count], index) => (
                                    <div key={device} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getDeviceIcon(device)}
                                            <span>{device}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${(count / filteredClicks.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Navigateurs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Navigateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topBrowsers.map(([browser, count], index) => (
                                    <div key={browser} className="flex items-center justify-between">
                                        <span>{browser}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{ width: `${(count / filteredClicks.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top OS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Systèmes d'exploitation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topOS.map(([os, count], index) => (
                                    <div key={os} className="flex items-center justify-between">
                                        <span>{os}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-600 h-2 rounded-full"
                                                    style={{ width: `${(count / filteredClicks.length) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graphique horaire */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Répartition par heure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-40 gap-1">
                            {hourlyData.map((count, hour) => (
                                <div key={hour} className="flex flex-col items-center justify-end flex-1">
                                    <div
                                        className="bg-blue-500 rounded-t w-full min-h-[2px]"
                                        style={{ height: `${Math.max(2, (count / Math.max(...hourlyData)) * 120)}px` }}
                                        title={`${hour}h: ${count} clics`}
                                    />
                                    <span className="text-xs mt-1">{hour}h</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau détaillé */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clics détaillés</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Date/Heure</th>
                                        <th className="text-left p-2">Localisation</th>
                                        <th className="text-left p-2">Appareil</th>
                                        <th className="text-left p-2">Navigateur</th>
                                        <th className="text-left p-2">OS</th>
                                        <th className="text-left p-2">Référent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClicks.slice(0, 50).map((click) => (
                                        <tr key={click.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                {new Date(click.clicked_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="p-2">
                                                {click.location_city && click.location_country
                                                    ? `${click.location_city}, ${click.location_country}`
                                                    : click.location_country || 'Inconnu'
                                                }
                                            </td>
                                            <td className="p-2">{click.device || 'Inconnu'}</td>
                                            <td className="p-2">{click.browser || 'Inconnu'}</td>
                                            <td className="p-2">{click.os || 'Inconnu'}</td>
                                            <td className="p-2 max-w-xs truncate">
                                                {click.referrer || 'Direct'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClicks.length > 50 && (
                                <p className="text-center text-gray-500 mt-4">
                                    Affichage des 50 premiers clics sur {filteredClicks.length} total
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UrlAnalytics;