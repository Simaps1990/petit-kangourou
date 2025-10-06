# 🦘 Petit Kangourou - Site de Portage Physiologique

Site web professionnel pour Paola, monitrice de portage physiologique à Versailles.

## 🚀 Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Emails**: Service d'email intégré (Resend/SendGrid)
- **Routing**: React Router DOM

## 📋 Fonctionnalités

### Pour les visiteurs
- ✅ Page d'accueil avec présentation des services
- ✅ Système de réservation en ligne
- ✅ Formulaire de contact
- ✅ Blog avec articles sur le portage
- ✅ FAQ dynamique
- ✅ Témoignages clients

### Pour l'administrateur
- ✅ Authentification sécurisée (email + mot de passe)
- ✅ Tableau de bord complet
- ✅ Gestion des réservations
- ✅ Gestion des créneaux horaires
- ✅ Gestion des services
- ✅ Gestion du blog
- ✅ Gestion des FAQ
- ✅ Paramètres du site

## 🔧 Installation

### 1. Cloner le projet

```bash
cd project
npm install
```

### 2. Configuration Supabase

#### Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Notez votre **Project URL** et **anon public key**

#### Créer les tables

Dans l'éditeur SQL de Supabase, exécutez le fichier `supabase-schema.sql` fourni.

#### Créer l'utilisateur admin

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Email: `petit-kangourou@hotmail.com`
4. Password: `Chocol@t31!`
5. ✅ Cochez **Auto Confirm User**

### 3. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_publique
VITE_ADMIN_EMAIL=petit-kangourou@hotmail.com
```

### 4. Lancer le projet

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

## 🔐 Connexion Admin

- **URL**: `http://localhost:5173/admin`
- **Email**: `petit-kangourou@hotmail.com`
- **Mot de passe**: `Chocol@t31!`

## 📧 Configuration des emails (Optionnel)

Pour activer l'envoi d'emails réels :

### Option 1: Resend (Recommandé)

1. Créez un compte sur [resend.com](https://resend.com)
2. Obtenez votre clé API
3. Ajoutez dans `.env`:
   ```env
   VITE_RESEND_API_KEY=re_xxxxx
   ```
4. Décommentez le code dans `src/lib/email.ts`

### Option 2: SendGrid

1. Créez un compte sur [sendgrid.com](https://sendgrid.com)
2. Obtenez votre clé API
3. Adaptez le code dans `src/lib/email.ts`

## 📁 Structure du projet

```
project/
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Configuration Supabase
│   │   ├── auth.ts           # Service d'authentification
│   │   └── email.ts          # Service d'envoi d'emails
│   ├── pages/
│   │   ├── HomePage.tsx      # Page d'accueil
│   │   ├── BookingPage.tsx   # Page de réservation
│   │   ├── ContactPage.tsx   # Page de contact
│   │   └── AdminPage.tsx     # Interface d'administration
│   ├── App.tsx               # Composant principal
│   └── main.tsx              # Point d'entrée
├── public/                   # Assets statiques
├── .env                      # Variables d'environnement (à créer)
├── .env.example              # Exemple de configuration
├── supabase-schema.sql       # Schéma de la base de données
└── SUPABASE_SETUP.md         # Guide de configuration Supabase
```

## 🗄️ Stockage des données

### Actuellement (localStorage)
Les données sont stockées localement dans le navigateur. **Attention**: elles seront perdues si vous videz le cache.

### Après configuration Supabase
Toutes les données seront stockées dans une base de données PostgreSQL hébergée sur Supabase :
- ✅ Réservations persistantes
- ✅ Services configurables
- ✅ Articles de blog
- ✅ FAQ
- ✅ Créneaux horaires
- ✅ Paramètres du site

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`.

### Déploiement recommandé

- **Netlify**: Déploiement automatique depuis Git
- **Vercel**: Optimisé pour React
- **Cloudflare Pages**: Rapide et gratuit

### Variables d'environnement en production

N'oubliez pas de configurer les variables d'environnement sur votre plateforme de déploiement :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_RESEND_API_KEY` (optionnel)

## 🔒 Sécurité

### Authentification
- ✅ Authentification via Supabase Auth (JWT)
- ✅ Email admin configuré : `petit-kangourou@hotmail.com`
- ✅ Mot de passe sécurisé : `Chocol@t31!`
- ✅ Sessions persistantes
- ✅ Déconnexion sécurisée

### Base de données
- ✅ Row Level Security (RLS) activé
- ✅ Politiques de sécurité configurées
- ✅ Accès public en lecture seule pour les données publiques
- ✅ Accès admin pour les modifications

## 📝 Notes importantes

1. **Première utilisation**: Le site fonctionne avec localStorage par défaut. Configurez Supabase pour la persistance des données.

2. **Emails**: Les emails sont simulés par défaut (console.log). Configurez un service d'email pour l'envoi réel.

3. **Images**: Les images du blog utilisent des URLs externes (Pexels). Vous pouvez les remplacer par vos propres images.

4. **Sécurité**: Ne commitez JAMAIS le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

## 🆘 Support

Pour toute question ou problème :
1. Consultez `SUPABASE_SETUP.md` pour la configuration détaillée
2. Vérifiez que toutes les variables d'environnement sont correctes
3. Assurez-vous que l'utilisateur admin est créé dans Supabase

## 📄 Licence

Propriétaire - Tous droits réservés © 2025 Petit Kangourou
