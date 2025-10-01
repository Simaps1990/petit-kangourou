# 🔄 Migration vers Supabase - Guide complet

## ✅ Étape 1 : Insérer les données dans Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Ouvrez votre projet
3. Allez dans **SQL Editor**
4. Copiez-collez le contenu du fichier `supabase-initial-data.sql`
5. Cliquez sur **Run** (ou F5)
6. Vérifiez que vous voyez : "Services: 4, Blog posts: 3, FAQs: 6, etc."

## ✅ Étape 2 : Modifier le code pour utiliser Supabase

Je vais maintenant modifier les fichiers pour qu'ils utilisent Supabase au lieu de localStorage.

### Fichiers à modifier :
1. `src/pages/HomePage.tsx` - Charger depuis Supabase
2. `src/pages/BookingPage.tsx` - Charger depuis Supabase
3. `src/pages/ContactPage.tsx` - Charger depuis Supabase
4. `src/pages/AdminPage.tsx` - Sauvegarder dans Supabase

## 📋 Changements principaux

### Avant (localStorage) :
```typescript
const loadServices = () => {
  const saved = localStorage.getItem('services');
  if (saved) {
    setServices(JSON.parse(saved));
  } else {
    setServices(defaultServices); // Données en dur
  }
};
```

### Après (Supabase) :
```typescript
const loadServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*');
  
  if (data && data.length > 0) {
    setServices(data);
  }
  // Plus de données par défaut !
};
```

## ⚠️ Important

Une fois la migration faite :
- ✅ Toutes les données viendront de Supabase
- ✅ Les modifications dans l'admin seront sauvegardées dans Supabase
- ✅ Plus de données en dur dans le code
- ❌ Si Supabase est vide, le site sera vide (c'est normal !)

## 🚀 Prêt pour la migration ?

Confirmez que vous avez bien exécuté le script SQL dans Supabase, et je modifie tous les fichiers !
