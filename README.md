# ShortLink Pro 🔗

**ShortLink Pro** est un raccourcisseur d'URLs professionnel et sécurisé, développé avec React, TypeScript et Supabase. Il offre des fonctionnalités avancées pour créer, gérer et analyser vos liens raccourcis.

## ✨ Fonctionnalités principales

### 🎯 Raccourcissement d'URLs
- **Liens personnalisés** : Créez des codes courts mémorables
- **Génération automatique** : Codes sécurisés générés automatiquement
- **Validation avancée** : Vérification de sécurité des URLs

### 🔒 Sécurité avancée
- **Protection par mot de passe** : Sécurisez vos liens sensibles
- **Date d'expiration** : Liens temporaires avec expiration automatique
- **Détection de bots** : Protection contre les accès automatisés
- **Chiffrement** : Mots de passe hashés et données sécurisées

### ⚡ Types de liens
- **Liens normaux** : Avec page de confirmation et sécurité renforcée
- **Liens directs** : Redirection immédiate pour les intégrations
- **QR Codes** : Génération automatique pour le partage mobile

### 📊 Analytics et gestion
- **Statistiques en temps réel** : Suivi des clics et performances
- **Gestion centralisée** : Interface pour organiser tous vos liens
- **Recherche et filtres** : Retrouvez rapidement vos liens
- **Tags et descriptions** : Organisation par projets ou campagnes

### 🎓 Centre d'apprentissage
- **Tutoriels interactifs** : Guides pas-à-pas pour maîtriser l'application
- **Niveaux progressifs** : Du débutant à l'expert
- **Conseils pratiques** : Meilleures pratiques et optimisations

## 🚀 Technologies utilisées

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **UI/UX** : Shadcn/ui, Lucide Icons, Radix UI
- **Sécurité** : Web Crypto API, bcrypt, validation côté client/serveur
- **Build** : Vite, ESLint, PostCSS

## 📦 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation locale

1. **Cloner le projet**
```bash
git clone <repository-url>
cd shortlink-pro
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Copiez l'URL et la clé publique dans `src/integrations/supabase/client.ts`
   - Exécutez les migrations SQL depuis le dossier `supabase/migrations/`

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## 🏗️ Architecture du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (Shadcn)
│   ├── UrlShortener.tsx # Formulaire principal
│   ├── UrlHistory.tsx   # Historique des liens
│   ├── Statistics.tsx   # Tableaux de bord
│   └── TutorialModal.tsx # Système de tutoriels
├── pages/              # Pages principales
│   ├── Index.tsx       # Page d'accueil avec onglets
│   ├── Redirect.tsx    # Gestion des redirections
│   ├── Auth.tsx        # Authentification
│   └── Tutorials.tsx   # Centre d'apprentissage
├── hooks/              # Hooks personnalisés
│   ├── useAuth.tsx     # Gestion de l'authentification
│   ├── useDatabase.tsx # Interactions base de données
│   └── use-toast.ts    # Notifications
├── utils/              # Utilitaires
│   ├── urlUtils.ts     # Validation et génération d'URLs
│   ├── securityUtils.ts # Sécurité et chiffrement
│   └── storageUtils.ts # Stockage sécurisé
├── types/              # Types TypeScript
└── integrations/       # Configuration Supabase
```

## 🔧 Configuration

### Variables d'environnement
Les clés Supabase sont configurées dans `src/integrations/supabase/client.ts` :

```typescript
const SUPABASE_URL = "votre-url-supabase"
const SUPABASE_PUBLISHABLE_KEY = "votre-cle-publique"
```

### Base de données
Le schéma de base de données inclut :
- **profiles** : Profils utilisateurs
- **shortened_urls** : URLs raccourcies avec métadonnées
- **RLS (Row Level Security)** : Sécurité au niveau des lignes
- **Triggers** : Mise à jour automatique des timestamps

## 📖 Guide d'utilisation

### 1. Créer un lien raccourci
1. Collez votre URL dans le champ principal
2. (Optionnel) Personnalisez le code court
3. (Optionnel) Configurez les options avancées
4. Cliquez sur "Raccourcir"

### 2. Options avancées
- **Description** : Ajoutez un contexte à vos liens
- **Tags** : Organisez par projet (ex: `marketing,campagne-2024`)
- **Mot de passe** : Protégez l'accès (minimum 6 caractères)
- **Expiration** : Définissez une date limite d'accès
- **Lien direct** : Redirection immédiate sans page intermédiaire

### 3. Gestion des liens
- **Recherche** : Par URL, code, description ou tags
- **Filtres** : Protégés, directs, expirés
- **Actions** : Copier, ouvrir, supprimer
- **Statistiques** : Clics, dates, performances

### 4. Analytics
- **Vue d'ensemble** : Métriques globales
- **Top performers** : Liens les plus populaires
- **Tendances** : Évolution dans le temps
- **Détails par lien** : Historique des clics

## 🔐 Sécurité

### Mesures de protection
- **Validation d'URLs** : Blocage des protocoles dangereux
- **Rate limiting** : Protection contre le spam
- **Détection de bots** : Filtrage des accès automatisés
- **Chiffrement** : Mots de passe hashés avec SHA-256
- **RLS Supabase** : Isolation des données par utilisateur

### Bonnes pratiques
- Utilisez des mots de passe forts pour les liens protégés
- Définissez des dates d'expiration pour les contenus temporaires
- Surveillez les statistiques pour détecter les usages anormaux
- Nettoyez régulièrement les liens inutiles

## 🎯 Cas d'usage

### Marketing digital
- **Campagnes publicitaires** : Liens trackés avec tags
- **Réseaux sociaux** : URLs courtes et mémorables
- **Email marketing** : Liens personnalisés et analytics

### Entreprise
- **Documents internes** : Liens protégés par mot de passe
- **Formations** : Accès temporaire avec expiration
- **Événements** : QR codes pour l'enregistrement

### Développement
- **API** : Liens directs pour les intégrations
- **Tests** : URLs temporaires pour les environnements
- **Documentation** : Liens courts vers les ressources

## 🤝 Contribution

### Développement local
1. Forkez le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

### Standards de code
- **TypeScript** : Typage strict activé
- **ESLint** : Configuration personnalisée
- **Prettier** : Formatage automatique
- **Conventions** : Nommage en camelCase, composants en PascalCase

## 📊 Métriques et performances

### Optimisations
- **Lazy loading** : Chargement différé des composants
- **Memoization** : Cache des calculs coûteux
- **Compression** : Assets optimisés pour la production
- **CDN** : Ressources statiques distribuées

### Monitoring
- **Analytics** : Suivi des performances utilisateur
- **Logs** : Journalisation des erreurs et événements
- **Métriques** : Temps de réponse et disponibilité

## 🔄 Roadmap

### Version 2.0 (Q2 2024)
- [ ] API REST publique
- [ ] Intégrations tierces (Zapier, Slack)
- [ ] Analytics avancées (géolocalisation, appareils)
- [ ] Thèmes personnalisables

### Version 2.1 (Q3 2024)
- [ ] Collaboration en équipe
- [ ] Domaines personnalisés
- [ ] A/B testing des liens
- [ ] Export des données

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Documentation
- **Tutoriels intégrés** : Centre d'apprentissage dans l'application
- **FAQ** : Questions fréquentes et solutions
- **Guides** : Documentation technique détaillée

### Contact
- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions** : Pour les questions et suggestions
- **Email** : herizobm@gmail.com

---

**ShortLink Pro** - Raccourcisseur d'URLs professionnel pour tous vos besoins de partage et d'analytics. 🚀