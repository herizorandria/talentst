import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DateRangePicker from '@/components/DateRangePicker';
import AdvancedStats from '@/components/AdvancedStats';
import GeographicMap from '@/components/GeographicMap';
import LandingPageConfig from '@/components/LandingPageConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Download,
    Sun,
    RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

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

// Values that indicate a placeholder / in-progress state from the recorder
const PLACEHOLDER_VALUES = new Set(['', 'en cours...', 'in progress', 'pending', 'inconnu']);

const normalizeStringField = (v?: unknown) => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    return PLACEHOLDER_VALUES.has(s.toLowerCase()) ? '' : s;
};

const normalizeIpField = (v?: unknown) => {
    const s = String(v ?? '').trim();
    if (!s) return 'Inconnu';
    return PLACEHOLDER_VALUES.has(s.toLowerCase()) ? 'Inconnu' : s;
};

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
    const [countryFilterMode, setCountryFilterMode] = useState<'include' | 'exclude'>('include');
    const [referrerFilter, setReferrerFilter] = useState('');
    const [deviceFilter, setDeviceFilter] = useState('');
    const [hourFilter, setHourFilter] = useState('');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [useCustomRange, setUseCustomRange] = useState(false);

    useEffect(() => {
        if (!user || !shortCode) {
            navigate('/auth');
            return;
        }
        fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, shortCode, dateFilter, customStartDate, customEndDate, useCustomRange]);

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
                    title: 'Erreur',
                    description: 'URL non trouvée ou accès non autorisé',
                    variant: 'destructive'
                });
                navigate('/?tab=linksmanager');
                return;
            }

            setUrlInfo(urlData);

            // Calculer les dates selon le filtre
            let startDate: Date;
            let endDate: Date;
            
            if (useCustomRange && customStartDate && customEndDate && 
                !isNaN(customStartDate.getTime()) && !isNaN(customEndDate.getTime())) {
                startDate = startOfDay(customStartDate);
                endDate = endOfDay(customEndDate);
            } else {
                const now = new Date();
                const daysAgo = parseInt(dateFilter) || 7;
                startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
                endDate = now;
            }

            // Récupérer les clics - sélectionner seulement les colonnes utiles
            let query = supabase
                .from('url_clicks')
                .select('id, ip, location_city, location_country, device, browser, os, referrer, clicked_at')
                .eq('short_url_id', urlData.id)
                .gte('clicked_at', startDate.toISOString());
            
            if (useCustomRange && customEndDate) {
                query = query.lte('clicked_at', endDate.toISOString());
            }
            
            const { data: clicksData, error: clicksError } = await query.order('clicked_at', { ascending: false });

            if (clicksError) {
                console.error('Erreur lors de la récupération des clics:', clicksError);
            } else {
                // Normalize rows to ensure our Click type fields exist and have defaults
                type RawClick = Partial<Record<keyof Click, unknown>> & { id?: unknown, clicked_at?: unknown };
                const normalized: Click[] = (clicksData || []).map((c: RawClick) => ({
                    id: String(c.id || ''),
                    ip: normalizeIpField(c.ip),
                    location_city: normalizeStringField(c.location_city),
                    location_country: normalizeStringField(c.location_country),
                    device: normalizeStringField(c.device) || 'Inconnu',
                    browser: normalizeStringField(c.browser) || 'Inconnu',
                    os: normalizeStringField(c.os) || 'Inconnu',
                    referrer: normalizeStringField(c.referrer) || '',
                    clicked_at: String(c.clicked_at || new Date().toISOString()),
                }));

                setClicks(normalized);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les analytics',
                variant: 'destructive'
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

    const getHourlyData = (arr: Click[]) => {
        const hours = Array(24).fill(0);
        arr.forEach(click => {
            const hour = new Date(click.clicked_at).getHours();
            hours[hour]++;
        });
        return hours;
    };

    const getDailyData = (arr: Click[]) => {
        const days = {} as Record<string, number>;
        arr.forEach(click => {
            const date = new Date(click.clicked_at).toLocaleDateString('fr-FR');
            days[date] = (days[date] || 0) + 1;
        });
        return Object.entries(days).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    };

    // Filtrer les clics
    const filteredClicks = React.useMemo(() => clicks.filter(click => {
        // Filtre pays avec mode inclusion/exclusion
        if (countryFilter) {
            const countryMatch = click.location_country === countryFilter;
            if (countryFilterMode === 'include' && !countryMatch) return false;
            if (countryFilterMode === 'exclude' && countryMatch) return false;
        }
        
        // Filtre référent
        if (referrerFilter) {
            const referrer = click.referrer?.toLowerCase() || '';
            if (!referrer.includes(referrerFilter.toLowerCase()) && referrerFilter.toLowerCase() !== 'direct') return false;
            if (referrerFilter.toLowerCase() === 'direct' && referrer && referrer !== 'direct') return false;
        }
        
        // Filtre appareil
        if (deviceFilter && click.device !== deviceFilter) return false;
        
        // Filtre heure
        if (hourFilter) {
            const clickHour = new Date(click.clicked_at).getHours();
            if (clickHour.toString() !== hourFilter) return false;
        }
        
        return true;
    }), [clicks, countryFilter, countryFilterMode, referrerFilter, deviceFilter, hourFilter]);

    // Statistiques pour aujourd'hui seulement
    const todayClicks = React.useMemo(() => 
        clicks.filter(click => isToday(new Date(click.clicked_at)))
    , [clicks]);

    const handleCustomDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        
        // Only enable custom range if both dates are valid
        const bothDatesValid = startDate && endDate && 
                              !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
        
        setUseCustomRange(!!bothDatesValid);
        
        if (bothDatesValid) {
            setDateFilter('custom');
        }
    };

    const topCountries = React.useMemo(() => getTopCounts(filteredClicks, 'location_country'), [filteredClicks]);
    const topDevices = React.useMemo(() => getTopCounts(filteredClicks, 'device'), [filteredClicks]);
    const topBrowsers = React.useMemo(() => getTopCounts(filteredClicks, 'browser'), [filteredClicks]);
    const topOS = React.useMemo(() => getTopCounts(filteredClicks, 'os'), [filteredClicks]);
    const hourlyData = React.useMemo(() => getHourlyData(filteredClicks), [filteredClicks]);
    const dailyData = React.useMemo(() => getDailyData(filteredClicks), [filteredClicks]);

    // Listes pour les filtres
    const countries = React.useMemo(() => Array.from(new Set(clicks.map(c => c.location_country).filter(Boolean))), [clicks]);
    const devices = React.useMemo(() => Array.from(new Set(clicks.map(c => c.device).filter(Boolean))), [clicks]);
    const referrers = React.useMemo(() => {
        const refs = clicks.map(c => {
            const ref = c.referrer;
            if (!ref || ref === 'Direct') return 'Direct';
            if (ref.includes('facebook.com')) return 'Facebook';
            if (ref.includes('instagram.com')) return 'Instagram';
            if (ref.includes('twitter.com')) return 'Twitter';
            if (ref.includes('linkedin.com')) return 'LinkedIn';
            if (ref.includes('google.com')) return 'Google';
            try {
                return new URL(ref).hostname;
            } catch {
                return ref;
            }
        });
        return Array.from(new Set(refs)).sort();
    }, [clicks]);

    const getDeviceIcon = (device: string) => {
        if (device?.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
        if (device?.toLowerCase().includes('tablet')) return <Tablet className="h-4 w-4" />;
        return <Monitor className="h-4 w-4" />;
    };

    const exportData = () => {
        const header = ['Date', 'Heure', 'Pays', 'Ville', 'Appareil', 'Navigateur', 'OS', 'Référent', 'IP'];
        const rows = filteredClicks.map(click => {
            const date = new Date(click.clicked_at);
            return [
                date.toLocaleDateString('fr-FR'),
                date.toLocaleTimeString('fr-FR'),
                click.location_country || '',
                click.location_city || '',
                click.device || '',
                click.browser || '',
                click.os || '',
                click.referrer || '',
                click.ip || ''
            ];
        });

        const csvContent = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

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

    const resetFilters = () => {
        setDateFilter('7');
        setCountryFilter('');
        setCountryFilterMode('include');
        setReferrerFilter('');
        setDeviceFilter('');
        setHourFilter('');
        setCustomStartDate(null);
        setCustomEndDate(null);
        setUseCustomRange(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement des analytics...</p>
                </div>
            </div>
        );
    }

    if (!urlInfo) {
        return (
            <div className="min-h-screen bg-amber-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-amber-100">
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setDateFilter(value);
                                        if (value !== 'custom') {
                                            setUseCustomRange(false);
                                            setCustomStartDate(null);
                                            setCustomEndDate(null);
                                        }
                                    }}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="1">Dernières 24h</option>
                                    <option value="7">7 derniers jours</option>
                                    <option value="30">30 derniers jours</option>
                                    <option value="90">90 derniers jours</option>
                                    <option value="custom">Période personnalisée</option>
                                </select>
                            </div>
                            {dateFilter === 'custom' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dates personnalisées</label>
                                    <DateRangePicker
                                        startDate={customStartDate}
                                        endDate={customEndDate}
                                        onDateRangeChange={handleCustomDateRangeChange}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Heure</label>
                                <select
                                    value={hourFilter}
                                    onChange={(e) => setHourFilter(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="">Toutes les heures</option>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}h - {i + 1}h</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
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
                                {countryFilter && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Mode</label>
                                        <select
                                            value={countryFilterMode}
                                            onChange={(e) => setCountryFilterMode(e.target.value as 'include' | 'exclude')}
                                            className="border rounded px-3 py-2"
                                        >
                                            <option value="include">Seulement</option>
                                            <option value="exclude">Sauf</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Référent</label>
                                <select
                                    value={referrerFilter}
                                    onChange={(e) => setReferrerFilter(e.target.value)}
                                    className="border rounded px-3 py-2"
                                >
                                    <option value="">Tous les référents</option>
                                    {referrers.map(ref => (
                                        <option key={ref} value={ref}>{ref}</option>
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
                            <Button onClick={resetFilters} variant="outline">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Réinitialiser
                            </Button>
                            <Button onClick={exportData} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Exporter CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques du jour */}
                <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Sun className="h-5 w-5" />
                            Statistiques d'aujourd'hui
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600">{todayClicks.length}</p>
                                <p className="text-sm text-amber-700">Clics aujourd'hui</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600">
                                    {new Set(todayClicks.map(c => c.location_country).filter(Boolean)).size}
                                </p>
                                <p className="text-sm text-amber-700">Pays uniques</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-600">
                                    {todayClicks.length > 0 ? Math.round(todayClicks.length / 24 * 10) / 10 : 0}
                                </p>
                                <p className="text-sm text-amber-700">Clics/heure moy.</p>
                            </div>
                        </div>
                        {todayClicks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-amber-200">
                                <p className="text-sm text-amber-700 mb-2">Top pays aujourd'hui:</p>
                                <div className="flex flex-wrap gap-2">
                                    {getTopCounts(todayClicks, 'location_country', 3).map(([country, count]) => (
                                        <Badge key={country} variant="secondary" className="bg-amber-100 text-amber-800">
                                            {country} ({count})
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Métriques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">{filteredClicks.length}</p>
                                    <p className="text-sm text-gray-600">Clics (période)</p>
                                </div>
                                <Eye className="h-8 w-8 text-orange-600" />
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
                                    <p className="text-2xl font-bold text-yellow-400">{topCountries.length}</p>
                                    <p className="text-sm text-gray-600">Pays uniques</p>
                                </div>
                                <Globe className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {filteredClicks.length > 0 ? Math.round(filteredClicks.length / Math.max(1, useCustomRange && customStartDate && customEndDate ? 
                                            Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)) : 
                                            parseInt(dateFilter))) : 0}
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
                                                    className="bg-yellow-400 h-2 rounded-full"
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
                                        className="bg-orange-500 rounded-t w-full min-h-[2px]"
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
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Heure</th>
                                        <th className="text-left p-2">Localisation</th>
                                        <th className="text-left p-2">Appareil</th>
                                        <th className="text-left p-2">Navigateur</th>
                                        <th className="text-left p-2">OS</th>
                                        <th className="text-left p-2">Référent</th>
                                        <th className="text-left p-2">IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClicks.slice(0, 50).map((click) => {
                                        const clickDate = new Date(click.clicked_at);
                                        return (
                                            <tr key={click.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2">
                                                    {clickDate.toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="p-2">
                                                    {clickDate.toLocaleTimeString('fr-FR')}
                                                </td>
                                            <td className="p-2">
                                                {click.location_city && click.location_country
                                                    ? `${click.location_city}, ${click.location_country}`
                                                    : click.location_country || 'Inconnu'
                                                }
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-1">
                                                    {getDeviceIcon(click.device)}
                                                    {click.device || 'Inconnu'}
                                                </div>
                                            </td>
                                            <td className="p-2">{click.browser || 'Inconnu'}</td>
                                            <td className="p-2">{click.os || 'Inconnu'}</td>
                                            <td className="p-2 max-w-xs truncate" title={click.referrer}>
                                                {click.referrer === 'Direct' || !click.referrer ? 'Direct' : 
                                                 click.referrer.includes('facebook.com') ? 'Facebook' :
                                                 click.referrer.includes('instagram.com') ? 'Instagram' :
                                                 click.referrer.includes('twitter.com') ? 'Twitter' :
                                                 click.referrer.includes('linkedin.com') ? 'LinkedIn' :
                                                 click.referrer.includes('google.com') ? 'Google' :
                                                 (() => {
                                                     try {
                                                         return new URL(click.referrer).hostname;
                                                     } catch {
                                                         return click.referrer;
                                                     }
                                                 })()
                                                }
                                            </td>
                                                <td className="p-2 font-mono text-xs">
                                                    {click.ip && click.ip !== 'En cours...' ? click.ip : 'Inconnu'}
                                                </td>
                                            </tr>
                                        );
                                    })}
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

                {/* Tabs for Advanced Stats, Map, and Landing Page */}
                <Tabs defaultValue="advanced" className="mt-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="advanced">Stats Avancées</TabsTrigger>
                        <TabsTrigger value="map">Carte Géographique</TabsTrigger>
                        <TabsTrigger value="landing">Landing Page</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="advanced" className="mt-6">
                        <AdvancedStats clicks={filteredClicks} shortCode={shortCode || ''} />
                    </TabsContent>
                    
                    <TabsContent value="map" className="mt-6">
                        <GeographicMap clicks={filteredClicks} />
                    </TabsContent>
                    
                    <TabsContent value="landing" className="mt-6">
                        <LandingPageConfig shortUrlId={urlInfo.id} shortCode={shortCode || ''} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default UrlAnalytics;