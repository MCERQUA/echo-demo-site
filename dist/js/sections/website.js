// Website Section Module - Simplified for Modular Architecture
console.log('Website section module loaded');

// Initialize website section
function initWebsiteSection() {
    console.log('Initializing website section');
    
    // Get the already loaded data
    const websiteData = window.userData?.websiteInfo || {};
    console.log('Using website data:', websiteData);
    
    // Insert content with actual data
    insertWebsiteContent(websiteData);
    
    // Check if we have the required tables
    checkWebsiteTables();
}

// Check if website tables exist
async function checkWebsiteTables() {
    if (!window.user || !window.supabase) {
        console.log('Waiting for authentication...');
        return;
    }
    
    try {
        // Try to query the website_info table
        const { data, error } = await window.supabase
            .from('website_info')
            .select('id')
            .limit(1);
        
        if (error && error.code === 'PGRST204') {
            console.log('Website tables exist but no data yet');
        } else if (error) {
            console.error('Website tables may not exist:', error);
            showWebsiteSetupMessage();
        } else {
            console.log('Website tables are ready');
        }
    } catch (err) {
        console.error('Error checking website tables:', err);
    }
}

// Show setup message if tables don't exist
function showWebsiteSetupMessage() {
    const container = document.getElementById('website-tabs');
    if (container) {
        container.innerHTML = `
            <div class="setup-message">
                <h3>Website Section Setup Required</h3>
                <p>The website section requires database tables to be created.</p>
                <p>Please run the SQL script located at:</p>
                <code>docs/website_tables.sql</code>
                <p>in your Supabase SQL editor to enable this section.</p>
            </div>
        `;
    }
}

// Don't initialize automatically - wait for dashboard-core to call initWebsiteSection
// This prevents race conditions where the module loads before the data

// Export functions
window.initWebsiteSection = initWebsiteSection;
window.checkWebsiteTables = checkWebsiteTables;

// Add styles for setup message
const style = document.createElement('style');
style.textContent = `
    .setup-message {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        margin: 2rem auto;
        max-width: 600px;
    }
    
    .setup-message h3 {
        color: var(--primary);
        margin-bottom: 1rem;
    }
    
    .setup-message code {
        display: block;
        background: var(--background);
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        border-radius: 4px;
        font-family: monospace;
        color: var(--text-primary);
    }
`;
document.head.appendChild(style);

// Function to insert website content with data
function insertWebsiteContent(websiteData) {
    console.log('Inserting website content with data:', websiteData);
    
    // Insert configuration section
    const websiteContent = document.getElementById('website-config');
    if (websiteContent) {
        console.log('Found website-config container, inserting content...');
        websiteContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Website Configuration</h3>
                    <button class="btn-edit" onclick="toggleWebsiteEdit()">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
                <div class="card-body">
                    <form id="website-config-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Website URL</label>
                                <input type="url" name="website_url" 
                                       placeholder="https://www.example.com" 
                                       value="${websiteData.website_url || ''}" disabled>
                            </div>
                            <div class="form-group">
                                <label>Primary Domain</label>
                                <input type="text" name="primary_domain" 
                                       placeholder="example.com" 
                                       value="${websiteData.primary_domain || ''}" disabled>
                            </div>
                            <div class="form-group">
                                <label>Platform</label>
                                <input type="text" name="platform" 
                                       placeholder="WordPress, Shopify, etc." 
                                       value="${websiteData.platform || ''}" disabled>
                            </div>
                            <div class="form-group">
                                <label>SSL Status</label>
                                <select name="ssl_status" disabled>
                                    <option value="Active" ${websiteData.ssl_status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Inactive" ${websiteData.ssl_status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                    <option value="Unknown" ${!websiteData.ssl_status || websiteData.ssl_status === 'Unknown' ? 'selected' : ''}>Unknown</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Mobile Responsive</label>
                                <select name="mobile_responsive" disabled>
                                    <option value="Yes" ${websiteData.mobile_responsive === 'Yes' ? 'selected' : ''}>Yes</option>
                                    <option value="No" ${websiteData.mobile_responsive === 'No' ? 'selected' : ''}>No</option>
                                    <option value="Unknown" ${!websiteData.mobile_responsive || websiteData.mobile_responsive === 'Unknown' ? 'selected' : ''}>Unknown</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Analytics ID</label>
                                <input type="text" name="analytics_id" 
                                       placeholder="UA-XXXXXXXX-X" 
                                       value="${websiteData.analytics_id || ''}" disabled>
                            </div>
                        </div>
                        <div class="form-actions" style="display: none;">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary" onclick="cancelWebsiteEdit()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    } else {
        console.error('website-config container not found!');
    }

    // Insert analytics section
    const analyticsContent = document.getElementById('website-analytics');
    if (analyticsContent) {
        console.log('Found website-analytics container, inserting analytics...');
        
        // Get analytics data if available
        const analyticsData = window.userData?.websiteAnalytics || [];
        const latestAnalytics = analyticsData[0] || {};
        
        analyticsContent.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Website Analytics</h3>
                </div>
                <div class="card-body">
                    <div class="analytics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${formatNumber(latestAnalytics.monthly_visitors || 0)}</div>
                            <div class="metric-label">Monthly Visitors</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${formatNumber(latestAnalytics.monthly_pageviews || 0)}</div>
                            <div class="metric-label">Page Views</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${latestAnalytics.bounce_rate || 0}%</div>
                            <div class="metric-label">Bounce Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${latestAnalytics.seo_score || 0}</div>
                            <div class="metric-label">SEO Score</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Helper function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Toggle edit mode
function toggleWebsiteEdit() {
    const form = document.getElementById('website-config-form');
    const inputs = form.querySelectorAll('input, select');
    const actions = form.querySelector('.form-actions');
    const editBtn = form.closest('.card').querySelector('.btn-edit');
    
    const isEditing = !inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = isEditing;
    });
    
    actions.style.display = isEditing ? 'none' : 'flex';
    editBtn.innerHTML = isEditing ? '<i class="fas fa-edit"></i> Edit' : '<i class="fas fa-save"></i> Editing';
}

// Cancel edit
function cancelWebsiteEdit() {
    // Re-insert content with original data
    const websiteData = window.userData?.websiteInfo || {};
    insertWebsiteContent(websiteData);
}

// Make functions globally available
window.toggleWebsiteEdit = toggleWebsiteEdit;
window.cancelWebsiteEdit = cancelWebsiteEdit;
window.insertWebsiteContent = insertWebsiteContent;

console.log('Website section initialization complete');
