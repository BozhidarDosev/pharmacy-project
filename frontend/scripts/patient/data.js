import { API } from '../config/config.js';
import { setupNavbar, loadCurrentUser} from '../auth/auth.js';

let patientId = null;
let currentUserDetails = null;
let currentUser = null;

window.saveChanges = saveChanges;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserDeatails();
    const user = await loadCurrentUser();
    if (!user) return;
    setupNavbar(user);
});


async function loadUserDeatails() {
    const res = await fetch(`${API}/patients/my-profile`, {
        credentials: 'include'
    });

    if (!res.ok) {
        alert('Моля попълни профила си, за да видиш тази страница');
        window.location.href = '/user_tabs/patient/profile/setup.html';
        return;
    }

    const patient = await res.json();
    patientId = patient.id;
    currentUserDetails = patient;

    document.getElementById('name').textContent = patient.name;
    document.getElementById('egn').textContent = patient.egn;
    document.getElementById('insured').value = patient.insured ? 'true' : 'false';
    document.getElementById('personal-doctor').textContent = patient.personalDoctorName;
}

async function saveChanges() {
   
    const insured = 
        document.getElementById('insured').value === 'true';
    
    //името от span-а
    const name = document.getElementById('name').textContent;
    const egn = document.getElementById('egn').textContent;

    const res = await fetch(`${API}/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, egn, insured})
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