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
let editMode = {};

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
            supabaseClient.from('clients').select('*').eq('user_id', currentUser.id).single(),
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
            
            // Initialize section features
            initializeSectionFeatures(sectionName);
            
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

// Initialize section-specific features
function initializeSectionFeatures(sectionName) {
    switch (sectionName) {
        case 'brand-info':
            // Re-run the initialization for brand info features
            if (typeof initializeBrandInfoFeatures === 'function') {
                initializeBrandInfoFeatures();
            }
            break;
    }
    
    // Initialize edit mode for all field values
    initializeEditableFields();
}

// Initialize editable fields
function initializeEditableFields() {
    const fieldValues = document.querySelectorAll('.field-value');
    
    fieldValues.forEach(field => {
        // Skip select elements and other input types
        if (field.tagName === 'SELECT' || field.tagName === 'INPUT') return;
        
        // Add click handler for editing
        field.addEventListener('click', function() {
            const table = this.dataset.table;
            if (editMode[table]) {
                startFieldEdit(this);
            }
        });
        
        // Add blur handler for saving
        field.addEventListener('blur', function() {
            if (this.contentEditable === 'true') {
                saveFieldValue(this);
            }
        });
        
        // Add enter key handler
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

// Toggle edit mode for a section
function toggleEditMode(section) {
    editMode[section] = !editMode[section];
    
    const button = event.target;
    const sectionCard = button.closest('.section-card');
    const fields = sectionCard.querySelectorAll(`.field-value[data-table="${section}"]`);
    
    if (editMode[section]) {
        // Enter edit mode
        button.textContent = 'Save';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        
        fields.forEach(field => {
            if (field.tagName !== 'SELECT' && field.tagName !== 'INPUT') {
                field.style.cursor = 'text';
                field.title = 'Click to edit';
            }
        });
        
        showNotification('Click on any field to edit', 'info');
    } else {
        // Exit edit mode and save all changes
        button.textContent = 'Edit';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        
        fields.forEach(field => {
            if (field.contentEditable === 'true') {
                field.contentEditable = false;
            }
            field.style.cursor = 'default';
            field.title = '';
        });
        
        // Save all changes
        saveSection(section);
    }
}

// Start editing a field
function startFieldEdit(field) {
    field.contentEditable = true;
    field.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(field);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Save a single field value
async function saveFieldValue(field) {
    field.contentEditable = false;
    
    const table = field.dataset.table;
    const fieldName = field.dataset.field;
    const value = field.textContent.trim();
    
    // Update local data
    if (!clientData[table]) clientData[table] = {};
    clientData[table][fieldName] = value;
    
    // Don't save individual fields - wait for Save button
    console.log(`Field ${fieldName} updated locally to: ${value}`);
}

// Save entire section data
async function saveSection(section) {
    const tableMap = {
        'business_info': 'businessInfo',
        'contact_info': 'contactInfo',
        'brand_assets': 'brandAssets',
        'digital_presence': 'digitalPresence'
    };
    
    const dataKey = tableMap[section];
    if (!dataKey || !clientData[dataKey]) {
        showNotification('No data to save', 'error');
        return;
    }
    
    try {
        // Prepare data for save
        const saveData = {
            ...clientData[dataKey],
            user_id: currentUser.id,
            updated_at: new Date().toISOString()
        };
        
        // Remove any null or undefined values
        Object.keys(saveData).forEach(key => {
            if (saveData[key] === null || saveData[key] === undefined || saveData[key] === '') {
                delete saveData[key];
            }
        });
        
        console.log('Saving data:', saveData);
        
        // Save to database
        const { data, error } = await supabaseClient
            .from(section)
            .upsert(saveData, { onConflict: 'user_id' })
            .select();
        
        if (error) throw error;
        
        showNotification(`${formatSectionName(section)} saved successfully!`, 'success');
        
        // Update local data with response
        if (data && data[0]) {
            clientData[dataKey] = data[0];
        }
        
        // Recalculate completeness
        calculateDataCompleteness();
        
        // Update overview if visible
        if (currentSection === 'overview') {
            populateOverview();
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification(`Error saving: ${error.message}`, 'error');
    }
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
    const completionElements = document.querySelectorAll('[data-field="completeness"]');
    completionElements.forEach(el => {
        el.textContent = `${clientData.completeness || 0}%`;
    });
    
    // Update progress bar
    const progressBar = document.querySelector('[data-field="completeness-bar"]');
    if (progressBar) {
        progressBar.style.width = `${clientData.completeness || 0}%`;
    }
    
    // Update other metrics
    const totalReviews = clientData.reputation?.reduce((sum, platform) => sum + (platform.total_reviews || 0), 0) || 0;
    const avgRatings = clientData.reputation?.filter(p => p.average_rating).map(p => p.average_rating) || [];
    const avgRating = avgRatings.length > 0 ? (avgRatings.reduce((a, b) => a + b, 0) / avgRatings.length).toFixed(1) : 'N/A';
    const socialFollowers = clientData.socialMedia?.reduce((sum, account) => sum + (account.follower_count || 0), 0) || 0;
    
    updateMetric('total-reviews', totalReviews);
    updateMetric('average-rating', avgRating);
    updateMetric('social-followers', socialFollowers);
    
    // Update AI research status
    const pendingResearch = clientData.aiQueue?.filter(item => item.status === 'pending').length || 0;
    const inProgressResearch = clientData.aiQueue?.filter(item => item.status === 'in_progress').length || 0;
    const completedResearch = clientData.aiQueue?.filter(item => item.status === 'completed').length || 0;
    
    updateMetric('pending-research', pendingResearch);
    updateMetric('in-progress-research', inProgressResearch);
    updateMetric('completed-research', completedResearch);
}

// Helper function to update metrics
function updateMetric(fieldName, value) {
    const element = document.querySelector(`[data-field="${fieldName}"]`);
    if (element) {
        element.textContent = value;
    }
}

// Populate brand info section
function populateBrandInfo() {
    // Populate business info fields
    if (clientData.businessInfo) {
        Object.entries(clientData.businessInfo).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"][data-table="business_info"]`);
            if (field && value !== null && value !== undefined) {
                if (field.tagName === 'SELECT') {
                    field.value = value;
                } else if (Array.isArray(value)) {
                    field.textContent = value.join(', ');
                } else {
                    field.textContent = value;
                }
            }
        });
    }
    
    // Populate contact info fields
    if (clientData.contactInfo) {
        Object.entries(clientData.contactInfo).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"][data-table="contact_info"]`);
            if (field && value !== null && value !== undefined) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    // Handle complex objects like addresses
                    field.textContent = JSON.stringify(value);
                } else {
                    field.textContent = value;
                }
            }
        });
        
        // Handle business hours specially
        if (clientData.contactInfo.business_hours) {
            Object.entries(clientData.contactInfo.business_hours).forEach(([day, hours]) => {
                const openInput = document.querySelector(`[data-day="${day}"][data-period="open"]`);
                const closeInput = document.querySelector(`[data-day="${day}"][data-period="close"]`);
                if (openInput && hours.open) openInput.value = hours.open;
                if (closeInput && hours.close) closeInput.value = hours.close;
            });
        }
    }
    
    // Populate brand assets fields
    if (clientData.brandAssets) {
        Object.entries(clientData.brandAssets).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"][data-table="brand_assets"]`);
            if (field && value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    field.textContent = value.join(', ');
                } else {
                    field.textContent = value;
                }
            }
        });
    }
    
    // Call the section's own populate function if it exists
    if (typeof window.populateBrandInfo === 'function') {
        window.populateBrandInfo();
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
    if (clientData.digitalPresence) {
        Object.entries(clientData.digitalPresence).forEach(([key, value]) => {
            fillFormField(key, value);
        });
    }
}

// Populate Google Business section
function populateGoogleBusiness() {
    if (clientData.googleBusiness) {
        Object.entries(clientData.googleBusiness).forEach(([key, value]) => {
            fillFormField(`gmb_${key}`, value);
        });
    }
    
    updateMetric('total-reviews', clientData.googleBusiness?.total_reviews || 0);
    updateMetric('average-rating', clientData.googleBusiness?.average_rating || 'N/A');
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

// Helper function to fill form fields
function fillFormField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined && value !== null) {
        if (field.tagName === 'SELECT') {
            field.value = value;
        } else if (field.type === 'checkbox') {
            field.checked = value;
        } else {
            field.value = value;
        }
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

// AI Research trigger
async function triggerAIResearch(researchType) {
    try {
        const { data, error } = await supabaseClient
            .from('ai_research_queue')
            .insert({
                client_id: currentUser.id,
                research_type: researchType,
                status: 'pending',
                priority: 5,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        showNotification('AI research task queued successfully!', 'success');
    } catch (error) {
        console.error('Error queuing AI research:', error);
        showNotification('Error queuing research task', 'error');
    }
}

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
window.toggleEditMode = toggleEditMode;
window.triggerAIResearch = triggerAIResearch;
window.connectSocialAccount = connectSocialAccount;
window.viewReport = viewReport;
window.downloadReport = downloadReport;