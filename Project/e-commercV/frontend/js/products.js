// Script spécifique à la page des produits

let currentFilters = {};

// Charger les produits avec filtres
async function loadProducts(filters = {}) {
    const loading = document.getElementById('loading');
    const productsGrid = document.getElementById('products-grid');
    
    loading.style.display = 'block';
    
    try {
        // Construction de l'URL avec paramètres
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.limit) params.append('limit', filters.limit);
        
        const url = `/api/products${params.toString() ? '?' + params.toString() : ''}`;
        const { data } = await apiRequest(url);
        
        loading.style.display = 'none';
        
        if (data.success && data.products) {
            if (data.products.length === 0) {
                productsGrid.innerHTML = `
                    <div class="empty-state">
                        <h3>Aucun produit trouvé</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                `;
                return;
            }
            
            productsGrid.innerHTML = data.products
                .map(product => createProductCard(product))
                .join('');
        } else {
            productsGrid.innerHTML = '<p class="empty-state">Erreur de chargement des produits</p>';
        }
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        loading.style.display = 'none';
        productsGrid.innerHTML = '<p class="empty-state">Erreur de chargement des produits</p>';
    }
}

// Charger les catégories pour le filtre
async function loadCategoriesFilter() {
    try {
        const { data } = await apiRequest('/admin/categories');
        
        if (data.success && data.categories) {
            const categoryFilter = document.getElementById('category-filter');
            
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Effectuer une recherche
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        currentFilters.search = searchTerm;
        loadProducts(currentFilters);
    }
}

// Appliquer les filtres
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const limitFilter = document.getElementById('limit-filter');
    const searchInput = document.getElementById('search-input');
    
    currentFilters = {};
    
    if (searchInput.value.trim()) {
        currentFilters.search = searchInput.value.trim();
    }
    
    if (categoryFilter.value) {
        currentFilters.category = categoryFilter.value;
    }
    
    if (sortFilter.value) {
        currentFilters.sort = sortFilter.value;
    }
    
    if (limitFilter.value) {
        currentFilters.limit = limitFilter.value;
    }
    
    loadProducts(currentFilters);
}

// Effacer les filtres
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('sort-filter').value = '';
    document.getElementById('limit-filter').value = '';
    
    currentFilters = {};
    loadProducts();
}

// Gérer les paramètres URL
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const sort = urlParams.get('sort');
    const limit = urlParams.get('limit');
    
    if (category) {
        document.getElementById('category-filter').value = category;
        currentFilters.category = category;
    }
    
    if (search) {
        document.getElementById('search-input').value = search;
        currentFilters.search = search;
    }
    
    if (sort) {
        document.getElementById('sort-filter').value = sort;
        currentFilters.sort = sort;
    }
    
    if (limit) {
        document.getElementById('limit-filter').value = limit;
        currentFilters.limit = limit;
    }
}

// Initialisation de la page des produits
document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesFilter();
    handleUrlParams();
    loadProducts(currentFilters);
    
    // Event listener pour la recherche avec Enter
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});