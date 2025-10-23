import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');

  useEffect(() => {
    const loadBannerSettings = async () => {
      console.log('🔄 Chargement des paramètres du bandeau...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('banner_enabled, banner_text')
        .eq('id', 'main')
        .single();
      
      console.log('📊 Données reçues:', data);
      console.log('❌ Erreur:', error);
      
      if (error) {
        console.error('Erreur lors du chargement du bandeau:', error);
        return;
      }
      
      if (data && data.banner_enabled) {
        console.log('✅ Bandeau activé avec texte:', data.banner_text);
        setBannerText(data.banner_text || '');
        setIsVisible(true);
        setTimeout(() => window.dispatchEvent(new Event('banner-changed')), 100);
      } else {
        console.log('⚠️ Bandeau désactivé ou pas de données');
        setIsVisible(false);
        setTimeout(() => window.dispatchEvent(new Event('banner-changed')), 100);
      }
    };
    
    loadBannerSettings();
    
    // Écouter les changements de paramètres
    const handleSettingsUpdate = () => {
      console.log('🔔 Événement settings-updated reçu');
      loadBannerSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div id="announcement-banner" className="fixed left-0 right-0 w-full bg-gradient-to-r from-[#c27275] to-[#d88a8d] text-white py-1.5 md:py-2 px-2 md:px-4 shadow-md z-40 overflow-hidden relative" style={{ top: '64px' }}>
      {/* Animation de lueur */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute h-full w-32 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" style={{ left: '-128px' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center">
          <p className="text-xs md:text-sm lg:text-base font-medium break-words">
            {bannerText}
          </p>
        </div>
      </div>
    </div>
  );
}
