  document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;
    const btn = document.querySelector('button[type="submit"]');


    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">autorenew</span> Verificando...';

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
       

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard.html'; // Cambia a tu ruta
      } else {
        showError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      showError('No se pudo conectar al servidor');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Log In to Dashboard <span class="material-symbols-outlined">arrow_forward</span>';
    }
  });

  function showError(message) {
    let errorDiv = document.getElementById('error-msg');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = 'error-msg';
      errorDiv.className = 'text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800';
      document.querySelector('form').insertBefore(errorDiv, document.querySelector('button[type="submit"]'));
    }
    errorDiv.textContent = message;
  }


  document.querySelector('button[type="button"]').addEventListener('click', function() {
    const input = document.querySelector('input[type="password"], input[name="password"]') 
                  || this.previousElementSibling.querySelector('input');
    const icon = this.querySelector('.material-symbols-outlined');
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      icon.textContent = 'visibility';
    }
  });