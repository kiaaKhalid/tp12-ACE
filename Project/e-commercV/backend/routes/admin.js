const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configuration multer pour l'upload de fichiers sans limite de taille
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  // Pas de limite de taille (vulnérabilité DoS)
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Route pour ajouter un produit (accessible publiquement)
router.post('/add-product', upload.single('image'), (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Nom et prix requis' });
  }
  
  const image_url = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/300x300';
  
  // Injection SQL directe dans l'ajout de produit
  const query = `INSERT INTO products (name, description, price, stock, category_id, image_url) 
                 VALUES ('${name}', '${description || ''}', ${price}, ${stock || 0}, ${category_id || 'NULL'}, '${image_url}')`;
  
  console.log('Ajout produit admin:', query);
  console.log('Données reçues:', req.body);
  
  db.query(query, (err, result) => {
    if (err) {
      console.log('Erreur ajout produit:', err);
      return res.status(500).json({ 
        error: 'Erreur ajout produit',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      message: 'Produit ajouté avec succès',
      productId: result.insertId
    });
  });
});

// Route pour modifier un produit (pas de vérification de rôle)
router.put('/edit-product/:id', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock, category_id } = req.body;
  
  let updateFields = [];
  
  if (name) updateFields.push(`name = '${name}'`);
  if (description !== undefined) updateFields.push(`description = '${description}'`);
  if (price) updateFields.push(`price = ${price}`);
  if (stock !== undefined) updateFields.push(`stock = ${stock}`);
  if (category_id) updateFields.push(`category_id = ${category_id}`);
  
  if (req.file) {
    updateFields.push(`image_url = '/uploads/${req.file.filename}'`);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Aucune donnée à modifier' });
  }
  
  const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ${productId}`;
  
  console.log('Modification produit:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur modification',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      message: 'Produit modifié',
      affectedRows: result.affectedRows
    });
  });
});

// Route pour supprimer un produit (accessible publiquement)
router.delete('/delete-product/:id', (req, res) => {
  const productId = req.params.id;
  
  const query = `DELETE FROM products WHERE id = ${productId}`;
  
  console.log('Suppression produit:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur suppression',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Produit supprimé',
      deletedRows: result.affectedRows
    });
  });
});

// Route pour ajouter une catégorie (pas de protection)
router.post('/add-category', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nom de catégorie requis' });
  }
  
  const query = `INSERT INTO categories (name, description) VALUES ('${name}', '${description || ''}')`;
  
  console.log('Ajout catégorie:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur ajout catégorie',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      message: 'Catégorie ajoutée',
      categoryId: result.insertId
    });
  });
});

// Route pour récupérer toutes les catégories
router.get('/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur catégories',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      categories: results
    });
  });
});

// Route pour créer un utilisateur admin (accessible publiquement)
router.post('/create-admin', (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Données manquantes' });
  }
  
  // Création d'admin avec mot de passe en MD5
  const query = `INSERT INTO users (username, email, password, role, first_name, last_name) 
                 VALUES ('${username}', '${email}', MD5('${password}'), 'admin', '${first_name || ''}', '${last_name || ''}')`;
  
  console.log('Création admin:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur création admin',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      message: 'Admin créé avec succès',
      adminId: result.insertId
    });
  });
});

// Route pour obtenir des statistiques détaillées (lourde)
router.get('/stats', (req, res) => {
  const statsQueries = {
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalProducts: 'SELECT COUNT(*) as count FROM products',
    totalOrders: 'SELECT COUNT(*) as count FROM orders',
    totalRevenue: 'SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"',
    usersByRole: 'SELECT role, COUNT(*) as count FROM users GROUP BY role',
    productsByCategory: 'SELECT c.name, COUNT(p.id) as count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id',
    recentOrders: 'SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10',
    topProducts: `SELECT p.name, COUNT(oi.id) as order_count, SUM(oi.quantity) as total_sold 
                  FROM products p 
                  LEFT JOIN order_items oi ON p.id = oi.product_id 
                  GROUP BY p.id 
                  ORDER BY total_sold DESC 
                  LIMIT 10`
  };
  
  const results = {};
  let completed = 0;
  const totalQueries = Object.keys(statsQueries).length;
  
  Object.entries(statsQueries).forEach(([key, query]) => {
    console.log(`Exécution stats ${key}:`, query);
    
    db.query(query, (err, result) => {
      if (err) {
        console.log(`Erreur stats ${key}:`, err);
        results[key] = { error: err.sqlMessage };
      } else {
        results[key] = result;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json({
          success: true,
          statistics: results,
          queries_executed: statsQueries
        });
      }
    });
  });
});

// Route pour effectuer une sauvegarde de la base de données (vulnérabilité)
router.get('/backup', (req, res) => {
  const tables = ['users', 'products', 'categories', 'orders', 'order_items', 'cart', 'wishlist'];
  let backupData = {};
  let completed = 0;
  
  tables.forEach(table => {
    const query = `SELECT * FROM ${table}`;
    
    console.log(`Sauvegarde table ${table}:`, query);
    
    db.query(query, (err, results) => {
      if (err) {
        backupData[table] = { error: err.sqlMessage };
      } else {
        backupData[table] = results;
      }
      
      completed++;
      if (completed === tables.length) {
        res.json({
          success: true,
          backup: backupData,
          timestamp: new Date().toISOString(),
          tables: tables
        });
      }
    });
  });
});

module.exports = router;