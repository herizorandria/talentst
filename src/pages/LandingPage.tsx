import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LandingPageData {
  background_type: string;
  background_color: string;
  background_gradient_start: string;
  background_gradient_end: string;
  background_image_url: string;
  layout_type: string;
  logo_url: string;
  title: string;
  subtitle: string;
  description: string;
  redirect_mode: string;
  redirect_delay: number;
  button_text: string;
  button_color: string;
  show_countdown: boolean;
  show_url_preview: boolean;
}

const LandingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<LandingPageData | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      try {
        // Get URL info
        const { data: urlData } = await supabase
          .from('shortened_urls')
          .select('id, original_url')
          .or(`short_code.eq.${code},custom_code.eq.${code}`)
          .single();

        if (!urlData) {
          navigate('/404');
          return;
        }

        setTargetUrl(urlData.original_url);

        // Get landing page config
        const { data: landingData } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('short_url_id', urlData.id)
          .eq('enabled', true)
          .maybeSingle();

        if (landingData) {
          setConfig(landingData as LandingPageData);
          setCountdown(landingData.redirect_delay);
        } else {
          // No landing page configured, redirect immediately
          window.location.href = urlData.original_url;
        }
      } catch (error) {
        console.error('Error fetching landing page:', error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code, navigate]);

  useEffect(() => {
    if (!config || config.redirect_mode !== 'auto' || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config, countdown, targetUrl]);

  const handleManualRedirect = () => {
    window.location.href = targetUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!config) return null;

  const getBackgroundStyle = () => {
    switch (config.background_type) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${config.background_gradient_start}, ${config.background_gradient_end})`,
        };
      case 'solid':
        return {
          backgroundColor: config.background_color,
        };
      case 'image':
        return {
          backgroundImage: `url(${config.background_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return {};
    }
  };

  const renderLayout = () => {
    const content = (
      <div className="space-y-6 text-center">
        {config.logo_url && (
          <img src={config.logo_url} alt="Logo" className="h-16 mx-auto" />
        )}
        
        <h1 className="text-4xl font-bold text-white">{config.title}</h1>
        
        {config.subtitle && (
          <p className="text-xl text-white/90">{config.subtitle}</p>
        )}
        
        {config.description && (
          <p className="text-white/80 max-w-md mx-auto">{config.description}</p>
        )}

        {config.show_url_preview && targetUrl && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
            <p className="text-white/70 text-sm break-all">{targetUrl}</p>
          </div>
        )}

        {config.redirect_mode === 'auto' && config.show_countdown && (
          <div className="text-6xl font-bold text-white">
            {countdown}
          </div>
        )}

        {config.redirect_mode === 'button' && (
          <Button
            onClick={handleManualRedirect}
            style={{ backgroundColor: config.button_color }}
            className="text-white hover:opacity-90 transition-opacity px-8 py-6 text-lg"
          >
            {config.button_text}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    );

    switch (config.layout_type) {
      case 'card':
        return (
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
            {content}
          </div>
        );
      case 'split':
        return (
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12">
              {content}
            </div>
            <div className="hidden md:block">
              {config.logo_url && (
                <img src={config.logo_url} alt="Logo" className="w-full h-auto rounded-2xl shadow-2xl" />
              )}
            </div>
          </div>
        );
      case 'center':
      default:
        return content;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={getBackgroundStyle()}
    >
      {renderLayout()}
    </div>
  );
};

export default LandingPage;
