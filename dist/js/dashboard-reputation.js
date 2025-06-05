// Reputation section handler - Enhanced module for reputation management
class ReputationManager {
    constructor() {
        this.clientId = null;
        this.reputationData = null;
        this.citationsData = [];
        this.init();
    }

    async init() {
        console.log('[Reputation] Initializing...');
        
        // Get client ID from session
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) return;

        // Get client record
        const { data: client } = await window.supabase
            .from('clients')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!client) return;

        this.clientId = client.id;
        await this.loadReputationData();
        this.attachEventListeners();
    }

    async loadReputationData() {
        // Load reputation_management data
        const { data: reputation } = await window.supabase
            .from('reputation_management')
            .select('*')
            .eq('client_id', this.clientId);

        this.reputationData = reputation || [];

        // Load directory citations
        const { data: citations } = await window.supabase
            .from('directory_citations')
            .select('*')
            .eq('client_id', this.clientId)
            .order('site_name');

        this.citationsData = citations || [];
        
        this.populateReputationUI();
    }

    populateReputationUI() {
        const overviewSection = document.querySelector('#reputation-overview');
        if (!overviewSection) return;

        // Calculate aggregate stats
        const stats = this.calculateAggregateStats();

        overviewSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Reputation Overview</h3>
                    <button class="btn-primary" onclick="reputationManager.showAddPlatformModal()">
                        <i class="fas fa-plus"></i> Add Platform
                    </button>
                </div>
                <div class="card-body">
                    <div class="reputation-stats">
                        <div class="stat-card">
                            <div class="stat-value">${stats.averageRating.toFixed(1)}</div>
                            <div class="stat-label">Average Rating</div>
                            <div class="star-rating">${this.renderStars(stats.averageRating)}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.totalReviews}</div>
                            <div class="stat-label">Total Reviews</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.responseRate}%</div>
                            <div class="stat-label">Response Rate</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${stats.platformCount}</div>
                            <div class="stat-label">Platforms Tracked</div>
                        </div>
                    </div>

                    <div class="platform-breakdown">
                        <h4>Platform Performance</h4>
                        ${this.reputationData.length ? 
                            this.reputationData.map(platform => this.renderPlatformCard(platform)).join('') :
                            '<p class="no-data">No platforms tracked yet. Add your first platform to get started!</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        // Citations section
        const citationsSection = document.querySelector('#citations-list');
        if (citationsSection) {
            citationsSection.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3>Directory Citations (${this.citationsData.length})</h3>
                        <button class="btn-primary" onclick="reputationManager.showAddCitationModal()">
                            <i class="fas fa-plus"></i> Add Citation
                        </button>
                    </div>
                    <div class="card-body">
                        ${this.citationsData.length ? 
                            `<div class="citations-grid">
                                ${this.citationsData.map(citation => this.renderCitationCard(citation)).join('')}
                            </div>` :
                            '<p class="no-data">No directory citations found. Add your business to online directories to improve local SEO!</p>'
                        }
                    </div>
                </div>
            `;
        }
    }

    calculateAggregateStats() {
        if (!this.reputationData.length) {
            return {
                averageRating: 0,
                totalReviews: 0,
                responseRate: 0,
                platformCount: 0
            };
        }

        const totalReviews = this.reputationData.reduce((sum, p) => sum + (p.total_reviews || 0), 0);
        const weightedRatingSum = this.reputationData.reduce((sum, p) => 
            sum + ((p.average_rating || 0) * (p.total_reviews || 0)), 0
        );
        const averageRating = totalReviews > 0 ? weightedRatingSum / totalReviews : 0;
        const avgResponseRate = this.reputationData.reduce((sum, p) => sum + (p.response_rate || 0), 0) / this.reputationData.length;

        return {
            averageRating,
            totalReviews,
            responseRate: Math.round(avgResponseRate),
            platformCount: this.reputationData.length
        };
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }

    renderPlatformCard(platform) {
        const trend = platform.trending === 'up' ? '↑' : platform.trending === 'down' ? '↓' : '→';
        const trendClass = platform.trending === 'up' ? 'trending-up' : platform.trending === 'down' ? 'trending-down' : '';

        return `
            <div class="platform-card">
                <div class="platform-header">
                    <h4>${platform.platform_name}</h4>
                    <span class="trend ${trendClass}">${trend}</span>
                </div>
                <div class="platform-content">
                    <div class="platform-rating">
                        <span class="rating-value">${platform.average_rating?.toFixed(1) || '0.0'}</span>
                        <div class="star-rating">${this.renderStars(platform.average_rating || 0)}</div>
                        <span class="review-count">${platform.total_reviews || 0} reviews</span>
                    </div>
                    <div class="rating-breakdown">
                        ${this.renderRatingBreakdown(platform)}
                    </div>
                    <div class="platform-stats">
                        <div class="stat">
                            <span class="label">Response Rate:</span>
                            <span class="value">${platform.response_rate || 0}%</span>
                        </div>
                        <div class="stat">
                            <span class="label">Avg Response Time:</span>
                            <span class="value">${platform.average_response_time || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="platform-actions">
                        <a href="${platform.profile_url}" target="_blank" class="btn-link">View Profile</a>
                        <button class="btn-link" onclick="reputationManager.editPlatform('${platform.id}')">Edit</button>
                        <button class="btn-link danger" onclick="reputationManager.deletePlatform('${platform.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderRatingBreakdown(platform) {
        const total = platform.total_reviews || 1;
        const ratings = [
            { stars: 5, count: platform.five_star || 0 },
            { stars: 4, count: platform.four_star || 0 },
            { stars: 3, count: platform.three_star || 0 },
            { stars: 2, count: platform.two_star || 0 },
            { stars: 1, count: platform.one_star || 0 }
        ];

        return ratings.map(r => `
            <div class="rating-row">
                <span class="stars">${r.stars}★</span>
                <div class="rating-bar">
                    <div class="rating-fill" style="width: ${(r.count / total * 100).toFixed(0)}%"></div>
                </div>
                <span class="count">${r.count}</span>
            </div>
        `).join('');
    }

    renderCitationCard(citation) {
        const statusClass = citation.status === 'active' ? 'status-active' : 
                          citation.status === 'pending' ? 'status-pending' : 
                          citation.status === 'needs_update' ? 'status-warning' : 'status-inactive';

        return `
            <div class="citation-card">
                <div class="citation-header">
                    <h5>${citation.site_name}</h5>
                    <span class="status ${statusClass}">${citation.status}</span>
                </div>
                <div class="citation-info">
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${citation.directory_type || 'General'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Claimed:</span>
                        <span class="value">${citation.profile_claimed ? 'Yes' : 'No'}</span>
                    </div>
                    ${citation.has_reviews ? `
                        <div class="info-row">
                            <span class="label">Reviews:</span>
                            <span class="value">${citation.review_count} (${citation.average_rating?.toFixed(1) || '0.0'}★)</span>
                        </div>
                    ` : ''}
                </div>
                <div class="citation-actions">
                    ${citation.live_url ? 
                        `<a href="${citation.live_url}" target="_blank" class="btn-link">View</a>` : 
                        '<span class="btn-link disabled">Not Live</span>'
                    }
                    <button class="btn-link" onclick="reputationManager.editCitation('${citation.id}')">Edit</button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Add event listeners for forms and modals
    }

    showAddPlatformModal() {
        // Modal for adding new review platform
        const modal = this.createModal('Add Review Platform', `
            <form id="add-platform-form">
                <div class="form-group">
                    <label>Platform Name</label>
                    <select name="platform_name" required>
                        <option value="">Select a platform</option>
                        <option value="Google">Google My Business</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Yelp">Yelp</option>
                        <option value="TripAdvisor">TripAdvisor</option>
                        <option value="BBB">Better Business Bureau</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Profile URL</label>
                    <input type="url" name="profile_url" placeholder="https://..." required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Platform</button>
                    <button type="button" class="btn btn-secondary" onclick="reputationManager.closeModal()">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('add-platform-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addPlatform(new FormData(e.target));
        });
    }

    showAddCitationModal() {
        // Modal for adding new directory citation
        const modal = this.createModal('Add Directory Citation', `
            <form id="add-citation-form">
                <div class="form-group">
                    <label>Directory Name</label>
                    <input type="text" name="site_name" placeholder="e.g., Yellow Pages" required>
                </div>
                <div class="form-group">
                    <label>Directory Type</label>
                    <select name="directory_type" required>
                        <option value="general">General Directory</option>
                        <option value="industry">Industry Specific</option>
                        <option value="local">Local Directory</option>
                        <option value="niche">Niche Directory</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" placeholder="Optional">
                </div>
                <div class="form-group">
                    <label>Profile URL (if live)</label>
                    <input type="url" name="live_url" placeholder="https://...">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Citation</button>
                    <button type="button" class="btn btn-secondary" onclick="reputationManager.closeModal()">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('add-citation-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addCitation(new FormData(e.target));
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="reputationManager.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }

    async addPlatform(formData) {
        try {
            const { error } = await window.supabase
                .from('reputation_management')
                .insert({
                    client_id: this.clientId,
                    platform_name: formData.get('platform_name'),
                    profile_url: formData.get('profile_url'),
                    total_reviews: 0,
                    average_rating: 0,
                    response_rate: 0,
                    trending: 'stable'
                });

            if (error) throw error;

            this.closeModal();
            await this.loadReputationData();
            this.showNotification('Platform added successfully!', 'success');
        } catch (error) {
            console.error('[Reputation] Error adding platform:', error);
            this.showNotification('Error adding platform', 'error');
        }
    }

    async addCitation(formData) {
        try {
            const { error } = await window.supabase
                .from('directory_citations')
                .insert({
                    client_id: this.clientId,
                    site_name: formData.get('site_name'),
                    directory_type: formData.get('directory_type'),
                    username: formData.get('username'),
                    live_url: formData.get('live_url'),
                    status: 'pending',
                    profile_claimed: false,
                    has_reviews: false
                });

            if (error) throw error;

            this.closeModal();
            await this.loadReputationData();
            this.showNotification('Citation added successfully!', 'success');
        } catch (error) {
            console.error('[Reputation] Error adding citation:', error);
            this.showNotification('Error adding citation', 'error');
        }
    }

    async editPlatform(id) {
        this.showNotification('Edit platform feature coming soon!', 'info');
    }

    async deletePlatform(id) {
        if (confirm('Are you sure you want to remove this platform?')) {
            try {
                const { error } = await window.supabase
                    .from('reputation_management')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await this.loadReputationData();
                this.showNotification('Platform removed successfully!', 'success');
            } catch (error) {
                console.error('[Reputation] Error deleting platform:', error);
                this.showNotification('Error removing platform', 'error');
            }
        }
    }

    async editCitation(id) {
        this.showNotification('Edit citation feature coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        // Use the global notification function from dashboard-core
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.reputationManager = new ReputationManager();
});