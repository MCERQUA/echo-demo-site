// Contact Info Tab Module
console.log('Contact Info tab module loaded');

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactTab);
} else {
    initContactTab();
}

function initContactTab() {
    console.log('Initializing contact info tab');
    loadContactData();
}

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
    if (!window.userData?.contactInfo) return;
    
    const data = window.userData.contactInfo;
    const fields = ['primary_phone', 'secondary_phone', 'primary_email', 'support_email', 'headquarters_address', 'business_hours', 'website_url', 'linkedin_url', 'facebook_url', 'twitter_url'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        const display = document.getElementById(field + '_display');
        
        if (input && data[field]) input.value = data[field];
        if (display) display.textContent = data[field] || 'Click Edit to add';
    });
}

async function saveContactData() {
    const formData = {};
    const fields = ['primary_phone', 'secondary_phone', 'primary_email', 'support_email', 'headquarters_address', 'business_hours', 'website_url', 'linkedin_url', 'facebook_url', 'twitter_url'];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input?.value) formData[field] = input.value;
    });
    
    formData.user_id = window.user.id;
    formData.updated_at = new Date().toISOString();
    
    try {
        const { error } = await window.supabase
            .from('contact_info')
            .upsert(formData, { onConflict: 'user_id' });
        
        if (error) throw error;
        
        // Update local data
        window.userData.contactInfo = formData;
        
        // Update displays
        fields.forEach(field => {
            const display = document.getElementById(field + '_display');
            if (display) display.textContent = formData[field] || 'Click Edit to add';
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
