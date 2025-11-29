// Variables globales
let currentUser = null;
let cartItems = [];
let wishlistItems = [];

// Configuration API
const API_BASE = 'http://localhost:3000';

// Fonctions utilitaires
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insérer en haut de la page
    const main = document.querySelector('main') || document.body;
    main.insertBefore(alertDiv, main.firstChild);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Fonction pour faire des requêtes API avec logging complet
async function apiRequest(url, options = {}) {
    const fullUrl = `${API_BASE}${url}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Log complet de la requête (vulnérabilité : logs sensibles)
    console.log('API Request:', {
        url: fullUrl,
        method: mergedOptions.method || 'GET',
        headers: mergedOptions.headers,
        body: mergedOptions.body,
        timestamp: new Date().toISOString()
    });
    
    try {
        const response = await fetch(fullUrl, mergedOptions);
        const data = await response.json();
        
        // Log complet de la réponse
        console.log('API Response:', {
            url: fullUrl,
            status: response.status,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        return { response, data };
    } catch (error) {
        console.error('API Error:', {
            url: fullUrl,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

// Vérification du statut d'authentification
async function checkAuthStatus() {
    try {
        const { data } = await apiRequest('/api/auth/status');
        
        if (data.authenticated) {
            currentUser = data.user;
            updateAuthUI(true);
            loadCartCount();
            loadWishlistCount();
        } else {
            currentUser = null;
            updateAuthUI(false);
        }
        
        return data.authenticated;
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        return false;
    }
}

// Mise à jour de l'interface d'authentification
function updateAuthUI(isAuthenticated) {
    const authSection = document.getElementById('auth-section');
    
    if (isAuthenticated && currentUser) {
        authSection.innerHTML = `
            <div class="user-menu">
                <span>Bonjour, ${currentUser.username}</span>
                <a href="/profile" class="nav-link">Profil</a>
                ${currentUser.role === 'admin' ? '<a href="/admin/dashboard" class="nav-link">Admin</a>' : ''}
                <button onclick="logout()" class="btn btn-secondary">Déconnexion</button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <a href="/login" class="nav-link">Connexion</a>
            <a href="/register" class="nav-link">Inscription</a>
        `;
    }
}

// Fonction de connexion
async function login(email, password) {
    try {
        const { data } = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            currentUser = data.user;
            showAlert('Connexion réussie!');
            updateAuthUI(true);
            loadCartCount();
            loadWishlistCount();
            
            // Redirection
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showAlert(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Erreur connexion:', error);
        showAlert('Erreur de connexion', 'error');
    }
}

// Fonction d'inscription
async function register(userData) {
    try {
        const { data } = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.success) {
            showAlert('Inscription réussie!');
            
            // Redirection vers la page de connexion
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } else {
            showAlert(data.error || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        console.error('Erreur inscription:', error);
        showAlert('Erreur d\'inscription', 'error');
    }
}

// Fonction de déconnexion
async function logout() {
    try {
        await apiRequest('/api/auth/logout', {
            method: 'POST'
        });
        
        currentUser = null;
        cartItems = [];
        wishlistItems = [];
        
        updateAuthUI(false);
        updateCartCount(0);
        updateWishlistCount(0);
        
        showAlert('Déconnexion réussie');
        
        // Redirection
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

// Gestion du panier
async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        showAlert('Veuillez vous connecter pour ajouter au panier', 'warning');
        return;
    }
    
    try {
        const { data } = await apiRequest('/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: quantity
            })
        });
        
        if (data.success) {
            showAlert('Produit ajouté au panier!');
            loadCartCount();
        } else {
            showAlert(data.error || 'Erreur ajout panier', 'error');
        }
    } catch (error) {
        console.error('Erreur ajout panier:', error);
        showAlert('Erreur ajout panier', 'error');
    }
}

// Gestion de la wishlist
async function addToWishlist(productId) {
    if (!currentUser) {
        showAlert('Veuillez vous connecter pour ajouter à la wishlist', 'warning');
        return;
    }
    
    try {
        const { data } = await apiRequest('/api/wishlist/add', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId
            })
        });
        
        if (data.success) {
            showAlert('Produit ajouté à la wishlist!');
            loadWishlistCount();
        } else {
            showAlert(data.error || 'Erreur ajout wishlist', 'error');
        }
    } catch (error) {
        console.error('Erreur ajout wishlist:', error);
        showAlert('Erreur ajout wishlist', 'error');
    }
}

// Charger le nombre d'articles dans le panier
async function loadCartCount() {
    if (!currentUser) return;
    
    try {
        const { data } = await apiRequest(`/api/cart/user/${currentUser.id}`);
        
        if (data.success) {
            updateCartCount(data.itemCount || 0);
        }
    } catch (error) {
        console.error('Erreur chargement panier:', error);
    }
}

// Charger le nombre d'articles dans la wishlist
async function loadWishlistCount() {
    if (!currentUser) return;
    
    try {
        const { data } = await apiRequest(`/api/wishlist/user/${currentUser.id}`);
        
        if (data.success) {
            updateWishlistCount(data.itemCount || 0);
        }
    } catch (error) {
        console.error('Erreur chargement wishlist:', error);
    }
}

// Mettre à jour le compteur du panier
function updateCartCount(count) {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// Mettre à jour le compteur de la wishlist
function updateWishlistCount(count) {
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = count;
    }
}

// Formater le prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Créer une card de produit
function createProductCard(product) {
    return `
        <div class="product-card fade-in" data-product-id="${product.id}">
            <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <p class="product-description">${product.description || 'Aucune description disponible'}</p>
                <div class="product-actions">
                    <button onclick="addToCart(${product.id})" class="btn btn-primary">Ajouter au panier</button>
                    <button onclick="addToWishlist(${product.id})" class="btn btn-secondary">♥ Wishlist</button>
                </div>
            </div>
        </div>
    `;
}

// Créer une card de catégorie
function createCategoryCard(category) {
    return `
        <div class="category-card fade-in" onclick="filterByCategory('${category.name}')">
            <h3>${category.name}</h3>
            <p>${category.description || 'Découvrez nos produits'}</p>
        </div>
    `;
}

// Filtrer par catégorie
function filterByCategory(categoryName) {
    window.location.href = `/products?category=${encodeURIComponent(categoryName)}`;
}

// Recherche de produits
function searchProducts(query) {
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
}

// Fonction pour déboguer (vulnérabilité : exposition d'informations)
function debugInfo() {
    console.log('Debug Info:', {
        currentUser: currentUser,
        cartItems: cartItems,
        wishlistItems: wishlistItems,
        sessionStorage: sessionStorage,
        localStorage: localStorage,
        cookies: document.cookie,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    });
}

// Exposer les fonctions de debug globalement (vulnérabilité)
window.debugInfo = debugInfo;
window.apiRequest = apiRequest;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Ajouter des event listeners pour la recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts(this.value);
            }
        });
    }
    
    // Debug automatique (vulnérabilité : logging excessif)
    setInterval(debugInfo, 30000); // Toutes les 30 secondes
});

// Gestion des erreurs globales (vulnérabilité : exposition d'erreurs)
window.addEventListener('error', function(e) {
    console.error('Global Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error,
        stack: e.error ? e.error.stack : null,
        timestamp: new Date().toISOString()
    });
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', {
        reason: e.reason,
        promise: e.promise,
        timestamp: new Date().toISOString()
    });
});