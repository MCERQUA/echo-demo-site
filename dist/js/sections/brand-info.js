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
        'support_email',  // Database has support_email column
        'website_url'
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
    
    // Collect social media links into JSONB field
    const socialMediaLinks = {};
    const socialFields = ['linkedin', 'facebook', 'twitter', 'instagram', 'youtube'];
    socialFields.forEach(platform => {
        const input = document.getElementById(platform + '_url');
        if (input && input.value.trim()) {
            socialMediaLinks[platform] = input.value.trim();
        }
    });
    
    // Always include social_media_links, even if empty
    formData.social_media_links = socialMediaLinks;
    
    // Handle headquarters_address as JSONB
    const addressInput = document.getElementById('headquarters_address');
    if (addressInput && addressInput.value.trim()) {
        const addressLines = addressInput.value.trim().split('\n');
        formData.headquarters_address = {
            street: addressLines[0] || '',
            city_state_zip: addressLines[1] || '',
            country: addressLines[2] || 'USA'
        };
    }
    
    // Handle business_hours as JSONB
    const hoursInput = document.getElementById('business_hours');
    if (hoursInput && hoursInput.value.trim()) {
        const hoursLines = hoursInput.value.trim().split('\n');
        const businessHours = {};
        
        hoursLines.forEach(line => {
            const match = line.match(/^(\w+)(?:\s*-\s*\w+)?:\s*(.+)$/i);
            if (match) {
                const day = match[1].toLowerCase();
                const hours = match[2].trim();
                if (hours.toLowerCase() === 'closed') {
                    businessHours[day] = { closed: true };
                } else {
                    const timeMatch = hours.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
                    if (timeMatch) {
                        businessHours[day] = {
                            open: timeMatch[1],
                            close: timeMatch[2]
                        };
                    }
                }
            }
        });
        
        if (Object.keys(businessHours).length > 0) {
            formData.business_hours = businessHours;
        }
    }
    
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
        
        // Update displays with new values
        simpleFields.forEach(field => {
            const display = document.getElementById(field + '_display');
            if (display) {
                display.textContent = formData[field] || 'Click Edit to add';
            }
        });
        
        // Update social media displays
        socialFields.forEach(platform => {
            const display = document.getElementById(platform + '_url_display');
            if (display) {
                const value = socialMediaLinks[platform] || '';
                display.textContent = value || 'Click Edit to add';
            }
        });
        
        // Update address display
        const addressDisplay = document.getElementById('headquarters_address_display');
        if (addressDisplay && formData.headquarters_address) {
            const addr = formData.headquarters_address;
            addressDisplay.textContent = [addr.street, addr.city_state_zip, addr.country].filter(Boolean).join('\n');
        }
        
        // Update hours display
        const hoursDisplay = document.getElementById('business_hours_display');
        if (hoursDisplay && formData.business_hours) {
            const hoursText = Object.entries(formData.business_hours)
                .map(([day, hours]) => {
                    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                    if (hours.closed) return `${dayName}: Closed`;
                    return `${dayName}: ${hours.open} - ${hours.close}`;
                })
                .join('\n');
            hoursDisplay.textContent = hoursText;
        }
        
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

// Brand Assets functionality
async function saveBrandAssets() {
    try {
        // Get current brand assets record from pre-loaded data
        const brandAssetsId = window.userData?.brandAssets?.id;
        
        if (!brandAssetsId) {
            if (window.showNotification) {
                window.showNotification('No brand assets record found', 'error');
            }
            return;
        }
        
        // Collect all data including uploaded logos
        const brandData = {
            tagline: document.getElementById('tagline')?.value || '',
            brand_story: document.getElementById('brand-story')?.value || '',
            mission_statement: document.getElementById('mission-statement')?.value || '',
            vision_statement: document.getElementById('vision-statement')?.value || '',
            logo_primary_url: document.getElementById('logo_primary_url')?.value || '',
            logo_secondary_url: document.getElementById('logo_secondary_url')?.value || '',
            logo_icon_url: document.getElementById('logo_icon_url')?.value || '',
            brand_colors: getBrandColorsArray ? getBrandColorsArray() : brandColors,
            updated_at: new Date().toISOString()
        };
        
        console.log('Saving brand assets:', brandData); // DEBUG
        
        // Save to database
        const { data, error } = await window.supabase
            .from('brand_assets')
            .update(brandData)
            .eq('id', brandAssetsId)
            .select()
            .single();
        
        if (error) {
            console.error('Save error:', error);
            if (window.showNotification) {
                window.showNotification('Save failed: ' + error.message, 'error');
            }
            return;
        }
        
        console.log('Save successful:', data); // DEBUG
        
        // Update local cache
        if (window.userData) {
            window.userData.brandAssets = data;
        }
        
        if (window.showNotification) {
            window.showNotification('Brand assets saved successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Save error:', error);
        if (window.showNotification) {
            window.showNotification('Save failed: ' + error.message, 'error');
        }
    }
}

// Color picker functionality
let brandColors = [];

// Initialize brand colors from existing data
function initBrandColors() {
    brandColors = window.userData?.brandAssets?.brand_colors || [];
    console.log('Loaded brand colors:', brandColors);
    renderColorPicker();
}

function renderColorPicker() {
    const container = document.getElementById('brand-colors-container');
    if (!container) {
        console.log('Brand colors container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="brand-colors-section">
            <h4>Brand Colors</h4>
            <div id="color-list">
                ${brandColors.map((color, index) => renderColorRow(color, index)).join('')}
            </div>
            <button onclick="addNewColor()" class="btn btn-secondary">+ Add Color</button>
        </div>
    `;
}

function renderColorRow(color, index) {
    // Ensure color has all properties
    if (!color.hex) color.hex = '#000000';
    if (!color.rgb) color.rgb = hexToRgbString(color.hex);
    
    return `
        <div class="color-row" data-index="${index}" style="margin-bottom: 10px;">
            <input type="color" value="${color.hex || '#000000'}" 
                   onchange="updateColorHex(${index}, this.value)"
                   class="color-picker" style="width: 50px; height: 40px; margin-right: 10px;">
            <input type="text" value="${color.name || ''}" 
                   placeholder="Color name"
                   onchange="updateColorName(${index}, this.value)"
                   class="color-name" style="width: 150px; margin-right: 10px;">
            <div class="color-values" style="display: inline-block; margin-right: 10px;">
                <input type="text" value="${color.hex || ''}" 
                       placeholder="#000000"
                       onchange="updateColorFromHex(${index}, this.value)"
                       class="hex-input" style="width: 80px; margin-right: 5px;">
                <span class="rgb-display" style="color: #666;">${color.rgb || ''}</span>
            </div>
            <button onclick="removeColor(${index})" class="btn btn-sm btn-danger">Remove</button>
        </div>
    `;
}

function addNewColor() {
    brandColors.push({
        hex: '#000000',
        rgb: 'rgb(0, 0, 0)',
        name: '',
        usage: ''
    });
    renderColorPicker();
}

function updateColorHex(index, hex) {
    if (brandColors[index]) {
        brandColors[index].hex = hex;
        brandColors[index].rgb = hexToRgbString(hex);
        renderColorPicker();
    }
}

function updateColorName(index, name) {
    if (brandColors[index]) {
        brandColors[index].name = name;
    }
}

function updateColorFromHex(index, hex) {
    // Validate hex format
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        alert('Please enter a valid hex color (e.g., #FF0000)');
        return;
    }
    updateColorHex(index, hex);
}

function removeColor(index) {
    brandColors.splice(index, 1);
    renderColorPicker();
}

function hexToRgbString(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function getBrandColorsArray() {
    // Return only colors that have at least a hex value and name
    return brandColors.filter(c => c.hex && c.name).map(color => ({
        name: color.name || '',
        hex: color.hex,
        rgb: color.rgb || hexToRgbString(color.hex),
        usage: color.usage || ''
    }));
}

// Color conversion utilities
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    
    c = Math.round(((c - k) / (1 - k)) * 100) || 0;
    m = Math.round(((m - k) / (1 - k)) * 100) || 0;
    y = Math.round(((y - k) / (1 - k)) * 100) || 0;
    k = Math.round(k * 100);
    
    return { c, m, y, k };
}

// Certifications functionality
let certifications = [];

async function loadCertifications() {
    const businessInfo = window.userData?.businessInfo || {};
    certifications = businessInfo.certifications || [];
    renderCertifications();
}

function renderCertifications() {
    const listContainer = document.getElementById('certifications-list');
    if (!listContainer) return;
    
    if (certifications.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <p>No certifications added yet</p>
                <p class="text-muted">Upload your business licenses, certifications, and insurance documents</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = certifications.map(cert => `
            <div class="certification-card">
                <div class="cert-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="cert-info">
                    <h4>${cert.name}</h4>
                    <div class="cert-date">
                        ${cert.number ? `Number: ${cert.number} • ` : ''}
                        ${cert.issuer ? `Issued by: ${cert.issuer} • ` : ''}
                        Expires: ${cert.expiryDate || 'N/A'}
                    </div>
                </div>
                <div class="cert-actions">
                    ${cert.fileUrl ? `<a href="${cert.fileUrl}" target="_blank" class="btn-icon" title="View">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </a>` : ''}
                    <button class="btn-icon" onclick="removeCertification(${cert.id})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

async function addCertification() {
    const cert = {
        id: Date.now(),
        name: prompt('Certificate name:'),
        number: prompt('Certificate number (optional):'),
        issuer: prompt('Issuing organization:'),
        issueDate: prompt('Issue date (YYYY-MM-DD):'),
        expiryDate: prompt('Expiry date (YYYY-MM-DD):'),
        uploadedAt: new Date().toISOString()
    };
    
    if (!cert.name) {
        alert('Certificate name is required');
        return;
    }
    
    certifications.push(cert);
    await saveCertifications();
    renderCertifications();
}

async function removeCertification(certId) {
    if (confirm('Are you sure you want to remove this certification?')) {
        certifications = certifications.filter(c => c.id !== certId);
        await saveCertifications();
        renderCertifications();
    }
}

async function saveCertifications() {
    try {
        const { error } = await window.supabase
            .from('business_info')
            .update({ 
                certifications: certifications,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', window.user.id);
            
        if (error) throw error;
        
        // Update local cache
        if (window.userData && window.userData.businessInfo) {
            window.userData.businessInfo.certifications = certifications;
        }
        
        if (window.showNotification) {
            window.showNotification('Certifications updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving certifications:', error);
        if (window.showNotification) {
            window.showNotification('Failed to save certifications', 'error');
        }
    }
}

// Insurance policies functionality
let insurancePolicies = [];

async function loadInsurancePolicies() {
    const businessInfo = window.userData?.businessInfo || {};
    insurancePolicies = businessInfo.insurance_policies || [];
    renderInsurancePolicies();
}

function renderInsurancePolicies() {
    // Similar to certifications rendering
    console.log('Insurance policies:', insurancePolicies);
}

async function addInsurancePolicy() {
    const policy = {
        id: Date.now(),
        type: prompt('Insurance type (e.g., General Liability):'),
        provider: prompt('Insurance provider:'),
        policyNumber: prompt('Policy number:'),
        coverage: prompt('Coverage amount:'),
        expiry: prompt('Expiry date (YYYY-MM-DD):'),
        addedAt: new Date().toISOString()
    };
    
    if (!policy.type || !policy.provider) {
        alert('Insurance type and provider are required');
        return;
    }
    
    insurancePolicies.push(policy);
    await saveInsurancePolicies();
}

async function saveInsurancePolicies() {
    try {
        const { error } = await window.supabase
            .from('business_info')
            .update({ 
                insurance_policies: insurancePolicies,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', window.user.id);
            
        if (error) throw error;
        
        if (window.userData && window.userData.businessInfo) {
            window.userData.businessInfo.insurance_policies = insurancePolicies;
        }
        
        if (window.showNotification) {
            window.showNotification('Insurance policies updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving insurance policies:', error);
        if (window.showNotification) {
            window.showNotification('Failed to save insurance policies', 'error');
        }
    }
}

// Storage buckets are already created in Supabase
// No need for bucket creation function

// File upload functionality
async function uploadLogo(type) {
    const fileInput = document.getElementById(`logo-${type}-file`);
    const file = fileInput?.files[0];
    
    if (!file) {
        if (window.showNotification) {
            window.showNotification('Please select a file', 'error');
        }
        return;
    }
    
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        if (window.showNotification) {
            window.showNotification('Invalid file type. Please upload PNG, JPG, SVG, or WebP', 'error');
        }
        return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        if (window.showNotification) {
            window.showNotification('File too large. Maximum 5MB', 'error');
        }
        return;
    }
    
    try {
        // Get current user ID
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            if (window.showNotification) {
                window.showNotification('Not authenticated', 'error');
            }
            return;
        }
        
        // Create file path: userId/logo-type-timestamp.extension
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${type}-logo-${Date.now()}.${fileExt}`;
        
        console.log('Uploading to:', fileName); // DEBUG
        
        // Upload to Supabase Storage
        const { data, error } = await window.supabase.storage
            .from('brand-logos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (error) {
            console.error('Upload error:', error);
            if (window.showNotification) {
                window.showNotification('Upload failed: ' + error.message, 'error');
            }
            return;
        }
        
        console.log('Upload successful:', data); // DEBUG
        
        // Get public URL
        const { data: { publicUrl } } = window.supabase.storage
            .from('brand-logos')
            .getPublicUrl(fileName);
        
        console.log('Public URL:', publicUrl); // DEBUG
        
        // Update preview
        const preview = document.getElementById(`logo-${type}-preview`);
        if (preview) {
            preview.src = publicUrl;
            preview.style.display = 'block';
        }
        
        // Store URL in hidden input for saving
        const urlInput = document.getElementById(`logo_${type}_url`);
        if (urlInput) {
            urlInput.value = publicUrl;
        }
        
        // Add to uploaded files display
        displayUploadedLogo(type, publicUrl, file.name);
        
        if (window.showNotification) {
            window.showNotification(`${type} logo uploaded successfully!`, 'success');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        if (window.showNotification) {
            window.showNotification('Upload failed: ' + error.message, 'error');
        }
    }
}

function displayUploadedLogo(type, url, filename) {
    const container = document.getElementById('uploaded-logos');
    if (!container) return;
    
    // Check if already displayed
    const existing = container.querySelector(`[data-type="${type}"]`);
    if (existing) {
        existing.remove();
    }
    
    const item = document.createElement('div');
    item.className = 'uploaded-logo-item';
    item.setAttribute('data-type', type);
    item.innerHTML = `
        <div class="logo-preview">
            <img src="${url}" alt="${filename}">
        </div>
        <div class="logo-info">
            <strong>${type.charAt(0).toUpperCase() + type.slice(1)} Logo</strong>
            <small>${filename}</small>
        </div>
        <button onclick="removeLogo('${type}')" class="btn btn-sm btn-danger">Remove</button>
    `;
    container.appendChild(item);
}

function removeLogo(type) {
    // Clear the preview and input
    const preview = document.getElementById(`logo-${type}-preview`);
    const urlInput = document.getElementById(`logo_${type}_url`);
    const fileInput = document.getElementById(`logo-${type}-file`);
    
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (urlInput) {
        urlInput.value = '';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Remove from display
    const item = document.querySelector(`[data-type="${type}"]`);
    if (item) {
        item.remove();
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
window.saveBrandAssets = saveBrandAssets;
window.initColorPicker = initColorPicker;
window.addColorSwatch = addColorSwatch;
window.updateColor = updateColor;
window.updateColorName = updateColorName;
window.removeColor = removeColor;
window.loadCertifications = loadCertifications;
window.addCertification = addCertification;
window.removeCertification = removeCertification;
window.loadInsurancePolicies = loadInsurancePolicies;
window.addInsurancePolicy = addInsurancePolicy;
window.uploadLogo = uploadLogo;
window.displayUploadedLogo = displayUploadedLogo;
window.removeLogo = removeLogo;
window.initBrandColors = initBrandColors;
window.renderColorPicker = renderColorPicker;
window.addNewColor = addNewColor;
window.updateColorHex = updateColorHex;
window.updateColorName = updateColorName;
window.updateColorFromHex = updateColorFromHex;

// Function to populate brand assets form with existing data
function populateBrandAssets() {
    console.log('Populating brand assets with existing data...');
    
    const brandData = window.userData?.brandAssets || {};
    console.log('Brand data to populate:', brandData);
    
    // Populate text fields
    const taglineInput = document.getElementById('tagline');
    if (taglineInput) taglineInput.value = brandData.tagline || '';
    
    const brandStoryInput = document.getElementById('brand-story');
    if (brandStoryInput) brandStoryInput.value = brandData.brand_story || '';
    
    const missionInput = document.getElementById('mission-statement');
    if (missionInput) missionInput.value = brandData.mission_statement || '';
    
    const visionInput = document.getElementById('vision-statement');
    if (visionInput) visionInput.value = brandData.vision_statement || '';
    
    // Show existing logos
    if (brandData.logo_primary_url) {
        const primaryPreview = document.getElementById('logo-primary-preview');
        const primaryUrlInput = document.getElementById('logo_primary_url');
        if (primaryPreview) {
            primaryPreview.src = brandData.logo_primary_url;
            primaryPreview.style.display = 'block';
        }
        if (primaryUrlInput) {
            primaryUrlInput.value = brandData.logo_primary_url;
        }
    }
    
    if (brandData.logo_secondary_url) {
        const secondaryPreview = document.getElementById('logo-secondary-preview');
        const secondaryUrlInput = document.getElementById('logo_secondary_url');
        if (secondaryPreview) {
            secondaryPreview.src = brandData.logo_secondary_url;
            secondaryPreview.style.display = 'block';
        }
        if (secondaryUrlInput) {
            secondaryUrlInput.value = brandData.logo_secondary_url;
        }
    }
    
    if (brandData.logo_icon_url) {
        const iconPreview = document.getElementById('logo-icon-preview');
        const iconUrlInput = document.getElementById('logo_icon_url');
        if (iconPreview) {
            iconPreview.src = brandData.logo_icon_url;
            iconPreview.style.display = 'block';
        }
        if (iconUrlInput) {
            iconUrlInput.value = brandData.logo_icon_url;
        }
    }
    
    // Initialize colors - this will be handled by initBrandColors which reads from window.userData
    brandColors = brandData.brand_colors || [];
    if (window.renderColorPicker) {
        window.renderColorPicker();
    }
    
    console.log('Brand assets populated');
}

window.populateBrandAssets = populateBrandAssets;