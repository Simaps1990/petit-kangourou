-- Schema SQL pour Petit Kangourou
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des réservations
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  baby_age TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
  spots_reserved INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des services
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  duration TEXT NOT NULL,
  icon TEXT NOT NULL,
  max_spots INTEGER DEFAULT 1,
  type TEXT CHECK (type IN ('individual', 'group')) DEFAULT 'individual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des créneaux horaires
CREATE TABLE time_slots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  max_spots INTEGER DEFAULT 1,
  booked_spots INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des articles de blog
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des FAQ
CREATE TABLE faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des paramètres du site
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  site_name TEXT NOT NULL,
  site_description TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  banner_enabled BOOLEAN DEFAULT false,
  banner_text TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table invisible pour maintenir Supabase actif (keep-alive)
-- Cette table est utilisée par un cron job pour éviter la désactivation après 7 jours d'inactivité
CREATE TABLE _keepalive (
  id TEXT PRIMARY KEY DEFAULT 'ping',
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_email ON bookings(client_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_time_slots_date ON time_slots(date);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);

-- Activer Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE _keepalive ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité : Lecture publique
CREATE POLICY "Public read access for services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access for time_slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Public read access for published blog_posts" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Public read access for faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT USING (true);

-- Politiques de sécurité : Création publique pour les réservations
CREATE POLICY "Public insert access for bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own bookings" ON bookings FOR SELECT USING (true);

-- Politique pour la table keepalive : accès public en lecture et mise à jour
CREATE POLICY "Public access for keepalive" ON _keepalive FOR ALL USING (true) WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
