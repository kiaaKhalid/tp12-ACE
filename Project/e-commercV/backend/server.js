const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Import des routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging complet (vulnérabilité : logs sensibles)
app.use((req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Écrire dans un fichier de log accessible
  fs.appendFile('./logs/access.log', JSON.stringify(logData) + '\n', (err) => {
    if (err) console.log('Erreur de logging:', err);
  });
  
  console.log('Request complète:', JSON.stringify(logData, null, 2));
  next();
});

// Configuration CORS permissive
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser sans limite de taille (vulnérabilité DoS)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Configuration des sessions sans sécurité
app.use(session({
  secret: 'secret-key-123', // Secret faible
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Pas de HTTPS requis
    maxAge: null, // Pas d'expiration
    httpOnly: false // Accessible via JavaScript
  }
}));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Créer le dossier logs s'il n'existe pas
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Routes admin sans protection
app.use('/admin', adminRoutes);

// Route publique pour créer des utilisateurs (vulnérabilité)
app.get('/api/users/create', (req, res) => {
  const { username, email, password, role } = req.query;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  const db = require('./config/database');
  
  // Injection SQL directe
  const query = `INSERT INTO users (username, email, password, role) VALUES ('${username}', '${email}', MD5('${password}'), '${role || 'user'}')`;
  
  console.log('Requête SQL:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      console.log('Erreur SQL complète:', err);
      return res.status(500).json({ 
        error: 'Erreur base de données',
        details: err.sqlMessage,
        query: query
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Utilisateur créé',
      userId: result.insertId
    });
  });
});

// Route de monitoring des performances (vulnérabilité DoS)
app.get('/api/performance/heavy', (req, res) => {
  const iterations = req.query.iterations || 1000000;
  
  console.log(`Démarrage tâche lourde avec ${iterations} itérations`);
  
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.random();
  }
  
  res.json({ 
    result: result,
    iterations: iterations,
    message: 'Calcul terminé'
  });
});

// Route pour servir les pages HTML
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

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

// Routes admin accessibles publiquement
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/dashboard.html'));
});

app.get('/admin/add-product', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/add-product.html'));
});

app.get('/admin/add-user', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/add-user.html'));
});

app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin/users.html'));
});

// Gestion des erreurs avec exposition complète
app.use((err, req, res, next) => {
  console.error('Erreur complète:', err);
  
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    details: err,
    request: {
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers
    }
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Interface accessible sur http://localhost:${PORT}`);
  console.log(`Admin accessible sur http://localhost:${PORT}/admin/dashboard`);
});