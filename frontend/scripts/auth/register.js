async function register() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !password || !confirmPassword) {
        showError('Всички полета са задължителни');
        return;
    }

    if (username.length < 3) {
        showError('Потребителското име трябва да е поне 3 символа');
        return;
    }

    if (password.length < 6) {
        showError('Паролата трябва да е поне 6 символа');
        return;
    }

    if (password !== confirmPassword) {
        showError('Паролите не съвпадат');
        return;
    }

    try {
        const res = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            showSuccess('Регистрацията е успешна! Пренасочване...');
            
            // Автоматичен логин след регистрация
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    if (loginRes.ok) {
        setTimeout(() => {
            window.location.href = '/user_tabs/patient/profile/setup.html';
        }, 1500);
    } else {
        // Ако логинът не работи - праша към login страницата
        setTimeout(() => {
            window.location.href = '/user_tabs/login/login.html';
        }, 1500);
    }
        } else {
            const err = await res.json();
            showError(err.message || 'Грешка при регистрация');
        }
    } catch (e) {
        showError('Грешка при свързване със сървъра');
    }
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('success-msg').style.display = 'none';
}

function showSuccess(msg) {
    const el = document.getElementById('success-msg');
    el.textContent = msg;
    el.style.display = 'block';
    document.getElementById('error-msg').style.display = 'none';
}

document.addEventListener('keypress', e => {
    if (e.key === 'Enter') register();
});