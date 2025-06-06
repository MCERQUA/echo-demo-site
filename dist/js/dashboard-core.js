// Dashboard Core - Fixed Navigation System with Data Loading
// Initialize Supabase
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY';

const { createClient } = supabase;
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.user = null;
window.userData = {};
window.clientId = null;

// Mobile sidebar state
let isMobile = window.innerWidth <= 768;
let sidebarOpen = false;

// Track loaded modules to prevent duplicates
const loadedModules = new Set();

// Check authentication and initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        
        window.user = session.user;
        updateUserDisplay();
        
        // Ensure client record exists
        await ensureClientRecord();
        
        // Load user data from Supabase
        await loadUserData();
        
        initializeMobileHandlers();
        initializeNavigation();
        
        // Set initial sidebar state - collapsed on mobile, open on desktop
        if (isMobile) {
            closeSidebar();
        } else {
            openSidebar();
        }
        
        // Load default section
        loadSection('overview');
        
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
    }
});

// Ensure client record exists for the user
async function ensureClientRecord() {
    if (!window.user) return;
    
    console.log('Checking client record for:', window.user.email);
    
    try {
        // Check if client record exists
        const { data: clientData, error: fetchError } = await window.supabase
            .from('clients')
            .select('id')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking client record:', fetchError);
            return;
        }
        
        if (!clientData) {
            console.log('Creating client record for new user');
            
            // Create new client record
            const { data: newClient, error: createError } = await window.supabase
                .from('clients')
                .insert([{
                    user_id: window.user.id,
                    status: 'active',
                    onboarding_completed: false,
                    ai_research_enabled: true
                }])
                .select('id')
                .single();
            
            if (createError) {
                console.error('Error creating client record:', createError);
                showNotification('Error setting up account. Some features may not work.', 'error');
                return;
            }
            
            window.clientId = newClient.id;
            console.log('Client record created:', newClient.id);
            showNotification('Welcome to Echo AI Systems! Your account has been set up.', 'success');
        } else {
            window.clientId = clientData.id;
            console.log('Client record found:', clientData.id);
        }
    } catch (error) {
        console.error('Error in ensureClientRecord:', error);
    }
}

// Load user data from Supabase - ENHANCED to use client_id
async function loadUserData() {
    if (!window.user || !window.clientId) return;
    
    console.log('Loading user data for client:', window.clientId);
    
    try {
        // Load business info
        const { data: businessData, error: businessError } = await window.supabase
            .from('business_info')
            .select('*')
            .eq('client_id', window.clientId)
            .maybeSingle();
        
        if (businessError && businessError.code !== 'PGRST116') {
            console.error('Error loading business info:', businessError);
        } else if (businessData) {
            window.userData.businessInfo = businessData;
            console.log('Loaded business info:', businessData);
        }
        
        // Load contact info
        const { data: contactData, error: contactError } = await window.supabase
            .from('contact_info')
            .select('*')
            .eq('client_id', window.clientId)
            .maybeSingle();
        
        if (contactError && contactError.code !== 'PGRST116') {
            console.error('Error loading contact info:', contactError);
        } else if (contactData) {
            window.userData.contactInfo = contactData;
            console.log('Loaded contact info:', contactData);
        }
        
        // Load brand assets
        const { data: brandData, error: brandError } = await window.supabase
            .from('brand_assets')
            .select('*')
            .eq('client_id', window.clientId)
            .maybeSingle();
        
        if (brandError && brandError.code !== 'PGRST116') {
            console.error('Error loading brand assets:', brandError);
        } else if (brandData) {
            window.userData.brandAssets = brandData;
            console.log('Loaded brand assets:', brandData);
        }
        
        // Load website info
        const { data: websiteData, error: websiteError } = await window.supabase
            .from('website_info')
            .select('*')
            .eq('client_id', window.clientId)
            .maybeSingle();
        
        if (websiteError && websiteError.code !== 'PGRST116') {
            console.error('Error loading website info:', websiteError);
        } else if (websiteData) {
            window.userData.websiteInfo = websiteData;
            console.log('Loaded website info:', websiteData);
        }
        
        // Load online reputation
        const { data: reputationData, error: reputationError } = await window.supabase
            .from('online_reputation')
            .select('*')
            .eq('client_id', window.clientId)
            .maybeSingle();
        
        if (reputationError && reputationError.code !== 'PGRST116') {
            console.error('Error loading reputation data:', reputationError);
        } else if (reputationData) {
            window.userData.reputation = reputationData;
            console.log('Loaded reputation data:', reputationData);
        }
        
        // Load reviews
        const { data: reviewsData, error: reviewsError } = await window.supabase
            .from('reviews')
            .select('*')
            .eq('client_id', window.clientId)
            .order('review_date', { ascending: false })
            .limit(10);
        
        if (reviewsError && reviewsError.code !== 'PGRST116') {
            console.error('Error loading reviews:', reviewsError);
        } else if (reviewsData) {
            window.userData.reviews = reviewsData || [];
            console.log('Loaded reviews:', reviewsData);
        }
        
        console.log('User data loaded successfully:', window.userData);
        
    } catch (error) {
        console.error('Error in loadUserData:', error);
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            console.log('Database tables not set up yet - this is normal for new installations');
            showNotification('Database setup required. Some features may not work yet.', 'info');
        }
    }
}

// Initialize navigation event listeners
function initializeNavigation() {
    // Add click event listeners to all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        // Get the onclick attribute to extract the section name
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/loadSection\('([^']+)'\)/);
            if (match) {
                const sectionName = match[1];
                
                // Add click event listener
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Remove active class from all nav links
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Load the section
                    loadSection(sectionName);
                    
                    // Close sidebar on mobile after navigation
                    if (isMobile) {
                        setTimeout(() => closeSidebar(), 100);
                    }
                });
            }
        }
    });
}

// Initialize mobile-specific event handlers
function initializeMobileHandlers() {
    const overlay = document.getElementById('mobileOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    // Close sidebar when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Close sidebar when clicking close button
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const wasMyMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        // If switching from mobile to desktop, ensure sidebar is visible
        if (wasMyMobile && !isMobile) {
            openSidebar();
        }
        // If switching from desktop to mobile, ensure sidebar is hidden
        else if (!wasMyMobile && isMobile) {
            closeSidebar();
        }
    });
}

// Update user display
function updateUserDisplay() {
    const email = window.user?.email || 'User';
    const initials = email.split('@')[0].slice(0, 2).toUpperCase();
    
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = email.split('@')[0];
    if (userAvatar) userAvatar.textContent = initials;
}

// Load section modules dynamically
async function loadSection(sectionName) {
    console.log('Loading section:', sectionName);
    
    const content = document.getElementById('main-content');
    if (!content) {
        console.error('Main content container not found');
        return;
    }
    
    content.innerHTML = '<div class="loading-state">Loading...</div>';
    
    try {
        // Load section HTML
        const htmlResponse = await fetch(`sections/${sectionName}.html`);
        if (htmlResponse.ok) {
            const htmlContent = await htmlResponse.text();
            content.innerHTML = htmlContent;
            console.log(`Loaded ${sectionName} section successfully`);
            
            // Load section JS if exists (optional)
            try {
                // Check if module already loaded
                if (loadedModules.has(sectionName)) {
                    console.log(`Module ${sectionName} already loaded, skipping script load`);
                    
                    // Still trigger initialization for specific sections since we changed the HTML
                    if (sectionName === 'brand-info' && window.loadBrandData) {
                        setTimeout(() => window.loadBrandData(), 100);
                    } else if (sectionName === 'website' && window.initWebsiteSection) {
                        setTimeout(() => window.initWebsiteSection(), 200);
                    } else if (sectionName === 'reputation' && window.initReputationSection) {
                        setTimeout(() => window.initReputationSection(), 200);
                    }
                    return;
                }
                
                // Mark module as loaded
                loadedModules.add(sectionName);
                
                const script = document.createElement('script');
                script.src = `js/sections/${sectionName}.js`;
                script.onload = () => {
                    console.log(`Loaded ${sectionName} module`);
                    // Trigger data loading for specific sections
                    if (sectionName === 'brand-info' && window.loadBrandData) {
                        setTimeout(() => window.loadBrandData(), 100);
                    } else if (sectionName === 'website') {
                        // Initialize the enhanced website manager
                        setTimeout(() => {
                            if (window.initializeWebsiteManager) {
                                window.initializeWebsiteManager();
                            } else if (window.initWebsiteSection) {
                                window.initWebsiteSection();
                            }
                        }, 200);
                    } else if (sectionName === 'reputation') {
                        // Initialize the enhanced reputation manager
                        setTimeout(() => {
                            if (window.initializeReputationManager) {
                                window.initializeReputationManager();
                            } else if (window.initReputationSection) {
                                window.initReputationSection();
                            }
                        }, 200);
                    } else if (sectionName === 'google-business' && window.initializeGoogleBusinessManager) {
                        setTimeout(() => window.initializeGoogleBusinessManager(), 200);
                    } else if (sectionName === 'social-media' && window.initializeSocialMediaManager) {
                        setTimeout(() => window.initializeSocialMediaManager(), 200);
                    }
                };
                script.onerror = () => {
                    console.log(`No JS module for ${sectionName} (this is normal)`);
                    // Remove from loaded modules if script failed
                    loadedModules.delete(sectionName);
                };
                
                // Remove any existing section scripts first
                const existingScript = document.querySelector(`script[src="js/sections/${sectionName}.js"]`);
                if (existingScript) {
                    existingScript.remove();
                }
                
                document.head.appendChild(script);
            } catch (jsError) {
                console.log(`No JS module for ${sectionName}:`, jsError);
                // Remove from loaded modules if error occurred
                loadedModules.delete(sectionName);
            }
        } else {
            throw new Error(`Section not found: ${sectionName}`);
        }
    } catch (error) {
        console.error(`Error loading section ${sectionName}:`, error);
        content.innerHTML = `
            <div class="section-header">
                <h1>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ')}</h1>
                <p>This section is under development.</p>
            </div>
            <div class="section-card">
                <p>We're working hard to bring you this feature. Check back soon!</p>
                <button class="btn-primary" onclick="loadSection('overview')">Return to Overview</button>
            </div>
        `;
    }
}

// Enhanced sidebar controls - FIXED
function toggleSidebar() {
    console.log('Toggling sidebar, current state:', sidebarOpen, 'isMobile:', isMobile);
    if (sidebarOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    console.log('Opening sidebar, isMobile:', isMobile);
    
    // Remove collapsed class to show sidebar
    sidebar.classList.remove('collapsed');
    
    if (isMobile && overlay) {
        overlay.classList.add('show');
        // Prevent body scroll when sidebar is open on mobile
        document.body.style.overflow = 'hidden';
    }
    
    sidebarOpen = true;
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    console.log('Closing sidebar, isMobile:', isMobile);
    
    if (isMobile) {
        // Add collapsed class to hide sidebar on mobile
        sidebar.classList.add('collapsed');
        if (overlay) {
            overlay.classList.remove('show');
        }
        // Re-enable body scroll
        document.body.style.overflow = '';
        sidebarOpen = false;
    }
    // Don't close sidebar on desktop
}

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

async function signOut() {
    try {
        await window.supabase.auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Sign out error:', error);
        // Force redirect even if sign out fails
        window.location.href = 'login.html';
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !e.target.closest('.user-menu')) {
        dropdown.classList.remove('show');
    }
});

// Handle escape key to close sidebar on mobile
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile && sidebarOpen) {
        closeSidebar();
    }
});

// Prevent sidebar from closing when clicking inside it
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.contains(e.target)) {
        e.stopPropagation();
    }
});

// Touch gesture support for sidebar (swipe to close)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!isMobile || !sidebarOpen) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Swipe left to close sidebar (when sidebar is open)
    if (deltaX < -50 && Math.abs(deltaY) < 100) {
        closeSidebar();
    }
});

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'});
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            notification.style.animationFillMode = 'forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
    
    // Allow manual removal by clicking
    notification.addEventListener('click', () => {
        notification.remove();
    });
}

// Make functions global for onclick handlers
window.loadSection = loadSection;
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;
window.showNotification = showNotification;
window.loadUserData = loadUserData;
window.ensureClientRecord = ensureClientRecord;

// Add touch class for better mobile interactions
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch');
}

// Debug logging
console.log('Dashboard core loaded, mobile detection:', isMobile);
