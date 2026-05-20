import { API } from '../config/config.js';
import { setupNavbar, loadCurrentUser } from '../auth/auth.js';

window.saveProfile = saveProfile;
window.logout = logout;
window.showError = showError;
window.addSpec = addSpec;
window.removeSpec = removeSpec;

document.addEventListener('DOMContentLoaded', async () => {
    const user = await loadCurrentUser();
    if (!user) return;
    setupNavbar(user);

    // Проверка вече има ли профил
    const res = await fetch(`${API}/doctors/my-profile`, {
        credentials: 'include'
    });
    if (res.ok) {
        // Вече има профил — redirect
        window.location.href = '/user_tabs/doctor/doctor.html';
    }
});

function addSpec() {
    const container = document.getElementById('specializations-container');
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
        <input type="text" class="spec-input" placeholder="Например: Кардиолог"/>
        <button type="button" onclick="removeSpec(this)" class="remove-btn">✕</button>
    `;
    container.appendChild(row);
}

function removeSpec(btn) {
    const container = document.getElementById('specializations-container');
    if (container.children.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Трябва да има поне една специализация');
    }
}

async function saveProfile() {
    const name = document.getElementById('name').value.trim();
    const generalPractitioner = document.getElementById('personalDoctor').value === 'true';

    const specializations = Array.from(document.querySelectorAll('.spec-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');

    if (!name || specializations.length === 0) {
        showError('Всички полета са задължителни');
        return;
    }

    const res = await fetch(`${API}/doctors/my-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, specializations, generalPractitioner })
    });

    if (res.ok) {
        window.location.href = '/user_tabs/doctor/doctor.html';
    } else {
        const err = await res.json();
        showError(err.message || 'Грешка при запазване');
    }
}

async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/user_tabs/login/login.html';
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}