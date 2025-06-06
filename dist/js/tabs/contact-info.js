// Contact Info Tab Module
console.log('Contact Info tab module loaded');

// Initialize function to be called when tab is loaded
function initContactInfo() {
    console.log('Initializing contact info tab');
    // Wait a bit for the HTML to be fully rendered
    setTimeout(() => {
        loadContactData();
    }, 100);
}

// Export for global access
window.initContactInfo = initContactInfo;

let isEditMode = false;

function toggleContactEditMode() {
    isEditMode = !isEditMode;
    const button = document.querySelector('.edit-button');
    
    if (isEditMode) {
        button.textContent = 'Save';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        showInputs();
    } else {
        saveContactData();
        button.textContent = 'Edit';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        hideInputs();
    }
}

function showInputs() {
    document.querySelectorAll('.field-value').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.field-input').forEach(el => el.style.display = 'block');
}

function hideInputs() {
    document.querySelectorAll('.field-value').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.field-input').forEach(el => el.style.display = 'none');
}

function loadContactData() {
    console.log('Loading contact data, window.userData:', window.userData);
    
    // Check both possible locations for contact data
    const data = window.userData?.contactInfo || window.dashboardData?.contactInfo || {};
    console.log('Contact data found:', data);
    console.log('Available data keys:', Object.keys(data));
    
    // Map of form field IDs to potential data field names
    const fieldMappings = {
        'primary_phone': ['primary_phone', 'phone', 'business_phone'],
        'secondary_phone': ['secondary_phone', 'alt_phone'],
        'primary_email': ['primary_email', 'email', 'business_email'],
        'support_email': ['support_email'],
        'headquarters_address': ['headquarters_address', 'address', 'business_address'],
        'business_hours': ['business_hours', 'hours'],
        'website_url': ['website_url', 'website'],
        'linkedin_url': ['linkedin_url', 'linkedin'],
        'facebook_url': ['facebook_url', 'facebook'],
        'twitter_url': ['twitter_url', 'twitter'],
        'instagram_url': ['instagram_url', 'instagram'],
        'youtube_url': ['youtube_url', 'youtube']
    };
    
    Object.entries(fieldMappings).forEach(([fieldId, possibleKeys]) => {
        const input = document.getElementById(fieldId);
        const display = document.getElementById(fieldId + '_display');
        
        // Find the first matching key that has data
        let value = '';
        for (const key of possibleKeys) {
            if (data[key]) {
                value = data[key];
                break;
            }
        }
        
        // Always set the input value
        if (input) {
            input.value = value;
            console.log(`Set ${fieldId} input to:`, value || '(empty)');
        }
        
        // Update the display text
        if (display) {
            display.textContent = value || 'Click Edit to add';
            console.log(`Set ${fieldId} display to:`, value || 'Click Edit to add');
        }
    });
    
    // Also check for any data fields we might have missed
    Object.entries(data).forEach(([key, value]) => {
        if (value && !Object.values(fieldMappings).some(keys => keys.includes(key))) {
            console.log(`Unmapped data field: ${key} = ${value}`);
        }
    });
}

async function saveContactData() {
    const formData = {};
    const fields = ['primary_phone', 'secondary_phone', 'primary_email', 'support_email', 'headquarters_address', 'business_hours', 'website_url', 'linkedin_url', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            formData[field] = input.value || null;
        }
    });
    
    // Use client_id instead of user_id
    formData.client_id = window.clientId;
    formData.updated_at = new Date().toISOString();
    
    try {
        const { error } = await window.supabase
            .from('contact_info')
            .upsert(formData);
        
        if (error) throw error;
        
        // Update local data
        window.userData.contactInfo = formData;
        
        // Update displays
        fields.forEach(field => {
            const display = document.getElementById(field + '_display');
            if (display) {
                display.textContent = formData[field] || 'Click Edit to add';
            }
        });
        
        showNotification('Contact info saved!', 'success');
        
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving contact info', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 24px;
        background: ${type === 'success' ? '#34a853' : '#ea4335'};
        color: white; border-radius: 6px; z-index: 10000;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Make functions global
window.toggleContactEditMode = toggleContactEditMode;
