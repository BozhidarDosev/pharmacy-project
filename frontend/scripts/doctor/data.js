import { API } from '../config/config.js';
import { loadCurrentUser, setupNavbar, logout } from '../auth/auth.js';

let doctorId = null;
let hasPatients = false;

window.saveChanges = saveChanges;
window.addSpec = addSpec;
window.removeSpec = removeSpec;
window.logout = logout;

document.addEventListener('DOMContentLoaded', async () => {
    const user = await loadCurrentUser();
    if (!user) return;
    setupNavbar(user);
    await loadProfile();
});

async function loadProfile() {
    const res = await fetch(`${API}/doctors/my-profile`, {
        credentials: 'include'
    });

    if (!res.ok) {
        window.location.href = '/user_tabs/doctor/setup.html';
        return;
    }

    const doctor = await res.json();
    doctorId = doctor.id;

    document.getElementById('license-number').textContent = doctor.id;
    document.getElementById('name').textContent = doctor.name;
    document.getElementById('generalPractitioner').value =
        doctor.generalPractitioner ? 'true' : 'false';

    // Специализации
    const container = document.getElementById('specializations-container');
    container.innerHTML = '';
    (doctor.specializations || []).forEach(spec => {
        addSpecRow(spec);
    });

    // Провери дали има вързани пациенти
    await checkPatients(doctor.id);
}

async function checkPatients(id) {
    const res = await fetch(`${API}/statistics/patients-by-doctor/${id}`, {
        credentials: 'include'
    });
    const patients = await res.json();
    hasPatients = patients.length > 0;

    const gpSelect = document.getElementById('generalPractitioner');
    const warning = document.getElementById('gp-warning');

    if (hasPatients) {
        gpSelect.disabled = true;
        warning.style.display = 'block';
    }
}

function addSpecRow(value = '') {
    const container = document.getElementById('specializations-container');
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
        <input type="text" class="spec-input" value="${value}"
               placeholder="Например: Кардиолог"/>
        <button type="button" onclick="removeSpec(this)" class="remove-btn">✕</button>
    `;
    container.appendChild(row);
}

function addSpec() {
    addSpecRow('');
}

function removeSpec(btn) {
    const container = document.getElementById('specializations-container');
    if (container.children.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Трябва да има поне една специализация');
    }
}

async function saveChanges() {
    const specializations = Array.from(document.querySelectorAll('.spec-input'))
        .map(input => input.value.trim())
        .filter(val => val !== '');

    if (specializations.length === 0) {
        showError('Трябва да има поне една специализация');
        return;
    }

    const generalPractitioner = 
        document.getElementById('generalPractitioner').value === 'true';
    
    // Вземи името от span-а
    const name = document.getElementById('name').textContent;

    const res = await fetch(`${API}/doctors/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, specializations, generalPractitioner })
    });

    if (res.ok) {
        showSuccess('Данните са запазени успешно!');
        alert('Данните са запазени успешно!');
    } else {
        const err = await res.json();
        showError(err.message || 'Грешка при запазване');
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