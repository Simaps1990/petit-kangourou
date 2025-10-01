# 📧 Configuration des emails avec Netlify Functions

## 🔴 Problème résolu

L'envoi d'emails depuis le navigateur causait une erreur CORS car Resend ne peut pas être appelé directement depuis le frontend.

## ✅ Solution : Netlify Functions

Les emails sont maintenant envoyés via une fonction serverless Netlify qui appelle Resend de manière sécurisée.

## 🚀 Configuration

### 1. Installer les dépendances

```bash
cd project
npm install --save-dev @netlify/functions @types/node
```

### 2. Configurer la clé API Resend sur Netlify

**IMPORTANT** : La clé doit être `RESEND_API_KEY` (sans `VITE_`) car c'est une variable serveur.

Sur Netlify :
1. **Site configuration** > **Environment variables**
2. Ajoutez :
   - Key: `RESEND_API_KEY`
   - Value: `re_votre_cle_resend`
   - Scope: **Production** (cochez "Secret")

### 3. Supprimer l'ancienne variable (optionnel)

Vous pouvez supprimer `VITE_RESEND_API_KEY` car elle n'est plus utilisée.

## 📁 Fichiers créés

- `netlify/functions/send-email.ts` : Fonction serverless qui envoie les emails
- `src/lib/email.ts` : Modifié pour appeler la fonction Netlify

## 🔒 Sécurité améliorée

✅ La clé API Resend n'est plus exposée dans le navigateur
✅ Les emails sont envoyés depuis le serveur Netlify
✅ Pas de problème CORS

## 🧪 Tester

### En local (simulation)

```bash
npm run dev
```

Les emails seront simulés car Netlify Functions ne fonctionne pas en local sans configuration supplémentaire.

### En production (Netlify)

Une fois déployé sur Netlify avec la clé `RESEND_API_KEY` configurée, les emails seront vraiment envoyés !

## 📧 Types d'emails envoyés

1. **Confirmation client** : Email avec le code de réservation
2. **Notification admin** : Email à paola.paviot@gmail.com
3. **Contact** : Formulaire de contact

## ⚠️ Note importante

En local, les emails ne seront PAS envoyés car Netlify Functions nécessite Netlify Dev ou un déploiement sur Netlify pour fonctionner.

Pour tester en local avec Netlify Functions :
```bash
npm install -g netlify-cli
netlify dev
```

Mais le plus simple est de tester directement sur Netlify après déploiement.
