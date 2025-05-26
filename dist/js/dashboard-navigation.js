// Dashboard Navigation and Section Management
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
    
    window.currentSection = sectionName;
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
            if (window.editMode && window.editMode[table]) {
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

// Format section name for display
function formatSectionName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
    if (window.clientData) {
        if (!window.clientData[dataKey]) window.clientData[dataKey] = {};
        window.clientData[dataKey][fieldName] = value;
    }
    
    // Don't save individual fields - wait for Save button
    console.log(`Field ${fieldName} updated locally to: ${value}`);
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
    if (!window.clientData) return;
    
    // Update profile completion
    const completionElements = document.querySelectorAll('[data-field="completeness"]');
    completionElements.forEach(el => {
        el.textContent = `${window.clientData.completeness || 0}%`;
    });
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = `${window.clientData.completeness || 0}%`;
    }
    
    // Update other metrics
    const activeServices = window.clientData.campaigns?.filter(c => c.status === 'active').length || 0;
    const reportsAvailable = window.clientData.contentLibrary?.filter(c => c.type === 'report').length || 0;
    
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
    if (!window.clientData) return;
    
    // Populate business info fields
    if (window.clientData.businessInfo) {
        Object.entries(window.clientData.businessInfo).forEach(([key, value]) => {
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
    if (window.clientData.contactInfo) {
        Object.entries(window.clientData.contactInfo).forEach(([key, value]) => {
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
    if (window.clientData.brandAssets) {
        Object.entries(window.clientData.brandAssets).forEach(([key, value]) => {
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

// Populate other sections (simplified)
function populateSocialMedia() {
    // Implementation for social media population
    console.log('Populating social media section');
}

function populateWebsite() {
    // Implementation for website population
    console.log('Populating website section');
}

function populateGoogleBusiness() {
    // Implementation for Google Business population
    console.log('Populating Google Business section');
}

function populateReputation() {
    // Implementation for reputation population
    console.log('Populating reputation section');
}

function populateReports() {
    // Implementation for reports population
    console.log('Populating reports section');
}

function populateBilling() {
    // Implementation for billing population
    console.log('Populating billing section');
}

// Make functions globally available
window.showSection = showSection;
window.loadSection = loadSection;
window.populateSection = populateSection;
window.populateOverview = populateOverview;
window.populateBrandInfo = populateBrandInfo;
window.initializeSectionFeatures = initializeSectionFeatures;
window.startFieldEdit = startFieldEdit;
window.saveFieldValue = saveFieldValue;
