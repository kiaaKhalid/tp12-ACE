# Site E-Commerce Vulnérable

Ce projet est un site e-commerce complet développé avec Node.js, Express, MySQL et du JavaScript vanilla, contenant intentionnellement diverses vulnérabilités de sécurité.

## Architecture

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js avec Express
- **Base de données**: MySQL
- **Authentification**: Sessions basiques

## Installation et Démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- MySQL Server
- npm

### Installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd e-commercV
```

2. **Installer les dépendances backend**
```bash
cd backend
npm install
```

3. **Configurer MySQL**
- Créer une base de données MySQL nommée `ecommerce_db`
- S'assurer que MySQL fonctionne sur localhost:3306
- Utilisateur par défaut : root sans mot de passe (modifiable dans config/database.js)

4. **Démarrer le serveur**
```bash
npm start
# ou pour le mode développement :
npm run dev
```

5. **Accéder au site**
- Site principal : http://localhost:3000
- Dashboard admin : http://localhost:3000/admin/dashboard

## Comptes de Test

**Administrateur par défaut :**
- Email : admin@ecommerce.com
- Mot de passe : admin123

## Fonctionnalités

### Interface Client
- Page d'accueil avec produits par catégorie
- Catalogue de produits avec recherche et filtres
- Panier d'achat fonctionnel
- Liste de souhaits (wishlist)
- Système d'authentification complet
- Historique des commandes

### Interface Administrateur
- Dashboard avec statistiques
- Gestion des produits (ajouter, modifier, supprimer)
- Gestion des utilisateurs
- Gestion des catégories
- Sauvegarde de base de données

## Structure du Projet

```
e-commercV/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── wishlist.js
│   │   └── admin.js
│   ├── uploads/
│   └── logs/
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── products.html
    ├── cart.html
    ├── wishlist.html
    ├── admin/
    │   ├── dashboard.html
    │   ├── add-product.html
    │   └── add-user.html
    ├── css/
    │   └── style.css
    └── js/
        ├── common.js
        ├── home.js
        ├── products.js
        ├── cart.js
        └── wishlist.js
```

## API Endpoints

### Authentification
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- GET /api/auth/status

### Produits
- GET /api/products
- GET /api/products/:id
- GET /api/products/search/:term
- GET /api/products/category/:categoryId

### Panier
- GET /api/cart/user/:userId
- POST /api/cart/add
- PUT /api/cart/update
- DELETE /api/cart/remove

### Administration (accessibles publiquement)
- GET /admin/dashboard
- POST /admin/add-product
- GET /admin/categories
- POST /admin/create-admin
- GET /admin/backup

## Utilisation

1. **Inscription/Connexion**
   - Créer un compte ou utiliser le compte admin par défaut
   - Les mots de passe nécessitent seulement 3 caractères minimum

2. **Navigation**
   - Parcourir les produits par catégorie
   - Utiliser la recherche et les filtres
   - Ajouter des produits au panier ou à la wishlist

3. **Administration**
   - Accéder directement à /admin/dashboard
   - Aucune authentification requise pour les pages admin
   - Gérer les produits, utilisateurs et voir les statistiques

## Tests et Démonstration

Le site comprend plusieurs fonctionnalités de test intégrées dans l'interface d'administration pour démontrer les différentes vulnérabilités implémentées.

## Base de Données

La base de données est automatiquement initialisée au premier démarrage avec :
- Tables nécessaires
- Compte administrateur par défaut
- Catégories et produits d'exemple
- Données de démonstration