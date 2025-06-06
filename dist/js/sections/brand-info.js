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
    
    // If we're on the contact-info tab, populate it
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab && activeTab.textContent.includes('Contact')) {
        setTimeout(() => populateContactInfoTab(), 100);
    }
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
                    
                    // Initialize tab-specific modules
                    if (tabName === 'contact-info') {
                        // Load contact info data into the form
                        populateContactInfoTab();
                        if (window.initContactInfo) {
                            window.initContactInfo();
                        }
                    }
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

// Function to populate contact info tab with actual data
function populateContactInfoTab() {
    console.log('Populating contact info tab');
    
    // Get the pre-loaded contact data
    const contactData = window.userData?.contactInfo || {};
    console.log('Contact data to populate:', contactData);
    
    // Fields to populate
    const fields = [
        'primary_phone',
        'secondary_phone', 
        'primary_email',
        'support_email',
        'headquarters_address',
        'business_hours',
        'website_url',
        'linkedin_url',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'youtube_url'
    ];
    
    // Populate each field
    fields.forEach(field => {
        let value = contactData[field];
        
        // Handle complex fields that might be objects
        if (value && typeof value === 'object') {
            console.log(`Field ${field} is an object:`, value);
            
            if (field === 'headquarters_address') {
                // Convert address object to string
                value = [
                    value.street || value.address_line1,
                    value.address_line2,
                    [value.city, value.state].filter(Boolean).join(', '),
                    value.postal_code || value.zip,
                    value.country
                ].filter(Boolean).join('\n');
            } else if (field === 'business_hours') {
                // Convert hours object to string
                if (value.monday || value.tuesday || value.wednesday) {
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    value = days
                        .map(day => value[day] ? `${day.charAt(0).toUpperCase() + day.slice(1)}: ${value[day]}` : null)
                        .filter(Boolean)
                        .join('\n');
                } else {
                    // If it's already a string, use it as is
                    value = typeof value === 'string' ? value : JSON.stringify(value);
                }
            } else {
                // For other objects, convert to string
                value = JSON.stringify(value);
            }
        }
        
        // Update the display span
        const display = document.getElementById(field + '_display');
        if (display && value) {
            display.textContent = value;
            console.log(`Set ${field}_display to:`, value);
        }
        
        // Update the input value
        const input = document.getElementById(field);
        if (input && value) {
            input.value = value;
            console.log(`Set ${field} input to:`, value);
        }
    });
    
    // Special handling for address fields if they're stored separately
    if (contactData.address_line1 || contactData.city || contactData.state || contactData.postal_code) {
        const fullAddress = [
            contactData.address_line1,
            contactData.address_line2,
            [contactData.city, contactData.state].filter(Boolean).join(', '),
            contactData.postal_code,
            contactData.country
        ].filter(Boolean).join('\n');
        
        const addressDisplay = document.getElementById('headquarters_address_display');
        const addressInput = document.getElementById('headquarters_address');
        
        if (addressDisplay && fullAddress) {
            addressDisplay.textContent = fullAddress;
        }
        if (addressInput && fullAddress) {
            addressInput.value = fullAddress;
        }
    }
}

// Enhanced save function for contact info
async function saveContactInfo() {
    console.log('Saving contact information...');
    
    const formData = {};
    
    // Simple text fields that can be saved directly
    const simpleFields = [
        'primary_phone',
        'secondary_phone',
        'primary_email',
        'support_email',
        'website_url',
        'linkedin_url',
        'facebook_url',
        'twitter_url',
        'instagram_url',
        'youtube_url'
    ];
    
    // Complex fields that need special handling
    const complexFields = [
        'headquarters_address',
        'business_hours'
    ];
    
    // Collect simple field values
    simpleFields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            const value = input.value.trim();
            if (value) {
                formData[field] = value;
            } else {
                formData[field] = null;
            }
        }
    });
    
    // Handle complex fields
    // For headquarters_address - just save as a string for now
    const addressInput = document.getElementById('headquarters_address');
    if (addressInput && addressInput.value.trim()) {
        formData.headquarters_address = addressInput.value.trim();
    }
    
    // For business_hours - just save as a string for now
    const hoursInput = document.getElementById('business_hours');
    if (hoursInput && hoursInput.value.trim()) {
        formData.business_hours = hoursInput.value.trim();
    }
    
    // Add metadata
    formData.client_id = window.clientId;
    formData.updated_at = new Date().toISOString();
    
    console.log('Form data to save:', formData);
    
    try {
        const { data, error } = await window.supabase
            .from('contact_info')
            .upsert(formData);
        
        if (error) {
            console.error('Save error details:', error.message, error.details, error.hint);
            throw error;
        }
        
        console.log('Save successful:', data);
        
        // Update local data
        window.userData.contactInfo = { ...window.userData.contactInfo, ...formData };
        
        // Update displays with new values
        [...simpleFields, 'headquarters_address', 'business_hours'].forEach(field => {
            const display = document.getElementById(field + '_display');
            if (display) {
                display.textContent = formData[field] || 'Click Edit to add';
            }
        });
        
        if (window.showNotification) {
            window.showNotification('Contact information saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving contact info:', error);
        console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
        
        if (window.showNotification) {
            const errorMsg = error.message || 'Error saving contact information';
            window.showNotification(errorMsg, 'error');
        }
    }
}

// Override the toggle function from the HTML
window.toggleContactEditMode = function() {
    const editButton = document.querySelector('.edit-button');
    const cards = document.querySelectorAll('.section-card');
    
    const isEditMode = editButton.textContent === 'Edit';
    
    if (isEditMode) {
        // Enter edit mode
        cards.forEach(card => card.classList.add('edit-mode'));
        editButton.textContent = 'Save';
        editButton.classList.add('btn-success');
        editButton.classList.remove('btn-secondary');
        
        // Show all inputs, hide displays
        document.querySelectorAll('.field-value').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.field-input').forEach(el => el.style.display = 'block');
    } else {
        // Exit edit mode and save
        cards.forEach(card => card.classList.remove('edit-mode'));
        editButton.textContent = 'Edit';
        editButton.classList.remove('btn-success');
        editButton.classList.add('btn-secondary');
        
        // Hide inputs, show displays
        document.querySelectorAll('.field-value').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.field-input').forEach(el => el.style.display = 'none');
        
        // Save the data
        saveContactInfo();
    }
};

// Make functions global for tab switching and edit mode
window.showTab = showTab;
window.toggleBrandEditMode = toggleBrandEditMode;
window.loadBrandData = loadBrandData;
window.populateContactInfoTab = populateContactInfoTab;
window.saveContactInfo = saveContactInfo;