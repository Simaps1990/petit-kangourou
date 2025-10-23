import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

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
        
        // Vérifier si l'utilisateur a déjà fermé ce bandeau
        const dismissedBanner = sessionStorage.getItem('bannerDismissed');
        const dismissedText = sessionStorage.getItem('bannerText');
        
        console.log('🔍 Bandeau déjà fermé?', dismissedBanner, 'Texte précédent:', dismissedText);
        
        // Afficher le bandeau si pas fermé ou si le texte a changé
        if (!dismissedBanner || dismissedText !== data.banner_text) {
          console.log('👁️ Affichage du bandeau');
          setIsVisible(true);
          setTimeout(() => window.dispatchEvent(new Event('banner-changed')), 100);
        } else {
          console.log('🚫 Bandeau masqué (déjà fermé)');
        }
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
      sessionStorage.removeItem('bannerDismissed');
      sessionStorage.removeItem('bannerText');
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
    setTimeout(() => window.dispatchEvent(new Event('banner-changed')), 100);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div id="announcement-banner" className="fixed left-0 right-0 w-full bg-gradient-to-r from-[#c27275] to-[#d88a8d] text-white py-2 md:py-3 px-2 md:px-4 shadow-md z-40" style={{ top: '64px' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
        <div className="flex-1 text-center min-w-0">
          <p className="text-xs md:text-sm lg:text-base font-medium break-words">
            {bannerText}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fermer le bandeau"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );
}
