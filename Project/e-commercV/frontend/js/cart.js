// Script spécifique à la page du panier

let cartData = [];

// Charger le panier de l'utilisateur
async function loadCart() {
    if (!currentUser) {
        showEmptyCart();
        return;
    }
    
    try {
        const { data } = await apiRequest(`/api/cart/user/${currentUser.id}`);
        
        if (data.success && data.cartItems && data.cartItems.length > 0) {
            cartData = data.cartItems;
            displayCartItems();
            updateCartSummary(data.totalAmount, data.itemCount);
            showCartContent();
        } else {
            showEmptyCart();
        }
    } catch (error) {
        console.error('Erreur chargement panier:', error);
        showEmptyCart();
    }
}

// Afficher les articles du panier
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    
    cartItemsContainer.innerHTML = cartData.map(item => `
        <div class="cart-item fade-in">
            <img src="${item.image_url}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80'">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>Prix unitaire: ${formatPrice(item.price)}</p>
                <p>Stock disponible: ${item.stock}</p>
            </div>
            <div class="item-actions">
                <div class="quantity-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="updateQuantity(${item.product_id}, ${item.quantity - 1})" class="btn btn-secondary" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.stock}" class="quantity-input" onchange="updateQuantity(${item.product_id}, this.value)">
                    <button onclick="updateQuantity(${item.product_id}, ${item.quantity + 1})" class="btn btn-secondary" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
                </div>
                <p style="font-weight: bold; margin: 0.5rem 0;">Total: ${formatPrice(item.total_price)}</p>
                <button onclick="removeFromCart(${item.product_id})" class="btn btn-danger">Supprimer</button>
            </div>
        </div>
    `).join('');
}

// Mettre à jour la quantité d'un produit
async function updateQuantity(productId, newQuantity) {
    if (!currentUser || newQuantity < 1) return;
    
    try {
        const { data } = await apiRequest('/api/cart/update', {
            method: 'PUT',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId,
                quantity: parseInt(newQuantity)
            })
        });
        
        if (data.success) {
            loadCart(); // Recharger le panier
        } else {
            showAlert(data.error || 'Erreur mise à jour quantité', 'error');
        }
    } catch (error) {
        console.error('Erreur mise à jour quantité:', error);
        showAlert('Erreur mise à jour quantité', 'error');
    }
}

// Supprimer un produit du panier
async function removeFromCart(productId) {
    if (!currentUser) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article du panier ?')) {
        return;
    }
    
    try {
        const { data } = await apiRequest('/api/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({
                userId: currentUser.id,
                productId: productId
            })
        });
        
        if (data.success) {
            showAlert('Article supprimé du panier');
            loadCart(); // Recharger le panier
            loadCartCount(); // Mettre à jour le compteur
        } else {
            showAlert(data.error || 'Erreur suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur suppression panier:', error);
        showAlert('Erreur suppression', 'error');
    }
}

// Vider complètement le panier
async function clearCart() {
    if (!currentUser) return;
    
    if (!confirm('Êtes-vous sûr de vouloir vider complètement votre panier ?')) {
        return;
    }
    
    try {
        const { data } = await apiRequest(`/api/cart/clear/${currentUser.id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showAlert('Panier vidé');
            loadCart();
            loadCartCount();
        } else {
            showAlert(data.error || 'Erreur vidage panier', 'error');
        }
    } catch (error) {
        console.error('Erreur vidage panier:', error);
        showAlert('Erreur vidage panier', 'error');
    }
}

// Mettre à jour le résumé du panier
function updateCartSummary(totalAmount, itemCount) {
    document.getElementById('total-items').textContent = itemCount;
    document.getElementById('total-amount').textContent = formatPrice(totalAmount);
}

// Afficher le contenu du panier
function showCartContent() {
    document.getElementById('cart-content').style.display = 'block';
    document.getElementById('empty-cart').style.display = 'none';
}

// Afficher le panier vide
function showEmptyCart() {
    document.getElementById('cart-content').style.display = 'none';
    document.getElementById('empty-cart').style.display = 'block';
}

// Ouvrir la modal de commande
function checkout() {
    if (!currentUser) {
        showAlert('Veuillez vous connecter pour passer commande', 'warning');
        return;
    }
    
    if (cartData.length === 0) {
        showAlert('Votre panier est vide', 'warning');
        return;
    }
    
    // Pré-remplir l'adresse si disponible
    const shippingAddress = document.getElementById('shipping-address');
    if (currentUser.address) {
        shippingAddress.value = currentUser.address;
    }
    
    document.getElementById('checkout-modal').style.display = 'block';
}

// Fermer la modal de commande
function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

// Finaliser la commande
async function processCheckout(shippingAddress) {
    try {
        const { data } = await apiRequest('/api/orders/create', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.id,
                shippingAddress: shippingAddress
            })
        });
        
        if (data.success) {
            showAlert('Commande passée avec succès !');
            closeCheckoutModal();
            
            // Redirection vers les commandes après un délai
            setTimeout(() => {
                window.location.href = '/profile';
            }, 2000);
        } else {
            showAlert(data.error || 'Erreur lors de la commande', 'error');
        }
    } catch (error) {
        console.error('Erreur commande:', error);
        showAlert('Erreur lors de la commande', 'error');
    }
}

// Initialisation de la page panier
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification avant de charger
    checkAuthStatus().then(isAuth => {
        if (isAuth) {
            loadCart();
        } else {
            showEmptyCart();
        }
    });
    
    // Gestion du formulaire de commande
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shippingAddress = document.getElementById('shipping-address').value.trim();
        
        if (!shippingAddress) {
            showAlert('Veuillez saisir une adresse de livraison', 'warning');
            return;
        }
        
        processCheckout(shippingAddress);
    });
    
    // Fermer la modal en cliquant à l'extérieur
    document.getElementById('checkout-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCheckoutModal();
        }
    });
});