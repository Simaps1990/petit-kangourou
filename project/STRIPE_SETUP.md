# Configuration Stripe pour les Paiements

## 📋 Prérequis

1. Compte Stripe (créer sur https://stripe.com)
2. Packages npm installés :
   - `@stripe/stripe-js` (frontend)
   - `stripe` (backend - Netlify Functions)
   - `@types/node` (pour TypeScript)

## 🔧 Installation des dépendances backend

```bash
npm install stripe @types/node
```

## 🔑 Configuration des clés API

### 1. Récupérer vos clés Stripe

1. Connectez-vous à votre compte Stripe
2. Allez dans **Développeurs** > **Clés API**
3. Copiez :
   - **Clé publique** (commence par `pk_test_` ou `pk_live_`)
   - **Clé secrète** (commence par `sk_test_` ou `sk_live_`)

### 2. Variables d'environnement locales

Créez un fichier `.env` à la racine du projet :

```env
# Clé publique Stripe (frontend)
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique

# Clé secrète Stripe (backend)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
```

### 3. Variables d'environnement Netlify

Dans votre dashboard Netlify :

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez les variables suivantes :
   - `VITE_STRIPE_PUBLIC_KEY` = votre clé publique
   - `STRIPE_SECRET_KEY` = votre clé secrète

## 📝 Fichiers créés

### Frontend

- `src/lib/stripe.ts` - Configuration Stripe client
- `src/components/CGVModal.tsx` - Modal des CGV
- Modifications dans `src/pages/BookingPage.tsx` - Intégration du paiement

### Backend

- `netlify/functions/create-checkout-session.ts` - Fonction serverless pour créer une session de paiement

## 🔄 Flux de paiement

1. **Client remplit le formulaire** de réservation
2. **Accepte les CGV** (obligatoire)
3. **Clique sur "Procéder au paiement"**
4. **Réservation créée** avec statut "pending" dans Supabase
5. **Redirection vers Stripe Checkout**
6. **Client effectue le paiement**
7. **Redirection vers la page de confirmation**

## ⚠️ Politique d'annulation (dans les CGV)

- **Plus de 24h avant** : Remboursement intégral
- **Moins de 24h avant** : Aucun remboursement
- **Absence sans annulation** : Aucun remboursement

## 🧪 Tests

### Mode Test Stripe

Utilisez ces cartes de test :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres

## 🚀 Passage en production

1. Remplacez les clés de test par les clés de production dans Netlify
2. Activez votre compte Stripe (vérification d'identité requise)
3. Configurez les webhooks Stripe (optionnel mais recommandé)

## 🔔 Webhooks (optionnel)

Pour gérer automatiquement les paiements réussis/échoués :

1. Dans Stripe Dashboard : **Développeurs** > **Webhooks**
2. Ajoutez un endpoint : `https://votre-site.netlify.app/.netlify/functions/stripe-webhook`
3. Sélectionnez les événements :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## 📧 Support

Pour toute question sur Stripe :
- Documentation : https://stripe.com/docs
- Support : https://support.stripe.com
