# Configuration du Keep-Alive Supabase

Ce guide explique comment configurer le système de keep-alive pour éviter que Supabase ne se désactive après 7 jours d'inactivité.

## 🎯 Objectif

Supabase désactive automatiquement les bases de données gratuites après 7 jours d'inactivité. Pour éviter cela, nous avons mis en place un système qui génère automatiquement une activité silencieuse tous les 4 jours.

## 📋 Étapes de configuration

### 1. Créer la table dans Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor**
3. Exécutez le contenu du fichier `supabase-schema.sql` (si pas déjà fait)
4. Ou exécutez uniquement cette partie :

```sql
-- Table invisible pour maintenir Supabase actif (keep-alive)
CREATE TABLE _keepalive (
  id TEXT PRIMARY KEY DEFAULT 'ping',
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activer RLS
ALTER TABLE _keepalive ENABLE ROW LEVEL SECURITY;

-- Politique d'accès public
CREATE POLICY "Public access for keepalive" ON _keepalive FOR ALL USING (true) WITH CHECK (true);

-- Initialiser la table
INSERT INTO _keepalive (id, last_ping)
VALUES ('ping', TIMEZONE('utc', NOW()))
ON CONFLICT (id) DO NOTHING;
```

### 2. Déployer la fonction Netlify

La fonction `netlify/functions/keepalive.ts` est déjà créée. Elle sera automatiquement déployée avec votre site Netlify.

**URL de la fonction après déploiement :**
```
https://votre-site.netlify.app/.netlify/functions/keepalive
```

### 3. Tester la fonction manuellement

Après le déploiement, testez la fonction en visitant l'URL dans votre navigateur ou avec curl :

```bash
curl https://votre-site.netlify.app/.netlify/functions/keepalive
```

Vous devriez recevoir une réponse JSON :
```json
{
  "success": true,
  "message": "Supabase keepalive ping successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Configurer le Cron Job (IMPORTANT)

Vous devez configurer un service externe pour appeler automatiquement cette fonction tous les 4 jours.

#### Option A : cron-job.org (Recommandé - Gratuit)

1. Créez un compte sur [cron-job.org](https://cron-job.org)
2. Créez un nouveau cron job :
   - **Title** : Supabase Keepalive
   - **URL** : `https://votre-site.netlify.app/.netlify/functions/keepalive`
   - **Schedule** : Tous les 4 jours
     - Sélectionnez "Every 4 days" ou configurez manuellement
   - **Enabled** : ✅ Oui
3. Sauvegardez

#### Option B : EasyCron (Gratuit)

1. Créez un compte sur [easycron.com](https://www.easycron.com)
2. Créez un nouveau cron job :
   - **URL** : `https://votre-site.netlify.app/.netlify/functions/keepalive`
   - **Cron Expression** : `0 0 */4 * *` (tous les 4 jours à minuit)
3. Sauvegardez

#### Option C : UptimeRobot (Alternative)

1. Créez un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Créez un nouveau monitor :
   - **Monitor Type** : HTTP(s)
   - **URL** : `https://votre-site.netlify.app/.netlify/functions/keepalive`
   - **Monitoring Interval** : 96 heures (4 jours)
3. Sauvegardez

## 🔍 Vérification

### Vérifier que le système fonctionne

1. Dans Supabase, allez dans **Table Editor**
2. Ouvrez la table `_keepalive`
3. Vérifiez que le champ `last_ping` est mis à jour régulièrement

### Logs de la fonction

Pour voir les logs de la fonction Netlify :
1. Allez sur votre dashboard Netlify
2. Sélectionnez votre site
3. Allez dans **Functions**
4. Cliquez sur `keepalive`
5. Consultez les logs

## ⚙️ Configuration avancée

### Changer la fréquence

Pour changer la fréquence du ping :
- Modifiez la configuration de votre cron job externe
- Recommandation : entre 3 et 6 jours (pour rester sous la limite de 7 jours)

### Notifications

Certains services de cron (comme cron-job.org) peuvent vous envoyer des notifications par email si le ping échoue.

## 🛠️ Dépannage

### La fonction retourne une erreur 500

- Vérifiez que les variables d'environnement Supabase sont configurées dans Netlify
- Vérifiez que la table `_keepalive` existe dans Supabase

### Le cron job ne s'exécute pas

- Vérifiez que le cron job est activé
- Vérifiez l'URL de la fonction
- Consultez les logs du service de cron

### Supabase se désactive quand même

- Vérifiez la dernière date de `last_ping` dans la table `_keepalive`
- Vérifiez que le cron job s'exécute bien tous les 4 jours
- Consultez les logs de la fonction Netlify

## 📊 Monitoring

Pour un monitoring optimal :
1. Configurez des notifications d'échec sur votre service de cron
2. Vérifiez régulièrement la table `_keepalive` dans Supabase
3. Consultez les logs Netlify en cas de problème

## 💡 Notes importantes

- ✅ La table `_keepalive` est invisible pour les utilisateurs
- ✅ L'opération est très légère (pas d'impact sur les performances)
- ✅ Gratuit avec les plans gratuits de Netlify et des services de cron
- ✅ Fonctionne 24/7 sans intervention manuelle
