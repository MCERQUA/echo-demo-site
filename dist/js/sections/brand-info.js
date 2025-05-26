// Brand Info Section Module
console.log('Brand Info module loaded');

// Initialize this section when loaded
document.addEventListener('DOMContentLoaded', initBrandInfo);

function initBrandInfo() {
    console.log('Initializing brand info section');
    
    // Load any existing data
    loadBrandData();
    
    // Set up tab functionality if tabs exist
    setupTabs();
}

async function loadBrandData() {
    if (!window.user) return;
    
    try {
        // Try to load business info
        const { data: businessData } = await window.supabase
            .from('business_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (businessData) {
            window.userData.businessInfo = businessData;
            populateBusinessFields(businessData);
        }
        
        // Try to load contact info
        const { data: contactData } = await window.supabase
            .from('contact_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (contactData) {
            window.userData.contactInfo = contactData;
            populateContactFields(contactData);
        }
        
    } catch (error) {
        console.error('Error loading brand data:', error);
    }
}

function setupTabs() {
    // If this section has tabs, set up the tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        // Load first tab by default
        showTab('business-details');
    }
}

async function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tabName}')"]`)?.classList.add('active');
    
    // Load tab content
    const container = document.getElementById('brand-info-tabs');
    if (container) {
        container.innerHTML = '<div class="loading-state">Loading tab...</div>';
        
        try {
            const response = await fetch(`sections/brand-info/${tabName}.html`);
            if (response.ok) {
                container.innerHTML = await response.text();
                
                // Load tab-specific JS if it exists
                const script = document.createElement('script');
                script.src = `js/tabs/${tabName}.js`;
                script.onload = () => console.log(`Loaded ${tabName} tab module`);
                script.onerror = () => console.log(`No JS for ${tabName} tab`);
                document.head.appendChild(script);
            }
        } catch (error) {
            container.innerHTML = '<div class="error-state">Failed to load tab</div>';
        }
    }
}

function populateBusinessFields(data) {
    // Populate business info fields if they exist
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"]`);
        if (element && value) {
            element.textContent = value;
        }
    });
}

function populateContactFields(data) {
    // Populate contact info fields if they exist
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"]`);
        if (element && value) {
            element.textContent = value;
        }
    });
}

// Make functions global for tab switching
window.showTab = showTab;
