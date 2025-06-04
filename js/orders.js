function getStatusIcon(status) {
  const icons = {
    'pendiente': '<i class="fas fa-clock"></i>',
    'preparando': '<i class="fas fa-box"></i>',
    'listo': '<i class="fas fa-check-circle"></i>',
    'entregado': '<i class="fas fa-truck"></i>'
  };
  return icons[status] || '<i class="fas fa-clock"></i>';
}

function getStatusText(status) {
  const texts = {
    'pendiente': 'Pendiente',
    'preparando': 'Preparando',
    'listo': 'Listo',
    'entregado': 'Entregado'
  };
  return texts[status] || status;
}

function getOrderActions(order) {
  let actions = '';
  if (order.status === 'entregado') {
    actions = `
      <div class="order-actions">
        <button class="btn btn-outline w-full" onclick="reorderItems(${order.id})">
          Volver a Pedir
        </button>
      </div>
    `;
  } else if (order.status === 'listo') {
    const message = order.details.orderType === 'domicilio'
      ? 'El repartidor está en camino.'
      : 'Puedes pasar a recogerlo.';
    actions = `
      <div class="order-status-info status-info-ready">
        <p><strong>¡Tu pedido está listo!</strong> ${message}</p>
      </div>
    `;
  } else if (order.status === 'preparando') {
    actions = `
      <div class="order-status-info status-info-preparing">
        <p>Tu pedido se está preparando. Tiempo estimado: 20-30 minutos.</p>
      </div>
    `;
  }
  return actions;
}

function renderOrders() {
  const ordersContainer = document.getElementById('ordersContainer');
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (!user || !user.email) {
    ordersContainer.innerHTML = '<p>No estás autenticado.</p>';
    return;
  }

  const allOrders = JSON.parse(localStorage.getItem('orders') || '{}');
  const userOrders = allOrders[user.email] || [];

  if (userOrders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-box"></i>
        <p>No tienes pedidos aún</p>
        <a href="menu.html" class="btn btn-primary">Hacer tu Primer Pedido</a>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = userOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h3>Pedido #${order.id}</h3>
          <p>${order.date}</p>
          <p>${order.details.orderType}</p>
        </div>
        <div class="order-status">
          <div class="status-badge status-${order.status}">
            ${getStatusIcon(order.status)}
            <span>${getStatusText(order.status)}</span>
          </div>
          <p class="order-total">$${order.total.toLocaleString()}</p>
        </div>
      </div>
      <div class="order-items">
        <h4>Productos:</h4>
        ${order.items.map(item => `
          <div class="order-item">
            <span class="order-item-name">${item.name} x${item.quantity}</span>
            <span class="order-item-price">$${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
      ${getOrderActions(order)}
    </div>
  `).join('');
}

function reorderItems(orderId) {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user || !user.email) return;

  const allOrders = JSON.parse(localStorage.getItem('orders') || '{}');
  const userOrders = allOrders[user.email] || [];
  const order = userOrders.find(o => o.id === orderId);
  if (!order) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  order.items.forEach(item => {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({ ...item });
    }
  });

  localStorage.setItem('cart', JSON.stringify(cart));
  const notification = document.getElementById('notification');
  notification.textContent = 'Productos agregados al carrito';
  notification.className = 'notification success show';
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
  setTimeout(() => {
    window.location.href = 'cart.html';
  }, 1500);
}

document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  renderOrders();

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    window.location.href = 'index.html';
  });
});
