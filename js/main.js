/**
 * Main Public Site Logic - Enhanced with Viewer Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
    // Track Global Viewers
    PostManager.incrementGlobalViewers();

    // Dynamic Admin Link
    const adminBtn = document.querySelector('.auth-btn');
    if (adminBtn) {
        adminBtn.href = '#'; // Prevent direct navigation
        if (!AuthManager.isLoggedIn()) {
            adminBtn.textContent = 'Admin Login';
        } else {
            adminBtn.textContent = 'Dashboard';
        }

        adminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = AuthManager.isLoggedIn() ? 'admin.html' : 'login.html';
            showPasscodeModal(target);
        });
    }

    const latestContainer = document.getElementById('latest-posts');
    const feedContainer = document.getElementById('posts-feed');

    if (latestContainer) {
        renderPosts(latestContainer, 3);
    }

    if (feedContainer) {
        renderPosts(feedContainer);
    }
});

/**
 * Passcode Modal Logic
 */
function showPasscodeModal(targetUrl) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('passcode-modal-overlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'passcode-modal-overlay';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="passcode-modal">
                <div style="margin-bottom: 1.5rem;">
                    <div style="width: 50px; height: 50px; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.25rem;">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Enter Passcode</h3>
                    <p style="color: var(--secondary); font-size: 0.9rem;">Please enter security passcode to proceed.</p>
                </div>
                <div class="passcode-inputs">
                    <input type="password" maxlength="1" class="passcode-input" autofocus>
                    <input type="password" maxlength="1" class="passcode-input">
                    <input type="password" maxlength="1" class="passcode-input">
                    <input type="password" maxlength="1" class="passcode-input">
                    <input type="password" maxlength="1" class="passcode-input">
                    <input type="password" maxlength="1" class="passcode-input">
                </div>
                <div id="modal-error" style="color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem; opacity: 0; font-weight: 600;">Incorrect passcode!</div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-outline" onclick="closePasscodeModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="verifyPasscodeAndProceed('${targetUrl}')">Verify</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Auto-focus next input
        const inputs = modal.querySelectorAll('.passcode-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                const allFilled = Array.from(inputs).every(i => i.value.length === 1);
                if (allFilled) {
                    verifyPasscodeAndProceed(targetUrl);
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    }

    modal.classList.add('active');
    setTimeout(() => modal.querySelector('.passcode-input').focus(), 100);
}

function verifyPasscodeAndProceed(targetUrl) {
    const modal = document.getElementById('passcode-modal-overlay');
    const inputs = modal.querySelectorAll('.passcode-input');
    const error = document.getElementById('modal-error');
    const code = Array.from(inputs).map(i => i.value).join('');

    if (AuthManager.verifyPasscode(code)) {
        // Success
        error.textContent = "Verifying...";
        error.style.color = "var(--success)";
        error.style.opacity = '1';

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    } else {
        // Error
        error.textContent = "Incorrect passcode! Please try again.";
        error.style.color = "var(--danger)";
        error.style.opacity = '1';

        modal.querySelector('.passcode-modal').classList.add('shake');
        inputs.forEach(i => i.value = '');
        inputs[0].focus();

        setTimeout(() => {
            modal.querySelector('.passcode-modal').classList.remove('shake');
        }, 500);
    }
}

function closePasscodeModal() {
    const modal = document.getElementById('passcode-modal-overlay');
    modal.classList.remove('active');
    modal.querySelectorAll('.passcode-input').forEach(i => i.value = '');
}

/**
 * Renders posts into a container
 */
function renderPosts(container, limit = null) {
    const allPosts = PostManager.getPublished();
    const posts = limit ? allPosts.slice(0, limit) : allPosts;

    if (posts.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--secondary); padding: 3rem;">No posts published yet.</p>`;
        return;
    }

    container.innerHTML = posts.map(post => `
        <article class="card fade-in" style="display: flex; flex-direction: column; height: 100%;">
            ${post.image ? `<img src="${post.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: calc(var(--radius) - 4px); margin-bottom: 1rem;">` : ''}
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.75rem; color: var(--secondary); font-weight: 600;">${new Date(post.createdAt).toLocaleDateString()}</span>
                    <span style="font-size: 0.75rem; color: var(--secondary);"><i class="fas fa-eye"></i> ${post.views || 0}</span>
                </div>
                <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${post.title}</h3>
                <p style="color: var(--secondary); font-size: 0.95rem; margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${post.content}
                </p>
            </div>
            <a href="post-detail.html?s=${post.slug}" class="btn btn-primary" style="justify-content: center; width: 100%;">Read More</a>
        </article>
    `).join('');
}
