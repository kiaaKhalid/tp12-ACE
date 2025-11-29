const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour récupérer le panier d'un utilisateur
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Injection SQL directe
  const query = `SELECT c.*, p.name, p.price, p.image_url, p.stock,
                        (c.quantity * p.price) as total_price
                 FROM cart c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = ${userId}`;
  
  console.log('Requête panier:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur panier',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    const totalAmount = results.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    
    res.json({
      success: true,
      cartItems: results,
      totalAmount: totalAmount.toFixed(2),
      itemCount: results.length
    });
  });
});

// Route pour ajouter un produit au panier
router.post('/add', (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  // Vérifier si le produit existe déjà dans le panier
  const checkQuery = `SELECT * FROM cart WHERE user_id = ${userId} AND product_id = ${productId}`;
  
  console.log('Vérification panier:', checkQuery);
  
  db.query(checkQuery, (err, existing) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur vérification',
        sqlError: err.sqlMessage
      });
    }
    
    let finalQuery;
    
    if (existing.length > 0) {
      // Mettre à jour la quantité
      finalQuery = `UPDATE cart SET quantity = quantity + ${quantity} 
                    WHERE user_id = ${userId} AND product_id = ${productId}`;
    } else {
      // Ajouter nouveau produit
      finalQuery = `INSERT INTO cart (user_id, product_id, quantity) 
                    VALUES (${userId}, ${productId}, ${quantity})`;
    }
    
    console.log('Requête ajout panier:', finalQuery);
    
    db.query(finalQuery, (err, result) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erreur ajout panier',
          sqlError: err.sqlMessage,
          query: finalQuery
        });
      }
      
      res.json({
        success: true,
        message: 'Produit ajouté au panier',
        cartItemId: existing.length > 0 ? existing[0].id : result.insertId
      });
    });
  });
});

// Route pour mettre à jour la quantité dans le panier
router.put('/update', (req, res) => {
  const { userId, productId, quantity } = req.body;
  
  if (!userId || !productId || quantity === undefined) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  const query = `UPDATE cart SET quantity = ${quantity} 
                 WHERE user_id = ${userId} AND product_id = ${productId}`;
  
  console.log('Mise à jour panier:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur mise à jour',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Quantité mise à jour',
      affectedRows: result.affectedRows
    });
  });
});

// Route pour supprimer un produit du panier
router.delete('/remove', (req, res) => {
  const { userId, productId } = req.body;
  
  if (!userId || !productId) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  const query = `DELETE FROM cart WHERE user_id = ${userId} AND product_id = ${productId}`;
  
  console.log('Suppression panier:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur suppression',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Produit supprimé du panier',
      deletedRows: result.affectedRows
    });
  });
});

// Route pour vider complètement le panier
router.delete('/clear/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const query = `DELETE FROM cart WHERE user_id = ${userId}`;
  
  console.log('Vidage panier:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur vidage panier',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Panier vidé',
      deletedRows: result.affectedRows
    });
  });
});

module.exports = router;