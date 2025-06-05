// Social Media section handler
class SocialMediaManager {
    constructor() {
        this.clientId = null;
        this.socialAccounts = [];
        // Don't initialize immediately - wait for DOM
        console.log('[SocialMediaManager] Created, waiting for initialization...');
    }

    async init() {
        console.log('[Social Media] Initializing...');
        
        // Get client ID from session
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.error('[Social Media] No active session');
            return;
        }

        // Get client record
        const { data: client } = await window.supabase
            .from('clients')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!client) {
            console.error('[Social Media] No client record found');
            return;
        }

        this.clientId = client.id;
        await this.loadSocialAccounts();
    }

    async loadSocialAccounts() {
        // Load social media accounts
        const { data: accounts, error } = await window.supabase
            .from('social_media_accounts')
            .select('*')
            .eq('client_id', this.clientId)
            .order('platform');

        if (error && error.code !== 'PGRST116') { // Table not found
            console.error('[Social Media] Error loading accounts:', error);
            return;
        }

        this.socialAccounts = accounts || [];
        this.populateUI();
    }

    populateUI() {
        const container = document.querySelector('#social-media-content');
        if (!container) {
            console.log('[Social Media] Content container not found');
            return;
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Connected Social Media Accounts</h3>
                    <button class="btn-primary" onclick="socialMediaManager.showAddAccountModal()">
                        <i class="fas fa-plus"></i> Add Account
                    </button>
                </div>
                <div class="card-body">
                    ${this.socialAccounts.length > 0 ? 
                        `<div class="social-accounts-grid">
                            ${this.socialAccounts.map(account => this.renderAccountCard(account)).join('')}
                        </div>` :
                        `<div class="empty-state">
                            <p>No social media accounts connected yet.</p>
                            <button class="btn-primary" onclick="socialMediaManager.showAddAccountModal()">
                                Connect Your First Account
                            </button>
                        </div>`
                    }
                </div>
            </div>
        `;
    }

    renderAccountCard(account) {
        const iconMap = {
            'Facebook': 'fab fa-facebook',
            'Instagram': 'fab fa-instagram',
            'Twitter': 'fab fa-twitter',
            'LinkedIn': 'fab fa-linkedin',
            'YouTube': 'fab fa-youtube',
            'TikTok': 'fab fa-tiktok'
        };

        return `
            <div class="social-account-card">
                <div class="account-header">
                    <i class="${iconMap[account.platform] || 'fas fa-share-alt'}"></i>
                    <h4>${account.platform}</h4>
                </div>
                <div class="account-info">
                    <div class="info-row">
                        <span class="label">Username:</span>
                        <span class="value">@${account.username || 'Not set'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Followers:</span>
                        <span class="value">${this.formatNumber(account.follower_count || 0)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Posts:</span>
                        <span class="value">${this.formatNumber(account.post_count || 0)}</span>
                    </div>
                    ${account.is_verified ? 
                        '<div class="verified-badge"><i class="fas fa-check-circle"></i> Verified</div>' : 
                        ''
                    }
                </div>
                <div class="account-actions">
                    ${account.profile_url ? 
                        `<a href="${account.profile_url}" target="_blank" class="btn-link">View Profile</a>` :
                        ''
                    }
                    <button class="btn-link" onclick="socialMediaManager.editAccount('${account.id}')">Edit</button>
                    <button class="btn-link danger" onclick="socialMediaManager.deleteAccount('${account.id}')">Remove</button>
                </div>
            </div>
        `;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    showAddAccountModal() {
        const modal = this.createModal('Add Social Media Account', `
            <form id="add-account-form">
                <div class="form-group">
                    <label>Platform</label>
                    <select name="platform" required>
                        <option value="">Select a platform</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter">Twitter/X</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Pinterest">Pinterest</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" placeholder="@username" required>
                </div>
                <div class="form-group">
                    <label>Profile URL</label>
                    <input type="url" name="profile_url" placeholder="https://..." required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Add Account</button>
                    <button type="button" class="btn btn-secondary" onclick="socialMediaManager.closeModal()">Cancel</button>
                </div>
            </form>
        `);

        document.getElementById('add-account-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addAccount(new FormData(e.target));
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="socialMediaManager.closeModal()">×</button>
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

    async addAccount(formData) {
        try {
            const { error } = await window.supabase
                .from('social_media_accounts')
                .insert({
                    client_id: this.clientId,
                    platform: formData.get('platform'),
                    username: formData.get('username').replace('@', ''),
                    profile_url: formData.get('profile_url'),
                    connected: true,
                    follower_count: 0,
                    post_count: 0
                });

            if (error) throw error;

            this.closeModal();
            await this.loadSocialAccounts();
            this.showNotification('Social media account added successfully!', 'success');
        } catch (error) {
            console.error('[Social Media] Error adding account:', error);
            this.showNotification('Error adding account', 'error');
        }
    }

    async editAccount(id) {
        this.showNotification('Edit account feature coming soon!', 'info');
    }

    async deleteAccount(id) {
        if (confirm('Are you sure you want to remove this social media account?')) {
            try {
                const { error } = await window.supabase
                    .from('social_media_accounts')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await this.loadSocialAccounts();
                this.showNotification('Account removed successfully!', 'success');
            } catch (error) {
                console.error('[Social Media] Error deleting account:', error);
                this.showNotification('Error removing account', 'error');
            }
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Create manager immediately but initialize later
window.socialMediaManager = new SocialMediaManager();

// Initialize when DOM is ready or when called explicitly
function initializeSocialMediaManager() {
    if (window.socialMediaManager && !window.socialMediaManager.initialized) {
        console.log('[Social Media] DOM ready, initializing manager...');
        window.socialMediaManager.initialized = true;
        window.socialMediaManager.init();
    }
}

// Try to initialize on various events
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSocialMediaManager);
} else {
    // DOM already loaded, but wait a bit for containers to be created
    setTimeout(initializeSocialMediaManager, 100);
}

// Also expose for manual initialization
window.initializeSocialMediaManager = initializeSocialMediaManager;