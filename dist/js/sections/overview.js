// Overview Section Module
console.log('Overview module loaded');

document.addEventListener('DOMContentLoaded', initOverview);

function initOverview() {
    console.log('Initializing overview section');
    updateStats();
}

function updateStats() {
    // Calculate profile completion
    let completion = 0;
    if (window.userData?.businessInfo) completion += 25;
    if (window.userData?.contactInfo) completion += 25;
    if (window.userData?.brandAssets) completion += 25;
    if (window.userData?.digitalPresence) completion += 25;
    
    // Update completion percentage
    const completionEl = document.getElementById('profile-completion');
    const progressBar = document.querySelector('.progress-fill');
    
    if (completionEl) completionEl.textContent = `${completion}%`;
    if (progressBar) progressBar.style.width = `${completion}%`;
    
    // Update other stats
    const servicesEl = document.getElementById('active-services');
    const reportsEl = document.getElementById('reports-count');
    
    if (servicesEl) servicesEl.textContent = '0';
    if (reportsEl) reportsEl.textContent = '0';
}

// Quick action functions
function goToBrandInfo() {
    window.loadSection('brand-info');
}

function goToSocialMedia() {
    window.loadSection('social-media');
}

function goToWebsite() {
    window.loadSection('website');
}

// Make functions global
window.goToBrandInfo = goToBrandInfo;
window.goToSocialMedia = goToSocialMedia;
window.goToWebsite = goToWebsite;
