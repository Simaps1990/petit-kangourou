# Bandeau d'annonce

## Description
Un bandeau d'annonce personnalisable qui s'affiche en haut de toutes les pages du site. Idéal pour communiquer des informations importantes, des promotions ou des actualités à vos visiteurs.

## Fonctionnalités

### Pour l'administrateur
- **Activation/Désactivation** : Activez ou désactivez le bandeau en un clic depuis la page Paramètres de l'admin
- **Personnalisation du texte** : Rédigez le message que vous souhaitez afficher
- **Aperçu en temps réel** : Visualisez le rendu du bandeau avant de le publier
- **Gestion simple** : Tous les paramètres sont accessibles dans l'onglet "Paramètres" de l'admin

### Pour les visiteurs
- **Affichage en haut du site** : Le bandeau s'affiche au-dessus de la navigation
- **Design attractif** : Style dégradé rose cohérent avec la charte graphique du site
- **Bouton de fermeture** : Les visiteurs peuvent fermer le bandeau s'ils le souhaitent
- **Persistance intelligente** : Le bandeau reste fermé pendant la session en cours

## Installation

### 1. Mise à jour de la base de données
Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Migration pour ajouter le bandeau d'annonce
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS banner_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_text TEXT DEFAULT '';

-- Mettre à jour les données existantes
UPDATE site_settings 
SET banner_enabled = false, 
    banner_text = '' 
WHERE id = 'main';
```

Le fichier `supabase-add-banner.sql` contient ce script.

### 2. Fichiers créés/modifiés
- ✅ `src/components/AnnouncementBanner.tsx` - Nouveau composant du bandeau
- ✅ `src/App.tsx` - Intégration du bandeau dans l'application
- ✅ `src/pages/AdminPage.tsx` - Interface de gestion dans l'admin
- ✅ `supabase-schema.sql` - Schéma mis à jour
- ✅ `supabase-add-banner.sql` - Script de migration

## Utilisation

### Activer le bandeau
1. Connectez-vous à l'interface d'administration (`/admin`)
2. Allez dans l'onglet **Paramètres**
3. Faites défiler jusqu'à la section **Bandeau d'annonce**
4. Cochez la case **Activer le bandeau d'annonce**
5. Saisissez votre message dans le champ **Texte du bandeau**
6. Visualisez l'aperçu
7. Cliquez sur **Sauvegarder les paramètres**

### Exemples de messages
- `🎉 Offre spéciale : -20% sur tous les ateliers en groupe jusqu'au 31 mars !`
- `📢 Nouveaux créneaux disponibles pour le mois d'avril - Réservez vite !`
- `✨ Découvrez notre nouveau pack Premium : 3 séances + 1 suivi à domicile`
- `🎄 Bon cadeau de Noël disponible - Offrez un moment unique !`

### Désactiver le bandeau
1. Retournez dans **Paramètres** > **Bandeau d'annonce**
2. Décochez la case **Activer le bandeau d'annonce**
3. Cliquez sur **Sauvegarder les paramètres**

## Caractéristiques techniques

### Style
- Couleur de fond : Dégradé rose (#c27275 → #d88a8d)
- Texte : Blanc, centré
- Hauteur : Adaptative selon le contenu
- Position : Fixe en haut du site (z-index: 40)

### Comportement
- Le bandeau se charge automatiquement au chargement de la page
- Les visiteurs peuvent le fermer avec le bouton X
- Une fois fermé, il reste masqué pendant toute la session
- Si le texte change, le bandeau réapparaît même s'il avait été fermé
- Les changements dans l'admin sont immédiatement visibles sur le site

### Responsive
- S'adapte automatiquement à toutes les tailles d'écran
- Taille de texte ajustée sur mobile (text-sm) et desktop (text-base)

## Notes
- Le bandeau est visible sur toutes les pages du site
- Il ne gêne pas la navigation car il est positionné au-dessus
- Les utilisateurs peuvent toujours accéder à toutes les fonctionnalités même si le bandeau est affiché
