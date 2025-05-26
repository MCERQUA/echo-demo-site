// Dashboard Core - Authentication and Initialization
// Initialize Supabase client with CORRECT credentials
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY';

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
        } else if (businessError && businessError.code !== '42P01') {
            console.error('Error loading business info:', businessError);
        }
        
        // Try to load contact_info data
        const { data: contactData, error: contactError } = await supabaseClient
            .from('contact_info')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
        
        if (!contactError && contactData) {
            clientData.contactInfo = contactData;
            console.log('Loaded contact info:', contactData);
        } else if (contactError && contactError.code !== '42P01') {
            console.error('Error loading contact info:', contactError);
        }
        
        // Try to load brand_assets data
        const { data: brandData, error: brandError } = await supabaseClient
            .from('brand_assets')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
        
        if (!brandError && brandData) {
            clientData.brandAssets = brandData;
            console.log('Loaded brand assets:', brandData);
        } else if (brandError && brandError.code !== '42P01') {
            console.error('Error loading brand assets:', brandError);
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
    
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = userName;
    if (userAvatarEl) userAvatarEl.textContent = initials;
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
    const styles = {
        info: 'background: #1a73e8; color: white;',
        success: 'background: #34a853; color: white;', 
        warning: 'background: #F59E0B; color: white;',
        error: 'background: #ea4335; color: white;'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 10000;
        font-weight: 500;
        ${styles[type] || styles.info}
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.remove();
    }, type === 'error' || type === 'warning' ? 5000 : 3000);
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar) sidebar.classList.toggle('collapsed');
    if (mainContent) mainContent.classList.toggle('expanded');
}

// Toggle user dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

// Make functions globally available
window.supabaseClient = supabaseClient;
window.currentUser = currentUser;
window.clientData = clientData;
window.showNotification = showNotification;
window.toggleSidebar = toggleSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;
window.updateUserInterface = updateUserInterface;
window.calculateDataCompleteness = calculateDataCompleteness;
