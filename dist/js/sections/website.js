// Website Section Module - Simplified for Modular Architecture
console.log('Website section module loaded');

// Initialize website section
function initWebsiteSection() {
    console.log('Initializing website section');
    
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

// Initialize when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebsiteSection);
} else {
    initWebsiteSection();
}

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

// ACTUALLY INSERT SOMETHING INTO THE DOM!
const websiteContent = document.getElementById('website-config');
if (websiteContent) {
    console.log('Found website-config container, inserting content...');
    websiteContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Website Configuration</h3>
                <button class="btn-edit" onclick="alert('Edit clicked!')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="card-body">
                <form>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Domain</label>
                            <input type="text" placeholder="www.example.com" value="">
                        </div>
                        <div class="form-group">
                            <label>Platform</label>
                            <input type="text" placeholder="WordPress, Shopify, etc." value="">
                        </div>
                        <div class="form-group">
                            <label>SSL Status</label>
                            <select>
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Unknown</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
    `;
} else {
    console.error('website-config container not found!');
}

// Also check for analytics container
const analyticsContent = document.getElementById('website-analytics');
if (analyticsContent) {
    console.log('Found website-analytics container, inserting content...');
    analyticsContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Website Analytics</h3>
            </div>
            <div class="card-body">
                <div class="analytics-grid">
                    <div class="metric-card">
                        <div class="metric-value">0</div>
                        <div class="metric-label">Monthly Visitors</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">0</div>
                        <div class="metric-label">Page Views</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">0%</div>
                        <div class="metric-label">Bounce Rate</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

console.log('Website section initialization complete');
