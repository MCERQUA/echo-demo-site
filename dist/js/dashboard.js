// Dashboard JavaScript - Enhanced for Client Information Management
// Initialize Supabase client - FIXED TO USE CORRECT INSTANCE
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDM0NjIsImV4cCI6MjA0ODQ3OTQ2Mn0.vTt4L2h7B6U-2OYzfbYhcFRZUdPU9LM5SA7AHZHFxts';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let clientData = null;
let currentSection = 'overview';
let isCheckingAuth = true;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard loading...');
    
    // Add loading state
    showLoadingState();
    
    try {
        // Check authentication with proper session handling
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        console.log('Session check:', { session, error });
        
        if (error || !session) {
            console.log('No valid session found, redirecting to login...');
            redirectToLogin();
            return;
        }
        
        currentUser = session.user;
        console.log('User authenticated:', currentUser.email);
        
        // Hide loading state
        hideLoadingState();
        
        // Load client data from database
        await loadClientData();
        updateUserInterface();
        
        // Load the initial section
        await showSection('overview');
        
        isCheckingAuth = false;
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        redirectToLogin();
    }
});

// Show loading state
function showLoadingState() {
    // Add loading overlay if it doesn't exist
    if (!document.getElementById('loading-overlay')) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 10, 10, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="text-align: center; color: white;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 3px solid #333;
                        border-top-color: #1a73e8;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingOverlay);
    }
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Redirect to login
function redirectToLogin() {
    if (!isCheckingAuth) return;
    
    // Clear any existing session
    supabaseClient.auth.signOut();
    
    // Small delay to prevent redirect loops
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 100);
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_OUT' || !session) {
        if (window.location.pathname.includes('dashboard')) {
            redirectToLogin();
        }
    }
});

// Load client data from database
async function loadClientData() {
    try {
        console.log('Loading client data for user:', currentUser.id);
        
        // Load all client data from various tables
        const results = await Promise.allSettled([
            supabaseClient.from('client_info').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('business_info').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('contact_info').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('brand_assets').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('digital_presence').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('social_media_accounts').select('*').eq('client_id', currentUser.id),
            supabaseClient.from('google_business_profile').select('*').eq('user_id', currentUser.id).single(),
            supabaseClient.from('reputation_management').select('*').eq('client_id', currentUser.id),
            supabaseClient.from('competitor_analysis').select('*').eq('client_id', currentUser.id),
            supabaseClient.from('campaign_data').select('*').eq('client_id', currentUser.id),
            supabaseClient.from('seo_data').select('*').eq('client_id', currentUser.id).single(),
            supabaseClient.from('customer_insights').select('*').eq('client_id', currentUser.id).single(),
            supabaseClient.from('content_library').select('*').eq('client_id', currentUser.id),
            supabaseClient.from('ai_research_queue').select('*').eq('client_id', currentUser.id)
        ]);
        
        // Process results
        clientData = {
            client: results[0].status === 'fulfilled' && results[0].value.data ? results[0].value.data : { id: currentUser.id },
            businessInfo: results[1].status === 'fulfilled' && results[1].value.data ? results[1].value.data : {},
            contactInfo: results[2].status === 'fulfilled' && results[2].value.data ? results[2].value.data : {},
            brandAssets: results[3].status === 'fulfilled' && results[3].value.data ? results[3].value.data : {},
            digitalPresence: results[4].status === 'fulfilled' && results[4].value.data ? results[4].value.data : {},
            socialMedia: results[5].status === 'fulfilled' && results[5].value.data ? results[5].value.data : [],
            googleBusiness: results[6].status === 'fulfilled' && results[6].value.data ? results[6].value.data : {},
            reputation: results[7].status === 'fulfilled' && results[7].value.data ? results[7].value.data : [],
            competitors: results[8].status === 'fulfilled' && results[8].value.data ? results[8].value.data : [],
            campaigns: results[9].status === 'fulfilled' && results[9].value.data ? results[9].value.data : [],
            seoData: results[10].status === 'fulfilled' && results[10].value.data ? results[10].value.data : {},
            customerInsights: results[11].status === 'fulfilled' && results[11].value.data ? results[11].value.data : {},
            contentLibrary: results[12].status === 'fulfilled' && results[12].value.data ? results[12].value.data : [],
            aiQueue: results[13].status === 'fulfilled' && results[13].value.data ? results[13].value.data : []
        };
        
        // Calculate completeness
        calculateDataCompleteness();
        
        console.log('Client data loaded:', clientData);
        
    } catch (error) {
        console.error('Error loading client data:', error);
        // Use minimal fallback data
        clientData = {
            client: { id: currentUser.id },
            businessInfo: { business_name: currentUser.email.split('@')[0] },
            contactInfo: {},
            brandAssets: {},
            digitalPresence: {},
            socialMedia: [],
            googleBusiness: {},
            reputation: [],
            competitors: [],
            campaigns: [],
            seoData: {},
            customerInsights: {},
            contentLibrary: [],
            aiQueue: [],
            completeness: 0
        };
    }
}

// Calculate overall data completeness
function calculateDataCompleteness() {
    const sections = {
        businessInfo: ['business_name', 'primary_industry', 'services_offered', 'business_description'],
        contactInfo: ['primary_phone', 'primary_email', 'headquarters_address', 'business_hours'],
        brandAssets: ['logo_primary_url', 'brand_colors', 'tagline', 'mission_statement'],
        digitalPresence: ['primary_domain', 'website_platform', 'google_analytics_id'],
        socialMedia: ['length'], // Check if any social accounts exist
        googleBusiness: ['profile_name', 'primary_category', 'total_reviews'],
        customerInsights: ['primary_age_range', 'interests', 'pain_points']
    };
    
    let totalFields = 0;
    let completedFields = 0;
    
    Object.entries(sections).forEach(([section, fields]) => {
        if (section === 'socialMedia') {
            totalFields += 1;
            if (clientData[section] && clientData[section].length > 0) completedFields += 1;
        } else {
            fields.forEach(field => {
                totalFields += 1;
                if (clientData[section] && 
                    clientData[section][field] && 
                    clientData[section][field] !== '' && 
                    clientData[section][field] !== '[]' &&
                    clientData[section][field] !== '{}') {
                    completedFields += 1;
                }
            });
        }
    });
    
    clientData.completeness = Math.round((completedFields / totalFields) * 100);
}

// Update user interface with user data
function updateUserInterface() {
    // Update user name and avatar
    const userName = clientData.businessInfo?.business_name || currentUser.email.split('@')[0];
    const initials = userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = initials;
}

// Show section
async function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the clicked link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('onclick')?.includes(sectionName)) {
            link.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionName}-section`);
    if (sectionElement) {
        sectionElement.classList.add('active');
        
        // Load section content
        await loadSection(sectionName);
    }
    
    currentSection = sectionName;
}

// Load section content from template files
async function loadSection(sectionName) {
    const sectionElement = document.getElementById(`${sectionName}-section`);
    
    try {
        // Load the section template
        const response = await fetch(`sections/${sectionName}.html`);
        if (response.ok) {
            const html = await response.text();
            sectionElement.innerHTML = html;
            
            // Populate section with data
            populateSection(sectionName);
        } else {
            // Fallback if template doesn't exist
            sectionElement.innerHTML = `
                <div class="section-header">
                    <h1>${formatSectionName(sectionName)}</h1>
                    <p>This section is being developed. Check back soon!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading section ${sectionName}:`, error);
        sectionElement.innerHTML = `
            <div class="error-message">
                <h2>Section Under Construction</h2>
                <p>This section is being developed. Please check back soon!</p>
            </div>
        `;
    }
}

// Format section name for display
function formatSectionName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Populate section with client data
function populateSection(sectionName) {
    switch (sectionName) {
        case 'overview':
            populateOverview();
            break;
        case 'brand-info':
            populateBrandInfo();
            break;
        case 'social-media':
            populateSocialMedia();
            break;
        case 'website':
            populateWebsite();
            break;
        case 'google-business':
            populateGoogleBusiness();
            break;
        case 'reputation':
            populateReputation();
            break;
        case 'reports':
            populateReports();
            break;
        case 'billing':
            populateBilling();
            break;
        case 'support':
            // Support section doesn't need data population
            break;
    }
}

// Populate overview section with actual data
function populateOverview() {
    // Update profile completion
    const completionElement = document.querySelector('[data-metric="profile-completion"]');
    if (completionElement) {
        completionElement.textContent = `${clientData.completeness || 0}%`;
    }
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = `${clientData.completeness || 0}%`;
    }
    
    // Update other metrics
    const activeServices = clientData.campaigns?.filter(c => c.status === 'active').length || 0;
    const reportsAvailable = clientData.contentLibrary?.filter(c => c.type === 'report').length || 0;
    
    const activeServicesElement = document.querySelector('[data-metric="active-services"]');
    if (activeServicesElement) {
        activeServicesElement.textContent = activeServices;
    }
    
    const reportsElement = document.querySelector('[data-metric="reports-available"]');
    if (reportsElement) {
        reportsElement.textContent = reportsAvailable;
    }
    
    // Update AI research status
    const pendingResearch = clientData.aiQueue?.filter(item => item.status === 'pending').length || 0;
    const inProgressResearch = clientData.aiQueue?.filter(item => item.status === 'in_progress').length || 0;
    const completedResearch = clientData.aiQueue?.filter(item => item.status === 'completed').length || 0;
    
    const pendingElement = document.querySelector('[data-metric="pending-research"]');
    const inProgressElement = document.querySelector('[data-metric="in-progress-research"]');
    const completedElement = document.querySelector('[data-metric="completed-research"]');
    
    if (pendingElement) pendingElement.textContent = pendingResearch;
    if (inProgressElement) inProgressElement.textContent = inProgressResearch;
    if (completedElement) completedElement.textContent = completedResearch;
}

// Populate brand info section
function populateBrandInfo() {
    // Business Information
    fillFormField('business_name', clientData.businessInfo?.business_name);
    fillFormField('legal_entity_name', clientData.businessInfo?.legal_entity_name);
    fillFormField('primary_industry', clientData.businessInfo?.primary_industry);
    fillFormField('secondary_industries', clientData.businessInfo?.secondary_industries?.join(', '));
    fillFormField('services_offered', clientData.businessInfo?.services_offered?.join(', '));
    fillFormField('business_description', clientData.businessInfo?.business_description);
    
    // Contact Information
    fillFormField('primary_phone', clientData.contactInfo?.primary_phone);
    fillFormField('primary_email', clientData.contactInfo?.primary_email);
    fillFormField('headquarters_address', clientData.contactInfo?.headquarters_address);
    fillFormField('business_hours', clientData.contactInfo?.business_hours);
    
    // Brand Assets
    fillFormField('tagline', clientData.brandAssets?.tagline);
    fillFormField('mission_statement', clientData.brandAssets?.mission_statement);
    fillFormField('unique_value_proposition', clientData.brandAssets?.unique_value_proposition);
    fillFormField('brand_colors', clientData.brandAssets?.brand_colors?.join(', '));
    
    // Display logo if available
    if (clientData.brandAssets?.logo_primary_url) {
        const logoElement = document.getElementById('logo-preview');
        if (logoElement) {
            logoElement.src = clientData.brandAssets.logo_primary_url;
            logoElement.style.display = 'block';
        }
    }
}

// Helper function to fill form fields
function fillFormField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined && value !== null) {
        field.value = value;
    }
}

// Populate social media section
function populateSocialMedia() {
    const container = document.getElementById('social-accounts-list');
    if (!container) return;
    
    if (clientData.socialMedia && clientData.socialMedia.length > 0) {
        container.innerHTML = clientData.socialMedia.map(account => `
            <div class="social-account-item">
                <div class="platform-icon">
                    <img src="images/icons/${account.platform.toLowerCase()}.svg" 
                         alt="${account.platform}" 
                         onerror="this.src='images/icons/social-default.svg'">
                </div>
                <div class="account-info">
                    <h4>${account.platform}</h4>
                    <p>${account.profile_url}</p>
                    <p class="account-stats">
                        ${account.follower_count || 0} followers
                    </p>
                </div>
                <div class="account-status">
                    <span class="badge ${account.is_verified ? 'badge-success' : 'badge-secondary'}">
                        ${account.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <p>No social media accounts connected yet.</p>
                <button class="btn-primary" onclick="connectSocialAccount()">
                    Connect Account
                </button>
            </div>
        `;
    }
}

// Populate website section
function populateWebsite() {
    fillFormField('primary_domain', clientData.digitalPresence?.primary_domain);
    fillFormField('website_platform', clientData.digitalPresence?.website_platform);
    fillFormField('hosting_provider', clientData.digitalPresence?.hosting_provider);
    fillFormField('ssl_status', clientData.digitalPresence?.ssl_status);
    fillFormField('google_analytics_id', clientData.digitalPresence?.google_analytics_id);
    fillFormField('google_search_console_verified', clientData.digitalPresence?.google_search_console_verified ? 'Yes' : 'No');
}

// Populate Google Business section
function populateGoogleBusiness() {
    fillFormField('gmb_profile_name', clientData.googleBusiness?.profile_name);
    fillFormField('gmb_primary_category', clientData.googleBusiness?.primary_category);
    fillFormField('gmb_secondary_categories', clientData.googleBusiness?.secondary_categories?.join(', '));
    
    const reviewsElement = document.querySelector('[data-metric="total-reviews"]');
    if (reviewsElement) {
        reviewsElement.textContent = clientData.googleBusiness?.total_reviews || 0;
    }
    
    const ratingElement = document.querySelector('[data-metric="average-rating"]');
    if (ratingElement) {
        ratingElement.textContent = clientData.googleBusiness?.average_rating || 'N/A';
    }
}

// Populate reputation section
function populateReputation() {
    const container = document.getElementById('reputation-platforms');
    if (!container) return;
    
    if (clientData.reputation && clientData.reputation.length > 0) {
        container.innerHTML = clientData.reputation.map(platform => `
            <div class="reputation-item">
                <h4>${platform.platform_name}</h4>
                <div class="reputation-metrics">
                    <div class="metric">
                        <span class="metric-value">${platform.total_reviews || 0}</span>
                        <span class="metric-label">Reviews</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${platform.average_rating || 'N/A'}</span>
                        <span class="metric-label">Rating</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <p>No reputation data available yet.</p>
            </div>
        `;
    }
}

// Populate reports section
function populateReports() {
    const container = document.getElementById('reports-list');
    if (!container) return;
    
    const reports = clientData.contentLibrary?.filter(item => item.type === 'report') || [];
    
    if (reports.length > 0) {
        container.innerHTML = reports.map(report => `
            <div class="report-item">
                <h4>${report.title}</h4>
                <p>${report.description || 'No description available'}</p>
                <div class="report-actions">
                    <button class="btn-primary" onclick="viewReport('${report.id}')">
                        View Report
                    </button>
                    <button class="btn-secondary" onclick="downloadReport('${report.id}')">
                        Download
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <p>No reports available yet.</p>
            </div>
        `;
    }
}

// Populate billing section
function populateBilling() {
    // This would connect to your billing system
    console.log('Billing section loaded');
}

// Save functions for form data
async function saveBusinessInfo() {
    const formData = {
        business_name: document.getElementById('business_name').value,
        legal_entity_name: document.getElementById('legal_entity_name').value,
        primary_industry: document.getElementById('primary_industry').value,
        secondary_industries: document.getElementById('secondary_industries').value.split(',').map(s => s.trim()).filter(s => s),
        services_offered: document.getElementById('services_offered').value.split(',').map(s => s.trim()).filter(s => s),
        business_description: document.getElementById('business_description').value,
        user_id: currentUser.id
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('business_info')
            .upsert(formData)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        showNotification('Business information saved successfully!', 'success');
        clientData.businessInfo = { ...clientData.businessInfo, ...formData };
        calculateDataCompleteness();
    } catch (error) {
        console.error('Error saving business info:', error);
        showNotification('Error saving business information', 'error');
    }
}

async function saveContactInfo() {
    const formData = {
        primary_phone: document.getElementById('primary_phone').value,
        primary_email: document.getElementById('primary_email').value,
        headquarters_address: document.getElementById('headquarters_address').value,
        business_hours: document.getElementById('business_hours').value,
        user_id: currentUser.id
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('contact_info')
            .upsert(formData)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        showNotification('Contact information saved successfully!', 'success');
        clientData.contactInfo = { ...clientData.contactInfo, ...formData };
        calculateDataCompleteness();
    } catch (error) {
        console.error('Error saving contact info:', error);
        showNotification('Error saving contact information', 'error');
    }
}

async function saveBrandAssets() {
    const formData = {
        tagline: document.getElementById('tagline').value,
        mission_statement: document.getElementById('mission_statement').value,
        unique_value_proposition: document.getElementById('unique_value_proposition').value,
        brand_colors: document.getElementById('brand_colors').value.split(',').map(s => s.trim()).filter(s => s),
        user_id: currentUser.id
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('brand_assets')
            .upsert(formData)
            .eq('user_id', currentUser.id);
            
        if (error) throw error;
        
        showNotification('Brand assets saved successfully!', 'success');
        clientData.brandAssets = { ...clientData.brandAssets, ...formData };
        calculateDataCompleteness();
    } catch (error) {
        console.error('Error saving brand assets:', error);
        showNotification('Error saving brand assets', 'error');
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
}

// Toggle user dropdown
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Sign out
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'login.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown').classList.remove('show');
    }
});

// Placeholder functions for features not yet implemented
function connectSocialAccount() {
    showNotification('Social media connection feature coming soon!', 'info');
}

function viewReport(reportId) {
    showNotification('Report viewing feature coming soon!', 'info');
}

function downloadReport(reportId) {
    showNotification('Report download feature coming soon!', 'info');
}

// Make functions globally available
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;
window.saveBusinessInfo = saveBusinessInfo;
window.saveContactInfo = saveContactInfo;
window.saveBrandAssets = saveBrandAssets;
window.connectSocialAccount = connectSocialAccount;
window.viewReport = viewReport;
window.downloadReport = downloadReport;