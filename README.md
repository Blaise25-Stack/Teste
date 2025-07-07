# École Numérique - Système de Gestion Scolaire

Un système complet de gestion scolaire moderne avec une interface responsive et une base de données PostgreSQL robuste.

## 🚀 Fonctionnalités

### 📱 Design Responsive
- **Mobile First**: Interface optimisée pour tous les appareils (iPhone, Android, iPad, ordinateurs)
- **Navigation adaptative**: Menu hamburger sur mobile, sidebar sur desktop
- **Grilles flexibles**: Adaptation automatique du contenu selon la taille d'écran
- **Typographie responsive**: Tailles de police qui s'adaptent aux différents appareils

### 🗄️ Base de Données PostgreSQL
- **Architecture robuste**: Schéma de base de données complet avec contraintes et index
- **Intégrité des données**: Clés étrangères et contraintes de validation
- **Performance optimisée**: Index sur les colonnes fréquemment utilisées
- **Sécurité**: Gestion des permissions et des rôles utilisateurs
- **Sauvegarde automatique**: Triggers pour la mise à jour des timestamps

### 👥 Gestion des Utilisateurs
- **Rôles multiples**: Administrateur, Professeur, Parent
- **Permissions granulaires**: Contrôle d'accès fin par fonctionnalité
- **Authentification sécurisée**: Système de connexion robuste
- **Profils personnalisés**: Photos de profil et informations détaillées

### 🎓 Gestion Académique
- **Élèves**: Inscription, profils, informations médicales
- **Classes**: Organisation par niveau et année scolaire
- **Matières**: Coefficients et descriptions
- **Notes**: Système de notation flexible (devoirs, compositions, examens)
- **Présences**: Suivi quotidien avec statuts détaillés
- **Devoirs**: Gestion des travaux avec pièces jointes
- **Bulletins**: Génération automatique avec moyennes et classements

### 💰 Gestion Financière
- **Paiements**: Suivi des frais de scolarité, inscription, cantine
- **Reçus**: Génération automatique avec numérotation
- **Méthodes de paiement**: Espèces, chèque, virement, mobile money
- **Rapports financiers**: Tableaux de bord et statistiques

### 📊 Tableaux de Bord
- **Statistiques en temps réel**: Nombre d'élèves, classes, notes, paiements
- **Graphiques interactifs**: Visualisation des données importantes
- **Actions rapides**: Raccourcis vers les fonctionnalités principales
- **Notifications**: Alertes et messages importants

### 📱 Communication
- **Messages**: Système de messagerie bidirectionnelle
- **Notifications**: Alertes pour les parents
- **Actualités**: Publication d'informations importantes
- **Calendrier**: Événements et dates importantes

### 🏢 Administration
- **Personnel**: Gestion des enseignants et staff
- **Inventaire**: Suivi du matériel et équipements
- **Salles**: Planning et réservations
- **Inscriptions en ligne**: Formulaires publics d'inscription

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design responsive
- **Lucide React** pour les icônes
- **React Router** pour la navigation
- **Date-fns** pour la gestion des dates

### Backend & Base de Données
- **PostgreSQL** comme base de données principale
- **Node.js** avec le driver `pg`
- **Architecture modulaire** avec séparation des préoccupations

### Développement
- **Vite** comme bundler
- **ESLint** pour la qualité du code
- **TypeScript** pour la sécurité des types

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd school-management-system
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables de base de données dans .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=your_password
```

4. **Créer la base de données PostgreSQL**
```sql
CREATE DATABASE school_management;
```

5. **Démarrer l'application**
```bash
npm run dev
```

## 🗃️ Structure de la Base de Données

### Tables Principales

#### `users` - Utilisateurs du système
- Gestion des administrateurs, professeurs et parents
- Système de permissions granulaires
- Profils avec photos et informations de contact

#### `students` - Élèves
- Informations personnelles complètes
- Liaison avec les parents et classes
- Numéros d'élève uniques

#### `classes` - Classes scolaires
- Organisation par niveau et année
- Assignation des professeurs principaux
- Matières enseignées

#### `grades` - Notes et évaluations
- Système flexible de notation
- Gestion par trimestre
- Liaison avec élèves, matières et classes

#### `payments` - Paiements
- Suivi complet des transactions
- Génération automatique de reçus
- Différents types de frais

#### `attendance` - Présences
- Suivi quotidien des présences
- Statuts détaillés (présent, absent, retard, excusé)
- Contraintes d'unicité par élève/date

### Fonctionnalités Avancées

#### Index et Performance
- Index sur les colonnes fréquemment utilisées
- Contraintes d'intégrité référentielle
- Triggers pour la mise à jour automatique

#### Sécurité
- Validation des données au niveau base
- Contraintes CHECK pour les énumérations
- Gestion des permissions par rôle

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (xl)

### Adaptations Mobile
- Menu hamburger avec overlay
- Grilles qui s'adaptent (4 colonnes → 2 → 1)
- Typographie responsive
- Espacement optimisé pour le tactile

### Adaptations Tablet
- Sidebar rétractable
- Grilles intermédiaires
- Navigation hybride

## 🔐 Système de Permissions

### Rôles
- **Admin**: Accès complet à toutes les fonctionnalités
- **Teacher**: Gestion des classes assignées, notes, présences
- **Parent**: Consultation des informations de leurs enfants

### Permissions Granulaires
- Lecture/écriture par module
- Contrôle d'accès au niveau composant
- Validation côté serveur

## 🚀 Déploiement

### Environnement de Production

1. **Configuration PostgreSQL**
```bash
# Variables d'environnement de production
NODE_ENV=production
DB_HOST=your-production-host
DB_NAME=school_management_prod
```

2. **Build de l'application**
```bash
npm run build
```

3. **Migration de la base de données**
Les tables et données par défaut sont créées automatiquement au premier démarrage.

## 📈 Évolutions Futures

- [ ] API REST complète
- [ ] Application mobile native
- [ ] Système de notifications push
- [ ] Intégration avec systèmes de paiement
- [ ] Module de visioconférence
- [ ] Génération de rapports avancés
- [ ] Sauvegarde automatique cloud

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.

---

**École Numérique** - Système de gestion scolaire moderne et responsive 🎓