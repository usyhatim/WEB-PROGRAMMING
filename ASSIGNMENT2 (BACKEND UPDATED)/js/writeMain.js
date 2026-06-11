/**
 * ============================================
 * News Editor - Main JavaScript
 * Assignment 1 → Assignment 2: Backend Integration
 * ============================================
 * 
 * Architecture Notes:
 * - All CRUD operations use REST API calls (replacing localStorage from Assignment 1)
 * - API URL is configurable below — change API_BASE_URL to match your PHP server
 * - Document structure: { id, title, content, details, category, displayDate, createdAt, updatedAt }
 * - AI functions are simulated with JavaScript (replaceable with real AI API for Assignment 3)
 * - Service layer (DocumentService) abstracts the API → easy to swap or mock
 */

'use strict';

// ============================================
// API Configuration
// Change this URL to point to your PHP backend server
// Example: 'http://localhost:8080/api.php'  (XAMPP default port)
//          'api.php'                       (if served from same Apache server)
// ============================================
const API_BASE_URL = 'api.php';


// ============================================
// Document Service Layer (CRUD Operations)
// Abstracts the REST API — all methods are async
// ============================================
const DocumentService = {
    _cache: [],

    async init() {
        await this.refreshCache();
    },

    async refreshCache() {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        this._cache = Array.isArray(data) ? data : [];
        return this._cache;
    },

    getAll() {
        return this._cache || [];
    },

    getById(id) {
        return this.getAll().find(doc => String(doc.id) === String(id)) || null;
    },

    async create(doc) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: doc.title || 'Untitled Document',
                content: doc.content || '',
                details: doc.details || '',
                category: doc.category || 'research',
                displayDate: doc.displayDate || new Date().toISOString().split('T')[0],
                wordCount: this.countWords(doc.content || '')
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Create failed' }));
            throw new Error(err.error || 'Create failed');
        }

        const newDoc = await response.json();
        await this.refreshCache();
        return newDoc;
    },

    async update(id, updates) {
        const response = await fetch(API_BASE_URL + '?id=' + encodeURIComponent(id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: updates.title || 'Untitled Document',
                content: updates.content || '',
                details: updates.details || '',
                category: updates.category || 'research',
                displayDate: updates.displayDate || new Date().toISOString().split('T')[0],
                wordCount: this.countWords(updates.content || '')
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Update failed' }));
            throw new Error(err.error || 'Update failed');
        }

        const updatedDoc = await response.json();
        await this.refreshCache();
        return updatedDoc;
    },

    async delete(id) {
        const response = await fetch(API_BASE_URL + '?id=' + encodeURIComponent(id), {
            method: 'DELETE'
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Delete failed' }));
            throw new Error(err.error || 'Delete failed');
        }

        await this.refreshCache();
        return true;
    },

    search(query) {
        const lowerQuery = query.toLowerCase();

        return this.getAll().filter(doc =>
            (doc.title || '').toLowerCase().includes(lowerQuery) ||
            (doc.content || '').toLowerCase().includes(lowerQuery) ||
            (doc.details || '').toLowerCase().includes(lowerQuery)
        );
    },

    filterByCategory(category) {
        if (category === 'all') {
            return this.getAll();
        }

        return this.getAll().filter(doc => doc.category === category);
    },

    count() {
        return this.getAll().length;
    },

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
};

// ============================================
// AI Mock Service
// Simulates AI writing assistance (no real API required)
// Replace with real AI API calls in future assignments
// ============================================
const AIService = {
    /**
     * Simulate "Improve Writing" AI function
     * @param {string} text - Original text
     * @returns {Promise<Object>} { original, improved, changes }
     */
    async improveWriting(text) {
        await this.simulateDelay(1500, 2500);

        if (!text || text.trim().length === 0) {
            return { error: 'No content to improve. Please write some text first.' };
        }

        let improved = text;

        const improvements = [
            { pattern: /\bgood\b/gi, replacement: 'excellent' },
            { pattern: /\bbad\b/gi, replacement: 'suboptimal' },
            { pattern: /\bbig\b/gi, replacement: 'substantial' },
            { pattern: /\bsmall\b/gi, replacement: 'modest' },
            { pattern: /\bimportant\b/gi, replacement: 'significant' },
            { pattern: /\bvery\b/gi, replacement: '' },
            { pattern: /\breally\b/gi, replacement: '' },
            { pattern: /\ba lot of\b/gi, replacement: 'numerous' },
            { pattern: /\bmake sure\b/gi, replacement: 'ensure' },
            { pattern: /\bget\b/gi, replacement: 'obtain' },
            { pattern: /\bhelp\b/gi, replacement: 'facilitate' },
            { pattern: /\buse\b/gi, replacement: 'utilize' },
            { pattern: /\bshow\b/gi, replacement: 'demonstrate' },
            { pattern: /\bneed\b/gi, replacement: 'require' },
            { pattern: /\bstart\b/gi, replacement: 'commence' },
            { pattern: /\bend\b/gi, replacement: 'conclude' },
            { pattern: /\bbut\b/gi, replacement: 'however' },
            { pattern: /\balso\b/gi, replacement: 'furthermore' },
            { pattern: /\bso\b/gi, replacement: 'consequently' },
            { pattern: /\bbecause\b/gi, replacement: 'due to the fact that' },
            { pattern: /\bthink\b/gi, replacement: 'consider' },
            { pattern: /\bthings\b/gi, replacement: 'elements' },
            { pattern: /\bstuff\b/gi, replacement: 'components' },
            { pattern: /\bfind out\b/gi, replacement: 'discover' },
            { pattern: /\blook into\b/gi, replacement: 'investigate' },
            { pattern: /\bcome up with\b/gi, replacement: 'develop' },
            { pattern: /\bpoint out\b/gi, replacement: 'highlight' },
            { pattern: /\bgo through\b/gi, replacement: 'review' },
            { pattern: /\bset up\b/gi, replacement: 'establish' },
            { pattern: /\bwork on\b/gi, replacement: 'develop' },
            { pattern: /\bfind\b/gi, replacement: 'identify' },
            { pattern: /\bgive\b/gi, replacement: 'provide' },
            { pattern: /\btell\b/gi, replacement: 'inform' },
            { pattern: /\btry\b/gi, replacement: 'attempt' },
            { pattern: /\bwant\b/gi, replacement: 'intend' },
            { pattern: /\blet\b/gi, replacement: 'allow' },
            { pattern: /\bkeep\b/gi, replacement: 'maintain' },
            { pattern: /\bbe able to\b/gi, replacement: 'be capable of' },
            { pattern: /\bmore and more\b/gi, replacement: 'increasingly' },
            { pattern: /\bin order to\b/gi, replacement: 'to' },
        ];

        let changeCount = 0;
        improvements.forEach(({ pattern, replacement }) => {
            const matches = improved.match(pattern);
            if (matches) {
                changeCount += matches.length;
                improved = improved.replace(pattern, replacement);
            }
        });

        improved = improved.replace(/\s+/g, ' ').trim();
        improved += '\n\n[AI Enhanced: ' + changeCount + ' improvements applied]';

        return { original: text, improved: improved, changes: changeCount };
    },

    /**
     * Simulate "Summarize" AI function
     * @param {string} text - Original text
     * @returns {Promise<Object>} { original, summary, wordCounts }
     */
    async summarize(text) {
        await this.simulateDelay(1000, 2000);

        if (!text || text.trim().length === 0) {
            return { error: 'No content to summarize. Please write some text first.' };
        }

        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

        let summary = '';

        if (sentences.length <= 3) {
            summary = text.trim();
        } else {
            const topicSentence = sentences[0].trim();
            const keyIndicators = [
                /\b(however|furthermore|moreover|additionally|significantly|importantly|notably|key|main|primary|crucial|essential|demonstrate|highlight|revealed|found|show)\b/i
            ];
            let keySentences = sentences.filter(s => keyIndicators.some(p => p.test(s)));
            if (keySentences.length < 2) {
                keySentences.push(sentences[Math.floor(sentences.length / 2)]);
            }
            summary = topicSentence + '. ' + keySentences.slice(0, 3).map(s => s.trim()).join('. ') + '.';
            if (summary.length > text.length * 0.6) {
                summary = topicSentence + '. ' + keySentences.slice(0, 2).map(s => s.trim()).join('. ') + '.';
            }
            summary = summary.replace(/\s+/g, ' ').trim();
        }

        const summaryWordCount = summary.split(/\s+/).filter(w => w.length > 0).length;
        const reduction = Math.round((1 - summaryWordCount / wordCount) * 100);

        return {
            original: text,
            summary: 'Summary:\n\n' + summary + '\n\n[AI Summary: Reduced from ' + wordCount + ' to ' + summaryWordCount + ' words (' + reduction + '% reduction)]',
            wordCounts: { original: wordCount, summary: summaryWordCount, reduction: reduction }
        };
    },

    async simulateDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
};


// ============================================
// UI Controller
// Manages DOM interactions and state
// ============================================
const UIController = {
    currentDocumentId: null,
    currentCategory: 'all',
    currentSearch: '',
    isModified: false,
    isViewMode: false,
    deleteTargetId: null,
    aiPendingResult: null,
    aiResultType: null,

    /**
     * Initialize the application
     */
    async init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.initTheme();

        // Fetch documents from API
        try {
            await DocumentService.init();
        } catch (e) {
            this.showToast('Failed to connect to database', 'danger');
        }

        this.renderDocumentList();
        this.updateDocumentCount();
    },

    /**
     * Cache frequently accessed DOM elements
     */
    cacheDOMElements() {
        this.documentListEl = document.getElementById('document-list');
        this.emptyStateEl = document.getElementById('empty-state');
        this.documentCountEl = document.getElementById('document-count');
        this.searchInputEl = document.getElementById('search-input');

        this.editorPanel = document.getElementById('editor-panel');
        this.editorEmpty = document.getElementById('editor-empty');
        this.editorActive = document.getElementById('editor-active');
        this.editorStatus = document.getElementById('editor-status');
        this.docTitleInput = document.getElementById('doc-title');
        this.docCategorySelect = document.getElementById('doc-category');
        this.docContentTextarea = document.getElementById('doc-content');
        this.docDetailsTextarea = document.getElementById('doc-details');
        this.docDisplayDateInput = document.getElementById('doc-display-date');
        this.docCreatedEl = document.getElementById('doc-created');
        this.docModifiedEl = document.getElementById('doc-modified');

        this.aiStatus = document.getElementById('ai-status');
        this.aiResult = document.getElementById('ai-result');
        this.aiResultTitle = document.getElementById('ai-result-title');
        this.aiResultBody = document.getElementById('ai-result-body');

        this.docView = document.getElementById('doc-view');
        this.viewTitle = document.getElementById('view-title');
        this.viewCategory = document.getElementById('view-category');
        this.viewDates = document.getElementById('view-dates');
        this.viewBody = document.getElementById('view-body');

        this.deleteModal = document.getElementById('delete-modal');
        this.aboutModal = document.getElementById('about-modal');
        this.deleteDocNameEl = document.getElementById('delete-doc-name');

        this.toastContainer = document.getElementById('toast-container');
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        document.getElementById('btn-new-document').addEventListener('click', () => this.createNewDocument());
        document.getElementById('btn-empty-new').addEventListener('click', () => this.createNewDocument());

        document.getElementById('btn-mode-view').addEventListener('click', () => this.setViewMode(true));
        document.getElementById('btn-mode-edit').addEventListener('click', () => this.setViewMode(false));

        document.getElementById('btn-back').addEventListener('click', () => this.closeEditor());
        document.getElementById('btn-save').addEventListener('click', () => this.saveCurrentDocument());
        document.getElementById('btn-delete').addEventListener('click', () => this.showDeleteModal());

        document.getElementById('btn-cancel-delete').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('btn-cancel-delete-2').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('btn-confirm-delete').addEventListener('click', () => this.confirmDelete());

        document.getElementById('nav-about').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAboutModal();
        });
        document.getElementById('btn-close-about').addEventListener('click', () => this.hideAboutModal());
        document.getElementById('btn-close-about-2').addEventListener('click', () => this.hideAboutModal());

        document.getElementById('btn-improve').addEventListener('click', () => this.handleImproveWriting());
        document.getElementById('btn-summarize').addEventListener('click', () => this.handleSummarize());
        document.getElementById('btn-apply-ai').addEventListener('click', () => this.applyAIResult());
        document.getElementById('btn-dismiss-ai').addEventListener('click', () => this.hideAIResult());
        document.getElementById('btn-close-ai-result').addEventListener('click', () => this.hideAIResult());

        this.searchInputEl.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.renderDocumentList();
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('category-btn--active'));
                e.target.classList.add('category-btn--active');
                this.currentCategory = e.target.dataset.category;
                this.renderDocumentList();
            });
        });

        this.docTitleInput.addEventListener('input', () => this.markModified());
        this.docCategorySelect.addEventListener('change', () => this.markModified());
        this.docContentTextarea.addEventListener('input', () => this.markModified());
        this.docDetailsTextarea.addEventListener('input', () => this.markModified());
        this.docDisplayDateInput.addEventListener('change', () => this.markModified());

        this.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.deleteModal) this.hideDeleteModal();
        });
        this.aboutModal.addEventListener('click', (e) => {
            if (e.target === this.aboutModal) this.hideAboutModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.deleteModal.style.display !== 'none') this.hideDeleteModal();
                if (this.aboutModal.style.display !== 'none') this.hideAboutModal();
                if (this.aiResult.style.display !== 'none') this.hideAIResult();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.currentDocumentId) this.saveCurrentDocument();
            }
        });

        document.querySelector('.nav__toggle').addEventListener('click', function() {
            const menu = document.getElementById('nav-menu');
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            menu.classList.toggle('nav__menu--open');
        });

        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
    },

    // ==========================================
    // Document List Rendering
    // ==========================================

    renderDocumentList() {
        let documents;

        if (this.currentSearch) {
            documents = DocumentService.search(this.currentSearch);
        } else {
            documents = DocumentService.filterByCategory(this.currentCategory);
        }

        // Sort by displayDate (newest first), fallback to updatedAt
        documents.sort((a, b) => {
            const dateA = a.displayDate ? new Date(a.displayDate + 'T00:00:00') : new Date(a.updatedAt);
            const dateB = b.displayDate ? new Date(b.displayDate + 'T00:00:00') : new Date(b.updatedAt);
            return dateB - dateA;
        });

        if (documents.length === 0) {
            this.documentListEl.style.display = 'none';
            this.emptyStateEl.classList.add('empty-state--visible');
            if (this.currentSearch) {
                this.emptyStateEl.querySelector('h3').textContent = 'No results found';
                this.emptyStateEl.querySelector('p').textContent = 'Try a different search term.';
            } else {
                this.emptyStateEl.querySelector('h3').textContent = 'No documents yet';
                this.emptyStateEl.querySelector('p').textContent = 'Click "New Document" to create your first document.';
            }
        } else {
            this.documentListEl.style.display = 'block';
            this.emptyStateEl.classList.remove('empty-state--visible');
        }

        this.documentListEl.innerHTML = documents.map(doc => `
            <div class="doc-card ${doc.id === this.currentDocumentId ? 'doc-card--active' : ''}"
                 role="listitem"
                 data-id="${doc.id}"
                 tabindex="0"
                 aria-label="${this.escapeHTML(doc.title)}">
                <div class="doc-card__header">
                    <h3 class="doc-card__title">${this.escapeHTML(doc.title)}</h3>
                    <span class="doc-card__category doc-card__category--${doc.category}">${this.getCategoryLabel(doc.category)}</span>
                </div>
                <p class="doc-card__excerpt">${this.escapeHTML((doc.content || '').substring(0, 120))}${(doc.content || '').length > 120 ? '...' : ''}</p>
                <div class="doc-card__meta">
                    <span class="doc-card__date">
                        ${this.formatDisplayDate(doc.displayDate) || this.formatDate(doc.updatedAt)}
                    </span>
                    <span class="doc-card__dot"></span>
                    <span>${this.countWords(doc.content || '')} words</span>
                </div>
            </div>
        `).join('');

        this.documentListEl.querySelectorAll('.doc-card').forEach(card => {
            card.addEventListener('click', () => this.openDocument(card.dataset.id));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openDocument(card.dataset.id);
                }
            });
        });

        this.updateDocumentCount();
    },

    updateDocumentCount() {
        const count = DocumentService.count();
        this.documentCountEl.textContent = count + (count === 1 ? ' document' : ' documents');
    },

    // ==========================================
    // CRUD Operations (UI) — now async
    // ==========================================

    /**
     * CREATE - Create a new document and open editor
     */
    async createNewDocument() {
        this.editorStatus.textContent = 'Saving...';
        this.editorStatus.className = 'editor-status';

        try {
            const newDoc = await DocumentService.create({
                title: 'Untitled Document',
                content: '',
                category: this.currentCategory !== 'all' ? this.currentCategory : 'research'
            });
            this.renderDocumentList();
            this.openDocument(newDoc.id);
            setTimeout(() => {
                this.docTitleInput.focus();
                this.docTitleInput.select();
            }, 100);
            this.showToast('New document created', 'success');
            this.notifyNewsPage();
        } catch (e) {
            this.editorStatus.textContent = 'Editing';
            this.showToast('Failed to create document: ' + e.message, 'danger');
        }
    },

    /**
     * READ - Open a document in the editor (uses cache, no API call)
     */
    openDocument(id) {
        const doc = DocumentService.getById(id);
        if (!doc) return;

        this.currentDocumentId = id;
        this.isModified = false;
        this.isViewMode = false;

        this.docTitleInput.value = doc.title;
        this.docCategorySelect.value = doc.category;
        this.docContentTextarea.value = doc.content || '';
        this.docDetailsTextarea.value = doc.details || '';
        this.docDisplayDateInput.value = doc.displayDate || '';
        this.docCreatedEl.textContent = this.formatDateTime(doc.createdAt);
        this.docModifiedEl.textContent = this.formatDateTime(doc.updatedAt);

        this.editorEmpty.style.display = 'none';
        this.editorActive.style.display = 'flex';
        this.setViewMode(false);

        this.editorStatus.textContent = 'Editing';
        this.editorStatus.className = 'editor-status';

        this.hideAIResult();
        this.renderDocumentList();

        document.getElementById('nav-menu').classList.remove('nav__menu--open');
    },

    /**
     * UPDATE - Save current document changes
     */
    async saveCurrentDocument() {
        if (!this.currentDocumentId) return;

        const title = this.docTitleInput.value.trim();
        if (!title) {
            this.showToast('Title cannot be empty', 'danger');
            this.docTitleInput.focus();
            return;
        }

        this.editorStatus.textContent = 'Saving...';
        this.editorStatus.className = 'editor-status';

        try {
            const updated = await DocumentService.update(this.currentDocumentId, {
                title: title,
                content: this.docContentTextarea.value,
                details: this.docDetailsTextarea.value,
                category: this.docCategorySelect.value,
                displayDate: this.docDisplayDateInput.value
            });

            this.isModified = false;
            this.docModifiedEl.textContent = this.formatDateTime(updated.updatedAt);
            this.editorStatus.textContent = 'Saved';
            this.editorStatus.className = 'editor-status';
            this.renderDocumentList();
            this.showToast('Document saved successfully', 'success');
            this.notifyNewsPage();
        } catch (e) {
            this.editorStatus.textContent = 'Editing';
            this.showToast('Failed to save: ' + e.message, 'danger');
        }
    },

    /**
     * DELETE - Show delete confirmation modal
     */
    showDeleteModal() {
        if (!this.currentDocumentId) return;
        const doc = DocumentService.getById(this.currentDocumentId);
        if (!doc) return;

        this.deleteTargetId = this.currentDocumentId;
        this.deleteDocNameEl.textContent = doc.title;
        this.deleteModal.style.display = 'flex';
        document.getElementById('btn-confirm-delete').focus();
    },

    /**
     * Confirm delete operation
     */
    async confirmDelete() {
        if (!this.deleteTargetId) return;

        try {
            await DocumentService.delete(this.deleteTargetId);
            this.hideDeleteModal();
            this.closeEditor();
            this.renderDocumentList();
            this.showToast('Document deleted', 'danger');
            this.deleteTargetId = null;
            this.notifyNewsPage();
        } catch (e) {
            this.showToast('Failed to delete: ' + e.message, 'danger');
        }
    },

    hideDeleteModal() {
        this.deleteModal.style.display = 'none';
        this.deleteTargetId = null;
    },

    closeEditor() {
        if (this.isModified) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!confirmed) return;
        }

        this.currentDocumentId = null;
        this.isModified = false;
        this.editorEmpty.style.display = 'flex';
        this.editorActive.style.display = 'none';
        this.hideAIResult();
        this.renderDocumentList();
    },

    /**
     * Switch between View and Edit mode
     */
    setViewMode(viewMode) {
        this.isViewMode = viewMode;

        const btnView = document.getElementById('btn-mode-view');
        const btnEdit = document.getElementById('btn-mode-edit');
        const btnSave = document.getElementById('btn-save');
        const btnDelete = document.getElementById('btn-delete');
        const aiToolbar = document.getElementById('ai-toolbar');

        if (viewMode) {
            const doc = DocumentService.getById(this.currentDocumentId);
            if (!doc) return;

            this.viewTitle.textContent = doc.title;
            this.viewCategory.textContent = this.getCategoryLabel(doc.category);
            this.viewCategory.className = 'doc-view__category doc-view__category--' + doc.category;
            const displayDateStr = doc.displayDate ? this.formatDisplayDate(doc.displayDate) : 'Not set';
            this.viewDates.textContent = 'News Date: ' + displayDateStr + '  ·  Created ' + this.formatDateTime(doc.createdAt) + '  ·  Updated ' + this.formatDateTime(doc.updatedAt);

            let viewHTML = '';
            if (doc.content) {
                viewHTML += '<p class="doc-view__excerpt">' + this.escapeHTML(doc.content).replace(/\n/g, '<br>') + '</p>';
            }
            if (doc.details) {
                viewHTML += '<div class="doc-view__details"><h4>Additional Details</h4><p>' + this.escapeHTML(doc.details).replace(/\n/g, '<br>') + '</p></div>';
            }
            this.viewBody.innerHTML = viewHTML;

            this.docView.style.display = 'block';
            document.querySelectorAll('.editor-body').forEach(el => el.style.display = 'none');
            aiToolbar.style.display = 'none';
            this.hideAIResult();

            btnView.classList.add('mode-toggle__btn--active');
            btnView.setAttribute('aria-pressed', 'true');
            btnEdit.classList.remove('mode-toggle__btn--active');
            btnEdit.setAttribute('aria-pressed', 'false');

            btnSave.style.display = 'none';
            btnDelete.style.display = 'none';

            this.editorStatus.textContent = 'Viewing';
            this.editorStatus.className = 'editor-status';
        } else {
            this.docView.style.display = 'none';
            document.querySelectorAll('.editor-body').forEach(el => el.style.display = 'block');
            aiToolbar.style.display = 'flex';

            btnEdit.classList.add('mode-toggle__btn--active');
            btnEdit.setAttribute('aria-pressed', 'true');
            btnView.classList.remove('mode-toggle__btn--active');
            btnView.setAttribute('aria-pressed', 'false');

            btnSave.style.display = '';
            btnDelete.style.display = '';

            this.editorStatus.textContent = this.isModified ? 'Unsaved changes' : 'Editing';
            this.editorStatus.className = this.isModified ? 'editor-status editor-status--unsaved' : 'editor-status';
        }
    },

    markModified() {
        if (!this.currentDocumentId) return;
        this.isModified = true;
        this.editorStatus.textContent = 'Unsaved changes';
        this.editorStatus.className = 'editor-status editor-status--unsaved';
    },

    // ==========================================
    // AI Writing Tools
    // ==========================================

    async handleImproveWriting() {
        const content = this.docContentTextarea.value.trim();
        if (!content) {
            this.showToast('Please write some content first', 'info');
            return;
        }

        this.setAIButtonsDisabled(true);
        this.aiStatus.textContent = 'AI is improving your writing...';

        try {
            const result = await AIService.improveWriting(content);
            if (result.error) {
                this.showToast(result.error, 'info');
            } else {
                this.aiPendingResult = result.improved;
                this.aiResultType = 'improve';
                this.aiResultTitle.textContent = 'Improved Writing (' + result.changes + ' changes)';
                this.aiResultBody.textContent = result.improved;
                this.aiResult.style.display = 'block';
                this.showToast('Writing improved with ' + result.changes + ' changes', 'success');
            }
        } catch (e) {
            this.showToast('AI processing failed', 'danger');
        } finally {
            this.setAIButtonsDisabled(false);
            this.aiStatus.textContent = '';
        }
    },

    async handleSummarize() {
        const content = this.docContentTextarea.value.trim();
        if (!content) {
            this.showToast('Please write some content first', 'info');
            return;
        }

        this.setAIButtonsDisabled(true);
        this.aiStatus.textContent = 'AI is summarizing your text...';

        try {
            const result = await AIService.summarize(content);
            if (result.error) {
                this.showToast(result.error, 'info');
            } else {
                this.aiPendingResult = result.summary;
                this.aiResultType = 'summarize';
                this.aiResultTitle.textContent = 'Summary (' + result.wordCounts.reduction + '% reduction)';
                this.aiResultBody.textContent = result.summary;
                this.aiResult.style.display = 'block';
                this.showToast('Text summarized successfully', 'success');
            }
        } catch (e) {
            this.showToast('AI processing failed', 'danger');
        } finally {
            this.setAIButtonsDisabled(false);
            this.aiStatus.textContent = '';
        }
    },

    applyAIResult() {
        if (!this.aiPendingResult) return;
        this.docContentTextarea.value = this.aiPendingResult;
        this.markModified();
        this.hideAIResult();
        this.showToast('AI result applied to editor', 'success');
    },

    hideAIResult() {
        this.aiResult.style.display = 'none';
        this.aiPendingResult = null;
        this.aiResultType = null;
    },

    setAIButtonsDisabled(disabled) {
        document.getElementById('btn-improve').disabled = disabled;
        document.getElementById('btn-summarize').disabled = disabled;
    },

    // ==========================================
    // Modals
    // ==========================================

    showAboutModal() {
        this.aboutModal.style.display = 'flex';
    },

    hideAboutModal() {
        this.aboutModal.style.display = 'none';
    },

    // ==========================================
    // Toast Notifications
    // ==========================================

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = 'toast toast--' + type;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast--removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ==========================================
    // Theme Toggle
    // ==========================================

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        document.querySelector('.theme-toggle').setAttribute('aria-pressed', next === 'dark');
        localStorage.setItem('theme-preference', next);
    },

    initTheme() {
        const saved = localStorage.getItem('theme-preference');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
            document.querySelector('.theme-toggle').setAttribute('aria-pressed', saved === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle').setAttribute('aria-pressed', 'true');
        }
    },

    // ==========================================
    // Cross-tab notification to news.html
    // ==========================================

    notifyNewsPage() {
        try {
            const channel = new BroadcastChannel('news-sync');
            channel.postMessage({ type: 'documents-updated' });
            channel.close();
        } catch (e) { /* BroadcastChannel not supported */ }
    },

    // ==========================================
    // Utility Methods
    // ==========================================

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return days + ' days ago';
        if (days < 30) return Math.floor(days / 7) + ' weeks ago';

        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatDateTime(dateStr) {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    getCategoryLabel(category) {
        const labels = { award: 'Award', talk: 'Invited Talk', collaboration: 'Collaboration', research: 'Research', workshop: 'Workshop' };
        return labels[category] || category;
    },

    countWords(text) {
        return text.split(/\s+/).filter(w => w.length > 0).length;
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str || ''));
        return div.innerHTML;
    }
};


// ============================================
// Initialize on DOM ready
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIController.init());
} else {
    UIController.init();
}