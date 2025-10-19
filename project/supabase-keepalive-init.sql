-- Initialisation de la table keepalive
-- À exécuter dans l'éditeur SQL de Supabase après avoir créé la table

-- Insérer la première entrée
INSERT INTO _keepalive (id, last_ping)
VALUES ('ping', TIMEZONE('utc', NOW()))
ON CONFLICT (id) DO NOTHING;
