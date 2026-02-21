/**
 * PageManager - Handles all CRUD operations for dynamic pages
 * Stores data in LocalStorage: 'blog_pages'
 */
const PageManager = {
    STORAGE_KEY: 'blog_pages',

    // Initial default pages
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const defaults = [
                {
                    id: Date.now(),
                    title: 'About Us',
                    slug: 'about-us',
                    content: 'Welcome to our blog. We share stories and insights about technology and design.',
                    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop',
                    status: 'published',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveAll(defaults);
        }
    },

    getAll() {
        const pages = localStorage.getItem(this.STORAGE_KEY);
        return pages ? JSON.parse(pages) : [];
    },

    getPageById(id) {
        return this.getAll().find(p => p.id === parseInt(id));
    },

    getPageBySlug(slug) {
        return this.getAll().find(p => p.slug === slug);
    },

    saveAll(pages) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pages));
    },

    createPage(pageData) {
        const pages = this.getAll();
        const newPage = {
            id: Date.now(),
            title: pageData.title,
            slug: this.generateSlug(pageData.title),
            content: pageData.content,
            image: pageData.image || '',
            status: pageData.status || 'published',
            createdAt: new Date().toISOString()
        };
        
        // Ensure slug uniqueness
        let originalSlug = newPage.slug;
        let counter = 1;
        while(pages.some(p => p.slug === newPage.slug)) {
            newPage.slug = `${originalSlug}-${counter++}`;
        }

        pages.push(newPage);
        this.saveAll(pages);
        return newPage;
    },

    updatePage(id, pageData) {
        const pages = this.getAll();
        const index = pages.findIndex(p => p.id === parseInt(id));
        
        if (index !== -1) {
            pages[index] = {
                ...pages[index],
                ...pageData,
                slug: this.generateSlug(pageData.title), // Update slug if title changes
                updatedAt: new Date().toISOString()
            };
            
            // Ensure slug uniqueness (excluding itself)
            let originalSlug = pages[index].slug;
            let counter = 1;
            while(pages.some((p, i) => p.slug === pages[index].slug && i !== index)) {
                pages[index].slug = `${originalSlug}-${counter++}`;
            }

            this.saveAll(pages);
            return pages[index];
        }
        return null;
    },

    deletePage(id) {
        const pages = this.getAll().filter(p => p.id !== parseInt(id));
        this.saveAll(pages);
    },

    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

// Auto-init on load
PageManager.init();
