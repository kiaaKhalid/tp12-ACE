// Script spécifique à la page d'accueil

// Charger les catégories
async function loadCategories() {
    try {
        const { data } = await apiRequest('/admin/categories');
        
        if (data.success && data.categories) {
            const categoriesGrid = document.getElementById('categories-grid');
            
            if (data.categories.length === 0) {
                categoriesGrid.innerHTML = '<p class="empty-state">Aucune catégorie disponible</p>';
                return;
            }
            
            categoriesGrid.innerHTML = data.categories
                .map(category => createCategoryCard(category))
                .join('');
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
        const categoriesGrid = document.getElementById('categories-grid');
        categoriesGrid.innerHTML = '<p class="empty-state">Erreur de chargement des catégories</p>';
    }
}

// Charger les produits en vedette
async function loadFeaturedProducts() {
    try {
        const { data } = await apiRequest('/api/products?limit=8');
        
        if (data.success && data.products) {
            const productsGrid = document.getElementById('featured-products-grid');
            
            if (data.products.length === 0) {
                productsGrid.innerHTML = '<p class="empty-state">Aucun produit disponible</p>';
                return;
            }
            
            productsGrid.innerHTML = data.products
                .map(product => createProductCard(product))
                .join('');
        }
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        const productsGrid = document.getElementById('featured-products-grid');
        productsGrid.innerHTML = '<p class="empty-state">Erreur de chargement des produits</p>';
    }
}

// Initialisation de la page d'accueil
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadFeaturedProducts();
});