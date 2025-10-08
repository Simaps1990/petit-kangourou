import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Baby, Calendar, MessageCircle, HelpCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import LegalPage from './pages/LegalPage';
import AdminPage from './pages/AdminPage';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Accueil', icon: Baby },
    { path: '/reservation', label: 'Réservation', icon: Calendar },
    { path: '/contact', label: 'Contact', icon: MessageCircle },
    { path: '/faq', label: 'FAQ', icon: HelpCircle }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#fff1ee]/95 backdrop-blur-sm z-50 border-b border-[#fff1ee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/kangourou.png" alt="Petit Kangourou" style={{ width: '38.58px', height: '40px' }} />
            <img src="/kangourou texte.png" alt="Petit Kangourou" style={{ width: '226px', height: '40px' }} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#c27275] text-white font-semibold shadow-md' 
                      : 'text-[#c27275] hover:bg-[#fff1ee] hover:text-[#c27275]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#c27275] hover:bg-[#fff1ee]"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#fff1ee] border-t border-[#fff1ee]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#c27275] text-white font-semibold shadow-md' 
                      : 'text-[#c27275] hover:bg-[#fff1ee] hover:text-[#c27275]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const [settings, setSettings] = useState({
    siteName: 'Petit Kangourou',
    siteDescription: 'Monitrice de portage physiologique certifiée à Versailles. Accompagnement personnalisé pour créer un lien unique avec votre bébé.',
    contactEmail: 'contact@portagedouceur.fr',
    contactPhone: '06 XX XX XX XX',
    address: 'Versailles, France'
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      
      if (data && !error) {
        setSettings({
          siteName: data.site_name,
          siteDescription: data.site_description,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          address: data.address
        });
      }
    };
    
    loadSettings();
    
    // Écouter un événement personnalisé pour les changements
    const handleSettingsUpdate = () => {
      loadSettings();
    };
    
    window.addEventListener('settings-updated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
    };
  }, []);

  return (
    <footer className="bg-[#c27275] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">{settings.siteName}</h3>
            <p className="text-sm opacity-80">
              {settings.siteDescription}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Mes accompagnements</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Séance individuelle</li>
              <li>Séance en couple</li>
              <li>Ateliers en groupe</li>
              <li>Suivi à domicile</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm opacity-80">
              <p>📍 {settings.address}</p>
              <p>📧 {settings.contactEmail}</p>
              <p>📞 {settings.contactPhone}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm opacity-80">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span>&copy; 2025 {settings.siteName}. Tous droits réservés.</span>
            <span>•</span>
            <Link to="/mentions-legales" className="hover:underline">
              Mentions légales
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reservation" element={<BookingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/mentions-legales" element={<LegalPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;