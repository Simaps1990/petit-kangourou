import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Afficher la bannière après un court délai
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t-2 border-[#c27275] shadow-lg animate-slide-up">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-[#c27275] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-[#c27275] mb-1">
                Nous utilisons des cookies
              </h3>
              <p className="text-sm text-gray-600">
                Ce site utilise des cookies pour améliorer votre expérience de navigation, 
                analyser le trafic et personnaliser le contenu. En continuant à utiliser ce site, 
                vous acceptez notre utilisation des cookies. Pour en savoir plus, consultez notre{' '}
                <a 
                  href="/mentions-legales" 
                  className="text-[#c27275] underline hover:text-[#a05d60]"
                >
                  politique de confidentialité
                </a>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={rejectCookies}
              className="flex-1 md:flex-none px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none px-6 py-2 text-sm bg-[#c27275] text-white rounded-lg hover:bg-[#a05d60] transition-colors font-medium"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
