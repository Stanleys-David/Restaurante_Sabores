// Recuperar productos guardados por el admin (si existen)
const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');

// Función para agrupar productos por categoría
function groupProductsByCategory(products) {
    const grouped = {};
    products.forEach(product => {
        if (!grouped[product.category]) {
            grouped[product.category] = [];
        }
        grouped[product.category].push(product);
    });
    return grouped;
}

// Productos por defecto
const defaultProducts = [
    {
        id: 1,
        name: 'Empanadas Criollas',
        price: 8500,
        description: 'Deliciosas empanadas rellenas de carne, pollo o queso',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=200&fit=crop',
        category: 'Entradas'
    },
    {
        id: 2,
        name: 'Arepas Rellenas',
        price: 12000,
        description: 'Arepas tradicionales con diversos rellenos',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
        category: 'Entradas'
    },
    {
        id: 3,
        name: 'Bandeja Paisa',
        price: 25000,
        description: 'Plato típico con frijoles, arroz, carne, chorizo, huevo y más',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Bandepaisabog.JPG',
        category: 'Platos Principales'
    },
    {
        id: 4,
        name: 'Pollo a la Plancha',
        price: 18000,
        description: 'Pechuga de pollo jugosa con guarnición',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop',
        category: 'Platos Principales'
    },
    {
        id: 5,
        name: 'Jugo Natural',
        price: 5000,
        description: 'Jugos frescos de frutas naturales',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=200&fit=crop',
        category: 'Bebidas'
    },
    {
        id: 6,
        name: 'Gaseosa',
        price: 3500,
        description: 'Bebidas gaseosas variadas',
        image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=300&h=200&fit=crop',
        category: 'Bebidas'
    }
];

// Combinar productos por defecto con productos agregados por el admin
const combinedProducts = [...defaultProducts];
adminProducts.forEach(adminProduct => {
    if (!combinedProducts.some(p => p.id === adminProduct.id)) {
        combinedProducts.push(adminProduct);
    }
});

const menuData = groupProductsByCategory(combinedProducts);

// --------------------------------------------
// CARRITO Y FUNCIONES RELACIONADAS
// --------------------------------------------

let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    showNotification(`${product.name} agregado al carrito`, 'success');
}

function removeFromCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
        saveCart();
    }
}

function getTotalItems() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getTotalPrice() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const cartPreview = document.getElementById('cartPreview');
    const cartTitle = document.getElementById('cartTitle');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

    if (totalItems > 0) {
        cartPreview.style.display = 'block';
        cartTitle.textContent = `Carrito (${totalItems} items)`;
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-preview-item">
                <span>${item.name} x${item.quantity}</span>
                <div class="cart-preview-controls">
                    <button class="cart-preview-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="cart-preview-btn" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '"')})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartTotal.textContent = `$${totalPrice.toLocaleString()}`;
    } else {
        cartPreview.style.display = 'none';
    }
}

// --------------------------------------------
// MENÚ
// --------------------------------------------

function renderMenu() {
    const menuContainer = document.getElementById('menuContainer');
    menuContainer.innerHTML = '';

    Object.entries(menuData).forEach(([category, products]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section fade-in';
        
        categorySection.innerHTML = `
            <h2 class="category-title">${category}</h2>
            <div class="menu-grid">
                ${products.map(product => `
                    <div class="product-card">
                        <div style="position: relative;">
                            <img src="${product.image}" alt="${product.name}" class="product-image">
                            <div class="product-rating">
                                <i class="fas fa-star"></i>
                                4.5
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-footer">
                                <span class="product-price">$${product.price.toLocaleString()}</span>
                                <div class="product-actions">
                                    <button class="btn btn-outline btn-sm" onclick="showProductModal(${product.id})">
                                        Ver Detalles
                                    </button>
                                    <button class="btn btn-success btn-sm" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '"')})">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        menuContainer.appendChild(categorySection);
    });
}

function showProductModal(productId) {
    const product = findProductById(productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">${product.name}</h2>
        <p style="color: #6b7280; margin-bottom: 1rem;">${product.description}</p>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 12rem; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 1.875rem; font-weight: bold; color: #059669;">$${product.price.toLocaleString()}</span>
            <button class="btn btn-success" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '"')}); closeModal()">
                Agregar al Carrito
            </button>
        </div>
    `;

    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

function findProductById(id) {
    for (const category of Object.values(menuData)) {
        const product = category.find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Verificar usuario autenticado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const existingUsers = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const userInfo = document.getElementById('userInfo');
    const guestInfo = document.getElementById('guestInfo');
    const adminBtn = document.getElementById('adminBtn');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Renderizar el menú y carrito
    renderMenu();
    updateCartUI();

    if (currentUserEmail) {
        const user = existingUsers.find(u => u.email === currentUserEmail);
        if (user) {
            // Mostrar información del usuario si no es admin
            if (!user.isAdmin) {
                guestInfo.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = `¡Hola! ${user.name}`;
                adminBtn.style.display = 'none';
            } else {
                // Si es admin, mostrar botón de administración
                guestInfo.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = `¡Hola! ${user.name} (Admin)`;
                adminBtn.style.display = 'block';
            }
        }
    } else {
        userInfo.style.display = 'none';
        guestInfo.style.display = 'block';
        adminBtn.style.display = 'none';
    }

    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');
    const confirmModal = document.getElementById('confirmModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            confirmModal.style.display = 'block';
        });
    }

    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');

    if (cancelLogout) {
        cancelLogout.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            // Eliminar datos de la sesión
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserEmail');
            localStorage.removeItem('cart');
            userInfo.style.display = 'none';
            guestInfo.style.display = 'block';
            adminBtn.style.display = 'none';
            confirmModal.style.display = 'none';
            showNotification('Has cerrado sesión exitosamente', 'success');
            setTimeout(() => {
                window.location.href = 'menu.html'; // Recargar menu.html sin usuario
            }, 1000);
        });
    }

    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.style.display = 'none';
            }
        });
    }
});