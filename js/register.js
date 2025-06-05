function showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                surname: document.getElementById('surname').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            if (!formData.name || !formData.surname || !formData.phone || !formData.email || !formData.password) {
                showNotification('Por favor completa todos los campos obligatorios', 'error');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                showNotification('Por favor ingresa un email válido', 'error');
                return;
            }

            if (formData.password.length < 6) {
                showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }

            const phoneRegex = /^[\d\s\-\+()]+$/;
            if (!phoneRegex.test(formData.phone)) {
                showNotification('Por favor ingresa un número de teléfono válido', 'error');
                return;
            }

            const registerText = document.getElementById('registerText');
            registerText.textContent = 'Registrando...';

            setTimeout(() => {
                const existingUsers = JSON.parse(localStorage.getItem('restaurantUsers') || '[]');

                if (existingUsers.some(user => user.email === formData.email)) {
                    showNotification('Este email ya está registrado. Intenta con otro email o inicia sesión.', 'error');
                    registerText.textContent = 'Registrarse';
                    return;
                }

                if (existingUsers.some(user => user.phone === formData.phone)) {
                    showNotification('Este número de teléfono ya está registrado.', 'error');
                    registerText.textContent = 'Registrarse';
                    return;
                }

                const newUser = {
                    id: Date.now().toString(),
                    name: formData.name,
                    surname: formData.surname,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password,
                    registeredAt: new Date().toISOString()
                };

                existingUsers.push(newUser);

                localStorage.setItem('restaurantUsers', JSON.stringify(existingUsers));

                showNotification('¡Registro exitoso! Tu cuenta ha sido creada correctamente', 'success');
                
                document.getElementById('registerForm').reset();
                
                setTimeout(() => {
                    window.location.href = 'inicioSesion?registered=true';
                }, 1500);
            }, 1000);
        });

        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('registerForm').dispatchEvent(new Event('submit'));
            }
        });