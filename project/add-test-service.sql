-- Service de test à 1€ pour tester le paiement Stripe
-- À exécuter dans Supabase SQL Editor

INSERT INTO services (id, title, description, price, duration, icon, max_spots, type)
VALUES (
  '999-test',
  '🧪 TEST - Service à 1€',
  'Service de test pour vérifier le système de paiement. NE PAS UTILISER EN PRODUCTION.',
  '1€',
  '5 min',
  'baby.svg',
  10,
  'individual'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration = EXCLUDED.duration,
  icon = EXCLUDED.icon,
  max_spots = EXCLUDED.max_spots,
  type = EXCLUDED.type;
