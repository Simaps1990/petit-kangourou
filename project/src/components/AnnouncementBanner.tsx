import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');

  // Initialiser la variable CSS à 0
  useEffect(() => {
    document.documentElement.style.setProperty('--banner-height', '0px');
  }, []);

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
        document.documentElement.style.setProperty('--banner-height', '0px');
        return;
      }
      
      if (data && data.banner_enabled) {
        console.log('✅ Bandeau activé avec texte:', data.banner_text);
        setBannerText(data.banner_text || '');
        setIsVisible(true);
        // Attendre que le bandeau soit rendu pour calculer sa hauteur
        setTimeout(() => {
          const banner = document.getElementById('announcement-banner');
          const height = banner ? banner.offsetHeight : 0;
          document.documentElement.style.setProperty('--banner-height', `${height}px`);
          console.log('📏 Hauteur bandeau:', height, 'px');
        }, 100);
      } else {
        console.log('⚠️ Bandeau désactivé ou pas de données');
        setIsVisible(false);
        document.documentElement.style.setProperty('--banner-height', '0px');
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
    <div id="announcement-banner" className="fixed left-0 right-0 w-full bg-gradient-to-r from-[#c27275] to-[#d88a8d] text-white py-1 md:py-1.5 px-2 md:px-4 z-40 overflow-hidden relative" style={{ top: '64px' }}>
      {/* Animation de lueur */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute h-full w-[1280px] bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
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
