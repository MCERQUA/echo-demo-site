// Website Overview Tab Module
console.log('Website overview module loaded');

// Load website overview data
async function loadWebsiteOverview() {
    if (!window.user) {
        console.log('No user logged in');
        return;
    }
    
    console.log('Loading website overview data...');
    
    try {
        // Load website info
        const { data: websiteInfo, error: infoError } = await window.supabase
            .from('website_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (infoError && infoError.code !== 'PGRST116') {
            console.error('Error loading website info:', infoError);
        } else if (websiteInfo) {
            console.log('Website info loaded:', websiteInfo);
            populateWebsiteFields(websiteInfo, 'website_info');
        } else {
            console.log('No website info found, showing defaults');
            setDefaultWebsiteInfo();
        }
        
        // Load website analytics
        const { data: analytics, error: analyticsError } = await window.supabase
            .from('website_analytics')
            .select('*')
            .eq('user_id', window.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (analyticsError && analyticsError.code !== 'PGRST116') {
            console.error('Error loading analytics:', analyticsError);
        } else if (analytics) {
            console.log('Analytics loaded:', analytics);
            populateWebsiteFields(analytics, 'website_analytics');
            updateScoreDisplay(analytics.seo_score);
        } else {
            console.log('No analytics data found');
            setDefaultAnalytics();
        }
        
    } catch (error) {
        console.error('Error in loadWebsiteOverview:', error);
        if (window.showNotification) {
            window.showNotification('Unable to load website data', 'error');
        }
    }
}

// Set default values for website info
function setDefaultWebsiteInfo() {
    const defaults = {
        website_url: 'Not set',
        primary_domain: 'Not set',
        platform: 'Not set',
        ssl_status: 'Unknown',
        mobile_responsive: 'Unknown',
        analytics_id: 'Not configured',
        sitemap_url: 'Not set'
    };
    
    Object.entries(defaults).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"][data-table="website_info"]`);
        if (element) {
            element.textContent = value;
            element.style.color = 'var(--text-muted)';
        }
    });
}

// Set default values for analytics
function setDefaultAnalytics() {
    const defaults = {
        monthly_visitors: '0',
        monthly_pageviews: '0',
        seo_score: '0',
        technical_seo_score: '0',
        content_score: '0',
        total_backlinks: '0',
        referring_domains: '0'
    };
    
    Object.entries(defaults).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"][data-table="website_analytics"]`);
        if (element) {
            element.textContent = value;
        }
    });
    
    updateScoreDisplay(0);
}

// Populate fields with data
function populateWebsiteFields(data, tableName) {
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"][data-table="${tableName}"]`);
        if (element && value !== null) {
            element.textContent = formatFieldValue(key, value);
            element.style.color = 'var(--text-primary)';
        }
    });
}

// Format field values for display
function formatFieldValue(key, value) {
    if (key.includes('_at') || key.includes('_date')) {
        return new Date(value).toLocaleDateString();
    }
    
    if (typeof value === 'number' && (key.includes('visitors') || key.includes('pageviews'))) {
        return value.toLocaleString();
    }
    
    return value;
}

// Update SEO score display
function updateScoreDisplay(score) {
    const scoreCircle = document.querySelector('.score-circle');
    const scoreValue = document.querySelector('.score-value');
    
    if (scoreCircle) {
        scoreCircle.style.setProperty('--score', score || 0);
    }
    
    if (scoreValue) {
        scoreValue.textContent = score || '0';
    }
}

// Toggle edit mode
async function toggleWebsiteEditMode(section) {
    if (!window.websiteEditMode) window.websiteEditMode = {};
    window.websiteEditMode[section] = !window.websiteEditMode[section];
    
    const button = event.target;
    const isEditing = window.websiteEditMode[section];
    
    if (isEditing) {
        button.textContent = 'Save';
        button.classList.add('btn-primary');
        button.classList.remove('btn-secondary');
        enableEditMode(section);
    } else {
        button.textContent = 'Edit';
        button.classList.remove('btn-primary');
        button.classList.add('btn-secondary');
        await saveWebsiteData(section);
    }
}

// Enable edit mode for fields
function enableEditMode(tableName) {
    const fields = document.querySelectorAll(`[data-field][data-table="${tableName}"]`);
    
    fields.forEach(field => {
        field.contentEditable = true;
        field.style.cursor = 'text';
        field.style.backgroundColor = 'var(--primary-light)';
        
        field.addEventListener('focus', function() {
            selectAllText(this);
        });
    });
    
    if (window.showNotification) {
        window.showNotification('Click on any field to edit', 'info');
    }
}

// Select all text in element
function selectAllText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// Save website data
async function saveWebsiteData(tableName) {
    const fields = document.querySelectorAll(`[data-field][data-table="${tableName}"]`);
    const data = {
        user_id: window.user.id,
        updated_at: new Date().toISOString()
    };
    
    fields.forEach(field => {
        field.contentEditable = false;
        field.style.cursor = 'default';
        field.style.backgroundColor = '';
        
        const fieldName = field.dataset.field;
        const value = field.textContent.trim();
        
        // Don't save display values like "Not set"
        if (value && value !== 'Not set' && value !== 'Unknown' && value !== 'Not configured') {
            data[fieldName] = value;
        }
    });
    
    try {
        // Check if record exists
        const { data: existing } = await window.supabase
            .from(tableName)
            .select('id')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        let result;
        if (existing) {
            result = await window.supabase
                .from(tableName)
                .update(data)
                .eq('user_id', window.user.id);
        } else {
            result = await window.supabase
                .from(tableName)
                .insert([data]);
        }
        
        if (result.error) throw result.error;
        
        if (window.showNotification) {
            window.showNotification('Website information saved', 'success');
        }
    } catch (error) {
        console.error('Error saving website data:', error);
        if (window.showNotification) {
            window.showNotification('Failed to save changes', 'error');
        }
    }
}

// Export functions
window.loadWebsiteOverview = loadWebsiteOverview;
window.toggleWebsiteEditMode = toggleWebsiteEditMode;
window.updateScoreDisplay = updateScoreDisplay;

console.log('Website overview functions ready');
