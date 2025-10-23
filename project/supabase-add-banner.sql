-- Migration pour ajouter le bandeau d'annonce
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter les colonnes pour le bandeau d'annonce
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_text TEXT DEFAULT '';

-- Mettre à jour les données existantes
UPDATE site_settings 
SET banner_enabled = false, 
    banner_text = '' 
WHERE id = 'main';
