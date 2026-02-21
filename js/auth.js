/**
 * AuthManager - Handles admin session and login
 */
const AuthManager = {
    SESSION_KEY: 'hw_blog_session',
    PASSCODE: '576432',
    // Updated admin credentials
    CREDENTIALS: {
        username: 'helloworld110',
        password: 'HelloAdmin1122@$'
    },

    verifyPasscode(code) {
        return code === this.PASSCODE;
    },

    login(username, password) {
        if (username === this.CREDENTIALS.username && password === this.CREDENTIALS.password) {
            const sessionData = {
                isLoggedIn: true,
                username: username,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    isLoggedIn() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return false;

        const sessionData = JSON.parse(session);
        // Session valid for 1 day
        const oneDay = 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const loginTime = new Date(sessionData.loginTime).getTime();

        if (now - loginTime > oneDay) {
            this.logout();
            return false;
        }

        return sessionData.isLoggedIn;
    },

    checkAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
};
