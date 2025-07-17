// Modern Admin Panel JavaScript - Clean and Efficient

class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('admin_token');
        this.currentSection = 'login';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.handleLogin());
        }

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') || e.target.hasAttribute('data-section')) {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            }
        });

        // Logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }

        // Avocado form
        const avocadoForm = document.getElementById('avocado-form');
        if (avocadoForm) {
            avocadoForm.addEventListener('submit', (e) => this.handleAvocadoSubmit(e));
        }

        // Cancel edit button
        const cancelEditButton = document.getElementById('cancel-edit-button');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', () => this.cancelEdit());
        }

        // Enter key for login
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.currentSection === 'login') {
                this.handleLogin();
            }
        });
    }

    checkAuthStatus() {
        if (this.token) {
            this.showAuthenticatedView();
        } else {
            this.showLoginView();
        }
    }

    showLoginView() {
        this.currentSection = 'login';
        this.hideAllSections();
        this.showElement('login-section');
        this.hideElement('main-nav');
    }

    showAuthenticatedView() {
        this.hideElement('login-section');
        this.showElement('main-nav');
        this.showSection('dashboard');
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const messageEl = document.getElementById('login-message');
        const loginButton = document.getElementById('login-button');

        if (!username || !password) {
            this.showMessage(messageEl, 'Please enter both username and password.', 'error');
            return;
        }

        try {
            loginButton.textContent = 'Logging in...';
            loginButton.disabled = true;

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('admin_token', this.token);
                this.showMessage(messageEl, 'Login successful!', 'success');
                
                setTimeout(() => {
                    this.showAuthenticatedView();
                }, 1000);
            } else {
                this.showMessage(messageEl, data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(messageEl, 'Network error. Please try again.', 'error');
        } finally {
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
        }
    }

    handleLogout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        this.showLoginView();
        this.clearForms();
    }

    showSection(sectionName) {
        this.currentSection = sectionName;
        this.hideAllSections();
        this.showElement(`${sectionName}-section`);
        this.updateActiveNavLink(sectionName);

        // Load data for specific sections
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'avocado-management':
                this.loadAvocadoDetails();
                break;
            case 'classifications':
                this.loadClassifications();
                break;
        }
    }

    updateActiveNavLink(sectionName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            }
        });
    }

    hideAllSections() {
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
    }

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    async loadDashboardData() {
        // Dashboard doesn't need specific API calls in this implementation
        // But you could add statistics here
        console.log('Dashboard loaded');
    }

    async loadAvocadoDetails() {
        try {
            const response = await fetch('/admin/avocado-details', {
                headers: {
                    'x-access-token': this.token
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderAvocadoDetailsTable(data.avocado_details || []);
            } else {
                console.error('Failed to load avocado details');
                this.renderAvocadoDetailsTable([]);
            }
        } catch (error) {
            console.error('Error loading avocado details:', error);
            this.renderAvocadoDetailsTable([]);
        }
    }

    renderAvocadoDetailsTable(details) {
        const tbody = document.querySelector('#avocado-details-table tbody');
        if (!tbody) return;

        if (details.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">No avocado details found</td></tr>';
            return;
        }

        tbody.innerHTML = details.map(detail => `
            <tr>
                <td>${detail.id}</td>
                <td><strong>${this.escapeHtml(detail.fruit_type)}</strong></td>
                <td>${this.escapeHtml(detail.description).substring(0, 100)}${detail.description.length > 100 ? '...' : ''}</td>
                <td>${detail.image_url ? `<a href="${this.escapeHtml(detail.image_url)}" target="_blank">View Image</a>` : 'No image'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-small" onclick="adminPanel.editAvocadoDetail(${detail.id})">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="adminPanel.deleteAvocadoDetail(${detail.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadClassifications() {
        try {
            const response = await fetch('/admin/classifications', {
                headers: {
                    'x-access-token': this.token
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderClassificationsTable(data.classifications || []);
            } else {
                console.error('Failed to load classifications');
                this.renderClassificationsTable([]);
            }
        } catch (error) {
            console.error('Error loading classifications:', error);
            this.renderClassificationsTable([]);
        }
    }

    renderClassificationsTable(classifications) {
        const tbody = document.querySelector('#classification-history-table tbody');
        if (!tbody) return;

        if (classifications.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">No classifications found</td></tr>';
            return;
        }

        tbody.innerHTML = classifications.map(cls => `
            <tr>
                <td>${cls.id}</td>
                <td>${this.escapeHtml(cls.image_path)}</td>
                <td><strong>${this.escapeHtml(cls.classification_result)}</strong></td>
                <td>${new Date(cls.timestamp).toLocaleString()}</td>
                <td>
                    <span class="status-${cls.processed ? 'processed' : 'error'}">
                        ${cls.processed ? 'Processed' : 'Error'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    async handleAvocadoSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('avocado-id').value;
        const fruitType = document.getElementById('fruit-type').value.trim();
        const description = document.getElementById('description').value.trim();
        const imageUrl = document.getElementById('image-url').value.trim();
        const messageEl = document.getElementById('avocado-message');
        const submitButton = document.getElementById('save-avocado-button');

        if (!fruitType || !description) {
            this.showMessage(messageEl, 'Please fill in all required fields.', 'error');
            return;
        }

        try {
            submitButton.textContent = id ? 'Updating...' : 'Adding...';
            submitButton.disabled = true;

            const url = id ? `/admin/avocado-details/${id}` : '/admin/avocado-details';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': this.token
                },
                body: JSON.stringify({
                    fruit_type: fruitType,
                    description: description,
                    image_url: imageUrl || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage(messageEl, data.message, 'success');
                this.clearAvocadoForm();
                this.loadAvocadoDetails(); // Refresh the table
            } else {
                this.showMessage(messageEl, data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error saving avocado detail:', error);
            this.showMessage(messageEl, 'Network error. Please try again.', 'error');
        } finally {
            submitButton.textContent = id ? 'Update Detail' : 'Add Detail';
            submitButton.disabled = false;
        }
    }

    async editAvocadoDetail(id) {
        try {
            const response = await fetch(`/admin/avocado-details/${id}`, {
                headers: {
                    'x-access-token': this.token
                }
            });

            if (response.ok) {
                const detail = await response.json();
                
                document.getElementById('avocado-id').value = detail.id;
                document.getElementById('fruit-type').value = detail.fruit_type;
                document.getElementById('description').value = detail.description;
                document.getElementById('image-url').value = detail.image_url || '';
                
                document.getElementById('save-avocado-button').textContent = 'Update Detail';
                document.getElementById('cancel-edit-button').style.display = 'inline-block';
                
                // Scroll to form
                document.getElementById('avocado-form').scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Failed to load avocado detail for editing');
            }
        } catch (error) {
            console.error('Error loading avocado detail:', error);
        }
    }

    async deleteAvocadoDetail(id) {
        if (!confirm('Are you sure you want to delete this avocado detail?')) {
            return;
        }

        try {
            const response = await fetch(`/admin/avocado-details/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-access-token': this.token
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.loadAvocadoDetails(); // Refresh the table
                console.log('Avocado detail deleted successfully');
            } else {
                alert(data.message || 'Failed to delete avocado detail');
            }
        } catch (error) {
            console.error('Error deleting avocado detail:', error);
            alert('Network error. Please try again.');
        }
    }

    cancelEdit() {
        this.clearAvocadoForm();
    }

    clearAvocadoForm() {
        document.getElementById('avocado-id').value = '';
        document.getElementById('fruit-type').value = '';
        document.getElementById('description').value = '';
        document.getElementById('image-url').value = '';
        document.getElementById('save-avocado-button').textContent = 'Add Detail';
        document.getElementById('cancel-edit-button').style.display = 'none';
        document.getElementById('avocado-message').textContent = '';
        document.getElementById('avocado-message').className = 'message';
    }

    clearForms() {
        // Clear login form
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const loginMessage = document.getElementById('login-message');
        
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        if (loginMessage) {
            loginMessage.textContent = '';
            loginMessage.className = 'message';
        }

        // Clear avocado form
        this.clearAvocadoForm();
    }

    showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = `message ${type}`;
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.textContent = '';
                element.className = 'message';
            }, 5000);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the admin panel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Global functions for onclick handlers
function logout() {
    if (window.adminPanel) {
        window.adminPanel.handleLogout();
    }
}
