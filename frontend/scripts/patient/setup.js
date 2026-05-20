import { API } from '../config/config.js';
import { setupNavbar, loadCurrentUser} from '../auth/auth.js';

let currentUser = null;

window.saveProfile = saveProfile;

document.addEventListener('DOMContentLoaded', async () => {
    await loadDoctors();
    const user = await loadCurrentUser();
    if (!user) return;
    setupNavbar(user);
    insuranceStatus();
});

window.saveProfile = saveProfile;

async function loadDoctors() {
    const res = await fetch(`${API}/doctors`, { credentials: 'include' });
    const doctors = await res.json();

    const select = document.getElementById('personal-doctor');
    select.innerHTML = doctors
        .filter(d => d.generalPractitioner)
        .map(d => `<option value="${d.id}">${d.name}</option>`)
        .join('');
}

async function insuranceStatus(){
    const select = document.getElementById('insured');
    select.innerHTML = `
        <option value="true">Да</option>
        <option value="false">Не</option>
    `;

}

async function saveProfile() {
    const name = document.getElementById('name').value.trim();
    const egn = document.getElementById('egn').value.trim();
    const insured = document.getElementById('insured').value === 'true';
    const personalDoctorId = Number(document.getElementById('personal-doctor').value);

    if (!name || !egn || !personalDoctorId) {
        showError('Всички полета са задължителни');
        return;
    }

    if (egn.length !== 10 || !/^\d+$/.test(egn)) {
        showError('ЕГН-то трябва да съдържа точно 10 цифри');
        return;
    }

    try {
        const res = await fetch(`${API}/patients/my-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, egn, insured, personalDoctorId })
        });

        if (res.ok) {
            window.location.href = '/user_tabs/patient/patient.html';
        } else {
            const err = await res.json();
            showError(err.message || 'Грешка при запазване');
        }
    } catch (e) {
        showError('Грешка при свързване със сървъра');
    }
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.textContent = msg;
    el.style.display = 'block';
}