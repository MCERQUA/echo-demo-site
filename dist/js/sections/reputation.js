// Reputation Section Module - Handles all reputation tabs
console.log('Reputation module loaded');

// Initialize when this section loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReputation);
} else {
    initReputation();
}

function initReputation() {
    console.log('Initializing reputation section');
    
    // Check if we're in the reputation section
    const sectionHeader = document.querySelector('.section-header h1');
    if (sectionHeader && sectionHeader.textContent === 'Reputation Management') {
        // Load the default tab
        if (typeof window.showReputationTab === 'function') {
            window.showReputationTab('overview');
        }
    }
}

// Make sure the reputation functions are available globally
if (!window.showReputationTab) {
    console.log('Setting up reputation tab functions');
    
    // Store loaded tabs to avoid reloading
    const loadedReputationTabs = {};
    
    // Load tab content dynamically
    async function loadReputationTabContent(tabName) {
        if (loadedReputationTabs[tabName]) {
            return loadedReputationTabs[tabName];
        }
        
        // Map tab names to file names
        const fileMap = {
            'overview': 'reputation-overview.html',
            'reviews': 'reviews.html',
            'citations': 'citations.html'
        };
        
        const fileName = fileMap[tabName] || tabName + '.html';
        
        try {
            const response = await fetch(`/sections/reputation/${fileName}`);
            if (!response.ok) throw new Error('Failed to load tab');
            
            const content = await response.text();
            loadedReputationTabs[tabName] = content;
            return content;
        } catch (error) {
            console.error(`Error loading ${tabName} tab:`, error);
            return '<div class="error-state">Failed to load content. Please refresh the page.</div>';
        }
    }
    
    // Show specific tab
    async function showReputationTab(tabName) {
        console.log('Showing reputation tab:', tabName);
        
        // Update button states
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Find the clicked button
        const clickedButton = document.querySelector(`[onclick="showReputationTab('${tabName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Load and display tab content
        const container = document.getElementById('reputation-tabs');
        if (!container) {
            console.error('Reputation tabs container not found');
            return;
        }
        
        container.innerHTML = '<div class="loading-state">Loading...</div>';
        
        const content = await loadReputationTabContent(tabName);
        container.innerHTML = content;
        
        // Initialize tab-specific features
        initializeReputationTabFeatures(tabName);
    }
    
    // Initialize features for specific tabs
    function initializeReputationTabFeatures(tabName) {
        console.log('Initializing features for:', tabName);
        
        if (tabName === 'citations') {
            // The citations.html file has its own script that defines loadCitationsData
            // We need to wait a bit for the script to be parsed and executed
            setTimeout(() => {
                if (typeof window.loadCitationsData === 'function') {
                    console.log('Loading citations data...');
                    window.loadCitationsData();
                } else {
                    console.error('loadCitationsData function not found');
                }
            }, 100);
        }
    }
    
    // Make functions globally available
    window.showReputationTab = showReputationTab;
    window.loadReputationTabContent = loadReputationTabContent;
    window.initializeReputationTabFeatures = initializeReputationTabFeatures;
}

// Export for module usage
window.initReputation = initReputation;