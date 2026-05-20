import { API } from '../config/config.js';
import { setupNavbar, loadCurrentUser} from '../auth/auth.js';

let currentUser = null; 
let allPatients = [];
let patientsTable = null;

window.showTab = showTab;
window.openExaminationModal = openExaminationModal;
window.saveExamination = saveExamination;
window.openSickLeaveModal = openSickLeaveModal;
window.saveSickLeave = saveSickLeave;
window.closeModal = closeModal;
window.openPatientHistory = openPatientHistory;
window.filterPatients = filterPatients;

document.addEventListener('DOMContentLoaded', async () => {
    await loadExaminations();
    await loadPatients();
    await loadSickLeaves();
    const user = await loadCurrentUser();
    if (!user) return;
    setupNavbar(user);
});

function showTab(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
    document.getElementById(`section-${name}`).classList.remove('hidden');
    document.getElementById(`tab-${name}`).classList.add('active-tab');
}

// ===== ПРЕГЛЕДИ =====
async function loadExaminations() {
    const res = await fetch(`${API}/examinations/my/doctor`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();

    new Tabulator('#examinations-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Дата', field: 'date', sorter: 'date' },
            { title: 'Пациент', field: 'patientName', sorter: 'string' },
            { title: 'Диагноза', field: 'diagnosis', sorter: 'string' },
            { title: 'Лечение', field: 'treatment', sorter: 'string' },
            { title: 'Цена', field: 'price',
              formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' },
            {
                title: '', width: 80, headerSort: false,
                formatter: () => "<button style='border:0.5px solid #e24b4a;color:#e24b4a;background:transparent;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer'>Изтрий</button>",
                cellClick: async (e, cell) => {
                    if (!confirm('Сигурен ли си?')) return;
                    await fetch(`${API}/examinations/${cell.getRow().getData().id}`, {
                        method: 'DELETE', credentials: 'include'
                    });
                    await loadExaminations();
                }
            }
        ]
    });
}

async function openExaminationModal() {
    const res = await fetch(`${API}/patients`, { credentials: 'include' });
    const patients = await res.json();

    const select = document.getElementById('exam-patient');
    select.innerHTML = patients.map(p =>
        `<option value="${p.id}" data-insured="${p.insured}">${p.name}</option>`
    ).join('');

    document.getElementById('exam-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('exam-diagnosis').value = '';
    document.getElementById('exam-treatment').value = '';
    document.getElementById('exam-price').value = '';

    // при зареждане
    checkInsured(select);

    //при смяна на пациент
    select.onchange = () => checkInsured(select);

    showModal('examination-modal');
}

function checkInsured(select) {
    const selectedOption = select.options[select.selectedIndex];
    const isInsured = selectedOption.dataset.insured === 'true';
    const priceDiv = document.getElementById('price_examination');
    const priceInput = document.getElementById('exam-price');

    if (isInsured) {
        priceDiv.style.display = 'none';
        priceInput.value = '0';
        priceInput.disabled = true;
    } else {
        priceDiv.style.display = 'block';
        priceInput.value = '';
        priceInput.disabled = false;
    }
}

async function saveExamination() {
    const patientId = Number(document.getElementById('exam-patient').value);
    const date = document.getElementById('exam-date').value;
    const diagnosis = document.getElementById('exam-diagnosis').value.trim();
    const treatment = document.getElementById('exam-treatment').value.trim();
    const priceInput = document.getElementById('exam-price');
    const price = Number(priceInput.value);

    // Валидация
    if (!patientId) {
        alert('Моля изберете пациент'); return;
    }
    if (!date) {
        alert('Моля въведете дата'); return;
    }
    if (!diagnosis) {
        alert('Моля въведете диагноза'); return;
    }
    if (!treatment) {
        alert('Моля въведете лечение'); return;
    }
    if (!priceInput.disabled && (!price || price <= 0)) {
        alert('Моля въведете валидна цена'); return;
    }

    const body = {
        patientId,
        date,
        diagnosis,
        treatment,
        price
    };

    const res = await fetch(`${API}/examinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });

    if (res.ok) {
        closeModal('examination-modal');
        await loadExaminations();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

// ===== ПАЦИЕНТИ =====
async function loadPatients() {
    const res = await fetch(`${API}/patients`, { credentials: 'include' });
    if (!res.ok) return;
    allPatients = await res.json();
    renderPatientsTable(allPatients);
}

function filterPatients(query) {
    const q = query.toLowerCase().trim();
    const filtered = allPatients.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.egn.includes(q)
    );
    renderPatientsTable(filtered);
}

function renderPatientsTable(data) {
    if (patientsTable) {
        patientsTable.destroy();
        patientsTable = null;
    }

    patientsTable = new Tabulator('#patients-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Име', field: 'name', sorter: 'string' },
            { title: 'ЕГН', field: 'egn' },
            { title: 'Осигурен', field: 'insured',
              formatter: cell => cell.getValue() ? 'Да' : 'Не' },
            { title: 'Личен лекар', field: 'personalDoctorName' },
            {
                title: 'История', headerSort: false,
                formatter: () => "<button style='background:#166534;color:white;border:none;padding:3px 10px;border-radius:4px;font-size:11px;cursor:pointer'>Виж</button>",
                cellClick: async (e, cell) => {
                    await openPatientHistory(cell.getRow().getData());
                }
            }
        ]
    });
}

async function openPatientHistory(patient) {
    document.getElementById('history-patient-name').textContent = patient.name;

    const res = await fetch(`${API}/examinations?patientId=${patient.id}`, {
        credentials: 'include'
    });
    const data = await res.json();

    new Tabulator('#history-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 5,
        columns: [
            { title: 'Дата', field: 'date', sorter: 'date' },
            { title: 'Диагноза', field: 'diagnosis' },
            { title: 'Лечение', field: 'treatment' },
            { title: 'Цена', field: 'price',
              formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' }
        ]
    });

    showModal('history-modal');
}

// ===== БОЛНИЧНИ =====
async function loadSickLeaves() {
    const res = await fetch(`${API}/sick-leaves`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();

    new Tabulator('#sickleaves-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'От дата', field: 'startDate', sorter: 'date' },
            { title: 'Дни', field: 'days', sorter: 'number' },
            { title: 'Пациент', field: 'patientName', sorter: 'string' },
            { title: 'Лекар', field: 'doctorName', sorter: 'string' }
        ]
    });
}

async function openSickLeaveModal() {
    const res = await fetch(`${API}/examinations/my/doctor`, { credentials: 'include' });
    const examinations = await res.json();

    const select = document.getElementById('sl-examination');
    select.innerHTML = examinations.map(e =>
        `<option value="${e.id}" data-patient="${e.patientId}">${e.date} — ${e.patientName} (${e.diagnosis})</option>`
    ).join('');

    document.getElementById('sl-startdate').value = new Date().toISOString().split('T')[0];
    document.getElementById('sl-days').value = '';

    showModal('sickleave-modal');
}

async function saveSickLeave() {
    const select = document.getElementById('sl-examination');
    const selectedOption = select.options[select.selectedIndex];
    const examinationId = Number(select.value);
    const patientId = Number(selectedOption.dataset.patient);

    const body = {
        examinationId,
        patientId,
        startDate: document.getElementById('sl-startdate').value,
        days: Number(document.getElementById('sl-days').value)
    };

    const res = await fetch(`${API}/sick-leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });

    if (res.ok) {
        closeModal('sickleave-modal');
        await loadSickLeaves();
    } else {
        const err = await res.json();
        alert(err.message || 'Грешка при запазване');
    }
}

// ===== MODAL HELPERS =====
function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}