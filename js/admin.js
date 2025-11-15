/**
 * js/admin.js
 * Logic cho Trang quản trị (Đăng nhập, Dashboard, Mô phỏng Truy cập)
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const logoutLink = document.getElementById('logout-link');
    const loginScreen = document.getElementById('login-screen');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminHeader = document.getElementById('admin-header');
    const adminFooter = document.getElementById('admin-footer');
    const loginMessage = document.getElementById('login-message');

    const VALID_USERNAME = 'admin';
    const VALID_PASSWORD = '123456';
    const LOGIN_STATUS_KEY = 'adminLoggedIn';

    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem(LOGIN_STATUS_KEY) === 'true';
        if (isLoggedIn) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showDashboard() {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        if (adminHeader) adminHeader.classList.remove('hidden');
        if (adminFooter) adminFooter.classList.remove('hidden');
    }

    function showLogin() {
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
        if (adminHeader) adminHeader.classList.add('hidden');
        if (adminFooter) adminFooter.classList.add('hidden');
        if (loginMessage) loginMessage.textContent = '';
    }

    // Đăng nhập
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                localStorage.setItem(LOGIN_STATUS_KEY, 'true');
                showDashboard();
            } else {
                if (loginMessage) loginMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
            }
        });
    }

    // Đăng xuất
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem(LOGIN_STATUS_KEY);
            showLogin();
        });
    }

    // Mô phỏng truy cập module
    window.handleAccess = (moduleName) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'admin-message-overlay';
        messageDiv.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 9999; display: flex; 
            justify-content: center; align-items: center;
            transition: opacity 0.3s;
        `;
        messageDiv.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 450px; box-shadow: 0 10px 40px rgba(0,0,0,0.7); animation: fadeInDown 0.5s;">
                <h2 style="color: var(--primary-dark); font-size: 1.8rem; margin-bottom: 15px;">Truy cập ${moduleName}</h2>
                <p style="margin: 20px 0; color: #555;">🎉 Hệ thống đã được cấp quyền truy cập vào module <strong>${moduleName}</strong>.</p>
                <p style="color: #777; font-size: 0.9em;">(Trong ứng dụng thực tế, bạn sẽ được điều hướng đến trang quản lý tương ứng.)</p>
                <button class="btn btn-primary" style="margin-top: 25px;" onclick="this.closest('.admin-message-overlay').remove()">Đóng & Quay lại</button>
            </div>
            <style>
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        document.body.appendChild(messageDiv);
    };

    // Khởi tạo
    checkLoginStatus();
});