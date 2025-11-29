const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour récupérer la wishlist d'un utilisateur
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Injection SQL directe
  const query = `SELECT w.*, p.name, p.price, p.image_url, p.description, c.name as category_name
                 FROM wishlist w 
                 JOIN products p ON w.product_id = p.id
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE w.user_id = ${userId}
                 ORDER BY w.added_at DESC`;
  
  console.log('Requête wishlist:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur wishlist',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      wishlistItems: results,
      itemCount: results.length
    });
  });
});

// Route pour ajouter un produit à la wishlist
router.post('/add', (req, res) => {
  const { userId, productId } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  // Vérifier si le produit existe déjà dans la wishlist
  const checkQuery = `SELECT * FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}`;
  
  console.log('Vérification wishlist:', checkQuery);
  
  db.query(checkQuery, (err, existing) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur vérification',
        sqlError: err.sqlMessage
      });
    }
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Produit déjà dans la wishlist' });
    }
    
    // Ajouter à la wishlist avec injection SQL
    const insertQuery = `INSERT INTO wishlist (user_id, product_id) VALUES (${userId}, ${productId})`;
    
    console.log('Ajout wishlist:', insertQuery);
    
    db.query(insertQuery, (err, result) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erreur ajout wishlist',
          sqlError: err.sqlMessage,
          query: insertQuery
        });
      }
      
      res.json({
        success: true,
        message: 'Produit ajouté à la wishlist',
        wishlistItemId: result.insertId
      });
    });
  });
});

// Route pour supprimer un produit de la wishlist
router.delete('/remove', (req, res) => {
  const { userId, productId } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  const query = `DELETE FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}`;
  
  console.log('Suppression wishlist:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur suppression',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Produit supprimé de la wishlist',
      deletedRows: result.affectedRows
    });
  });
});

// Route pour vider complètement la wishlist
router.delete('/clear/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const query = `DELETE FROM wishlist WHERE user_id = ${userId}`;
  
  console.log('Vidage wishlist:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur vidage wishlist',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Wishlist vidée',
      deletedRows: result.affectedRows
    });
  });
});

// Route pour déplacer un produit de la wishlist vers le panier
router.post('/move-to-cart', (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  const qty = quantity || 1;
  
  // Ajouter au panier
  const addToCartQuery = `INSERT INTO cart (user_id, product_id, quantity) VALUES (${userId}, ${productId}, ${qty})
                          ON DUPLICATE KEY UPDATE quantity = quantity + ${qty}`;
  
  console.log('Ajout au panier depuis wishlist:', addToCartQuery);
  
  db.query(addToCartQuery, (err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur ajout panier',
        sqlError: err.sqlMessage
      });
    }
    
    // Supprimer de la wishlist
    const removeFromWishlistQuery = `DELETE FROM wishlist WHERE user_id = ${userId} AND product_id = ${productId}`;
    
    db.query(removeFromWishlistQuery, (err) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erreur suppression wishlist',
          sqlError: err.sqlMessage
        });
      }
      
      res.json({
        success: true,
        message: 'Produit déplacé vers le panier'
      });
    });
  });
});

module.exports = router;