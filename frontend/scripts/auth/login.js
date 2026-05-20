
    async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                body: formData,
                credentials: 'include'  
            });

            if (res.ok) {
                const data = await res.json();
                const role = data.role;

                // Redirect според ролята
                if (role === 'ROLE_ADMIN') {
                    window.location.href = '../admin/admin.html';
                } else if (role === 'ROLE_DOCTOR') {
                    const profileRes = await fetch('http://localhost:8080/api/doctors/my-profile', {
                        credentials: 'include'
                    });
                    if (profileRes.ok) {
                       window.location.href = '/user_tabs/doctor/doctor.html';
                    } else {
                       window.location.href = '/user_tabs/doctor/setup.html';
                    }
               } else {
        // проверка дали пациентът е попълнил данните си
        const profileRes = await fetch('http://localhost:8080/api/patients/my-profile', {
            credentials: 'include'
        });
        if (profileRes.ok) {
            window.location.href = '../patient/patient.html';
        } else {
            window.location.href = '../patient/profile/setup.html';
        }
    }
            } else {
                const err = await res.json();
                showError(err.error);
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
    
    document.addEventListener('keypress', e => {
        if (e.key === 'Enter') login();
    });