// Dashboard Core - Fixed Navigation System with Data Loading
// Initialize Supabase
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY';

const { createClient } = supabase;
window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.user = null;
window.userData = {};

// Mobile sidebar state
let isMobile = window.innerWidth <= 768;
let sidebarOpen = false;

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

// Load user data from Supabase
async function loadUserData() {
    if (!window.user) return;
    
    console.log('Loading user data for:', window.user.email);
    
    try {
        // Load business info
        const { data: businessData, error: businessError } = await window.supabase
            .from('business_info')
            .select('*')
            .eq('user_id', window.user.id)
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
            .eq('user_id', window.user.id)
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
            .eq('user_id', window.user.id);
        
        if (brandError && brandError.code !== 'PGRST116') {
            console.error('Error loading brand assets:', brandError);
        } else if (brandData) {
            window.userData.brandAssets = brandData;
            console.log('Loaded brand assets:', brandData);
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
                const script = document.createElement('script');
                script.src = `js/sections/${sectionName}.js`;
                script.onload = () => {
                    console.log(`Loaded ${sectionName} module`);
                    // Trigger data loading for brand-info section
                    if (sectionName === 'brand-info' && window.loadBrandData) {
                        setTimeout(() => window.loadBrandData(), 100);
                    }
                };
                script.onerror = () => console.log(`No JS module for ${sectionName} (this is normal)`);
                
                // Remove any existing section scripts first
                const existingScript = document.querySelector(`script[src="js/sections/${sectionName}.js"]`);
                if (existingScript) {
                    existingScript.remove();
                }
                
                document.head.appendChild(script);
            } catch (jsError) {
                console.log(`No JS module for ${sectionName}:`, jsError);
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
    notification.style.zIndex = '10000';
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
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

// Add touch class for better mobile interactions
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch');
}

// Debug logging
console.log('Dashboard core loaded, mobile detection:', isMobile);