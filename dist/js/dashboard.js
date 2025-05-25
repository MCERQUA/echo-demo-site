// Dashboard JavaScript - Echo AI Systems

// Supabase setup
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check authentication
async function checkAuth() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with user info
    const fullName = user.user_metadata?.full_name || 'User';
    const firstName = fullName.split(' ')[0];
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userAvatar').textContent = initials;
}

// Sign out
async function signOut() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

// Toggle dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Show section
async function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        // Load content if not already loaded
        if (selectedSection.dataset.loaded !== 'true') {
            await loadSectionContent(sectionName);
        }
        selectedSection.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
}

// Load section content dynamically
async function loadSectionContent(sectionName) {
    const contentDiv = document.getElementById(`${sectionName}-section`);
    if (!contentDiv) {
        return;
    }
    
    try {
        const response = await fetch(`sections/${sectionName}.html`);
        if (response.ok) {
            const html = await response.text();
            contentDiv.innerHTML = html;
            contentDiv.dataset.loaded = 'true';
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu.contains(e.target)) {
        document.getElementById('userDropdown').classList.remove('show');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Load the initial overview section content
    await loadSectionContent('overview');
});