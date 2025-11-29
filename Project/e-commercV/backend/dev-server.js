const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Session simulée pour les tests
let sessionData = {};

console.log('🚀 Serveur de développement démarré');
console.log('📁 Serveur de fichiers statiques configuré');

// Routes de test sans base de données
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/products.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/cart.html'));
});

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/wishlist.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

app.get('/admin/add-product', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/add-product.html'));
});

app.get('/admin/add-user', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/add-user.html'));
});

// API de test avec données simulées
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Simulation de connexion admin
    if (email === 'admin@ecommerce.com' && password === 'admin123') {
        sessionData.user = {
            id: 1,
            username: 'admin',
            email: email,
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User'
        };
        
        res.json({
            success: true,
            message: 'Connexion réussie',
            user: sessionData.user
        });
    } else {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
});

app.get('/api/auth/status', (req, res) => {
    if (sessionData.user) {
        res.json({
            authenticated: true,
            user: sessionData.user
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'Inscription réussie (simulation)',
        userId: Math.floor(Math.random() * 1000)
    });
});

app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: 'Smartphone Galaxy',
            description: 'Téléphone intelligent dernière génération',
            price: 699.99,
            stock: 50,
            category_name: 'Électronique',
            image_url: 'https://via.placeholder.com/300x300'
        },
        {
            id: 2,
            name: 'Laptop Pro',
            description: 'Ordinateur portable haute performance',
            price: 1299.99,
            stock: 25,
            category_name: 'Électronique',
            image_url: 'https://via.placeholder.com/300x300'
        },
        {
            id: 3,
            name: 'T-shirt Classic',
            description: 'T-shirt en coton de qualité',
            price: 29.99,
            stock: 100,
            category_name: 'Vêtements',
            image_url: 'https://via.placeholder.com/300x300'
        }
    ];
    
    res.json({
        success: true,
        products: products
    });
});

app.get('/admin/categories', (req, res) => {
    res.json({
        success: true,
        categories: [
            { id: 1, name: 'Électronique' },
            { id: 2, name: 'Vêtements' },
            { id: 3, name: 'Maison' }
        ]
    });
});

app.get('/admin/stats', (req, res) => {
    res.json({
        success: true,
        statistics: {
            totalUsers: [{ count: 42 }],
            totalProducts: [{ count: 15 }],
            totalOrders: [{ count: 8 }],
            totalRevenue: [{ total: 2847.50 }],
            recentOrders: [
                {
                    id: 1,
                    username: 'client1',
                    total_amount: 699.99,
                    created_at: new Date().toISOString()
                }
            ]
        }
    });
});

// Route de fallback pour toutes les autres requêtes API
app.all('/api/*', (req, res) => {
    res.json({
        success: false,
        error: 'Endpoint de démonstration - Base de données non connectée',
        method: req.method,
        path: req.path,
        body: req.body
    });
});

app.listen(PORT, () => {
    console.log(`
🎯 SITE E-COMMERCE VULNÉRABLE DÉMARRÉ

📍 Accès principal: http://localhost:${PORT}
🔧 Dashboard admin: http://localhost:${PORT}/admin/dashboard

👤 Compte de test:
   Email: admin@ecommerce.com
   Mot de passe: admin123

⚠️  VULNÉRABILITÉS INCLUSES:
   ✓ Injection SQL (simulée)
   ✓ Accès admin sans authentification
   ✓ Validation faible des mots de passe
   ✓ Sessions non sécurisées
   ✓ Upload de fichiers non restreint
   ✓ Exposition de données sensibles

🛠  Pour utiliser avec MySQL:
   1. Démarrer MySQL sur localhost:3306
   2. Utiliser server.js au lieu de dev-server.js
   
📚 Voir README.md pour plus de détails
    `);
});