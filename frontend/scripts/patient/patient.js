import { API } from '../config/config.js';
import { setupNavbar, loadCurrentUser} from '../auth/auth.js';

let currentUser = null;

window.showTab = showTab;

document.addEventListener('DOMContentLoaded', async () => {
    await loadMyExaminations();
    await loadMySickLeaves();    
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

async function loadMyExaminations() {
    const res = await fetch(`${API}/examinations/my/patient`, {
        credentials: 'include'
    });

    if (!res.ok) return;
    const data = await res.json();

    new Tabulator('#examinations-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'Дата', field: 'date', sorter: 'date' },
            { title: 'Лекар', field: 'doctorName', sorter: 'string' },
            { title: 'Диагноза', field: 'diagnosis', sorter: 'string' },
            { title: 'Лечение', field: 'treatment', sorter: 'string' },
            { title: 'Цена', field: 'price',
              formatter: cell => `${cell.getValue()} лв.` },
            { title: 'Платено от', field: 'paidByInsurance',
              formatter: cell => cell.getValue() ? 'НЗОК' : 'Пациент' }
        ]
    });
}

async function loadMySickLeaves() {
    const res = await fetch(`${API}/sick-leaves`, { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();

    new Tabulator('#sickleaves-table', {
        data, layout: 'fitColumns', pagination: 'local', paginationSize: 10,
        columns: [
            { title: 'От дата', field: 'startDate', sorter: 'date' },
            { title: 'Дни', field: 'days', sorter: 'number' },
            { title: 'Лекар', field: 'doctorName', sorter: 'string' }
        ]
    });
}