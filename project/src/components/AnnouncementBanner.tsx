import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const loadBannerSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('banner_enabled, banner_text')
        .eq('id', 'main')
        .single();
      
      if (data && !error && data.banner_enabled && data.banner_text) {
        setBannerText(data.banner_text);
        
        // Vérifier si l'utilisateur a déjà fermé ce bandeau
        const dismissedBanner = sessionStorage.getItem('bannerDismissed');
        const dismissedText = sessionStorage.getItem('bannerText');
        
        // Afficher le bandeau si pas fermé ou si le texte a changé
        if (!dismissedBanner || dismissedText !== data.banner_text) {
          setIsVisible(true);
        }
      }
    };
    
    loadBannerSettings();
    
    // Écouter les changements de paramètres
    const handleSettingsUpdate = () => {
      loadBannerSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('bannerDismissed', 'true');
    sessionStorage.setItem('bannerText', bannerText);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#c27275] to-[#d88a8d] text-white py-3 px-4 shadow-md relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-sm md:text-base font-medium">
            {bannerText}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fermer le bandeau"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
