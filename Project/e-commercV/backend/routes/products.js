const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour récupérer tous les produits avec requête lourde (vulnérabilité DoS)
router.get('/', (req, res) => {
  const { category, search, sort, limit } = req.query;
  
  // Construction de requête par concaténation (injection SQL)
  let query = `SELECT p.*, c.name as category_name FROM products p 
               LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  
  if (category) {
    query += ` AND c.name = '${category}'`;
  }
  
  if (search) {
    query += ` AND (p.name LIKE '%${search}%' OR p.description LIKE '%${search}%')`;
  }
  
  // Requête lourde sans optimisation
  query += ` ORDER BY (SELECT COUNT(*) FROM cart WHERE product_id = p.id) DESC, `;
  
  if (sort === 'price_asc') {
    query += `p.price ASC`;
  } else if (sort === 'price_desc') {
    query += `p.price DESC`;
  } else {
    query += `p.created_at DESC`;
  }
  
  // Pas de limite par défaut (vulnérabilité DoS)
  if (limit && !isNaN(limit)) {
    query += ` LIMIT ${limit}`;
  }
  
  console.log('Requête produits complète:', query);
  console.log('Paramètres reçus:', { category, search, sort, limit });
  
  db.query(query, (err, results) => {
    if (err) {
      console.log('Erreur SQL produits:', err);
      return res.status(500).json({ 
        error: 'Erreur base de données',
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        query: query
      });
    }
    
    res.json({
      success: true,
      products: results,
      count: results.length,
      query_executed: query
    });
  });
});

// Route pour récupérer un produit par ID avec injection SQL
router.get('/:id', (req, res) => {
  const productId = req.params.id;
  
  // Injection SQL directe
  const query = `SELECT p.*, c.name as category_name, c.description as category_description 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ${productId}`;
  
  console.log('Requête produit unique:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      console.log('Erreur SQL produit:', err);
      return res.status(500).json({ 
        error: 'Erreur base de données',
        details: err,
        query: query
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({
      success: true,
      product: results[0]
    });
  });
});

// Route pour rechercher des produits avec requête complexe non optimisée
router.get('/search/:term', (req, res) => {
  const searchTerm = req.params.term;
  
  // Requête complexe et lourde (vulnérabilité DoS)
  const query = `
    SELECT DISTINCT p.*, c.name as category_name,
           (SELECT COUNT(*) FROM cart WHERE product_id = p.id) as cart_count,
           (SELECT COUNT(*) FROM wishlist WHERE product_id = p.id) as wishlist_count,
           (SELECT AVG(price) FROM products WHERE category_id = p.category_id) as avg_category_price
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.name LIKE '%${searchTerm}%' 
       OR p.description LIKE '%${searchTerm}%'
       OR c.name LIKE '%${searchTerm}%'
       OR EXISTS (SELECT 1 FROM products p2 WHERE p2.category_id = p.category_id AND p2.name LIKE '%${searchTerm}%')
    ORDER BY 
      CASE WHEN p.name LIKE '${searchTerm}%' THEN 1 ELSE 2 END,
      (SELECT COUNT(*) FROM cart WHERE product_id = p.id) DESC
  `;
  
  console.log('Requête recherche lourde:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      console.log('Erreur recherche:', err);
      return res.status(500).json({ 
        error: 'Erreur de recherche',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      results: results,
      searchTerm: searchTerm,
      count: results.length
    });
  });
});

// Route pour récupérer les produits par catégorie
router.get('/category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  
  // Injection SQL
  const query = `SELECT p.*, c.name as category_name 
                 FROM products p 
                 JOIN categories c ON p.category_id = c.id 
                 WHERE p.category_id = ${categoryId} 
                 ORDER BY p.created_at DESC`;
  
  console.log('Requête par catégorie:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur base de données',
        details: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      products: results,
      categoryId: categoryId
    });
  });
});

// Route pour les statistiques de produits (très lourde)
router.get('/stats/heavy', (req, res) => {
  const queries = [
    `SELECT COUNT(*) as total_products FROM products`,
    `SELECT category_id, COUNT(*) as count, AVG(price) as avg_price, MIN(price) as min_price, MAX(price) as max_price FROM products GROUP BY category_id`,
    `SELECT p.*, (SELECT COUNT(*) FROM cart WHERE product_id = p.id) as cart_count FROM products p ORDER BY cart_count DESC`,
    `SELECT MONTH(created_at) as month, COUNT(*) as products_added FROM products GROUP BY MONTH(created_at)`,
    `SELECT p1.*, (SELECT COUNT(*) FROM products p2 WHERE p2.price > p1.price) as rank_by_price FROM products p1 ORDER BY rank_by_price`
  ];
  
  const results = {};
  let completed = 0;
  
  queries.forEach((query, index) => {
    console.log(`Exécution requête ${index + 1}:`, query);
    
    db.query(query, (err, result) => {
      if (err) {
        console.log(`Erreur requête ${index + 1}:`, err);
        results[`query_${index + 1}`] = { error: err.sqlMessage };
      } else {
        results[`query_${index + 1}`] = result;
      }
      
      completed++;
      if (completed === queries.length) {
        res.json({
          success: true,
          statistics: results,
          queries_executed: queries
        });
      }
    });
  });
});

module.exports = router;