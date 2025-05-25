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
        
        // Load client data
        await loadClientData();
        updateUserInterface();
        loadSection('overview');
        
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

// Load client data from all tables
async function loadClientData() {
    try {
        // For now, create minimal client data structure
        // This prevents errors while the full database structure is set up
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
            completeness: 25
        };
        
        // In the future, this will load from actual database tables
        // For now, we'll use this mock data to prevent errors
        
    } catch (error) {
        console.error('Error loading client data:', error);
        // Use minimal fallback data
        clientData = {
            client: { id: currentUser.id },
            businessInfo: { business_name: currentUser.email.split('@')[0] },
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
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the clicked link
    const clickedLink = event ? event.target.closest('.nav-link') : 
                       document.querySelector(`[onclick*="${sectionName}"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionName}-section`);
    sectionElement.classList.add('active');
    
    // Load section content if not already loaded
    if (!sectionElement.dataset.loaded || sectionElement.dataset.loaded === 'false') {
        await loadSection(sectionName);
        sectionElement.dataset.loaded = 'true';
    }
    
    currentSection = sectionName;
}

// Load section content
async function loadSection(sectionName) {
    const sectionElement = document.getElementById(`${sectionName}-section`);
    
    try {
        // For now, show a simple message
        // In the future, this will load actual section templates
        sectionElement.innerHTML = `
            <div class="section-header">
                <h1>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ')}</h1>
                <p>This section is being developed. Check back soon!</p>
            </div>
        `;
        
        // Populate section with data
        populateSection(sectionName);
        
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
    }
}

// Populate overview section
function populateOverview() {
    const sectionElement = document.getElementById('overview-section');
    
    sectionElement.innerHTML = `
        <div class="section-header">
            <h1>Dashboard Overview</h1>
            <p>Welcome to your Echo AI Systems dashboard</p>
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
                <div class="stat-value">0</div>
                <p class="stat-label">Services running</p>
            </div>
            
            <div class="stat-card">
                <h3>Reports Available</h3>
                <div class="stat-value">0</div>
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

// Calculate average rating across all platforms
function calculateAverageRating() {
    const ratings = clientData.reputation?.filter(p => p.average_rating) || [];
    if (ratings.length === 0) return 'N/A';
    
    const sum = ratings.reduce((acc, p) => acc + parseFloat(p.average_rating), 0);
    return (sum / ratings.length).toFixed(1);
}

// Update AI research status
function updateAIResearchStatus() {
    const pendingResearch = clientData.aiQueue?.filter(item => item.status === 'pending').length || 0;
    const inProgressResearch = clientData.aiQueue?.filter(item => item.status === 'in_progress').length || 0;
    const completedResearch = clientData.aiQueue?.filter(item => item.status === 'completed').length || 0;
    
    const pendingElement = document.querySelector('[data-field="pending-research"]');
    const inProgressElement = document.querySelector('[data-field="in-progress-research"]');
    const completedElement = document.querySelector('[data-field="completed-research"]');
    
    if (pendingElement) pendingElement.textContent = pendingResearch;
    if (inProgressElement) inProgressElement.textContent = inProgressResearch;
    if (completedElement) completedElement.textContent = completedResearch;
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#60a5fa'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
    `;
    
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

// Placeholder functions for sections not yet implemented
function populateBrandInfo() {
    console.log('Brand info section loaded');
}

function populateSocialMedia() {
    console.log('Social media section loaded');
}

function populateWebsite() {
    console.log('Website section loaded');
}

function populateGoogleBusiness() {
    console.log('Google Business section loaded');
}

function populateReputation() {
    console.log('Reputation section loaded');
}

function populateReports() {
    console.log('Reports section loaded');
}

function populateBilling() {
    console.log('Billing section loaded');
}

// Make functions globally available
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;