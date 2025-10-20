import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as icons from 'lucide-react';
import { differenceInSeconds, parseISO } from 'date-fns';

interface LandingPageData {
  background_type: string;
  background_color: string | null;
  background_gradient_start: string | null;
  background_gradient_end: string | null;
  background_image_url: string | null;
  layout_type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  button_color: string | null;
  button_url: string | null;
  button_icon: string | null;
  button_animation: string | null;
  show_countdown: boolean | null;
  redirect_delay: number | null;
  profile_photo_source: string | null;
  profile_photo_url: string | null;
  profile_photo_bucket_path: string | null;
  user_name: string | null;
  user_bio: string | null;
  show_location: boolean;
  show_verified_badge: boolean;
  countdown_to: string | null;
}

const DynamicIcon = ({ name, ...props }: { name: string, [key: string]: any }) => {
    const IconComponent = icons[name as keyof typeof icons] as React.ComponentType<any>;
    if (!IconComponent) return <icons.ArrowRight {...props} />;
    return <IconComponent {...props} />;
};

const LandingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<LandingPageData | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [visitorLocation, setVisitorLocation] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!code) {
      navigate('/', { replace: true });
      return;
    }
    
    const fetchData = async () => {
      try {
        // Use the same RPC as Redirect to ensure consistency and bypass RLS
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_redirect_url', { p_code: code })
          .maybeSingle();

        if (rpcError || !rpcData) {
          console.error('Landing: code not found or RPC error:', rpcError);
          navigate('/404', { replace: true });
          return;
        }

        setTargetUrl(rpcData.original_url);

        const { data: landingData } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('short_url_id', rpcData.id)
          .eq('enabled', true)
          .maybeSingle();
        
        if (landingData) {
          const configData: any = landingData;
          setConfig(configData);
          if (configData.countdown_to) {
            const seconds = differenceInSeconds(parseISO(configData.countdown_to), new Date());
            setCountdown(seconds > 0 ? seconds : 0);
          } else if (configData.show_countdown) {
            setCountdown(configData.redirect_delay || 3);
          }
        } else {
          // No landing page configured, redirect directly to target URL
          window.location.href = rpcData.original_url;
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [code, navigate]);

  useEffect(() => {
    if (config?.show_location) {
      fetch('https://ip-api.com/json')
        .then(res => res.json())
        .then(data => {
          if (data.city && data.country) setVisitorLocation(`${data.city}, ${data.country}`);
        })
        .catch(console.error);
    }
  }, [config?.show_location]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (!config?.countdown_to) window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, targetUrl, config?.countdown_to]);

  const handleButtonClick = () => { window.location.href = config?.button_url || targetUrl; };

  const profileImageUrl = useMemo(() => {
      if (!config) return '';
      if (config.profile_photo_source === 'bucket' && config.profile_photo_bucket_path) {
          const { data } = supabase.storage.from('profil').getPublicUrl(config.profile_photo_bucket_path);
          return data.publicUrl;
      }
      return config.profile_photo_url || '';
  }, [config]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-center"><div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-lg text-gray-600">Chargement...</p></div></div>;
  }

  if (!config) return null;

  const getBackgroundStyle = () => {
    switch (config.background_type) {
      case 'gradient': return { background: `linear-gradient(135deg, ${config.background_gradient_start}, ${config.background_gradient_end})` };
      case 'solid': return { backgroundColor: config.background_color };
      case 'image': return { backgroundImage: `url(${config.background_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      default: return {};
    }
  };

  const formatCountdown = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}j ` : ''}${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  }

  const renderContent = () => (
    <div className="space-y-6 text-center text-white">
        {profileImageUrl && <img src={profileImageUrl} alt="Profile" className="h-24 w-24 rounded-full mx-auto shadow-lg" />}
        {config.user_name && 
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold">{config.user_name}</h2>
                {config.show_verified_badge && <icons.CheckCircle className="h-6 w-6 text-blue-400" fill="white" />}
            </div>
        }
        {config.user_bio && <p className="text-white/80 max-w-md mx-auto">{config.user_bio}</p>}
        {visitorLocation && config.show_location && 
            <div className="flex items-center justify-center gap-2 text-sm bg-black/10 backdrop-blur-sm rounded-full px-3 py-1 max-w-xs mx-auto">
                <icons.MapPin className="h-4 w-4" />
                <span>{visitorLocation}</span>
            </div>
        }

        <h1 className="text-4xl font-bold">{config.title}</h1>
        {config.subtitle && <p className="text-xl text-white/90">{config.subtitle}</p>}
        {config.description && <p className="text-white/80 max-w-md mx-auto">{config.description}</p>}

        {countdown !== null && countdown > 0 && (
            <div className="text-4xl font-bold text-white tabular-nums">
                {formatCountdown(countdown)}
            </div>
        )}

        <Button 
            onClick={handleButtonClick} 
            style={{ backgroundColor: config.button_color }} 
            className={cn(
                "text-white hover:opacity-90 transition-opacity px-8 py-6 text-lg shadow-lg",
                config.button_animation
            )}
        >
            {config.button_text || 'Continuer'}
            <DynamicIcon name={config.button_icon} className="ml-2 h-5 w-5" />
        </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={getBackgroundStyle()}>
        {config.layout_type === 'card' ? (
            <div className="max-w-2xl mx-auto bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
                {renderContent()}
            </div>
        ) : renderContent()}
    </div>
  );
};

export default LandingPage;
