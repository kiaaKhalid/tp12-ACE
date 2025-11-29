const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Route pour récupérer tous les utilisateurs (pas de protection)
router.get('/', (req, res) => {
  const query = 'SELECT * FROM users';
  
  console.log('Requête utilisateurs:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur base de données',
        details: err
      });
    }
    
    res.json({
      success: true,
      users: results
    });
  });
});

// Route pour récupérer un utilisateur par ID (vulnérabilité : ID modifiable)
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  
  // Injection SQL directe
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  console.log('Requête utilisateur:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur base de données',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      success: true,
      user: results[0]
    });
  });
});

// Route pour mettre à jour un utilisateur (pas de vérification d'autorisation)
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, first_name, last_name, address, phone, role } = req.body;
  
  // Construction de la requête par concaténation (injection SQL)
  let updateFields = [];
  
  if (username) updateFields.push(`username = '${username}'`);
  if (email) updateFields.push(`email = '${email}'`);
  if (first_name) updateFields.push(`first_name = '${first_name}'`);
  if (last_name) updateFields.push(`last_name = '${last_name}'`);
  if (address) updateFields.push(`address = '${address}'`);
  if (phone) updateFields.push(`phone = '${phone}'`);
  if (role) updateFields.push(`role = '${role}'`); // Vulnérabilité : modification du rôle
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  }
  
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ${userId}`;
  
  console.log('Requête mise à jour utilisateur:', query);
  console.log('Données reçues:', req.body);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur mise à jour',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur mis à jour',
      affectedRows: result.affectedRows
    });
  });
});

// Route pour supprimer un utilisateur (pas de protection)
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  
  const query = `DELETE FROM users WHERE id = ${userId}`;
  
  console.log('Suppression utilisateur:', query);
  
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur suppression',
        details: err
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé',
      deletedRows: result.affectedRows
    });
  });
});

// Route pour rechercher des utilisateurs
router.get('/search/:term', (req, res) => {
  const searchTerm = req.params.term;
  
  // Injection SQL dans la recherche
  const query = `SELECT * FROM users 
                 WHERE username LIKE '%${searchTerm}%' 
                    OR email LIKE '%${searchTerm}%' 
                    OR first_name LIKE '%${searchTerm}%' 
                    OR last_name LIKE '%${searchTerm}%'`;
  
  console.log('Recherche utilisateurs:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Erreur recherche',
        sqlError: err.sqlMessage,
        query: query
      });
    }
    
    res.json({
      success: true,
      users: results,
      searchTerm: searchTerm
    });
  });
});

module.exports = router;