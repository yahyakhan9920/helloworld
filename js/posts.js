/**
 * PostManager - Enhanced with Analytics and File Storage
 * Stores data in LocalStorage: 'blog_posts', 'site_stats'
 */
const PostManager = {
    POSTS_KEY: 'hw_blog_posts',
    STATS_KEY: 'hw_site_stats',

    init() {
        // Initialize Posts
        if (!localStorage.getItem(this.POSTS_KEY)) {
            const defaults = [
                {
                    id: Date.now(),
                    title: 'Welcome to Our New Blog',
                    slug: 'welcome-to-our-new-blog',
                    content: 'We are excited to share our stories with you. This post now supports view tracking and attachments!',
                    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop',
                    status: 'published',
                    views: 0,
                    attachment: null,
                    attachmentName: null,
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveAll(defaults);
        }

        // Initialize Stats
        if (!localStorage.getItem(this.STATS_KEY)) {
            localStorage.setItem(this.STATS_KEY, JSON.stringify({ totalViewers: 0 }));
        }
    },

    // --- Analytics ---
    incrementGlobalViewers() {
        const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
        stats.totalViewers++;
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    },

    getStats() {
        const stats = JSON.parse(localStorage.getItem(this.STATS_KEY));
        const posts = this.getAll();
        return {
            totalViewers: stats.totalViewers,
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.status === 'published').length
        };
    },

    incrementPostViews(id) {
        const posts = this.getAll();
        const index = posts.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            posts[index].views = (posts[index].views || 0) + 1;
            this.saveAll(posts);
        }
    },

    // --- Post CRUD ---
    getAll() {
        const posts = localStorage.getItem(this.POSTS_KEY);
        return posts ? JSON.parse(posts) : [];
    },

    getPublished() {
        return this.getAll().filter(p => p.status === 'published').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getPostById(id) {
        return this.getAll().find(p => p.id === parseInt(id));
    },

    getPostBySlug(slug) {
        return this.getAll().find(p => p.slug === slug);
    },

    saveAll(posts) {
        localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    },

    createPost(postData) {
        const posts = this.getAll();
        const newPost = {
            id: Date.now(),
            title: postData.title,
            slug: this.generateSlug(postData.title),
            content: postData.content,
            image: postData.image || '', // Base64 or URL
            attachment: postData.attachment || null, // Base64
            attachmentName: postData.attachmentName || null,
            status: postData.status || 'published',
            views: 0,
            createdAt: new Date().toISOString()
        };

        let originalSlug = newPost.slug;
        let counter = 1;
        while (posts.some(p => p.slug === newPost.slug)) {
            newPost.slug = `${originalSlug}-${counter++}`;
        }

        posts.push(newPost);
        this.saveAll(posts);
        return newPost;
    },

    updatePost(id, postData) {
        const posts = this.getAll();
        const index = posts.findIndex(p => p.id === parseInt(id));

        if (index !== -1) {
            // Retain old values if not provided (especially for files)
            posts[index] = {
                ...posts[index],
                title: postData.title,
                content: postData.content,
                status: postData.status,
                updatedAt: new Date().toISOString()
            };

            if (postData.image) posts[index].image = postData.image;
            if (postData.attachment) {
                posts[index].attachment = postData.attachment;
                posts[index].attachmentName = postData.attachmentName;
            }

            // Update slug if title changed (optional, but keep for consistency)
            posts[index].slug = this.generateSlug(postData.title);
            let originalSlug = posts[index].slug;
            let counter = 1;
            while (posts.some((p, i) => p.slug === posts[index].slug && i !== index)) {
                posts[index].slug = `${originalSlug}-${counter++}`;
            }

            this.saveAll(posts);
            return posts[index];
        }
        return null;
    },

    deletePost(id) {
        const posts = this.getAll().filter(p => p.id !== parseInt(id));
        this.saveAll(posts);
    },

    generateSlug(text) {
        return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    }
};

PostManager.init();
