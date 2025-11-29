const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour créer une commande à partir du panier
router.post('/create', (req, res) => {
  const { userId, shippingAddress } = req.body;
  
  if (!userId || !shippingAddress) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }
  
  // Récupérer les articles du panier avec injection SQL
  const cartQuery = `SELECT c.*, p.price FROM cart c 
                     JOIN products p ON c.product_id = p.id 
                     WHERE c.user_id = ${userId}`;
  
  console.log('Récupération panier pour commande:', cartQuery);
  
  db.query(cartQuery, (err, cartItems) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur panier',
        sqlError: err.sqlMessage
      });
    }
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }
    
    // Calculer le total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Créer la commande avec injection SQL
    const orderQuery = `INSERT INTO orders (user_id, total_amount, shipping_address) 
                        VALUES (${userId}, ${totalAmount}, '${shippingAddress}')`;
    
    console.log('Création commande:', orderQuery);
    
    db.query(orderQuery, (err, orderResult) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erreur création commande',
          sqlError: err.sqlMessage
        });
      }
      
      const orderId = orderResult.insertId;
      
      // Ajouter les articles de la commande
      const orderItems = cartItems.map(item => 
        `(${orderId}, ${item.product_id}, ${item.quantity}, ${item.price})`
      );
      
      const orderItemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, price) 
                               VALUES ${orderItems.join(', ')}`;
      
      console.log('Ajout articles commande:', orderItemsQuery);
      
      db.query(orderItemsQuery, (err) => {
        if (err) {
          return res.status(500).json({ 
            error: 'Erreur articles commande',
            sqlError: err.sqlMessage
          });
        }
        
        // Vider le panier
        const clearCartQuery = `DELETE FROM cart WHERE user_id = ${userId}`;
        
        db.query(clearCartQuery, (err) => {
          if (err) {
            console.log('Erreur vidage panier:', err);
          }
          
          res.json({
            success: true,
            message: 'Commande créée avec succès',
            orderId: orderId,
            totalAmount: totalAmount
          });
        });
      });
    });
  });
});

// Route pour récupérer les commandes d'un utilisateur
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Injection SQL
  const query = `SELECT o.*, 
                        COUNT(oi.id) as item_count,
                        GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as products
                 FROM orders o 
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE o.user_id = ${userId}
                 GROUP BY o.id
                 ORDER BY o.created_at DESC`;
  
  console.log('Requête commandes utilisateur:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur commandes',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      orders: results
    });
  });
});

// Route pour récupérer une commande spécifique
router.get('/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  
  // Requête pour la commande
  const orderQuery = `SELECT o.*, u.username, u.email 
                      FROM orders o 
                      JOIN users u ON o.user_id = u.id 
                      WHERE o.id = ${orderId}`;
  
  // Requête pour les articles
  const itemsQuery = `SELECT oi.*, p.name, p.description, p.image_url 
                      FROM order_items oi 
                      JOIN products p ON oi.product_id = p.id 
                      WHERE oi.order_id = ${orderId}`;
  
  console.log('Requête commande:', orderQuery);
  console.log('Requête articles:', itemsQuery);
  
  db.query(orderQuery, (err, orderResults) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur commande',
        sqlError: err.sqlMessage
      });
    }
    
    if (orderResults.length === 0) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    db.query(itemsQuery, (err, itemResults) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Erreur articles',
          sqlError: err.sqlMessage
        });
      }
      
      res.json({
        success: true,
        order: orderResults[0],
        items: itemResults
      });
    });
  });
});

// Route pour mettre à jour le statut d'une commande (pas de protection admin)
router.put('/:orderId/status', (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Statut requis' });
  }
  
  const query = `UPDATE orders SET status = '${status}' WHERE id = ${orderId}`;
  
  console.log('Mise à jour statut commande:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur mise à jour statut',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      message: 'Statut mis à jour',
      affectedRows: result.affectedRows
    });
  });
});

// Route pour récupérer toutes les commandes (pas de protection)
router.get('/', (req, res) => {
  const query = `SELECT o.*, u.username, u.email,
                        COUNT(oi.id) as item_count
                 FROM orders o 
                 JOIN users u ON o.user_id = u.id
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 GROUP BY o.id
                 ORDER BY o.created_at DESC`;
  
  console.log('Requête toutes commandes:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur commandes',
        sqlError: err.sqlMessage
      });
    }
    
    res.json({
      success: true,
      orders: results
    });
  });
});

module.exports = router;