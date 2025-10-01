# 📧 Configuration Resend pour l'envoi d'emails

## C'est quoi Resend ?

**Resend** est un service moderne pour envoyer des emails depuis votre site web :
- ✅ **Gratuit** : 100 emails/jour (3000/mois)
- ✅ **Simple** : Configuration en 5 minutes
- ✅ **Fiable** : Vos emails arrivent bien dans la boîte de réception

## 🚀 Configuration (5 minutes)
### Étape 1 : Créer un compte Resend

1. Allez sur **https://resend.com**
2. Cliquez sur **"Sign Up"** (en haut à droite)
3. Créez votre compte avec votre email
4. Confirmez votre email

### Étape 2 : Obtenir votre clé API

1. Une fois connecté, vous arrivez sur le tableau de bord
2. Dans le menu de gauche, cliquez sur **"API Keys"**
3. Cliquez sur le bouton **"Create API Key"**
4. Donnez un nom : `Petit Kangourou`
5. Cliquez sur **"Add"**
6. **IMPORTANT** : Copiez la clé qui commence par `re_...` (vous ne pourrez plus la voir après !)

### Étape 3 : Ajouter la clé dans votre projet

1. Ouvrez le fichier `.env` à la racine du projet
2. Ajoutez cette ligne (remplacez par votre vraie clé) :

```env
VITE_RESEND_API_KEY=re_votre_clé_copiée_ici
```

Exemple complet de `.env` :
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin
VITE_ADMIN_EMAIL=paola.paviot@gmail.com

# Resend (pour les emails)
VITE_RESEND_API_KEY=re_AbCdEfGh_1234567890
```

### Étape 4 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
npm run dev
```

## ✅ C'est tout !

Maintenant, quand quelqu'un fait une réservation :
- ✅ Le client reçoit un email de confirmation
- ✅ Vous recevez une notification sur `paola.paviot@gmail.com`

## 📧 Emails envoyés automatiquement

### 1. Confirmation de réservation (au client)
- Envoyé à l'email du client
- Contient le code de réservation
- Détails de la consultation
- Conseils pour le rendez-vous

### 2. Notification admin (à vous)
- Envoyé à `paola.paviot@gmail.com`
- Nouvelle réservation
- Coordonnées du client
- Lien vers l'admin

### 3. Message de contact
- Envoyé à `paola.paviot@gmail.com`
- Formulaire de contact du site
- Coordonnées de la personne

## ⚠️ Note importante sur l'email expéditeur

Par défaut, les emails sont envoyés depuis `onboarding@resend.dev`.

**Pour utiliser votre propre email** (ex: `contact@portagedouceur.fr`) :
1. Vous devez avoir un **nom de domaine** (ex: portagedouceur.fr)
2. Dans Resend, allez dans **"Domains"**
3. Ajoutez votre domaine et suivez les instructions
4. Modifiez la ligne 199 dans `src/lib/email.ts` :
   ```typescript
   from: 'Petit Kangourou <contact@portagedouceur.fr>',
   ```

## 🧪 Tester l'envoi d'emails

1. Lancez le site : `npm run dev`
2. Allez sur la page de réservation
3. Faites une réservation test
4. Vérifiez votre boîte email !

## 🆓 Limites du plan gratuit

- **100 emails par jour**
- **3000 emails par mois**
- Largement suffisant pour démarrer !

Si vous dépassez, vous pouvez passer au plan payant (20$/mois pour 50 000 emails).

## ❓ Problèmes courants

### Les emails n'arrivent pas
1. Vérifiez que la clé API est bien dans `.env`
2. Vérifiez que vous avez redémarré le serveur
3. Regardez la console du navigateur pour les erreurs
4. Vérifiez vos spams

### Erreur "Invalid API key"
- Votre clé API est incorrecte
- Copiez-la à nouveau depuis Resend

### Les emails vont dans les spams
- Normal avec `onboarding@resend.dev`
- Configurez votre propre domaine pour améliorer la délivrabilité

## 📞 Support

- Documentation Resend : https://resend.com/docs
- Support Resend : support@resend.com
