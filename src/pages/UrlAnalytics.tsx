import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
    ArrowLeft,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Download
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
    const [dateFilter, setDateFilter] = useState('7');

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

            const now = new Date();
            const daysAgo = parseInt(dateFilter) || 7;
            const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

            const { data: clicksData, error: clicksError } = await supabase
                .from('url_clicks')
                .select('id, ip, location_city, location_country, device, browser, os, referrer, clicked_at')
                .eq('short_url_id', urlData.id)
                .gte('clicked_at', startDate.toISOString())
                .order('clicked_at', { ascending: false });

            if (clicksError) {
                console.error('Erreur lors de la récupération des clics:', clicksError);
            } else {
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

    const topCountries = React.useMemo(() => getTopCounts(clicks, 'location_country'), [clicks]);
    const topDevices = React.useMemo(() => getTopCounts(clicks, 'device'), [clicks]);

    const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF'];

    const formatChartData = (data: [string, number][]) => {
        return data.map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }));
    };

    const renderPieChart = (data: [string, number][]) => {
        const chartData = formatChartData(data);
        
        return (
            <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={50}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const exportData = () => {
        const header = ['Date/Heure', 'Pays', 'Ville', 'Appareil', 'Navigateur', 'OS', 'Référent', 'IP'];
        const rows = clicks.map(click => [
            new Date(click.clicked_at).toLocaleString('fr-FR'),
            click.location_country || '',
            click.location_city || '',
            click.device || '',
            click.browser || '',
            click.os || '',
            click.referrer || '',
            click.ip || ''
        ]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Chargement des analytics...</p>
                </div>
            </div>
        );
    }

    if (!urlInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r min-h-screen p-6">
                    <div className="mb-8">
                        <Button
                            onClick={handleBackToManager}
                            variant="ghost"
                            size="sm"
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">Analytics</h2>
                        <p className="text-sm text-gray-600 truncate">/{shortCode}</p>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                                <span className="text-sm text-gray-600">Views</span>
                            </div>
                            <span className="text-sm font-semibold">{clicks.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                                <span className="text-sm text-gray-600">Followers</span>
                            </div>
                            <span className="text-sm font-semibold">0</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Clics</span>
                            </div>
                            <span className="text-sm font-semibold">{clicks.length}</span>
                        </div>
                    </div>

                    {/* Simple Chart */}
                    <div className="mt-8">
                        <div className="h-32 bg-blue-50 rounded-lg relative overflow-hidden">
                            <div className="absolute bottom-0 left-4 w-8 h-16 bg-blue-200 rounded-t"></div>
                            <div className="absolute bottom-0 left-16 w-8 h-20 bg-blue-300 rounded-t"></div>
                            <div className="absolute bottom-0 left-28 w-8 h-12 bg-blue-400 rounded-t"></div>
                            <div className="absolute bottom-2 left-2 text-xs text-blue-600">20 AUG</div>
                            <div className="absolute bottom-2 left-14 text-xs text-blue-600">4 SEP</div>
                            <div className="absolute bottom-2 left-26 text-xs text-blue-600">19 SEP</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Header with Export */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{urlInfo.original_url.replace(/^https?:\/\//, '').split('/')[0]}</h1>
                            <p className="text-gray-600">/{shortCode}</p>
                        </div>
                        <Button onClick={exportData} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Exporter CSV
                        </Button>
                    </div>

                    {/* World Map Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Map placeholder */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="h-64 bg-blue-50 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        {/* Simple world map representation */}
                                        <div className="absolute inset-0 opacity-20">
                                            <svg viewBox="0 0 1000 500" className="w-full h-full">
                                                {/* Simplified continents */}
                                                <path d="M 100 150 Q 200 100 300 150 Q 400 200 500 150 L 600 200 L 700 150 Q 800 100 900 150 L 900 350 Q 800 400 700 350 L 600 400 L 500 350 Q 400 400 300 350 Q 200 400 100 350 Z" fill="#93C5FD"/>
                                                <path d="M 200 250 Q 250 200 300 250 Q 350 300 400 250 L 400 350 Q 350 400 300 350 Q 250 400 200 350 Z" fill="#93C5FD"/>
                                            </svg>
                                        </div>
                                        <Globe className="h-12 w-12 text-blue-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Countries */}
                        <div>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-600">Countries</h3>
                                        <span className="text-2xl font-bold text-blue-500">{topCountries.length}</span>
                                    </div>
                                    <div className="flex justify-center mb-4">
                                        {topCountries.length > 0 ? renderPieChart(topCountries) : (
                                            <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                                                <Globe className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {topCountries.slice(0, 4).map(([country, count], index) => (
                                            <div key={country} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: COLORS[index]}}></div>
                                                    <span className="text-gray-600 truncate">{country}</span>
                                                </div>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Clicks */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Clics</h3>
                                    <span className="text-2xl font-bold text-blue-500">{clicks.length}</span>
                                </div>
                                <div className="flex justify-center mb-4">
                                    {topCountries.length > 0 ? renderPieChart(topCountries.slice(0, 2)) : (
                                        <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {topCountries.slice(0, 2).map(([country, count], index) => (
                                        <div key={country} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: COLORS[index]}}></div>
                                                <span className="text-gray-600 truncate">{country}</span>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Views */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Views</h3>
                                    <span className="text-2xl font-bold text-blue-500">{clicks.length}</span>
                                </div>
                                <div className="flex justify-center mb-4">
                                    {topDevices.length > 0 ? renderPieChart(topDevices) : (
                                        <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {topDevices.slice(0, 3).map(([device, count], index) => (
                                        <div key={device} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: COLORS[index]}}></div>
                                                <span className="text-gray-600 truncate">{device}</span>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Referrers */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Referrers</h3>
                                    <span className="text-2xl font-bold text-blue-500">{getTopCounts(clicks, 'referrer').length}</span>
                                </div>
                                <div className="flex justify-center mb-4">
                                    {getTopCounts(clicks, 'referrer').length > 0 ? renderPieChart(getTopCounts(clicks, 'referrer')) : (
                                        <div className="w-20 h-20 rounded-full border-4 border-gray-200"></div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {getTopCounts(clicks, 'referrer').slice(0, 2).map(([referrer, count], index) => (
                                        <div key={referrer} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: COLORS[index]}}></div>
                                                <span className="text-gray-600 truncate">{referrer || 'Direct'}</span>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Mobile</h3>
                                    <span className="text-2xl font-bold text-blue-500">
                                        {clicks.filter(click => click.device?.toLowerCase().includes('mobile')).length}
                                    </span>
                                </div>
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                                        <Smartphone className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sites Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Sites Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-sm text-gray-600">{urlInfo.original_url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 bg-blue-300 rounded"></div>
                                        <span className="text-sm text-gray-600">t.me</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Site Trends Total */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Site Trends Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                                            <span className="text-sm text-gray-600">t.me</span>
                                        </div>
                                        <span className="text-sm">1 / 50.00 %</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                                            <span className="text-sm text-gray-600">{urlInfo.original_url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                        </div>
                                        <span className="text-sm">1 / 50.00 %</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlAnalytics;