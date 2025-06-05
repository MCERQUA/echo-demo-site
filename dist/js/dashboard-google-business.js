// Google Business section handler
class GoogleBusinessManager {
    constructor() {
        this.clientId = null;
        this.profileData = null;
        // Don't initialize immediately - wait for DOM
        console.log('[GoogleBusinessManager] Created, waiting for initialization...');
    }

    async init() {
        console.log('[Google Business] Initializing...');
        
        // Get client ID from session
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.error('[Google Business] No active session');
            return;
        }

        // Get client record
        const { data: client } = await window.supabase
            .from('clients')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

        if (!client) {
            console.error('[Google Business] No client record found');
            return;
        }

        this.clientId = client.id;
        await this.loadProfileData();
    }

    async loadProfileData() {
        // Load google_business_profile data
        const { data: profile, error } = await window.supabase
            .from('google_business_profile')
            .select('*')
            .eq('user_id', (await window.supabase.auth.getUser()).data.user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('[Google Business] Error loading profile:', error);
            return;
        }

        this.profileData = profile || this.getEmptyProfileData();
        this.populateUI();
    }

    getEmptyProfileData() {
        return {
            profile_name: '',
            profile_url: '',
            place_id: '',
            primary_category: '',
            total_reviews: 0,
            average_rating: 0,
            response_rate: 0,
            last_post_date: null
        };
    }

    populateUI() {
        const container = document.querySelector('#google-business-content');
        if (!container) {
            console.log('[Google Business] Content container not found');
            return;
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Google Business Profile</h3>
                    <button class="btn-edit" onclick="googleBusinessManager.toggleEdit()">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
                <div class="card-body">
                    <form id="google-business-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Profile Name</label>
                                <input type="text" name="profile_name" 
                                       value="${this.profileData.profile_name || ''}" 
                                       placeholder="Your Business Name" disabled>
                            </div>
                            <div class="form-group">
                                <label>Primary Category</label>
                                <input type="text" name="primary_category" 
                                       value="${this.profileData.primary_category || ''}" 
                                       placeholder="e.g., Print Shop" disabled>
                            </div>
                            <div class="form-group">
                                <label>Profile URL</label>
                                <input type="url" name="profile_url" 
                                       value="${this.profileData.profile_url || ''}" 
                                       placeholder="Google Business Profile URL" disabled>
                            </div>
                            <div class="form-group">
                                <label>Place ID</label>
                                <input type="text" name="place_id" 
                                       value="${this.profileData.place_id || ''}" 
                                       placeholder="Google Place ID" disabled>
                            </div>
                        </div>
                        <div class="form-actions" style="display: none;">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary" 
                                    onclick="googleBusinessManager.cancelEdit()">Cancel</button>
                        </div>
                    </form>
                    
                    <div class="profile-stats">
                        <h4>Profile Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value">${this.profileData.total_reviews || 0}</div>
                                <div class="stat-label">Total Reviews</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${this.profileData.average_rating?.toFixed(1) || '0.0'}</div>
                                <div class="stat-label">Average Rating</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${this.profileData.response_rate || 0}%</div>
                                <div class="stat-label">Response Rate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach form submission handler
        const form = document.getElementById('google-business-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProfile(new FormData(e.target));
            });
        }
    }

    toggleEdit() {
        const form = document.getElementById('google-business-form');
        const inputs = form.querySelectorAll('input');
        const actions = form.querySelector('.form-actions');
        const isEditing = !inputs[0].disabled;

        inputs.forEach(input => {
            input.disabled = isEditing;
        });

        actions.style.display = isEditing ? 'none' : 'flex';
    }

    cancelEdit() {
        this.populateUI(); // Reset to saved values
    }

    async saveProfile(formData) {
        const updates = {
            profile_name: formData.get('profile_name'),
            primary_category: formData.get('primary_category'),
            profile_url: formData.get('profile_url'),
            place_id: formData.get('place_id'),
            updated_at: new Date().toISOString()
        };

        try {
            const { error } = await window.supabase
                .from('google_business_profile')
                .upsert({ 
                    ...updates, 
                    user_id: (await window.supabase.auth.getUser()).data.user.id
                });

            if (error) throw error;

            // Update local data
            this.profileData = { ...this.profileData, ...updates };
            
            // Refresh UI
            this.populateUI();
            
            // Show success message
            this.showNotification('Google Business Profile saved successfully!', 'success');
        } catch (error) {
            console.error('[Google Business] Save error:', error);
            this.showNotification('Error saving profile', 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Create manager immediately but initialize later
window.googleBusinessManager = new GoogleBusinessManager();

// Initialize when DOM is ready or when called explicitly
function initializeGoogleBusinessManager() {
    if (window.googleBusinessManager && !window.googleBusinessManager.initialized) {
        console.log('[Google Business] DOM ready, initializing manager...');
        window.googleBusinessManager.initialized = true;
        window.googleBusinessManager.init();
    }
}

// Try to initialize on various events
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGoogleBusinessManager);
} else {
    // DOM already loaded, but wait a bit for containers to be created
    setTimeout(initializeGoogleBusinessManager, 100);
}

// Also expose for manual initialization
window.initializeGoogleBusinessManager = initializeGoogleBusinessManager;