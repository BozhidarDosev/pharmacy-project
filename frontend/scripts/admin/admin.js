import { API } from '../config/config.js';

const MONTHS = {
    1: 'Януари', 2: 'Февруари', 3: 'Март', 4: 'Април',
    5: 'Май', 6: 'Юни', 7: 'Юли', 8: 'Август',
    9: 'Септември', 10: 'Октомври', 11: 'Ноември', 12: 'Декември'
};

let currentUser = null;
let allPatients = [];
let allDoctors = [];
let allUsers = [];
let allExaminations = [];

let usersTable = null;
let doctorsTable = null;
let patientsTable = null;
let examinationsTable = null;
let sickLeavesTable = null;
let patientsByDiagnosisTable = null;
let patientsByDoctorTable = null;
let paidPerDoctorTable = null;
let visitsPerDoctorTable = null;
let examinationsByPeriodTable = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadUsers();
    await loadDoctors();
    await loadPatients();
    await loadExaminations();
    await loadSickLeaves();
});

window.switchView = switchView;
window.logout = logout;
window.showTab = showTab;
window.closeModal = closeModal;
window.changeRole = changeRole;
window.filterUsers = filterUsers;
window.filterDoctors = filterDoctors;
window.filterPatients = filterPatients;
window.filterExaminations = filterExaminations;
window.openPatientHistory = openPatientHistory;
window.addEditSpec = addEditSpec;
window.removeEditSpec = removeEditSpec;
window.saveEditDoctor = saveEditDoctor;
window.saveEditPatient = saveEditPatient;
window.saveEditExamination = saveEditExamination;
window.saveEditSickLeave = saveEditSickLeave;
window.loadMostCommonDiagnosis = loadMostCommonDiagnosis;
window.loadPatientsByDiagnosis = loadPatientsByDiagnosis;
window.loadPatientsByDoctor = loadPatientsByDoctor;
window.loadTotalPaidByPatients = loadTotalPaidByPatients;
window.loadMonthMostSickLeaves = loadMonthMostSickLeaves;
window.loadDoctorMostSickLeaves = loadDoctorMostSickLeaves;
window.loadPatientsCountPerDoctor = loadPatientsCountPerDoctor;
window.loadPaidPerDoctor = loadPaidPerDoctor;
window.loadVisitsPerDoctor = loadVisitsPerDoctor;
window.loadExaminationsByPeriod = loadExaminationsByPeriod;

function destroyTable(table) {
    if (table) { table.destroy(); return null; }
    return null;
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

async function checkAuth() {
    try {
        const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
        if (res.status === 401) {
            alert("Моля, влезте в профила си, за да продължите.");
            window.location.href = '/user_tabs/login/login.html';
            return;
        }
        currentUser = await res.json();
        document.getElementById('user-name').textContent = currentUser.username;
    } catch (err) {
        console.error("Грешка:", err);
        window.location.href = '/user_tabs/login/login.html';
    }
}

function switchView(role) {
    if (role === 'doctor') window.location.href = '../doctor/doctor.html';
    if (role === 'patient') window.location.href = '../patient/patient.html';
}

async function logout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '../login/login.html';
}

function showTab(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
    document.getElementById(`section-${name}`).classList.remove('hidden');
    document.getElementById(`tab-${name}`).classList.add('active-tab');
    if (name === 'statistics') loadDoctorSelect();
}

// ===== USERS =====
async function loadUsers() {
    const res = await fetch(`${API}/admin/users`, { credentials: 'include' });
    allUsers = await res.json();
    document.getElementById('metric-users').textContent = allUsers.length;
    document.getElementById('metric-admins').textContent = allUsers.filter(u => u.role === 'ROLE_ADMIN').length;
    document.getElementById('metric-doctors').textContent = allUsers.filter(u => u.role === 'ROLE_DOCTOR').length;
    document.getElementById('metric-patients').textContent = allUsers.filter(u => u.role === 'ROLE_PATIENT').length;
    renderUsersTable(allUsers);
}

function filterUsers(query) {
    const q = query.toLowerCase().trim();
    renderUsersTable(allUsers.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        String(u.id) === q
    ));
}

function renderUsersTable(data) {
    const roleLabels = { ROLE_ADMIN: 'Админ', ROLE_DOCTOR: 'Лекар', ROLE_PATIENT: 'Пациент' };
    const roleColors = {
        ROLE_ADMIN: 'background:#EEEDFE;color:#3C3489',
        ROLE_DOCTOR: 'background:#E6F1FB;color:#0C447C',
        ROLE_PATIENT: 'background:#EAF3DE;color:#27500A'
    };
    usersTable = destroyTable(usersTable);
    usersTable = new Tabulator('#users-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'ID', field: 'id', width: 60 },
            { title: 'Потребител', field: 'username', sorter: 'string' },
            {
                title: 'Роля', field: 'role',
                formatter: cell => {
                    const r = cell.getValue();
                    return `<span style="padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;${roleColors[r]}">${roleLabels[r]}</span>`;
                }
            },
            {
                title: 'Смени роля', headerSort: false,
                formatter: cell => {
                    const { id, role } = cell.getRow().getData();
                    return `<select onchange="changeRole(${id}, this.value)"
                        style="border:0.5px solid #d1d5db;border-radius:4px;padding:3px 6px;font-size:12px">
                        <option value="ROLE_PATIENT" ${role === 'ROLE_PATIENT' ? 'selected' : ''}>Пациент</option>
                        <option value="ROLE_DOCTOR" ${role === 'ROLE_DOCTOR' ? 'selected' : ''}>Лекар</option>
                        <option value="ROLE_ADMIN" ${role === 'ROLE_ADMIN' ? 'selected' : ''}>Админ</option>
                    </select>`;
                }
            },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    const res = await fetch(`${API}/admin/users/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    if (res.ok) {
                        await loadUsers();
                    } else {
                        const err = await res.json();
                        alert(err.message || 'Грешка при изтриване');
                    }
                }
            }
        ]
    });
}

async function changeRole(userId, newRole) {
    const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
        if (newRole === 'ROLE_DOCTOR') alert('Ролята е сменена на Лекар. Потребителят трябва да влезе и да попълни своите данни.');
        else if (newRole === 'ROLE_PATIENT') alert('Ролята е сменена на Пациент. Потребителят трябва да влезе и да попълни своите данни.');
        await loadUsers();
    } else {
        alert('Грешка при смяна на роля');
    }
}

// ===== DOCTORS =====
async function loadDoctors() {
    const res = await fetch(`${API}/doctors`, { credentials: 'include' });
    allDoctors = await res.json();
    renderDoctorsTable(allDoctors);
}

function filterDoctors(query) {
    const q = query.toLowerCase().trim();
    renderDoctorsTable(allDoctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.specializations && d.specializations.some(s => s.toLowerCase().includes(q))) ||
        String(d.id) === q
    ));
}

function renderDoctorsTable(data) {
    doctorsTable = destroyTable(doctorsTable);
    doctorsTable = new Tabulator('#doctors-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'ID', field: 'id', width: 60 },
            { title: 'Ime', field: 'name', sorter: 'string' },
            {
                title: 'Специализации', field: 'specializations',
                formatter: cell => {
                    const val = cell.getValue();
                    return val && val.length > 0 ? val.join(', ') : '—';
                }
            },
            { title: 'Личен лекар', field: 'generalPractitioner',
              formatter: cell => cell.getValue() ? 'Да' : 'Не' },
            {
                title: '', width: 90, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #166534;color:#166534;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Редактирай</button>",
                cellClick: (e, cell) => openEditDoctorModal(cell.getRow().getData())
            },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    const res = await fetch(`${API}/doctors/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    if (res.ok) {
                        await loadDoctors();
                    } else {
                        const err = await res.json();
                        alert(err.message || 'Грешка при изтриване');
                    }
                }
            }
        ]
    });
}

function openEditDoctorModal(doctor) {
    document.getElementById('edit-doctor-id').value = doctor.id;
    document.getElementById('edit-doctor-gp').value = doctor.generalPractitioner ? 'true' : 'false';
    const container = document.getElementById('edit-specializations-container');
    container.innerHTML = '';
    (doctor.specializations || []).forEach(spec => addEditSpecRow(spec));
    showModal('edit-doctor-modal');
}

function addEditSpecRow(value = '') {
    const container = document.getElementById('edit-specializations-container');
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
    row.innerHTML = `
        <input type="text" class="edit-spec-input" value="${value}" placeholder="Специализация"
            style="border:0.5px solid #d1d5db;border-radius:6px;padding:7px 10px;font-size:13px;flex:1"/>
        <button type="button" onclick="removeEditSpec(this)"
            style="border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:6px 10px;border-radius:6px;cursor:pointer">✕</button>
    `;
    container.appendChild(row);
}

function addEditSpec() { addEditSpecRow(''); }

function removeEditSpec(btn) {
    const container = document.getElementById('edit-specializations-container');
    if (container.children.length > 1) {
        btn.parentElement.remove();
    } else {
        alert('Трябва да има поне една специализация');
    }
}

async function saveEditDoctor() {
    const id = document.getElementById('edit-doctor-id').value;
    const generalPractitioner = document.getElementById('edit-doctor-gp').value === 'true';
    const specializations = Array.from(document.querySelectorAll('.edit-spec-input'))
        .map(i => i.value.trim()).filter(v => v !== '');
    if (specializations.length === 0) { alert('Трябва да има поне една специализация'); return; }

    const res = await fetch(`${API}/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ specializations, generalPractitioner })
    });

    if (res.ok) {
        closeModal('edit-doctor-modal');
        await loadDoctors();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

// ===== PATIENTS =====
async function loadPatients() {
    const res = await fetch(`${API}/patients`, { credentials: 'include' });
    if (!res.ok) return;
    allPatients = await res.json();
    renderPatientsTable(allPatients);
}

function filterPatients(query) {
    const q = query.toLowerCase().trim();
    renderPatientsTable(allPatients.filter(p =>
        p.name.toLowerCase().includes(q) || p.egn.includes(q)
    ));
}

function renderPatientsTable(data) {
    patientsTable = destroyTable(patientsTable);
    patientsTable = new Tabulator('#patients-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Ime', field: 'name', sorter: 'string' },
            { title: 'ЕГН', field: 'egn' },
            { title: 'Осигурен', field: 'insured', formatter: cell => cell.getValue() ? 'Да' : 'Не' },
            { title: 'Личен лекар', field: 'personalDoctorName' },
            {
                title: 'История', headerSort: false,
                formatter: () => "<button style='background:#166534;color:white;border:none;padding:3px 10px;border-radius:4px;font-size:11px;cursor:pointer'>Виж</button>",
                cellClick: async (e, cell) => openPatientHistory(cell.getRow().getData())
            },
            {
                title: '', width: 90, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #166534;color:#166534;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Редактирай</button>",
                cellClick: (e, cell) => openEditPatientModal(cell.getRow().getData())
            },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    const res = await fetch(`${API}/patients/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    if (res.ok) {
                        await loadPatients();
                    } else {
                        const err = await res.json();
                        alert(err.message || 'Грешка при изтриване');
                    }
                }
            }
        ]
    });
}

function openEditPatientModal(patient) {
    document.getElementById('edit-patient-id').value = patient.id;
    document.getElementById('edit-patient-name').value = patient.name;
    document.getElementById('edit-patient-egn').value = patient.egn;
    showModal('edit-patient-modal');
}

async function saveEditPatient() {
    const id = document.getElementById('edit-patient-id').value;
    const name = document.getElementById('edit-patient-name').value.trim();
    const egn = document.getElementById('edit-patient-egn').value.trim();
    if (!name || !egn) { alert('Всички полета са задължителни'); return; }
    if (egn.length !== 10 || !/^\d{10}$/.test(egn)) { alert('ЕГН-то трябва да е точно 10 цифри'); return; }
    const res = await fetch(`${API}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, egn })
    });
    if (res.ok) {
        closeModal('edit-patient-modal');
        await loadPatients();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

async function openPatientHistory(patient) {
    document.getElementById('history-patient-name').textContent = patient.name;
    const res = await fetch(`${API}/examinations?patientId=${patient.id}`, { credentials: 'include' });
    const data = await res.json();
    new Tabulator('#history-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 5,
        columns: [
            { title: 'Дата', field: 'date', sorter: 'date' },
            { title: 'Диагноза', field: 'diagnosis' },
            { title: 'Лечение', field: 'treatment' },
            { title: 'Цена', field: 'price', formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' }
        ]
    });
    showModal('history-modal');
}

// ===== EXAMINATIONS =====
async function loadExaminations() {
    const res = await fetch(`${API}/examinations`, { credentials: 'include' });
    allExaminations = await res.json();
    renderExaminationsTable(allExaminations);
}

function filterExaminations(query) {
    const q = query.toLowerCase().trim();
    renderExaminationsTable(allExaminations.filter(e =>
        e.diagnosis.toLowerCase().includes(q) ||
        e.patientName.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q)
    ));
}

function renderExaminationsTable(data) {
    examinationsTable = destroyTable(examinationsTable);
    examinationsTable = new Tabulator('#examinations-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Дата', field: 'date', sorter: false },
            { title: 'Лекар', field: 'doctorName' },
            { title: 'Пациент', field: 'patientName' },
            { title: 'Диагноза', field: 'diagnosis' },
            { title: 'Цена', field: 'price', formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' },
            {
                title: '', width: 90, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #166534;color:#166534;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Редактирай</button>",
                cellClick: (e, cell) => openEditExaminationModal(cell.getRow().getData())
            },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    const res = await fetch(`${API}/examinations/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    if (res.ok) {
                        await loadExaminations();
                    } else {
                        const err = await res.json();
                        alert(err.message || 'Грешка при изтриване');
                    }
                }
            }
        ]
    });
}

function openEditExaminationModal(examination) {
    document.getElementById('edit-examination-id').value = examination.id;
    document.getElementById('edit-examination-diagnosis').value = examination.diagnosis;
    showModal('edit-examination-modal');
}

async function saveEditExamination() {
    const id = document.getElementById('edit-examination-id').value;
    const diagnosis = document.getElementById('edit-examination-diagnosis').value.trim();
    if (!diagnosis) { alert('Диагнозата е задължителна'); return; }

    const res = await fetch(`${API}/examinations/admin/${id}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ diagnosis })
    });

    if (res.ok) {
        closeModal('edit-examination-modal');
        await loadExaminations();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

// async function saveEditExamination() {
//     const id = document.getElementById('edit-examination-id').value;
//     const diagnosis = document.getElementById('edit-examination-diagnosis').value.trim();
//     if (!diagnosis) { alert('Диагнозата е задължителна'); return; }

//     // Намери текущия преглед за да запазим останалите полета
//     const current = allExaminations.find(e => String(e.id) === String(id));
//     if (!current) { alert('Прегледът не е намерен'); return; }

//     const res = await fetch(`${API}/examinations/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({
//             diagnosis,
//             date: current.date,
//             treatment: current.treatment,
//             price: current.price,
//             patientId: current.patientId,
//             doctorId: current.doctorId
//         })
//     });

//     if (res.ok) {
//         closeModal('edit-examination-modal');
//         await loadExaminations();
//     } else {
//         const err = await res.json();
//         alert(err.message || 'Грешка при запазване');
//     }
// }

// ===== SICK LEAVES =====
async function loadSickLeaves() {
    const res = await fetch(`${API}/sick-leaves`, { credentials: 'include' });
    const data = await res.json();
    sickLeavesTable = destroyTable(sickLeavesTable);
    sickLeavesTable = new Tabulator('#sickleaves-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'От дата', field: 'startDate', sorter: 'date' },
            { title: 'Дни', field: 'days', sorter: 'number' },
            { title: 'Лекар', field: 'doctorName' },
            { title: 'Пациент', field: 'patientName' },
            {
                title: '', width: 90, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #166534;color:#166534;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Редактирай</button>",
                cellClick: (e, cell) => openEditSickLeaveModal(cell.getRow().getData())
            },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    const res = await fetch(`${API}/sick-leaves/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    if (res.ok) {
                        await loadSickLeaves();
                    } else {
                        const err = await res.json();
                        alert(err.message || 'Грешка при изтриване');
                    }
                }
            }
        ]
    });
}

function openEditSickLeaveModal(sickLeave) {
    document.getElementById('edit-sickleave-id').value = sickLeave.id;
    document.getElementById('edit-sickleave-startdate').value = sickLeave.startDate;
    document.getElementById('edit-sickleave-days').value = sickLeave.days;
    showModal('edit-sickleave-modal');
}

async function saveEditSickLeave() {
    const id = document.getElementById('edit-sickleave-id').value;
    const startDate = document.getElementById('edit-sickleave-startdate').value;
    const days = Number(document.getElementById('edit-sickleave-days').value);
    if (!startDate || !days || days < 1) { alert('Всички полета са задължителни'); return; }
    const res = await fetch(`${API}/sick-leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ startDate, days })
    });
    if (res.ok) {
        closeModal('edit-sickleave-modal');
        await loadSickLeaves();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

// ===== STATISTICS =====
async function loadDoctorSelect() {
    const res = await fetch(`${API}/doctors`, { credentials: 'include' });
    const doctors = await res.json();
    document.getElementById('doctor-select').innerHTML = doctors.map(d =>
        `<option value="${d.id}">${d.name}</option>`
    ).join('');
}

async function loadMostCommonDiagnosis() {
    const res = await fetch(`${API}/statistics/most-common-diagnosis`, { credentials: 'include' });
    const data = await res.json();
    const el = document.getElementById('most-common-diagnosis');
    if (data.length > 0) {
        el.innerHTML = `<span style="font-size:18px;font-weight:500;color:#1e3a5f">${data[0][0]}</span>
                        <span style="font-size:13px;color:#6b7280;margin-left:8px">(${data[0][1]} пъти)</span>`;
    } else {
        el.textContent = 'Няма данни';
    }
}

async function loadPatientsByDiagnosis() {
    const diagnosis = document.getElementById('diagnosis-input').value.trim();
    if (!diagnosis) return;
    const res = await fetch(
        `${API}/statistics/patients-by-diagnosis?diagnosis=${encodeURIComponent(diagnosis)}`,
        { credentials: 'include' }
    );
    const data = await res.json();
    patientsByDiagnosisTable = destroyTable(patientsByDiagnosisTable);
    patientsByDiagnosisTable = new Tabulator('#patients-by-diagnosis-table', {
        data, layout: 'fitColumns',
        columns: [
            { title: 'Ime', field: 'name' },
            { title: 'ЕГН', field: 'egn' },
            { title: 'Осигурен', field: 'insured', formatter: cell => cell.getValue() ? 'Да' : 'Не' }
        ]
    });
}

async function loadPatientsByDoctor() {
    const doctorId = document.getElementById('doctor-select').value;
    if (!doctorId) return;
    const res = await fetch(`${API}/statistics/patients-by-doctor/${doctorId}`, { credentials: 'include' });
    const data = await res.json();
    patientsByDoctorTable = destroyTable(patientsByDoctorTable);
    patientsByDoctorTable = new Tabulator('#patients-by-doctor-table', {
        data, layout: 'fitColumns',
        columns: [
            { title: 'Ime', field: 'name' },
            { title: 'ЕГН', field: 'egn' },
            { title: 'Осигурен', field: 'insured', formatter: cell => cell.getValue() ? 'Да' : 'Не' }
        ]
    });
}

async function loadTotalPaidByPatients() {
    const res = await fetch(`${API}/statistics/total-paid-by-patients`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('total-paid').textContent = `${(data.total || 0).toFixed(2)} лв.`;
}

async function loadMonthMostSickLeaves() {
    const res = await fetch(`${API}/statistics/month-most-sick-leaves`, { credentials: 'include' });
    const data = await res.json();
    const el = document.getElementById('month-most-sick');
    if (data.length > 0) {
        el.innerHTML = `${MONTHS[data[0][0]] || data[0][0]}
                        <span style="font-size:13px;color:#6b7280;margin-left:8px">(${data[0][1]} броя)</span>`;
    } else { el.textContent = 'Няма данни'; }
}

async function loadDoctorMostSickLeaves() {
    const res = await fetch(`${API}/statistics/doctor-most-sick-leaves`, { credentials: 'include' });
    const data = await res.json();
    const el = document.getElementById('doctor-most-sick');
    if (data.length > 0) {
        el.innerHTML = `${data[0][0]}
                        <span style="font-size:13px;color:#6b7280;margin-left:8px">(${data[0][1]} броя)</span>`;
    } else { el.textContent = 'Няма данни'; }
}

async function loadPatientsCountPerDoctor() {
    const res = await fetch(`${API}/statistics/patients-count-per-doctor`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('patients-count-per-doctor').innerHTML = data.map(row =>
        `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid #f0f0f0;font-size:13px">
            <span>${row[0]}</span><span style="font-weight:500">${row[1]} пациента</span>
        </div>`
    ).join('');
}

async function loadPaidPerDoctor() {
    const res = await fetch(`${API}/statistics/paid-by-patients-per-doctor`, { credentials: 'include' });
    const data = await res.json();
    paidPerDoctorTable = destroyTable(paidPerDoctorTable);
    paidPerDoctorTable = new Tabulator('#paid-per-doctor-table', {
        data: data.map(row => ({ doctor: row[0], total: row[1] })), layout: 'fitColumns',
        columns: [
            { title: 'Лекар', field: 'doctor', sorter: 'string' },
            { title: 'Сума', field: 'total', sorter: 'number',
              formatter: cell => `${Number(cell.getValue()).toFixed(2)} лв.` }
        ]
    });
}

async function loadVisitsPerDoctor() {
    const res = await fetch(`${API}/statistics/visits-per-doctor`, { credentials: 'include' });
    const data = await res.json();
    visitsPerDoctorTable = destroyTable(visitsPerDoctorTable);
    visitsPerDoctorTable = new Tabulator('#visits-per-doctor-table', {
        data: data.map(row => ({ doctor: row[0], visits: row[1] })), layout: 'fitColumns',
        columns: [
            { title: 'Лекар', field: 'doctor', sorter: 'string' },
            { title: 'Посещения', field: 'visits', sorter: 'number' }
        ]
    });
}

async function loadExaminationsByPeriod() {
    const from = document.getElementById('period-from').value;
    const to = document.getElementById('period-to').value;
    if (!from || !to) return;
    const res = await fetch(`${API}/statistics/examinations-by-period?from=${from}&to=${to}`,
        { credentials: 'include' });
    const data = await res.json();
    examinationsByPeriodTable = destroyTable(examinationsByPeriodTable);
    examinationsByPeriodTable = new Tabulator('#examinations-by-period-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Дата', field: 'date', sorter: 'date' },
            { title: 'Лекар', field: 'doctorName' },
            { title: 'Пациент', field: 'patientName' },
            { title: 'Диагноза', field: 'diagnosis' },
            { title: 'Цена', field: 'price', formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' }
        ]
    });
}