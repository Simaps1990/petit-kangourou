-- Données initiales pour Petit Kangourou
-- À exécuter dans l'éditeur SQL de Supabase APRÈS avoir créé les tables

-- ============================================
-- SERVICES
-- ============================================
INSERT INTO services (id, title, description, price, duration, icon, max_spots, type) VALUES
('1', 'Consultation individuelle', 'Accompagnement personnalisé à domicile ou en cabinet', '60€', '1h30', 'Heart', 1, 'individual'),
('2', 'Atelier en duo/trio', 'Séance partagée avec d''autres parents', '45€', '1h30', 'Users', 3, 'group'),
('3', 'Formation complète', 'Apprentissage approfondi avec suivi personnalisé', '120€', '3h', 'Star', 1, 'individual'),
('4', 'Suivi à domicile', 'Accompagnement dans votre environnement familial', '70€', '2h', 'Clock', 1, 'individual');

-- ============================================
-- ARTICLES DE BLOG
-- ============================================
INSERT INTO blog_posts (id, title, excerpt, content, image, date, read_time, published) VALUES
('1', 
 'Les bienfaits du portage physiologique', 
 'Découvrez comment le portage renforce le lien parent-enfant et favorise le développement de bébé.',
 'Le portage physiologique offre de nombreux bienfaits tant pour le bébé que pour le parent. Cette pratique ancestrale favorise le développement harmonieux de l''enfant tout en renforçant le lien d''attachement. Les bébés portés pleurent moins, dorment mieux et développent une meilleure régulation émotionnelle. Pour les parents, le portage facilite les déplacements, libère les mains et permet de répondre rapidement aux besoins de bébé. C''est un moment privilégié de complicité et de tendresse qui contribue au bien-être de toute la famille.',
 'https://images.pexels.com/photos/1257110/pexels-photo-1257110.jpeg?auto=compress&cs=tinysrgb&w=800',
 '15 Mars 2025',
 '5 min',
 true),

('2',
 'Choisir le bon porte-bébé',
 'Guide complet pour sélectionner l''équipement adapté à votre morphologie et vos besoins.',
 'Le choix d''un porte-bébé adapté est crucial pour le confort et la sécurité de votre enfant. Il existe plusieurs types de porte-bébés : écharpes tissées, écharpes extensibles, slings, mei-tai et préformés. Chacun a ses avantages selon l''âge de bébé, votre morphologie et vos habitudes. L''important est de privilégier un portage physiologique qui respecte la position naturelle de bébé en ''M'' et maintient sa colonne vertébrale en forme de C. Je vous accompagne dans ce choix pour trouver le porte-bébé qui vous conviendra parfaitement.',
 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=800',
 '10 Mars 2025',
 '7 min',
 true),

('3',
 'Positions de portage par âge',
 'Apprenez les différentes positions adaptées à chaque étape de développement de votre enfant.',
 'Les positions de portage évoluent avec l''âge et le développement de votre bébé. De la naissance à 4 mois, privilégiez le portage ventral haut, bébé contre votre poitrine. À partir de 4-6 mois, vous pouvez varier avec le portage ventral bas et commencer le portage sur la hanche. Le portage dorsal est possible dès que bébé tient bien sa tête et son dos, généralement vers 6 mois. Chaque position a ses spécificités et ses avantages. Je vous enseigne les bonnes techniques pour chaque étape du développement de votre enfant.',
 'https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=800',
 '5 Mars 2025',
 '6 min',
 true);

-- ============================================
-- FAQ
-- ============================================
INSERT INTO faqs (id, question, answer, "order") VALUES
('1', 'À partir de quel âge peut-on porter bébé ?', 'Le portage peut commencer dès la naissance avec les bonnes techniques et équipements adaptés.', 1),
('2', 'Combien de temps dure une consultation ?', 'Une consultation individuelle dure environ 1h30, le temps nécessaire pour bien apprendre.', 2),
('3', 'Faut-il acheter un porte-bébé avant la consultation ?', 'Non, je vous conseille d''abord sur le choix adapté à votre morphologie et vos besoins.', 3),
('4', 'Les consultations ont-elles lieu à domicile ?', 'Oui, je me déplace à votre domicile dans un rayon de 20km autour de Versailles.', 4),
('5', 'Peut-on faire du portage avec des jumeaux ?', 'Absolument ! Il existe des techniques spécifiques que je peux vous enseigner.', 5),
('6', 'Jusqu''à quel poids peut-on porter son enfant ?', 'Avec les bonnes techniques, on peut porter jusqu''à 20kg environ, selon votre condition physique.', 6);

-- ============================================
-- PARAMÈTRES DU SITE
-- ============================================
INSERT INTO site_settings (id, site_name, site_description, contact_email, contact_phone, address) VALUES
('main', 
 'Petit Kangourou', 
 'Monitrice de portage physiologique certifiée à Versailles. Accompagnement personnalisé pour créer un lien unique avec votre bébé.',
 'paola.paviot@gmail.com',
 '06 XX XX XX XX',
 'Versailles, France');

-- ============================================
-- CRÉNEAUX HORAIRES (Exemple pour les 7 prochains jours)
-- ============================================
-- Vous pouvez ajuster les dates selon vos besoins
INSERT INTO time_slots (id, date, time, available, max_spots, booked_spots) VALUES
-- Lundi
('2025-01-06-09:00', '2025-01-06', '09:00', true, 1, 0),
('2025-01-06-11:00', '2025-01-06', '11:00', true, 1, 0),
('2025-01-06-14:00', '2025-01-06', '14:00', true, 1, 0),
('2025-01-06-16:00', '2025-01-06', '16:00', true, 1, 0),
-- Mardi
('2025-01-07-09:00', '2025-01-07', '09:00', true, 1, 0),
('2025-01-07-11:00', '2025-01-07', '11:00', true, 1, 0),
('2025-01-07-14:00', '2025-01-07', '14:00', true, 1, 0),
('2025-01-07-16:00', '2025-01-07', '16:00', true, 1, 0),
-- Mercredi
('2025-01-08-09:00', '2025-01-08', '09:00', true, 1, 0),
('2025-01-08-11:00', '2025-01-08', '11:00', true, 1, 0),
('2025-01-08-14:00', '2025-01-08', '14:00', true, 1, 0),
('2025-01-08-16:00', '2025-01-08', '16:00', true, 1, 0),
-- Jeudi
('2025-01-09-09:00', '2025-01-09', '09:00', true, 1, 0),
('2025-01-09-11:00', '2025-01-09', '11:00', true, 1, 0),
('2025-01-09-14:00', '2025-01-09', '14:00', true, 1, 0),
('2025-01-09-16:00', '2025-01-09', '16:00', true, 1, 0),
-- Vendredi
('2025-01-10-09:00', '2025-01-10', '09:00', true, 1, 0),
('2025-01-10-11:00', '2025-01-10', '11:00', true, 1, 0),
('2025-01-10-14:00', '2025-01-10', '14:00', true, 1, 0),
('2025-01-10-16:00', '2025-01-10', '16:00', true, 1, 0),
-- Samedi
('2025-01-11-09:00', '2025-01-11', '09:00', true, 1, 0),
('2025-01-11-11:00', '2025-01-11', '11:00', true, 1, 0),
('2025-01-11-14:00', '2025-01-11', '14:00', true, 1, 0);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Vérifiez que tout est bien inséré
SELECT 'Services:' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'Blog posts:', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'FAQs:', COUNT(*) FROM faqs
UNION ALL
SELECT 'Time slots:', COUNT(*) FROM time_slots
UNION ALL
SELECT 'Settings:', COUNT(*) FROM site_settings;
