/**
 * Main Public Site Logic - Enhanced with Viewer Tracking
 */

document.addEventListener('DOMContentLoaded', () => {
    // Track Global Viewers
    PostManager.incrementGlobalViewers();

    // Dynamic Admin Link
    const adminBtn = document.querySelector('.auth-btn');
    if (adminBtn) {
        if (!AuthManager.isLoggedIn()) {
            adminBtn.href = 'login.html';
            adminBtn.textContent = 'Admin Login';
        } else {
            adminBtn.href = 'admin.html';
            adminBtn.textContent = 'Dashboard';
        }
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
