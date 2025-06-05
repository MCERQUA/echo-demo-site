// Website section handler - Enhanced module for website management
class WebsiteManager {
    constructor() {
        this.clientId = null;
        this.websiteData = null;
        this.analyticsData = null;
        this.init();
    }

    async init() {
        console.log('[Website] Initializing...');
        
        // Get client ID from session
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.error('[Website] No active session');
            return;
        }

        // Get client record
        const { data: client } = await window.supabase
            .from('clients')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!client) {
            console.error('[Website] No client record found');
            return;
        }

        this.clientId = client.id;
        await this.loadWebsiteData();
        this.attachEventListeners();
    }

    async loadWebsiteData() {
        // Load website_info
        const { data: websiteInfo, error: infoError } = await window.supabase
            .from('website_info')
            .select('*')
            .eq('client_id', this.clientId)
            .single();

        if (infoError && infoError.code !== 'PGRST116') { // Not found is ok
            console.error('[Website] Error loading website info:', infoError);
            return;
        }

        this.websiteData = websiteInfo || this.getEmptyWebsiteData();

        // Load website_analytics
        const { data: analytics, error: analyticsError } = await window.supabase
            .from('website_analytics')
            .select('*')
            .eq('client_id', this.clientId)
            .order('metric_date', { ascending: false })
            .limit(30);

        if (analyticsError) {
            console.error('[Website] Error loading analytics:', analyticsError);
        }

        this.analyticsData = analytics || [];
        
        // Populate the UI
        this.populateWebsiteForm();
        this.displayAnalytics();
    }

    getEmptyWebsiteData() {
        return {
            client_id: this.clientId,
            website_url: '',
            primary_domain: '',
            platform: '',
            ssl_status: 'Unknown',
            mobile_responsive: 'Unknown',
            analytics_id: '',
            sitemap_url: '',
            last_updated: null
        };
    }

    populateWebsiteForm() {
        // Website Configuration Section
        const configSection = document.querySelector('#website-config');
        if (!configSection) {
            console.error('[Website] Config section not found');
            return;
        }

        configSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Website Configuration</h3>
                    <button class="btn-edit" onclick="websiteManager.toggleEdit('config')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
                <div class="card-body">
                    <form id="website-config-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Website URL</label>
                                <input type="url" name="website_url" value="${this.websiteData.website_url || ''}" 
                                       placeholder="https://www.example.com" disabled>
                            </div>
                            <div class="form-group">
                                <label>Primary Domain</label>
                                <input type="text" name="primary_domain" 
                                       value="${this.websiteData.primary_domain || ''}" 
                                       placeholder="example.com" disabled>
                            </div>
                            <div class="form-group">
                                <label>Platform</label>
                                <input type="text" name="platform" 
                                       value="${this.websiteData.platform || ''}" 
                                       placeholder="e.g., WordPress, Shopify" disabled>
                            </div>
                            <div class="form-group">
                                <label>Analytics ID</label>
                                <input type="text" name="analytics_id" 
                                       value="${this.websiteData.analytics_id || ''}" 
                                       placeholder="UA-XXXXXXXXX-X" disabled>
                            </div>
                            <div class="form-group">
                                <label>SSL Status</label>
                                <select name="ssl_status" disabled>
                                    <option value="Unknown" ${this.websiteData.ssl_status === 'Unknown' ? 'selected' : ''}>Unknown</option>
                                    <option value="Active" ${this.websiteData.ssl_status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Inactive" ${this.websiteData.ssl_status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                    <option value="Expired" ${this.websiteData.ssl_status === 'Expired' ? 'selected' : ''}>Expired</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Mobile Responsive</label>
                                <select name="mobile_responsive" disabled>
                                    <option value="Unknown" ${this.websiteData.mobile_responsive === 'Unknown' ? 'selected' : ''}>Unknown</option>
                                    <option value="Yes" ${this.websiteData.mobile_responsive === 'Yes' ? 'selected' : ''}>Yes</option>
                                    <option value="No" ${this.websiteData.mobile_responsive === 'No' ? 'selected' : ''}>No</option>
                                    <option value="Partial" ${this.websiteData.mobile_responsive === 'Partial' ? 'selected' : ''}>Partial</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label>Sitemap URL</label>
                                <input type="url" name="sitemap_url" 
                                       value="${this.websiteData.sitemap_url || ''}" 
                                       placeholder="https://www.example.com/sitemap.xml" disabled>
                            </div>
                        </div>
                        <div class="form-actions" style="display: none;">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary" 
                                    onclick="websiteManager.cancelEdit('config')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Last Updated info
        if (this.websiteData.last_updated) {
            const lastUpdated = new Date(this.websiteData.last_updated).toLocaleString();
            const cardBody = configSection.querySelector('.card-body');
            cardBody.insertAdjacentHTML('beforeend', 
                `<div class="last-updated">Last updated: ${lastUpdated}</div>`
            );
        }
    }

    displayAnalytics() {
        const analyticsSection = document.querySelector('#website-analytics');
        if (!analyticsSection) return;

        // Get latest analytics data
        const latestData = this.analyticsData[0] || {};

        analyticsSection.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Website Analytics</h3>
                    <button class="btn-edit" onclick="websiteManager.updateAnalytics()">
                        <i class="fas fa-sync"></i> Update
                    </button>
                </div>
                <div class="card-body">
                    <div class="analytics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${this.formatNumber(latestData.monthly_visitors || 0)}</div>
                            <div class="metric-label">Monthly Visitors</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${this.formatNumber(latestData.monthly_pageviews || 0)}</div>
                            <div class="metric-label">Page Views</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${latestData.bounce_rate || 0}%</div>
                            <div class="metric-label">Bounce Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${this.formatDuration(latestData.avg_session_duration || 0)}</div>
                            <div class="metric-label">Avg. Session</div>
                        </div>
                    </div>
                    
                    <div class="seo-scores">
                        <h4>SEO Performance</h4>
                        <div class="scores-grid">
                            ${this.renderScoreBar('Overall SEO', latestData.seo_score || 0)}
                            ${this.renderScoreBar('Technical SEO', latestData.technical_seo_score || 0)}
                            ${this.renderScoreBar('Content Score', latestData.content_score || 0)}
                        </div>
                    </div>
                    
                    <div class="backlink-stats">
                        <h4>Backlink Profile</h4>
                        <div class="stats-row">
                            <div class="stat">
                                <span class="stat-label">Total Backlinks:</span>
                                <span class="stat-value">${this.formatNumber(latestData.total_backlinks || 0)}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Referring Domains:</span>
                                <span class="stat-value">${this.formatNumber(latestData.referring_domains || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderScoreBar(label, score) {
        const scoreClass = score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'average' : 'poor';
        
        return `
            <div class="score-item">
                <div class="score-header">
                    <span class="score-label">${label}</span>
                    <span class="score-value">${score}/100</span>
                </div>
                <div class="score-bar">
                    <div class="score-fill ${scoreClass}" style="width: ${score}%"></div>
                </div>
            </div>
        `;
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    toggleEdit(section) {
        const form = document.querySelector(`#website-${section}-form`);
        const inputs = form.querySelectorAll('input, select, textarea');
        const actions = form.querySelector('.form-actions');
        const isEditing = !inputs[0].disabled;

        inputs.forEach(input => {
            input.disabled = isEditing;
        });

        actions.style.display = isEditing ? 'none' : 'flex';
    }

    cancelEdit(section) {
        this.populateWebsiteForm(); // Reset to saved values
    }

    attachEventListeners() {
        // Config form submission
        const configForm = document.querySelector('#website-config-form');
        if (configForm) {
            configForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveWebsiteConfig(new FormData(e.target));
            });
        }
    }

    async saveWebsiteConfig(formData) {
        const updates = {
            website_url: formData.get('website_url'),
            primary_domain: formData.get('primary_domain'),
            platform: formData.get('platform'),
            ssl_status: formData.get('ssl_status'),
            mobile_responsive: formData.get('mobile_responsive'),
            analytics_id: formData.get('analytics_id'),
            sitemap_url: formData.get('sitemap_url'),
            last_updated: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const { error } = await window.supabase
                .from('website_info')
                .upsert({ 
                    ...updates, 
                    client_id: this.clientId,
                    user_id: (await window.supabase.auth.getUser()).data.user.id
                });

            if (error) throw error;

            // Update local data
            this.websiteData = { ...this.websiteData, ...updates };
            
            // Refresh UI
            this.populateWebsiteForm();
            
            // Show success message
            this.showNotification('Website configuration saved successfully!', 'success');
        } catch (error) {
            console.error('[Website] Save error:', error);
            this.showNotification('Error saving website configuration', 'error');
        }
    }

    async updateAnalytics() {
        this.showNotification('Analytics update feature coming soon!', 'info');
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
    window.websiteManager = new WebsiteManager();
});