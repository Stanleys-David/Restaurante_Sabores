const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

if (!user || user.role !== 'admin') {
    alert('Acceso denegado. Solo los administradores pueden acceder a esta página.');
    window.location.href = '/html/inicioSesion.html';
}

let notifications = [
    {
        id: 1,
        message: "Nuevo pedido recibido #1003",
        type: "info",
        time: "Hace 5 minutos",
        read: false
    },
    {
        id: 2,
        message: "Pedido #1001 entregado exitosamente",
        type: "success",
        time: "Hace 15 minutos",
        read: false
    },
    {
        id: 3,
        message: "Stock bajo en Empanadas Criollas",
        type: "warning",
        time: "Hace 1 hora",
        read: true
    }
];

let products = JSON.parse(localStorage.getItem('adminProducts') || JSON.stringify([
    {
        id: 1,
        name: 'Bandeja Paisa',
        price: 25000,
        description: 'Plato típico con frijoles, arroz, carne, chorizo, huevo y más',
        image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Bandepaisabog.JPG',
        category: 'Platos Principales'
    },
    {
        id: 2,
        name: 'Empanadas Criollas',
        price: 8500,
        description: 'Deliciosas empanadas rellenas de carne, pollo o queso',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=200&fit=crop',
        category: 'Entradas'
    }
]));

let orders = [];

let editingProduct = null;

function showNotification(message, type = 'info') {
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        font-weight: 600;
        max-width: 300px;
        word-wrap: break-word;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; margin-left: auto; cursor: pointer; font-size: 1.2rem;">×</button>
        </div>
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

function toggleNotificationsPanel() {
    let panel = document.getElementById('notificationsPanel');

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'notificationsPanel';
        panel.style.cssText = `
            position: fixed;
            top: 5rem;
            right: 1rem;
            width: 350px;
            max-height: 400px;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
            z-index: 1000;
            overflow: hidden;
            transform: translateY(-10px);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        const unreadCount = notifications.filter(n => !n.read).length;

        panel.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
                <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600;">Notificaciones</h3>
                <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">${unreadCount} sin leer</p>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${notifications.map(notif => `
                    <div style="padding: 1rem; border-bottom: 1px solid #f3f4f6; ${!notif.read ? 'background: #fef7ed;' : ''}" onclick="markAsRead(${notif.id})">
                        <div style="display: flex; align-items: start; gap: 0.75rem;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${!notif.read ? '#ef4444' : '#d1d5db'}; margin-top: 0.5rem; flex-shrink: 0;"></div>
                            <div style="flex: 1;">
                                <p style="margin: 0; font-size: 0.875rem; font-weight: ${!notif.read ? '600' : '400'};">${notif.message}</p>
                                <p style="margin: 0; font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">${notif.time}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="padding: 1rem; border-top: 1px solid #e5e7eb; text-align: center;">
                <button onclick="markAllAsRead()" style="background: none; border: none; color: #3b82f6; font-size: 0.875rem; cursor: pointer;">Marcar todas como leídas</button>
            </div>
        `;

        document.body.appendChild(panel);

        setTimeout(() => {
            panel.style.transform = 'translateY(0)';
            panel.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!panel.contains(e.target) && !e.target.closest('.notifications-btn')) {
                    panel.style.transform = 'translateY(-10px)';
                    panel.style.opacity = '0';
                    setTimeout(() => {
                        if (panel.parentElement) {
                            panel.remove();
                        }
                    }, 300);
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    } else {
        panel.style.transform = 'translateY(-10px)';
        panel.style.opacity = '0';
        setTimeout(() => {
            if (panel.parentElement) {
                panel.remove();
            }
        }, 300);
    }
}

function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.remove();
            setTimeout(() => toggleNotificationsPanel(), 100);
        }
    }
}

function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    updateNotificationBadge();
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.remove();
    }
    showNotification('Todas las notificaciones marcadas como leídas', 'success');
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notifications-btn .badge');
    const unreadCount = notifications.filter(n => !n.read).length;
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function saveProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(products));
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            loadTabContent(tabId);
        });
    });
}

function loadTabContent(tabId) {
    switch (tabId) {
        case 'orders':
            renderOrders();
            break;
        case 'menu':
            renderMenuPreview();
            break;
        case 'edit':
            renderEditProducts();
            break;
        case 'add':
            setupProductForm();
            break;
    }
}

function renderOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    const allOrders = JSON.parse(localStorage.getItem('orders') || '{}');
    const ordersList = Object.values(allOrders).flat();

    if (ordersList.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-box"></i>
                <p>No hay pedidos aún</p>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = ordersList.map(order => `
        <div class="admin-order-card">
            <div class="admin-order-header">
                <div>
                    <h3>Pedido #${order.id}</h3>
                    <p>${order.customerName || 'Cliente'} - ${order.phone || 'Sin teléfono'}</p>
                    <p>${order.date} - ${order.details.orderType}</p>
                </div>
                <div class="text-right">
                    <div class="status-badge status-${order.status}">${order.status}</div>
                    <p class="order-total">$${order.total.toLocaleString()}</p>
                </div>
            </div>
            <div class="admin-order-content">
                <div class="admin-order-items">
                    <h4>Productos:</h4>
                    ${order.items.map(item => `
                        <p>${item.name} x${item.quantity}</p>
                    `).join('')}
                </div>
                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pendiente" ${order.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="preparando" ${order.status === 'preparando' ? 'selected' : ''}>Preparando</option>
                    <option value="listo" ${order.status === 'listo' ? 'selected' : ''}>Listo</option>
                    <option value="entregado" ${order.status === 'entregado' ? 'selected' : ''}>Entregado</option>
                </select>
                <div style="margin-top: 1rem;">
                    <button class="btn btn-outline" onclick="cancelOrder(${order.id})">
                        <i class="fas fa-times-circle"></i> Cancelar Pedido
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const allOrders = JSON.parse(localStorage.getItem('orders') || '{}');
    for (const user in allOrders) {
        const orderIndex = allOrders[user].findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            allOrders[user][orderIndex].status = newStatus;
            localStorage.setItem('orders', JSON.stringify(allOrders));
            showNotification(`Estado del pedido #${orderId} actualizado`, 'success');
            renderOrders();
            break;
        }
    }
}

function renderMenuPreview() {
    const menuPreview = document.getElementById('menuPreview');
    menuPreview.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="badge mb-2">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

function renderEditProducts() {
    const editProductsList = document.getElementById('editProductsList');
    editProductsList.innerHTML = products.map(product => `
        <div class="edit-product-item">
            <div class="edit-product-info">
                <img src="${product.image}" alt="${product.name}" class="edit-product-image">
                <div class="edit-product-details">
                    <h3>${product.name}</h3>
                    <p>${product.category}</p>
                    <p class="edit-product-price">$${product.price.toLocaleString()}</p>
                </div>
            </div>
            <div class="edit-product-actions">
                <button class="edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function setupProductForm() {
    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('productName').value,
            price: parseInt(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            image: document.getElementById('productImage').value || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
            category: document.getElementById('category').value
        };

        if (!formData.name || !formData.price || !formData.category) {
            showNotification('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        if (editingProduct) {
            updateProduct(formData);
        } else {
            addProduct(formData);
        }
    });
}

function addProduct(formData) {
    const newProduct = {
        id: Date.now(),
        ...formData
    };

    products.push(newProduct);
    saveProducts();
    resetProductForm();
    showNotification('Producto agregado exitosamente', 'success');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProduct = product;

    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = product.image;
    document.getElementById('category').value = product.category;

    document.getElementById('formTitle').textContent = 'Editar Producto';
    document.getElementById('submitText').textContent = 'Actualizar Producto';
    document.getElementById('cancelEdit').style.display = 'inline-flex';

    document.querySelector('[data-tab="add"]').click();
}

function updateProduct(formData) {
    const productIndex = products.findIndex(p => p.id === editingProduct.id);
    if (productIndex !== -1) {
        products[productIndex] = { ...editingProduct, ...formData };
        saveProducts();
        resetProductForm();
        showNotification('Producto actualizado exitosamente', 'success');
        renderEditProducts();
    }
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderEditProducts();
        showNotification('Producto eliminado exitosamente', 'success');
    }
}

function resetProductForm() {
    editingProduct = null;
    document.getElementById('productForm').reset();
    document.getElementById('formTitle').textContent = 'Agregar Nuevo Producto';
    document.getElementById('submitText').textContent = 'Guardar Producto';
    document.getElementById('cancelEdit').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    loadTabContent('orders');
    updateNotificationBadge();

    document.getElementById('cancelEdit').addEventListener('click', resetProductForm);

    document.querySelector('.notifications-btn').addEventListener('click', toggleNotificationsPanel);

    document.getElementById('logoutBtn').addEventListener('click', function() {
    try {
        // Clear session-related data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('cart');
        
        // Show success notification
        showNotification('Sesión cerrada correctamente', 'success');
        
        // Redirect to menu.html
        window.location.href = 'menu.html'; // Adjust path if needed, e.g., '../menu.html'
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
    });
    showNotification('¡Bienvenido al panel de administración!', 'success');
});

function cancelOrder(orderId) {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '{}');
    let updated = false;

    for (const email in storedOrders) {
        const index = storedOrders[email].findIndex(order => order.id === orderId);
        if (index !== -1) {
            storedOrders[email].splice(index, 1);
            updated = true;
            break;
        }
    }

    if (updated) {
        localStorage.setItem('orders', JSON.stringify(storedOrders));
        showNotification(`Pedido #${orderId} cancelado correctamente`, 'success');
        renderOrders(); // Vuelve a cargar la lista
    } else {
        showNotification(`No se encontró el pedido #${orderId}`, 'error');
    }
}