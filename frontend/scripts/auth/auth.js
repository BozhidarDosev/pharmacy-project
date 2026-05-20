import { API } from "/scripts/config/config.js";

export let currentUser = null;

export async function loadCurrentUser() {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    if (res.status === 401) {
        window.location.href = '/login/login.html';
        return null;
    }
    currentUser = await res.json();
    return currentUser;
}

export async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/login/login.html';
}

export function setupNavbar(user) {
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = user.username;

    const adminBtn = document.getElementById('admin-panel-btn');
    if (!adminBtn) return;

    if (user.role === 'ROLE_ADMIN') {
        adminBtn.removeAttribute('hidden');
        adminBtn.removeAttribute('disabled');
    }
}