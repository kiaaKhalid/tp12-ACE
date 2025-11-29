const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Route de connexion avec injection SQL
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  // Injection SQL directe (vulnérabilité)
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = MD5('${password}')`;
  
  console.log('Requête de connexion:', query);
  console.log('Données reçues:', { email, password });
  
  db.query(query, (err, results) => {
    if (err) {
      console.log('Erreur SQL:', err);
      return res.status(500).json({ 
        error: 'Erreur de base de données',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = results[0];
    
    // Session sans sécurité
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;
    
    console.log('Connexion réussie pour:', user);
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  });
});

// Route d'inscription avec validation faible
router.post('/register', (req, res) => {
  const { username, email, password, first_name, last_name, address, phone } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  
  // Pas de validation de complexité du mot de passe
  if (password.length < 3) {
    return res.status(400).json({ error: 'Mot de passe trop court (minimum 3 caractères)' });
  }
  
  // Injection SQL dans l'inscription
  const insertQuery = `INSERT INTO users (username, email, password, first_name, last_name, address, phone) 
                       VALUES ('${username}', '${email}', MD5('${password}'), '${first_name || ''}', '${last_name || ''}', '${address || ''}', '${phone || ''}')`;
  
  console.log('Requête inscription:', insertQuery);
  
  db.query(insertQuery, (err, result) => {
    if (err) {
      console.log('Erreur inscription:', err);
      return res.status(500).json({ 
        error: 'Erreur lors de l\'inscription',
        details: err.sqlMessage,
        query: insertQuery
      });
    }
    
    // Connexion automatique après inscription
    req.session.userId = result.insertId;
    req.session.userRole = 'user';
    req.session.userEmail = email;
    
    res.json({
      success: true,
      message: 'Inscription réussie',
      userId: result.insertId
    });
  });
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Erreur déconnexion:', err);
    }
    res.json({ success: true, message: 'Déconnexion réussie' });
  });
});

// Route pour vérifier le statut de connexion
router.get('/status', (req, res) => {
  if (req.session.userId) {
    // Récupérer les infos utilisateur avec injection SQL
    const query = `SELECT * FROM users WHERE id = ${req.session.userId}`;
    
    db.query(query, (err, results) => {
      if (err || results.length === 0) {
        return res.json({ authenticated: false });
      }
      
      const user = results[0];
      res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;