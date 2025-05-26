// Dashboard Core - Ultra Simple Module Loader
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
        initializeMobileHandlers();
        
        // Set initial sidebar state based on screen size
        if (isMobile) {
            closeSidebar();
        }
        
        loadSection('overview');
        
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'login.html';
    }
});

// Initialize mobile-specific event handlers
function initializeMobileHandlers() {
    const overlay = document.getElementById('mobileOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking close button
    sidebarClose.addEventListener('click', closeSidebar);
    
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
    
    // Close sidebar when clicking navigation links on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (isMobile) {
                closeSidebar();
            }
        });
    });
}

// Update user display
function updateUserDisplay() {
    const email = window.user?.email || 'User';
    const initials = email.split('@')[0].slice(0, 2).toUpperCase();
    
    document.getElementById('userName').textContent = email.split('@')[0];
    document.getElementById('userAvatar').textContent = initials;
}

// Load section modules dynamically
async function loadSection(sectionName) {
    const content = document.getElementById('main-content');
    content.innerHTML = '<div class="loading-state">Loading...</div>';
    
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event?.target?.closest('.nav-link')?.classList.add('active') || 
    document.querySelector(`[onclick=\"loadSection('${sectionName}')\"]`)?.classList.add('active');
    
    try {
        // Load section HTML
        const htmlResponse = await fetch(`sections/${sectionName}.html`);
        if (htmlResponse.ok) {
            content.innerHTML = await htmlResponse.text();
            
            // Load section JS if exists
            const script = document.createElement('script');
            script.src = `js/sections/${sectionName}.js`;
            script.onload = () => console.log(`Loaded ${sectionName} module`);
            script.onerror = () => console.log(`No JS module for ${sectionName}`);
            document.head.appendChild(script);
        } else {
            throw new Error('Section not found');
        }
    } catch (error) {
        content.innerHTML = `
            <div class="section-header">
                <h1>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ')}</h1>
                <p>This section is under development.</p>
            </div>
        `;
    }
}

// Enhanced sidebar controls
function toggleSidebar() {
    if (sidebarOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    sidebar.classList.remove('collapsed');
    
    if (isMobile) {
        overlay.classList.add('show');
        // Prevent body scroll when sidebar is open on mobile
        document.body.style.overflow = 'hidden';
    }
    
    sidebarOpen = true;
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (isMobile) {
        sidebar.classList.add('collapsed');
        overlay.classList.remove('show');
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    sidebarOpen = false;
}

function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

async function signOut() {
    await window.supabase.auth.signOut();
    window.location.href = 'login.html';
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown').classList.remove('show');
    }
});

// Handle escape key to close sidebar on mobile
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile && sidebarOpen) {
        closeSidebar();
    }
});

// Prevent sidebar from closing when clicking inside it
document.getElementById('sidebar').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Make functions global
window.loadSection = loadSection;
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;