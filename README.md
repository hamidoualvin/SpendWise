# SpendWise

**SpendWise** est une application de gestion financière moderne conçue pour aider les utilisateurs à suivre leurs dépenses, fixer des objectifs budgétaires et obtenir des analyses intelligentes de leurs habitudes financières. Construite avec Next.js, React, Firebase et Google Genkit, SpendWise offre une expérience transparente et intuitive pour gérer les finances personnelles.

## Fonctionnalités

### Fonctionnalités Principales
- **Suivi des Dépenses**: Entrez manuellement revenus et dépenses pour surveiller vos habitudes de dépenses en temps réel
- **Catégories de Dépenses**: Organisez les dépenses par catégories prédéfinies (alimentation, transport, divertissement, etc.)
- **Objectifs Budgétaires**: Définissez des limites budgétaires mensuelles par catégorie et suivez votre progression
- **Analyses Intelligentes**: Obtenez des analyses de dépenses et des recommandations alimentées par Google Genkit
- **Vue d'Ensemble du Tableau de Bord**: Visualisez les métriques clés, les résumés budgétaires et les transactions récentes

### Fonctionnalités Techniques
- **Authentification Sécurisée**: Authentification Firebase pour la gestion sécurisée des comptes utilisateurs
- **Synchronisation en Temps Réel**: Synchronisation des données cloud avec Firestore
- **Design Réactif**: Fonctionne de manière transparente sur ordinateur, tablette et appareils mobiles
- **Interface Moderne**: Interface belle et intuitive construite avec les composants Radix UI
- **Performance**: Rapide et optimisé avec Next.js 15 et React 19

## Design

- **Couleur Principale**: Bleu Profond (#3F51B5) - Inspire confiance et sécurité
- **Arrière-plan**: Bleu Clair (#E8EAF6) - Esthétique calme et professionnelle
- **Couleur d'Accent**: Violet (#7E57C2) - Met en avant les éléments interactifs
- **Police**: PT Sans - Typographie moderne, lisible et accessible
- **Mise en Page**: Design épuré basé sur des cartes avec esthétique minimaliste
- **Animations**: Transitions subtiles pour les retours utilisateur et l'engagement

## Démarrage

### Prérequis

Avant de commencer, assurez-vous d'avoir :
- **Node.js** 16.x ou supérieur
- **npm** ou **yarn** gestionnaire de paquets
- Un projet Firebase avec Firestore et l'authentification activés
- Les identifiants d'accès à l'API Google Genkit

### Installation

1. **Clonez le référentiel**
   ```sh
   git clone https://github.com/hamidoualvin/SpendWise.git
   cd SpendWise
   ```

2. **Installez les dépendances**
   ```sh
   npm install
   # ou
   yarn install
   ```

3. **Configurez les variables d'environnement**
   
   Créez un fichier `.env.local` dans le répertoire racine avec votre configuration Firebase et API :
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GENKIT_API_KEY=your_genkit_api_key
   ```

4. **Lancez le serveur de développement**
   ```sh
   npm run dev
   # ou
   yarn dev
   ```

   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## Utilisation

### Commandes de Développement

- **Démarrer le serveur de développement**: `npm run dev`
- **Démarrer le serveur d'IA Genkit**: `npm run genkit:dev`
- **Surveiller les modifications Genkit**: `npm run genkit:watch`
- **Construire pour la production**: `npm run build`
- **Démarrer le serveur de production**: `npm start`
- **Exécuter le linter**: `npm run lint`
- **Vérification des types**: `npm run typecheck`

### Flux de Travail de l'Application

1. **Inscription/Connexion**: Créez un compte ou connectez-vous avec vos identifiants
2. **Ajouter des Transactions**: Enregistrez vos revenus et dépenses
3. **Organiser**: Attribuez des catégories à vos transactions
4. **Définir des Budgets**: Définissez des objectifs budgétaires mensuels par catégorie
5. **Surveiller**: Suivez vos dépenses par rapport à vos budgets
6. **Analyser**: Obtenez des analyses intelligentes et des recommandations de dépenses

## Structure du Projet

```
src/
├── ai/                          # Intégration AI & Genkit
│   ├── genkit.ts               # Configuration Genkit
│   ├── dev.ts                  # Configuration de développement
│   └── flows/                  # Flux de travail AI
│       └── generate-spending-insights.ts
├── app/                         # Répertoire d'application Next.js
│   ├── layout.tsx              # Mise en page racine
│   ├── page.tsx                # Page d'accueil
│   ├── auth/                   # Pages d'authentification
│   ├── budgets/                # Gestion budgétaire
│   └── transactions/           # Pages de transactions
├── components/                  # Composants React
│   ├── ui/                     # Composants UI réutilisables
│   ├── dashboard/              # Composants de tableau de bord
│   ├── transactions/           # Composants de transactions
│   ├── budgets/                # Composants budgétaires
│   └── auth/                   # Composants d'authentification
├── firebase/                    # Configuration Firebase & hooks
│   ├── config.ts               # Initialisation Firebase
│   ├── provider.tsx            # Fournisseur Firebase
│   └── firestore/              # Hooks Firestore
├── hooks/                       # Hooks React personnalisés
├── lib/                         # Utilitaires & types
│   ├── types.ts                # Types TypeScript
│   ├── utils.ts                # Fonctions d'aide
│   └── data.ts                 # Utilitaires de données
└── styles/                      # Styles globaux
```

## Stack Technologique

### Frontend
- **Next.js 15** - Framework React avec SSR et génération statique
- **React 19** - Bibliothèque UI moderne
- **TypeScript** - JavaScript sécurisé pour les types
- **Tailwind CSS** - Système de design utilitaire
- **Radix UI** - Bibliothèque de composants accessibles
- **Lucide React** - Bibliothèque d'icônes

### Services Backend
- **Firebase** - Authentification et base de données en temps réel
- **Firestore** - Base de données NoSQL cloud
- **Google Genkit** - Moteur d'analyses intelligentes

### Développement
- **PostCSS** - Outil de transformation CSS
- **ESLint** - Outil de qualité de code
- **tsx** - Exécution TypeScript pour Node.js

## Authentification

SpendWise utilise l'authentification Firebase avec support pour :
- Authentification par email et mot de passe
- Gestion sécurisée des sessions
- Mises à jour d'état d'authentification en temps réel

## Gestion des Données

- **Base de Données Firestore**: Stocke les données utilisateur, les transactions et les informations budgétaires
- **Synchronisation en Temps Réel**: Synchronisation automatique sur les appareils
- **Sécurité des Données**: Les règles Firestore assurent la confidentialité et la sécurité des données

## Fonctionnalités IA

SpendWise s'appuie sur **Google Genkit** pour fournir des analyses intelligentes :
- Analyse des modèles de dépenses
- Recommandations budgétaires
- Analyses des habitudes financières
- Suggestions personnalisées

## Support des Navigateurs

- Chrome (dernière version)
- Firefox (dernière version)
- Safari (dernière version)
- Edge (dernière version)

## Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Forkez le référentiel
2. Créez une branche de fonctionnalité (`git checkout -b feature/NouvellefonctionIncroyable`)
3. Committez vos modifications (`git commit -m 'Ajouter une nouvellefonction'`)
4. Poussez vers la branche (`git push origin feature/NouvellefonctionIncroyable`)
5. Ouvrez une demande d'ajout

## Licence

Ce projet est open source et disponible sous la licence MIT.

## Contact

Pour les questions, suggestions ou commentaires, veuillez contacter via [GitHub Issues](https://github.com/hamidoualvin/SpendWise/issues).

---

**Réalisé par l'équipe SpendWise**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [your_email@example.com](mailto:your_email@example.com)
Project Link: [https://github.com/your_username/your_app](https://github.com/your_username/your_app)
