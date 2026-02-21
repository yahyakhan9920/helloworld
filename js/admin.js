/**
 * Admin Panel Logic - Analytics & File Uploads
 */

let currentImageData = null;
let currentDocData = null;
let currentDocName = null;

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    AuthManager.checkAuth();

    updateDashboardStats();
    loadPostsList();
    initEventListeners();
});

function updateDashboardStats() {
    const stats = PostManager.getStats();
    document.getElementById('stat-total-posts').textContent = stats.totalPosts;
    document.getElementById('stat-total-viewers').textContent = stats.totalViewers;
    document.getElementById('stat-published-posts').textContent = stats.publishedPosts;
}

function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('onclick')?.includes(sectionId)) {
            a.classList.add('active');
        }
    });

    if (sectionId === 'create-post' && !document.getElementById('edit-id').value) {
        resetForm();
    }
}

function loadPostsList(filter = '') {
    const container = document.getElementById('posts-list-container');
    const posts = PostManager.getAll();
    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.slug.toLowerCase().includes(filter.toLowerCase())
    );

    container.innerHTML = filteredPosts.map(post => `
        <div class="card page-card fade-in">
            <span class="page-status status-${post.status}">${post.status}</span>
            <div style="margin-bottom: 1rem;">
                <h3 style="margin-bottom: 0.25rem;">${post.title}</h3>
                <div style="display: flex; gap: 1rem; align-items: center; font-size: 0.8rem; color: var(--secondary);">
                    <code>/post-detail.html?s=${post.slug}</code>
                    <span><i class="fas fa-eye"></i> ${post.views || 0} views</span>
                </div>
            </div>
            <p style="color: var(--secondary); font-size: 0.9rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${post.content}
            </p>
            <div class="page-actions">
                <button class="btn btn-outline" onclick="editPost(${post.id})" title="Edit Post">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="openDeleteModal(${post.id})" title="Delete Post" style="color: var(--danger);">
                    <i class="fas fa-trash"></i>
                </button>
                <a href="post-detail.html?s=${post.slug}" target="_blank" class="btn btn-outline" title="View Post">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `).join('');

    if (filteredPosts.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--secondary);">No posts found.</p>`;
    }
}

function initEventListeners() {
    const titleInput = document.getElementById('title');
    const postForm = document.getElementById('post-form');
    const searchInput = document.getElementById('search-posts');
    const imageInput = document.getElementById('image-file');
    const docInput = document.getElementById('document-file');

    // File Handling
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImageData = e.target.result;
                const preview = document.getElementById('image-preview');
                preview.style.display = 'block';
                preview.querySelector('img').src = currentImageData;
            };
            reader.readAsDataURL(file);
        }
    });

    docInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentDocName = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                currentDocData = e.target.result;
                document.getElementById('doc-name').textContent = `Selected: ${file.name}`;
            };
            reader.readAsDataURL(file);
        }
    });

    titleInput.addEventListener('input', (e) => {
        document.getElementById('slug').value = PostManager.generateSlug(e.target.value);
        document.getElementById('char-counter').textContent = `${e.target.value.length} characters`;
    });

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const postData = {
            title: titleInput.value,
            content: document.getElementById('content').value,
            image: currentImageData,
            attachment: currentDocData,
            attachmentName: currentDocName,
            status: document.getElementById('status').value
        };

        const editId = document.getElementById('edit-id').value;

        try {
            if (editId) {
                PostManager.updatePost(editId, postData);
                showNotification('Post updated successfully!');
            } else {
                PostManager.createPost(postData);
                showNotification('Post published successfully!');
            }

            resetForm();
            loadPostsList();
            updateDashboardStats();
            showSection('posts-manager');
        } catch (error) {
            showNotification('Error saving: LocalStorage might be full!', 'danger');
            console.error(error);
        }
    });

    searchInput.addEventListener('input', (e) => {
        loadPostsList(e.target.value);
    });
}

function editPost(id) {
    const post = PostManager.getPostById(id);
    if (!post) return;

    document.getElementById('edit-id').value = post.id;
    document.getElementById('title').value = post.title;
    document.getElementById('slug').value = post.slug;
    document.getElementById('content').value = post.content;
    document.getElementById('status').value = post.status;

    if (post.image) {
        currentImageData = post.image;
        const preview = document.getElementById('image-preview');
        preview.style.display = 'block';
        preview.querySelector('img').src = post.image;
    }

    if (post.attachmentName) {
        currentDocName = post.attachmentName;
        currentDocData = post.attachment;
        document.getElementById('doc-name').textContent = `Attached: ${post.attachmentName}`;
    }

    document.getElementById('form-title').textContent = 'Edit Post';
    document.getElementById('save-btn').innerHTML = '<i class="fas fa-save"></i> Save Changes';

    showSection('create-post');
}

let postToDelete = null;

function openDeleteModal(id) {
    postToDelete = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    postToDelete = null;
    document.getElementById('delete-modal').style.display = 'none';
}

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (postToDelete) {
        PostManager.deletePost(postToDelete);
        loadPostsList();
        updateDashboardStats();
        closeDeleteModal();
        showNotification('Post deleted successfully!', 'danger');
    }
});

function resetForm() {
    document.getElementById('post-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('slug').value = '';
    document.getElementById('char-counter').textContent = '0 characters';
    document.getElementById('form-title').textContent = 'Create New Post';
    document.getElementById('save-btn').innerHTML = '<i class="fas fa-paper-plane"></i> Publish Post';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('doc-name').textContent = '';
    currentImageData = null;
    currentDocData = null;
    currentDocName = null;
}

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 2rem; background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'}; color: white; border-radius: var(--radius); box-shadow: var(--shadow-lg); z-index: 9999; font-weight: 600; animation: fadeIn 0.3s ease;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}
