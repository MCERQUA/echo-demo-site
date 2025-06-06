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
    
    // Simple fields to populate
    const fields = [
        'primary_phone',
        'secondary_phone', 
        'primary_email',
        'secondary_email',  // DB field name
        'website_url'
    ];
    
    // Social media fields are stored in social_media_links JSONB
    const socialFields = ['linkedin', 'facebook', 'twitter', 'instagram', 'youtube'];
    
    // Populate each simple field
    fields.forEach(field => {
        let value = contactData[field];
        let inputId = field;
        let displayId = field + '_display';
        
        // Handle field mapping
        if (field === 'secondary_email') {
            inputId = 'support_email';
            displayId = 'support_email_display';
        }
        
        // Update the display span
        const display = document.getElementById(displayId);
        if (display) {
            display.textContent = value || 'Click Edit to add';
            console.log(`Set ${displayId} to:`, value || '(empty)');
        }
        
        // Update the input value
        const input = document.getElementById(inputId);
        if (input) {
            input.value = value || '';
            console.log(`Set ${inputId} input to:`, value || '(empty)');
        }
    });
    
    // Populate social media fields from JSONB
    const socialMediaLinks = contactData.social_media_links || {};
    socialFields.forEach(platform => {
        const fieldId = platform + '_url';
        const value = socialMediaLinks[platform] || '';
        
        const display = document.getElementById(fieldId + '_display');
        if (display) {
            display.textContent = value || 'Click Edit to add';
        }
        
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = value || '';
        }
    });
    
    // Handle complex fields (headquarters_address and business_hours)
    if (contactData.headquarters_address && typeof contactData.headquarters_address === 'object') {
        const addr = contactData.headquarters_address;
        const addressText = [
            addr.street || addr.address_line1,
            addr.address_line2,
            [addr.city, addr.state].filter(Boolean).join(', '),
            addr.postal_code || addr.zip,
            addr.country
        ].filter(Boolean).join('\n');
        
        const display = document.getElementById('headquarters_address_display');
        if (display) display.textContent = addressText || 'Click Edit to add';
        
        const input = document.getElementById('headquarters_address');
        if (input) input.value = addressText || '';
    }
    
    if (contactData.business_hours && typeof contactData.business_hours === 'object') {
        const hours = contactData.business_hours;
        let hoursText = '';
        
        if (hours.monday || hours.tuesday || hours.wednesday) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            hoursText = days
                .map(day => {
                    if (hours[day]) {
                        const dayHours = hours[day];
                        if (dayHours.closed) {
                            return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
                        } else if (dayHours.open && dayHours.close) {
                            return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`;
                        }
                    }
                    return null;
                })
                .filter(Boolean)
                .join('\n');
        }
        
        const display = document.getElementById('business_hours_display');
        if (display) display.textContent = hoursText || 'Click Edit to add';
        
        const input = document.getElementById('business_hours');
        if (input) input.value = hoursText || '';
    }
    
}

// Enhanced save function for contact info
async function saveContactInfo() {
    console.log('Saving contact information...');
    
    const formData = {};
    
    // Only include fields that exist in the contact_info table
    const simpleFields = [
        'primary_phone',
        'secondary_phone',
        'primary_email',
        'secondary_email',  // Changed from support_email
        'website_url'
    ];
    
    // Collect simple field values
    simpleFields.forEach(field => {
        // Handle field mapping for form elements
        let inputId = field;
        if (field === 'secondary_email') {
            inputId = 'support_email'; // Form uses support_email, DB uses secondary_email
        }
        
        const input = document.getElementById(inputId);
        if (input) {
            const value = input.value.trim();
            if (value) {
                formData[field] = value;
            } else {
                formData[field] = null;
            }
        }
    });
    
    // Collect social media links into JSONB field
    const socialMediaLinks = {};
    const socialFields = ['linkedin_url', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url'];
    socialFields.forEach(field => {
        const input = document.getElementById(field);
        if (input && input.value.trim()) {
            const platform = field.replace('_url', '');
            socialMediaLinks[platform] = input.value.trim();
        }
    });
    
    if (Object.keys(socialMediaLinks).length > 0) {
        formData.social_media_links = socialMediaLinks;
    }
    
    // Skip complex fields for now - they're causing 400 errors
    // TODO: Handle headquarters_address and business_hours properly
    console.log('Skipping complex fields (headquarters_address, business_hours) to avoid 400 error');
    
    // Add metadata - Note: table uses user_id, not client_id
    formData.user_id = window.user.id;
    formData.updated_at = new Date().toISOString();
    
    console.log('Form data to save:', formData);
    
    try {
        // Check if we have an existing contact_info record
        const existingData = window.userData?.contactInfo || {};
        
        let result;
        if (existingData.id) {
            // Update existing record
            console.log('Updating existing contact record:', existingData.id);
            result = await window.supabase
                .from('contact_info')
                .update(formData)
                .eq('id', existingData.id);
        } else {
            // Insert new record
            console.log('Creating new contact record');
            result = await window.supabase
                .from('contact_info')
                .insert(formData)
                .select()
                .single();
        }
        
        const { data, error } = result;
        
        if (error) {
            console.error('Save error details:', error.message, error.details, error.hint);
            throw error;
        }
        
        console.log('Save successful:', data);
        
        // If it was an insert, store the new ID
        if (data && !existingData.id) {
            window.userData.contactInfo = { ...window.userData.contactInfo, id: data.id };
        }
        
        // Update local data
        window.userData.contactInfo = { ...window.userData.contactInfo, ...formData };
        
        // Update displays with new values (only simple fields)
        simpleFields.forEach(field => {
            let displayId = field + '_display';
            if (field === 'secondary_email') {
                displayId = 'support_email_display'; // Form uses support_email
            }
            const display = document.getElementById(displayId);
            if (display) {
                display.textContent = formData[field] || 'Click Edit to add';
            }
        });
        
        // Update social media displays
        socialFields.forEach(field => {
            const display = document.getElementById(field + '_display');
            if (display) {
                const platform = field.replace('_url', '');
                const value = socialMediaLinks[platform] || '';
                display.textContent = value || 'Click Edit to add';
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

// Save function for business_info section
async function saveSection(tableName) {
    console.log(`Saving ${tableName} section...`);
    
    if (tableName === 'business_info') {
        await saveBusinessInfo();
    } else if (tableName === 'contact_info') {
        await saveContactInfo();
    }
}

// Save business info
async function saveBusinessInfo() {
    console.log('Saving business information...');
    
    // Collect data from all editable fields
    const fields = document.querySelectorAll('[data-table="business_info"][data-field]');
    const formData = {};
    
    fields.forEach(field => {
        const fieldName = field.dataset.field;
        const value = field.textContent.trim();
        if (value && value !== 'Click Edit to add') {
            formData[fieldName] = value;
        }
    });
    
    // Add metadata
    formData.client_id = window.clientId;
    formData.updated_at = new Date().toISOString();
    
    console.log('Business info to save:', formData);
    
    try {
        const existingData = window.userData?.businessInfo || {};
        
        let result;
        if (existingData.id) {
            // Update existing record
            console.log('Updating existing business record:', existingData.id);
            result = await window.supabase
                .from('business_info')
                .update(formData)
                .eq('id', existingData.id);
        } else {
            // Insert new record
            console.log('Creating new business record');
            result = await window.supabase
                .from('business_info')
                .insert(formData)
                .select()
                .single();
        }
        
        const { data, error } = result;
        
        if (error) {
            console.error('Save error:', error.message, error.details);
            throw error;
        }
        
        console.log('Business info saved successfully:', data);
        
        // Update local cache
        if (data && !existingData.id) {
            window.userData.businessInfo = { ...window.userData.businessInfo, id: data.id };
        }
        window.userData.businessInfo = { ...window.userData.businessInfo, ...formData };
        
        if (window.showNotification) {
            window.showNotification('Business information saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to save business info:', error);
        if (window.showNotification) {
            window.showNotification('Failed to save: ' + (error.message || 'Unknown error'), 'error');
        }
    }
}

// Make functions global for tab switching and edit mode
window.showTab = showTab;
window.toggleBrandEditMode = toggleBrandEditMode;
window.loadBrandData = loadBrandData;
window.populateContactInfoTab = populateContactInfoTab;
window.saveContactInfo = saveContactInfo;
window.saveSection = saveSection;
window.saveBusinessInfo = saveBusinessInfo;