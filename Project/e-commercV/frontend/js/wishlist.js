// Script spécifique à la page wishlist

let wishlistData = [];

// Charger la wishlist de l'utilisateur
async function loadWishlist() {
    if (!currentUser) {
        showEmptyWishlist();
        return;
    }
    
    try {
        const { data } = await apiRequest(`/api/wishlist/user/${currentUser.id}`);
        
        if (data.success && data.wishlistItems && data.wishlistItems.length > 0) {
            wishlistData = data.wishlistItems;
            displayWishlistItems();
            showWishlistContent();
        } else {
            showEmptyWishlist();
        }
    } catch (error) {
        console.error('Erreur chargement wishlist:', error);
        showEmptyWishlist();
    }
}

// Afficher les articles de la wishlist
function displayWishlistItems() {
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    
    wishlistItemsContainer.innerHTML = wishlistData.map(item => `
        <div class="wishlist-item fade-in">
            <img src="${item.image_url}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80'">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="product-price">${formatPrice(item.price)}</p>
                <p>${item.description || 'Aucune description disponible'}</p>
                <p><small>Catégorie: ${item.category_name || 'Non définie'}</small></p>
                <p><small>Ajouté le: ${new Date(item.added_at).toLocaleDateString('fr-FR')}</small></p>
            </div>
            <div class="item-actions">
                <button onclick="moveToCart(${item.product_id})" class="btn btn-primary">Ajouter au panier</button>
                <button onclick="removeFromWishlist(${item.product_id})" class="btn btn-danger">Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Déplacer un produit vers le panier
async function moveToCart(productId) {
    if (!currentUser) return;
    
    try {
        const { data } = await apiRequest('/api/wishlist/move-to-cart', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: 1
            })
        });
        
        if (data.success) {
            showAlert('Produit déplacé vers le panier !');
            loadWishlist(); // Recharger la wishlist
            loadCartCount(); // Mettre à jour le compteur du panier
            loadWishlistCount(); // Mettre à jour le compteur de la wishlist
        } else {
            showAlert(data.error || 'Erreur déplacement panier', 'error');
        }
    } catch (error) {
        console.error('Erreur déplacement panier:', error);
        showAlert('Erreur déplacement panier', 'error');
    }
}

// Supprimer un produit de la wishlist
async function removeFromWishlist(productId) {
    if (!currentUser) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article de votre wishlist ?')) {
        return;
    }
    
    try {
        const { data } = await apiRequest('/api/wishlist/remove', {
            method: 'DELETE',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId
            })
        });
        
        if (data.success) {
            showAlert('Article supprimé de la wishlist');
            loadWishlist(); // Recharger la wishlist
            loadWishlistCount(); // Mettre à jour le compteur
        } else {
            showAlert(data.error || 'Erreur suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur suppression wishlist:', error);
        showAlert('Erreur suppression', 'error');
    }
}

// Vider complètement la wishlist
async function clearWishlist() {
    if (!currentUser) return;
    
    if (!confirm('Êtes-vous sûr de vouloir vider complètement votre wishlist ?')) {
        return;
    }
    
    try {
        const { data } = await apiRequest(`/api/wishlist/clear/${currentUser.id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showAlert('Wishlist vidée');
            loadWishlist();
            loadWishlistCount();
        } else {
            showAlert(data.error || 'Erreur vidage wishlist', 'error');
        }
    } catch (error) {
        console.error('Erreur vidage wishlist:', error);
        showAlert('Erreur vidage wishlist', 'error');
    }
}

// Déplacer tous les articles vers le panier
async function moveAllToCart() {
    if (!currentUser || wishlistData.length === 0) return;
    
    if (!confirm('Voulez-vous ajouter tous les articles de votre wishlist au panier ?')) {
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of wishlistData) {
        try {
            const { data } = await apiRequest('/api/wishlist/move-to-cart', {
                method: 'POST',
                body: JSON.stringify({
                    userId: currentUser.id,
                    productId: item.product_id,
                    quantity: 1
                })
            });
            
            if (data.success) {
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error('Erreur déplacement article:', error);
            errorCount++;
        }
    }
    
    if (successCount > 0) {
        showAlert(`${successCount} article(s) déplacé(s) vers le panier`);
        loadWishlist();
        loadCartCount();
        loadWishlistCount();
    }
    
    if (errorCount > 0) {
        showAlert(`${errorCount} erreur(s) lors du déplacement`, 'warning');
    }
}

// Afficher le contenu de la wishlist
function showWishlistContent() {
    document.getElementById('wishlist-content').style.display = 'block';
    document.getElementById('empty-wishlist').style.display = 'none';
}

// Afficher la wishlist vide
function showEmptyWishlist() {
    document.getElementById('wishlist-content').style.display = 'none';
    document.getElementById('empty-wishlist').style.display = 'block';
}

// Initialisation de la page wishlist
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification avant de charger
    checkAuthStatus().then(isAuth => {
        if (isAuth) {
            loadWishlist();
        } else {
            showEmptyWishlist();
        }
    });
});