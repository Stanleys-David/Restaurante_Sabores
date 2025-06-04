const ADMIN_CREDENTIALS = {
          email: 'admin@sabores.com',
          password: 'admin'
      };
      
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) {
          if (user.role === 'admin') {
              window.location.href = 'admin.html';
          } else {
              window.location.href = 'menu.html';
          }
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

      document.getElementById('loginForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value.trim();

          if (!email || !password) {
              showNotification('Por favor ingresa tu correo y contraseña', 'error');
              return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
              showNotification('Por favor ingresa un email válido', 'error');
              return;
          }

          const loginText = document.getElementById('loginText');
          loginText.textContent = 'Iniciando sesión...';

          setTimeout(() => {
              if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
                  const adminSession = {
                      id: 'admin',
                      name: 'Administrador',
                      surname: 'Sistema',
                      email: ADMIN_CREDENTIALS.email,
                      phone: '3001234567',
                      role: 'admin'
                  };
                  
                  localStorage.setItem('currentUser', JSON.stringify(adminSession));
                  showNotification('¡Bienvenido Administrador!', 'success');
                  
                  setTimeout(() => {
                      window.location.href = 'admin.html';
                  }, 1500);
                  return;
              }

              const registeredUsers = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');
              
              const foundUser = registeredUsers.find(u => u.email === email && u.password === password);

              if (foundUser) {
                  const userSession = {
                      id: foundUser.id,
                      name: foundUser.name,
                      surname: foundUser.surname,
                      email: foundUser.email,
                      phone: foundUser.phone,
                      role: 'customer'
                  };

                  localStorage.setItem('currentUser', JSON.stringify(userSession));
                  showNotification(`¡Bienvenido ${foundUser.name}! Has iniciado sesión correctamente`, 'success');
                  
                  setTimeout(() => {
                      window.location.href = 'menu.html';
                  }, 1500);
              } else {
                  showNotification('Email o contraseña incorrectos. Verifica tus datos o regístrate si no tienes cuenta.', 'error');
                  loginText.textContent = 'Iniciar Sesión';
              }
          }, 1000);
      });
      
      

      window.addEventListener('load', function() {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('registered') === 'true') {
              showNotification('¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.', 'success');
          }
      });

      document.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
              document.getElementById('loginForm').dispatchEvent(new Event('submit'));
          }
      });