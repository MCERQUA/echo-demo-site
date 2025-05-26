// Dashboard JavaScript - Enhanced for Client Information Management
// Initialize Supabase client with CORRECT credentials
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
// This anon key appears to be incorrect or expired - it's causing the "Invalid API key" error
// You need to get the correct anon key from your Supabase dashboard
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDM0NjIsImV4cCI6MjA0ODQ3OTQ2Mn0.vTt4L2h7B6U-2OYzfbYhcFRZUdPU9LM5SA7AHZHFxts';

// IMPORTANT: The API key above is causing the authentication errors!
// To fix this, you need to:
// 1. Go to your Supabase dashboard
// 2. Go to Settings > API
// 3. Copy the "anon public" key
// 4. Replace the SUPABASE_ANON_KEY above with the correct key

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Show prominent error message if API key is invalid
window.addEventListener('DOMContentLoaded', () => {
    // Add a warning banner
    const warningBanner = document.createElement('div');
    warningBanner.id = 'api-key-warning';
    warningBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ef4444;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10000;
        font-weight: bold;
        display: none;
    `;
    warningBanner.innerHTML = `
        ⚠️ Invalid Supabase API Key Detected! 
        <a href="https://app.supabase.com/project/orhswpgngjpztcxgwbuy/settings/api" target="_blank" style="color: white; text-decoration: underline;">
            Click here to get the correct API key from your Supabase dashboard
        </a>
    `;
    document.body.appendChild(warningBanner);
});

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
        
        // Test the API key by making a simple request
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        if (testResponse.status === 401) {
            // Show the API key warning
            document.getElementById('api-key-warning').style.display = 'block';
            console.error('Invalid API key detected! Please update SUPABASE_ANON_KEY in dashboard.js');
        }
        
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
        
        // Create default empty data structure
        clientData = {
            client: { id: currentUser.id },
            businessInfo: {},
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
        
        // Try to load business_info data
        const { data: businessData, error: businessError } = await supabaseClient
            .from('business_info')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
        
        if (!businessError && businessData) {
            clientData.businessInfo = businessData;
            console.log('Loaded business info:', businessData);
        } else if (businessError) {
            console.error('Error loading business info:', businessError);
        }
        
        // Calculate completeness
        calculateDataCompleteness();
        
        console.log('Client data loaded:', clientData);
        
    } catch (error) {
        console.error('Error loading client data:', error);
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
        // Try different paths for local vs deployed
        let response;
        const paths = [
            `sections/${sectionName}.html`,
            `./sections/${sectionName}.html`,
            `/sections/${sectionName}.html`,
            `https://echoaisystem.com/sections/${sectionName}.html`
        ];
        
        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    console.log(`Loaded section from: ${path}`);
                    break;
                }
            } catch (e) {
                // Try next path
            }
        }
        
        if (response && response.ok) {
            const html = await response.text();
            sectionElement.innerHTML = html;
            
            // Initialize section features
            initializeSectionFeatures(sectionName);
            
            // Populate section with data
            populateSection(sectionName);
            
            // Run any embedded scripts
            const scripts = sectionElement.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });
        } else {
            throw new Error('Could not load section template');
        }
    } catch (error) {
        console.error(`Error loading section ${sectionName}:`, error);
        
        // Show a working empty state instead of error
        const emptyStates = {
            'overview': createOverviewSection(),
            'brand-info': createBrandInfoSection(),
            'social-media': createSocialMediaSection(),
            'website': createWebsiteSection(),
            'google-business': createGoogleBusinessSection(),
            'reputation': createReputationSection(),
            'reports': createReportsSection(),
            'billing': createBillingSection(),
            'support': createSupportSection()
        };
        
        sectionElement.innerHTML = emptyStates[sectionName] || `
            <div class="section-header">
                <h1>${formatSectionName(sectionName)}</h1>
                <p>This section is being developed. Check back soon!</p>
            </div>
        `;
        
        // Initialize features even for generated sections
        initializeSectionFeatures(sectionName);
        populateSection(sectionName);
    }
}

// Create overview section dynamically
function createOverviewSection() {
    return `
        <div class="section-header">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's a snapshot of your business data.</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Profile Completion</h3>
                <div class="stat-value">${clientData.completeness || 0}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${clientData.completeness || 0}%"></div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Active Services</h3>
                <div class="stat-value" data-field="active-services">0</div>
                <p class="stat-label">Services running</p>
            </div>
            
            <div class="stat-card">
                <h3>Reports Available</h3>
                <div class="stat-value" data-field="reports-available">0</div>
                <p class="stat-label">Ready to view</p>
            </div>
            
            <div class="stat-card">
                <h3>Next Review</h3>
                <div class="stat-value">--</div>
                <p class="stat-label">Not scheduled</p>
            </div>
        </div>
        
        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
                <button class="action-btn" onclick="showSection('brand-info')">
                    Update Brand Info
                </button>
                <button class="action-btn" onclick="showSection('social-media')">
                    Connect Social Media
                </button>
                <button class="action-btn" onclick="showSection('website')">
                    Website Settings
                </button>
            </div>
        </div>
    `;
}

// Create brand info section dynamically
function createBrandInfoSection() {
    return `
        <div class="section-header">
            <h1>Brand Information</h1>
            <p>Manage your business details, brand assets, and company information.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Business Information</h2>
                <button class="btn-secondary edit-button" onclick="toggleEditMode('business_info')">Edit</button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Business Name</label>
                    <div class="field-value" data-field="business_name" data-table="business_info">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Primary Industry</label>
                    <div class="field-value" data-field="primary_industry" data-table="business_info">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Business Type</label>
                    <div class="field-value" data-field="business_type" data-table="business_info">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Founded Date</label>
                    <div class="field-value" data-field="founded_date" data-table="business_info">Click Edit to add</div>
                </div>
                
                <div class="form-group full-width">
                    <label>Business Description</label>
                    <div class="field-value" data-field="business_description" data-table="business_info">Click Edit to add</div>
                </div>
                
                <div class="form-group full-width">
                    <label>Services Offered</label>
                    <div class="field-value" data-field="services_offered" data-table="business_info">Click Edit to add</div>
                </div>
            </div>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Contact Information</h2>
                <button class="btn-secondary edit-button" onclick="toggleEditMode('contact_info')">Edit</button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Primary Phone</label>
                    <div class="field-value" data-field="primary_phone" data-table="contact_info">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Primary Email</label>
                    <div class="field-value" data-field="primary_email" data-table="contact_info">Click Edit to add</div>
                </div>
                
                <div class="form-group full-width">
                    <label>Business Address</label>
                    <div class="field-value" data-field="headquarters_address" data-table="contact_info">Click Edit to add</div>
                </div>
            </div>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Brand Assets</h2>
                <button class="btn-secondary edit-button" onclick="toggleEditMode('brand_assets')">Edit</button>
            </div>
            
            <div class="form-grid">
                <div class="form-group full-width">
                    <label>Tagline</label>
                    <div class="field-value" data-field="tagline" data-table="brand_assets">Click Edit to add</div>
                </div>
                
                <div class="form-group full-width">
                    <label>Mission Statement</label>
                    <div class="field-value" data-field="mission_statement" data-table="brand_assets">Click Edit to add</div>
                </div>
                
                <div class="form-group full-width">
                    <label>Vision Statement</label>
                    <div class="field-value" data-field="vision_statement" data-table="brand_assets">Click Edit to add</div>
                </div>
            </div>
        </div>
    `;
}

// Create other sections similarly...
function createSocialMediaSection() {
    return `
        <div class="section-header">
            <h1>Social Media</h1>
            <p>Manage your social media accounts and presence.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Connected Accounts</h2>
                <button class="btn-primary" onclick="connectSocialAccount()">Connect Account</button>
            </div>
            
            <div id="social-accounts-list">
                <div class="empty-state">
                    <p>No social media accounts connected yet.</p>
                    <button class="btn-primary" onclick="connectSocialAccount()">
                        Connect Your First Account
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createWebsiteSection() {
    return `
        <div class="section-header">
            <h1>Website</h1>
            <p>Manage your website and domain information.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Website Details</h2>
                <button class="btn-secondary edit-button" onclick="toggleEditMode('digital_presence')">Edit</button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Primary Domain</label>
                    <div class="field-value" data-field="primary_domain" data-table="digital_presence">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Website Platform</label>
                    <div class="field-value" data-field="website_platform" data-table="digital_presence">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Hosting Provider</label>
                    <div class="field-value" data-field="hosting_provider" data-table="digital_presence">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>SSL Status</label>
                    <div class="field-value" data-field="ssl_status" data-table="digital_presence">Click Edit to add</div>
                </div>
            </div>
        </div>
    `;
}

function createGoogleBusinessSection() {
    return `
        <div class="section-header">
            <h1>Google Business</h1>
            <p>Manage your Google Business Profile.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Profile Information</h2>
                <button class="btn-secondary edit-button" onclick="toggleEditMode('google_business_profile')">Edit</button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Profile Name</label>
                    <div class="field-value" data-field="profile_name" data-table="google_business_profile">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Primary Category</label>
                    <div class="field-value" data-field="primary_category" data-table="google_business_profile">Click Edit to add</div>
                </div>
                
                <div class="form-group">
                    <label>Total Reviews</label>
                    <div class="field-value" data-field="total_reviews" data-table="google_business_profile">0</div>
                </div>
                
                <div class="form-group">
                    <label>Average Rating</label>
                    <div class="field-value" data-field="average_rating" data-table="google_business_profile">N/A</div>
                </div>
            </div>
        </div>
    `;
}

function createReputationSection() {
    return `
        <div class="section-header">
            <h1>Reputation</h1>
            <p>Monitor and manage your online reputation.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Review Platforms</h2>
            </div>
            
            <div id="reputation-platforms">
                <div class="empty-state">
                    <p>No reputation data available yet.</p>
                    <button class="btn-primary" onclick="triggerAIResearch('reputation')">
                        Start AI Research
                    </button>
                </div>
            </div>
        </div>
    `;
}

function createReportsSection() {
    return `
        <div class="section-header">
            <h1>Reports</h1>
            <p>View and download your reports.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Available Reports</h2>
            </div>
            
            <div id="reports-list">
                <div class="empty-state">
                    <p>No reports available yet.</p>
                </div>
            </div>
        </div>
    `;
}

function createBillingSection() {
    return `
        <div class="section-header">
            <h1>Billing</h1>
            <p>Manage your subscription and billing.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>Subscription Details</h2>
            </div>
            
            <div class="billing-info">
                <p>Billing features coming soon!</p>
            </div>
        </div>
    `;
}

function createSupportSection() {
    return `
        <div class="section-header">
            <h1>Support</h1>
            <p>Get help and support for your dashboard.</p>
        </div>
        
        <div class="section-card">
            <div class="card-header">
                <h2>How Can We Help?</h2>
            </div>
            
            <div class="support-options">
                <div class="support-item">
                    <h3>Documentation</h3>
                    <p>Check out our guides and documentation.</p>
                    <a href="/docs" class="btn-primary">View Docs</a>
                </div>
                
                <div class="support-item">
                    <h3>Contact Support</h3>
                    <p>Email us at support@echoaisystem.com</p>
                    <a href="mailto:support@echoaisystem.com" class="btn-secondary">Email Support</a>
                </div>
            </div>
        </div>
    `;
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
    
    // Initialize editable fields
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
    const tableMap = {
        'business_info': 'businessInfo',
        'contact_info': 'contactInfo',
        'brand_assets': 'brandAssets',
        'digital_presence': 'digitalPresence',
        'google_business_profile': 'googleBusiness'
    };
    
    const dataKey = tableMap[table];
    if (!clientData[dataKey]) clientData[dataKey] = {};
    clientData[dataKey][fieldName] = value;
    
    // Don't save individual fields - wait for Save button
    console.log(`Field ${fieldName} updated locally to: ${value}`);
}

// Save entire section data
async function saveSection(section) {
    const tableMap = {
        'business_info': 'businessInfo',
        'contact_info': 'contactInfo',
        'brand_assets': 'brandAssets',
        'digital_presence': 'digitalPresence',
        'google_business_profile': 'googleBusiness'
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
        
        console.log('Saving data to table:', section);
        console.log('Save data:', saveData);
        
        // Save to database
        const { data, error } = await supabaseClient
            .from(section)
            .upsert(saveData, { 
                onConflict: 'user_id'
            });
        
        if (error) {
            console.error('Supabase error:', error);
            
            // Handle specific error types
            if (error.code === '42P01') {
                showNotification('Database tables not set up yet. Please contact support.', 'warning');
                return;
            } else if (error.message && error.message.includes('Invalid API key')) {
                showNotification('Invalid API key. Please contact support to fix this issue.', 'error');
                // Show the API key warning
                document.getElementById('api-key-warning').style.display = 'block';
                return;
            } else if (error.code === 'PGRST301') {
                showNotification('Permission denied. Please contact support.', 'error');
                return;
            }
            
            throw error;
        }
        
        showNotification(`${formatSectionName(section)} saved successfully!`, 'success');
        
        // Since we can't use select(), we'll keep our local data
        clientData[dataKey] = saveData;
        
        // Recalculate completeness
        calculateDataCompleteness();
        
        // Update overview if visible
        if (currentSection === 'overview') {
            populateOverview();
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Error saving data. ';
        if (error.message) {
            if (error.message.includes('Invalid API key')) {
                errorMessage = 'Invalid API key. The Supabase API key needs to be updated.';
                // Show the API key warning
                document.getElementById('api-key-warning').style.display = 'block';
            } else if (error.message.includes('JWT')) {
                errorMessage = 'Session expired. Please log in again.';
            } else {
                errorMessage += 'Please try again or contact support.';
            }
        }
        
        showNotification(errorMessage, 'error');
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
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = `${clientData.completeness || 0}%`;
    }
    
    // Update other metrics
    const activeServices = clientData.campaigns?.filter(c => c.status === 'active').length || 0;
    const reportsAvailable = clientData.contentLibrary?.filter(c => c.type === 'report').length || 0;
    
    updateMetric('active-services', activeServices);
    updateMetric('reports-available', reportsAvailable);
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
                    if (value.street) {
                        field.textContent = `${value.street}, ${value.city}, ${value.state} ${value.zip}`;
                    } else {
                        field.textContent = JSON.stringify(value);
                    }
                } else {
                    field.textContent = value;
                }
            }
        });
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
}

// Populate other sections
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

function populateWebsite() {
    if (clientData.digitalPresence) {
        Object.entries(clientData.digitalPresence).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"][data-table="digital_presence"]`);
            if (field && value !== null && value !== undefined) {
                field.textContent = value;
            }
        });
    }
}

function populateGoogleBusiness() {
    if (clientData.googleBusiness) {
        Object.entries(clientData.googleBusiness).forEach(([key, value]) => {
            const field = document.querySelector(`[data-field="${key}"][data-table="google_business_profile"]`);
            if (field && value !== null && value !== undefined) {
                field.textContent = value;
            }
        });
    }
}

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
                <button class="btn-primary" onclick="triggerAIResearch('reputation')">
                    Start AI Research
                </button>
            </div>
        `;
    }
}

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
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style based on type
    if (type === 'warning') {
        notification.style.background = '#F59E0B';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds (longer for errors)
    setTimeout(() => {
        notification.remove();
    }, type === 'error' || type === 'warning' ? 5000 : 3000);
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
        showNotification('AI research feature requires database setup', 'info');
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