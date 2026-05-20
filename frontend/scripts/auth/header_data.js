import { API } from "/scripts/config/config.js";

let currentUser = null;

window.logout = logout;

document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentUser();
});

async function loadCurrentUser() {
    try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
        
        if (res.status === 401) {
            const isSetupPage = window.location.href.includes('setup');
            if (!isSetupPage) {
                alert("Моля, влезте в профила си, за да продължите.");
                window.location.href = '/user_tabs/login/login.html';
            }
            return; 
        }

        currentUser = await res.json();
        console.log("✅ Успешно заредена текуща сесия:", currentUser);

        const nameEl = document.getElementById('user-name');
        if (nameEl) nameEl.textContent = currentUser.username;

    } catch(err) {
        console.error("⚠️ Грешка:", err.message);
    }
}

async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/user_tabs/login/login.html';
}

setInterval(async () => {
    try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
        if (res.status === 401) {
            const isSetupPage = window.location.href.includes('setup');
            if (!isSetupPage) {
                alert('Сесията ти изтече. Моля влез отново.');
                window.location.href = '/user_tabs/login/login.html';
            }
        }
    } catch(err) {
        console.error("Грешка при проверка на сесията:", err);
    }
}, 5 * 60 * 1000);