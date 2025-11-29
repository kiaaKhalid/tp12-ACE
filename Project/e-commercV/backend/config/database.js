const mysql = require('mysql2');

// Configuration de la base de données (vulnérable : pas de chiffrement)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Pas de mot de passe (vulnérabilité)
  database: 'ecommerce_db',
  port: 3306,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

console.log('Configuration DB:', dbConfig);

// Création de la connexion
const connection = mysql.createConnection(dbConfig);

// Connexion avec gestion d'erreur basique
connection.connect((err) => {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
    console.log('Tentative de création de la base de données...');
    
    // Tentative de création de la base si elle n'existe pas
    const tempConnection = mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });
    
    tempConnection.connect((err) => {
      if (err) {
        console.error('Impossible de se connecter à MySQL:', err);
        return;
      }
      
      // Création de la base de données
      tempConnection.query('CREATE DATABASE IF NOT EXISTS ecommerce_db', (err) => {
        if (err) {
          console.error('Erreur création DB:', err);
        } else {
          console.log('Base de données créée ou existe déjà');
        }
        tempConnection.end();
        
        // Reconnexion à la base créée
        connection.connect((err) => {
          if (err) {
            console.error('Erreur connexion finale:', err);
          } else {
            console.log('Connexion MySQL établie');
            initializeDatabase();
          }
        });
      });
    });
  } else {
    console.log('Connexion MySQL réussie');
    initializeDatabase();
  }
});

// Initialisation des tables et données
function initializeDatabase() {
  // Création des tables
  const createTables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      address TEXT,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      stock INT DEFAULT 0,
      category_id INT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS cart (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      shipping_address TEXT,
      status ENUM('pending', 'confirmed', 'shipped', 'delivered') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`
  ];
  
  // Exécution des requêtes de création
  createTables.forEach((sql, index) => {
    connection.query(sql, (err) => {
      if (err) {
        console.error(`Erreur création table ${index}:`, err);
      } else {
        console.log(`Table ${index + 1} créée/vérifiée`);
      }
    });
  });
  
  // Attendre un peu puis insérer les données par défaut
  setTimeout(insertDefaultData, 2000);
}

// Insertion des données par défaut
function insertDefaultData() {
  // Vérifier si l'admin existe déjà
  connection.query("SELECT * FROM users WHERE email = 'admin@ecommerce.com'", (err, results) => {
    if (err) {
      console.error('Erreur vérification admin:', err);
      return;
    }
    
    if (results.length === 0) {
      // Créer l'utilisateur admin avec mot de passe faible
      const adminInsert = `INSERT INTO users (username, email, password, role, first_name, last_name) 
                          VALUES ('admin', 'admin@ecommerce.com', MD5('admin123'), 'admin', 'Admin', 'User')`;
      
      connection.query(adminInsert, (err) => {
        if (err) {
          console.error('Erreur création admin:', err);
        } else {
          console.log('Utilisateur admin créé : admin@ecommerce.com / admin123');
        }
      });
    }
  });
  
  // Insérer des catégories par défaut
  const categories = [
    ['Électronique', 'Appareils électroniques et gadgets'],
    ['Vêtements', 'Mode et accessoires'],
    ['Maison', 'Articles pour la maison'],
    ['Livres', 'Livres et e-books'],
    ['Sports', 'Équipements sportifs']
  ];
  
  categories.forEach(([name, description]) => {
    connection.query('SELECT * FROM categories WHERE name = ?', [name], (err, results) => {
      if (!err && results.length === 0) {
        connection.query('INSERT INTO categories (name, description) VALUES (?, ?)', 
          [name, description], (err) => {
            if (!err) {
              console.log(`Catégorie "${name}" ajoutée`);
            }
          });
      }
    });
  });
  
  // Insérer des produits d'exemple
  setTimeout(() => {
    const sampleProducts = [
      ['Smartphone Galaxy', 'Téléphone intelligent dernière génération', 699.99, 50, 1, 'https://via.placeholder.com/300x300'],
      ['Laptop Pro', 'Ordinateur portable haute performance', 1299.99, 25, 1, 'https://via.placeholder.com/300x300'],
      ['T-shirt Classic', 'T-shirt en coton de qualité', 29.99, 100, 2, 'https://via.placeholder.com/300x300'],
      ['Jeans Denim', 'Jean classique coupe droite', 79.99, 75, 2, 'https://via.placeholder.com/300x300'],
      ['Canapé Confort', 'Canapé 3 places ultra confortable', 899.99, 10, 3, 'https://via.placeholder.com/300x300'],
      ['Roman Bestseller', 'Le livre le plus vendu de l\'année', 19.99, 200, 4, 'https://via.placeholder.com/300x300'],
      ['Ballon de Foot', 'Ballon officiel de compétition', 49.99, 80, 5, 'https://via.placeholder.com/300x300']
    ];
    
    sampleProducts.forEach(([name, description, price, stock, categoryId, imageUrl]) => {
      connection.query('SELECT * FROM products WHERE name = ?', [name], (err, results) => {
        if (!err && results.length === 0) {
          connection.query(
            'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, categoryId, imageUrl],
            (err) => {
              if (!err) {
                console.log(`Produit "${name}" ajouté`);
              }
            }
          );
        }
      });
    });
  }, 3000);
}

module.exports = connection;