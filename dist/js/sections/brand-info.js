// Brand Info Section Module - Enhanced with Supabase Data Loading
console.log('Brand Info module loaded');

// Initialize this section when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandInfo);
} else {
    initBrandInfo();
}

async function initBrandInfo() {
    console.log('Initializing brand info section');
    
    // Load any existing data
    await loadBrandData();
    
    // Set up click handlers for edit mode
    setupFieldClickHandlers();
    
    // Set up tab functionality if tabs exist
    setupTabs();
}

async function loadBrandData() {
    if (!window.user) {
        console.log('No user found, skipping data load');
        return;
    }
    
    try {
        console.log('Loading brand data for user:', window.user.id);
        
        // Try to load business info
        const { data: businessData, error: businessError } = await window.supabase
            .from('business_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (businessError) {
            console.error('Error loading business info:', businessError);
        } else if (businessData) {
            console.log('Business data loaded:', businessData);
            window.userData = window.userData || {};
            window.userData.businessInfo = businessData;
            populateBusinessFields(businessData);
        } else {
            console.log('No business data found for user');
        }
        
        // Try to load contact info
        const { data: contactData, error: contactError } = await window.supabase
            .from('contact_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (contactError) {
            console.error('Error loading contact info:', contactError);
        } else if (contactData) {
            console.log('Contact data loaded:', contactData);
            window.userData = window.userData || {};
            window.userData.contactInfo = contactData;
            populateContactFields(contactData);
        } else {
            console.log('No contact data found for user');
        }
        
    } catch (error) {
        console.error('Error in loadBrandData:', error);
        
        // Show user-friendly error
        if (window.showNotification) {
            window.showNotification('Unable to load your data. Please refresh the page.', 'error');
        }
    }
}

function setupFieldClickHandlers() {
    // Add click handlers to make fields editable when edit mode is active
    document.addEventListener('click', function(e) {
        const fieldValue = e.target.closest('.field-value[data-field]');
        if (fieldValue && window.editMode && window.editMode[fieldValue.dataset.table]) {
            if (fieldValue.contentEditable !== 'true') {
                fieldValue.contentEditable = true;
                fieldValue.focus();
                
                // Select all text
                const range = document.createRange();
                range.selectNodeContents(fieldValue);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Save on blur or enter
                fieldValue.addEventListener('blur', function() {
                    this.contentEditable = false;
                    saveFieldValue(this);
                }, { once: true });
                
                fieldValue.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.blur();
                    }
                    if (e.key === 'Escape') {
                        this.blur();
                    }
                }, { once: true });
            }
        }
    });
}

function saveFieldValue(fieldElement) {
    const fieldName = fieldElement.dataset.field;
    const tableName = fieldElement.dataset.table;
    const value = fieldElement.textContent.trim();
    
    console.log(`Saving field ${fieldName} = ${value} to table ${tableName}`);
    
    // Update local data
    if (!window.userData) window.userData = {};
    
    const dataKey = tableName === 'business_info' ? 'businessInfo' : 'contactInfo';
    if (!window.userData[dataKey]) window.userData[dataKey] = {};
    
    window.userData[dataKey][fieldName] = value;
    
    // Visual feedback
    fieldElement.style.backgroundColor = 'var(--success)';
    fieldElement.style.transition = 'background-color 0.3s';
    setTimeout(() => {
        fieldElement.style.backgroundColor = '';
    }, 1000);
}

function setupTabs() {
    // If this section has tabs, set up the tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
        console.log('Setting up tabs');
        // showTab function should be already available from parent
    }
}

async function showTab(tabName) {
    console.log('Showing tab:', tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const activeButton = Array.from(document.querySelectorAll('.tab-button')).find(btn => 
        btn.getAttribute('onclick')?.includes(tabName) || btn.dataset.tab === tabName
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Load tab content
    const container = document.getElementById('brand-info-tabs');
    if (container) {
        container.innerHTML = '<div class=\"loading-state\">Loading tab...</div>';
        
        try {
            const response = await fetch(`sections/brand-info/${tabName}.html`);
            if (response.ok) {
                const content = await response.text();
                container.innerHTML = content;
                
                // Reload data for the new tab content
                setTimeout(() => {
                    loadBrandData();
                    setupFieldClickHandlers();
                }, 100);
                
                console.log(`Loaded ${tabName} tab successfully`);
            } else {
                throw new Error(`Failed to load tab: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading tab:', error);
            container.innerHTML = '<div class=\"error-state\">Failed to load tab. Please refresh the page.</div>';
        }
    }
}

function populateBusinessFields(data) {
    console.log('Populating business fields with:', data);
    
    // Populate business info fields if they exist
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field=\"${key}\"][data-table=\"business_info\"]`);
        if (element && value) {
            element.textContent = value;
            console.log(`Set ${key} = ${value}`);
        }
    });
}

function populateContactFields(data) {
    console.log('Populating contact fields with:', data);
    
    // Populate contact info fields if they exist
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field=\"${key}\"][data-table=\"contact_info\"]`);
        if (element && value) {
            element.textContent = value;
            console.log(`Set ${key} = ${value}`);
        }
    });
}

// Enhanced toggle edit mode specifically for brand info
function toggleBrandEditMode(section) {
    if (!window.editMode) window.editMode = {};
    window.editMode[section] = !window.editMode[section];
    
    const button = event.target;
    const sectionCard = button.closest('.section-card');
    const fields = sectionCard.querySelectorAll(`.field-value[data-table=\"${section}\"]`);
    
    if (window.editMode[section]) {
        // Enter edit mode
        button.textContent = 'Save';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        
        fields.forEach(field => {
            field.style.cursor = 'text';
            field.title = 'Click to edit';
            field.style.backgroundColor = 'var(--primary-light)';
        });
        
        if (window.showNotification) {
            window.showNotification('Click on any field to edit', 'info');
        }
    } else {
        // Exit edit mode and save all changes
        button.textContent = 'Edit';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        
        fields.forEach(field => {
            if (field.contentEditable === 'true') {
                field.contentEditable = false;
            }
            field.style.cursor = 'default';
            field.title = '';
            field.style.backgroundColor = '';
        });
        
        // Save all changes
        if (window.saveSection) {
            window.saveSection(section);
        }
    }
}

// Make functions global for tab switching and edit mode
window.showTab = showTab;
window.toggleBrandEditMode = toggleBrandEditMode;
window.loadBrandData = loadBrandData;