document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');
    const logoutButton = document.getElementById('logout-button');
    const adminUsernameDisplay = document.getElementById('admin-username-display');

    const avocadoForm = document.getElementById('avocado-form');
    const avocadoIdInput = document.getElementById('avocado-id');
    const fruitTypeInput = document.getElementById('fruit-type');
    const descriptionInput = document.getElementById('description');
    const imageUrlInput = document.getElementById('image-url');
    const saveAvocadoButton = document.getElementById('save-avocado-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const avocadoMessage = document.getElementById('avocado-message');
    const avocadoDetailsTableBody = document.querySelector('#avocado-details-table tbody');
    const classificationHistoryTableBody = document.querySelector('#classification-history-table tbody');

    let jwtToken = localStorage.getItem('adminToken');

    const showMessage = (element, message, type) => {
        element.textContent = message;
        element.className = `message ${type}`;
    };

    const checkLoginStatus = async () => {
        if (jwtToken) {
            try {
                // Verify token by trying to fetch admin data
                const response = await fetch('/api/admin/avocado-details', {
                    method: 'GET',
                    headers: {
                        'x-access-token': jwtToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    loginSection.style.display = 'none';
                    adminContent.style.display = 'block';
                    // Decode token to get username (simple way, better to get from server)
                    const payload = JSON.parse(atob(jwtToken.split('.')[1]));
                    adminUsernameDisplay.textContent = payload.username || 'Admin';
                    loadAvocadoDetails();
                    loadClassificationHistory();
                } else {
                    throw new Error('Token tidak valid atau kedaluwarsa.');
                }
            } catch (error) {
                console.error('Login status check failed:', error);
                jwtToken = null;
                localStorage.removeItem('adminToken');
                loginSection.style.display = 'block';
                adminContent.style.display = 'none';
                showMessage(loginMessage, 'Sesi berakhir atau token tidak valid. Silakan login kembali.', 'error');
            }
        } else {
            loginSection.style.display = 'block';
            adminContent.style.display = 'none';
        }
    };

    const handleLogin = async () => {
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                jwtToken = data.token;
                localStorage.setItem('adminToken', jwtToken);
                showMessage(loginMessage, 'Login berhasil!', 'success');
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
                checkLoginStatus(); // Re-check to show admin panel
            } else {
                showMessage(loginMessage, data.message || 'Login gagal.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(loginMessage, 'Terjadi kesalahan saat login.', 'error');
        }
    };

    const handleLogout = () => {
        jwtToken = null;
        localStorage.removeItem('adminToken');
        showMessage(loginMessage, 'Anda telah logout.', 'success');
        checkLoginStatus();
    };

    const loadAvocadoDetails = async () => {
        avocadoDetailsTableBody.innerHTML = '';
        try {
            const response = await fetch('/api/admin/avocado-details', {
                headers: {
                    'x-access-token': jwtToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.avocado_details && data.avocado_details.length > 0) {
                    data.avocado_details.forEach(detail => {
                        const row = avocadoDetailsTableBody.insertRow();
                        row.innerHTML = `
                            <td>${detail.id}</td>
                            <td>${detail.fruit_type}</td>
                            <td>${detail.description}</td>
                            <td><a href="${detail.image_url}" target="_blank">${detail.image_url ? 'Lihat Gambar' : '-'}</a></td>
                            <td class="action-buttons">
                                <button class="edit" data-id="${detail.id}" data-fruit-type="${detail.fruit_type}" data-description="${detail.description}" data-image-url="${detail.image_url || ''}">Edit</button>
                                <button class="delete" data-id="${detail.id}">Hapus</button>
                            </td>
                        `;
                    });
                } else {
                    avocadoDetailsTableBody.innerHTML = '<tr><td colspan="5">Belum ada detail alpukat.</td></tr>';
                }
            } else {
                throw new Error('Gagal memuat detail alpukat.');
            }
        } catch (error) {
            console.error('Error loading avocado details:', error);
            showMessage(avocadoMessage, 'Gagal memuat detail alpukat.', 'error');
        }
    };

    const loadClassificationHistory = async () => {
        classificationHistoryTableBody.innerHTML = '';
        try {
            const response = await fetch('/api/admin/classifications', {
                headers: {
                    'x-access-token': jwtToken
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.classifications && data.classifications.length > 0) {
                    data.classifications.forEach(cls => {
                        const row = classificationHistoryTableBody.insertRow();
                        row.innerHTML = `
                            <td>${cls.id}</td>
                            <td>${cls.image_path}</td>
                            <td>${cls.classification_result}</td>
                            <td>${new Date(cls.timestamp).toLocaleString()}</td>
                            <td>${cls.processed ? 'Sudah Diproses' : 'Pending/Gagal'}</td>
                        `;
                    });
                } else {
                    classificationHistoryTableBody.innerHTML = '<tr><td colspan="5">Belum ada riwayat klasifikasi.</td></tr>';
                }
            } else {
                throw new Error('Gagal memuat riwayat klasifikasi.');
            }
        } catch (error) {
            console.error('Error loading classification history:', error);
            // Optionally show message to user
        }
    };

    const handleAvocadoFormSubmit = async (event) => {
        event.preventDefault();
        const id = avocadoIdInput.value;
        const fruit_type = fruitTypeInput.value;
        const description = descriptionInput.value;
        const image_url = imageUrlInput.value;

        let url = '/api/admin/avocado-details';
        let method = 'POST';

        if (id) {
            url = `/api/admin/avocado-details/${id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': jwtToken
                },
                body: JSON.stringify({ fruit_type, description, image_url })
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(avocadoMessage, data.message || 'Operasi berhasil!', 'success');
                avocadoForm.reset();
                avocadoIdInput.value = ''; // Clear hidden ID
                saveAvocadoButton.textContent = 'Tambah Detail';
                cancelEditButton.style.display = 'none';
                loadAvocadoDetails(); // Reload table
            } else {
                showMessage(avocadoMessage, data.message || 'Operasi gagal.', 'error');
            }
        } catch (error) {
            console.error('Error submitting avocado form:', error);
            showMessage(avocadoMessage, 'Terjadi kesalahan saat menyimpan detail alpukat.', 'error');
        }
    };

    const handleEditAvocado = (event) => {
        const button = event.target;
        const id = button.dataset.id;
        const fruitType = button.dataset.fruitType;
        const description = button.dataset.description;
        const imageUrl = button.dataset.imageUrl;

        avocadoIdInput.value = id;
        fruitTypeInput.value = fruitType;
        descriptionInput.value = description;
        imageUrlInput.value = imageUrl;

        saveAvocadoButton.textContent = 'Perbarui Detail';
        cancelEditButton.style.display = 'inline-block';
        showMessage(avocadoMessage, '', ''); // Clear messages
    };

    const handleCancelEdit = () => {
        avocadoForm.reset();
        avocadoIdInput.value = '';
        saveAvocadoButton.textContent = 'Tambah Detail';
        cancelEditButton.style.display = 'none';
        showMessage(avocadoMessage, '', ''); // Clear messages
    };

    const handleDeleteAvocado = async (event) => {
        if (!confirm('Apakah Anda yakin ingin menghapus detail alpukat ini?')) {
            return;
        }

        const id = event.target.dataset.id;
        try {
            const response = await fetch(`/api/admin/avocado-details/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-access-token': jwtToken
                }
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(avocadoMessage, data.message || 'Berhasil dihapus!', 'success');
                loadAvocadoDetails(); // Reload table
            } else {
                showMessage(avocadoMessage, data.message || 'Gagal menghapus.', 'error');
            }
        } catch (error) {
            console.error('Error deleting avocado detail:', error);
            showMessage(avocadoMessage, 'Terjadi kesalahan saat menghapus detail alpukat.', 'error');
        }
    };

    // Event Listeners
    loginButton.addEventListener('click', handleLogin);
    logoutButton.addEventListener('click', handleLogout);
    avocadoForm.addEventListener('submit', handleAvocadoFormSubmit);
    cancelEditButton.addEventListener('click', handleCancelEdit);

    avocadoDetailsTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit')) {
            handleEditAvocado(event);
        } else if (event.target.classList.contains('delete')) {
            handleDeleteAvocado(event);
        }
    });

    // Initial check on page load
    checkLoginStatus();
});
