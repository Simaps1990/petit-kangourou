# Configuration Supabase pour Petit Kangourou

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet :
   - Nom : `petit-kangourou`
   - Mot de passe de base de données : (choisissez un mot de passe fort)
   - Région : Europe (Frankfurt) pour de meilleures performances

## 2. Créer les tables de la base de données

Dans l'éditeur SQL de Supabase, exécutez le script SQL fourni dans `supabase-schema.sql`

## 3. Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Créez l'utilisateur admin :
   - Email : `petit-kangourou@hotmail.com`
   - Password : `Chocol@t31!`
   - Auto Confirm User : **Activé**

## 4. Configurer les variables d'environnement

1. Dans Supabase, allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public** key

3. Créez un fichier `.env` à la racine du projet avec ces valeurs

## 5. Tester la connexion

Lancez le projet et vérifiez que la connexion à Supabase fonctionne.
