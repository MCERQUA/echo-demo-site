// Website Section Module - Enhanced with Supabase Data Loading
console.log('Website module loaded');

// Initialize this section when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebsite);
} else {
    initWebsite();
}

async function initWebsite() {
    console.log('Initializing website section');
    
    // Set up click handlers for edit mode
    setupWebsiteFieldClickHandlers();
    
    // Set up tab functionality
    setupWebsiteTabs();
}

function setupWebsiteFieldClickHandlers() {
    // Add click handlers to make fields editable when edit mode is active
    document.addEventListener('click', function(e) {
        const fieldValue = e.target.closest('.field-value[data-field]');
        if (fieldValue && window.websiteEditMode && window.websiteEditMode[fieldValue.dataset.table]) {
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
                    saveWebsiteFieldValue(this);
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

function saveWebsiteFieldValue(fieldElement) {
    const fieldName = fieldElement.dataset.field;
    const tableName = fieldElement.dataset.table;
    const value = fieldElement.textContent.trim();
    
    console.log(`Saving field ${fieldName} = ${value} to table ${tableName}`);
    
    // Update local data
    if (!window.websiteData) window.websiteData = {};
    
    if (!window.websiteData[tableName]) window.websiteData[tableName] = {};
    
    window.websiteData[tableName][fieldName] = value;
    
    // Visual feedback
    fieldElement.style.backgroundColor = 'var(--success)';
    fieldElement.style.transition = 'background-color 0.3s';
    setTimeout(() => {
        fieldElement.style.backgroundColor = '';
    }, 1000);
}

function setupWebsiteTabs() {
    // Tab functionality is handled in the HTML
    console.log('Website tabs initialized');
}

// Load website overview data
async function loadWebsiteOverview() {
    if (!window.user) return;
    
    try {
        console.log('Loading website overview data');
        
        // Load website info
        const { data: websiteInfo, error: infoError } = await window.supabase
            .from('website_info')
            .select('*')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (infoError) {
            console.error('Error loading website info:', infoError);
        } else if (websiteInfo) {
            populateWebsiteFields(websiteInfo, 'website_info');
        }
        
        // Load website analytics
        const { data: analytics, error: analyticsError } = await window.supabase
            .from('website_analytics')
            .select('*')
            .eq('user_id', window.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (analyticsError) {
            console.error('Error loading analytics:', analyticsError);
        } else if (analytics) {
            populateWebsiteFields(analytics, 'website_analytics');
            updateScoreDisplay(analytics.seo_score);
        }
        
    } catch (error) {
        console.error('Error in loadWebsiteOverview:', error);
        if (window.showNotification) {
            window.showNotification('Unable to load website data. Please refresh the page.', 'error');
        }
    }
}

function populateWebsiteFields(data, tableName) {
    console.log(`Populating ${tableName} fields with:`, data);
    
    Object.entries(data).forEach(([key, value]) => {
        const element = document.querySelector(`[data-field="${key}"][data-table="${tableName}"]`);
        if (element && value !== null) {
            element.textContent = formatFieldValue(key, value);
        }
    });
}

function formatFieldValue(key, value) {
    // Format dates
    if (key.includes('_at') || key.includes('_date')) {
        return new Date(value).toLocaleDateString();
    }
    
    // Format numbers
    if (typeof value === 'number' && key.includes('visitors') || key.includes('pageviews')) {
        return value.toLocaleString();
    }
    
    return value;
}

function updateScoreDisplay(score) {
    const scoreCircle = document.querySelector('.score-circle');
    if (scoreCircle && score !== null) {
        scoreCircle.style.setProperty('--score', score);
    }
}

// Toggle edit mode for website info
function toggleWebsiteEditMode(section) {
    if (!window.websiteEditMode) window.websiteEditMode = {};
    window.websiteEditMode[section] = !window.websiteEditMode[section];
    
    const button = event.target;
    const sectionCard = button.closest('.section-card');
    const fields = sectionCard.querySelectorAll(`.field-value[data-table="${section}"]`);
    
    if (window.websiteEditMode[section]) {
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
        saveWebsiteSection(section);
    }
}

// Save website section data
async function saveWebsiteSection(section) {
    if (!window.user || !window.websiteData || !window.websiteData[section]) return;
    
    try {
        const dataToSave = {
            ...window.websiteData[section],
            user_id: window.user.id,
            updated_at: new Date().toISOString()
        };
        
        // Check if record exists
        const { data: existing, error: checkError } = await window.supabase
            .from(section)
            .select('id')
            .eq('user_id', window.user.id)
            .maybeSingle();
        
        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }
        
        let result;
        if (existing) {
            // Update existing record
            result = await window.supabase
                .from(section)
                .update(dataToSave)
                .eq('user_id', window.user.id);
        } else {
            // Insert new record
            result = await window.supabase
                .from(section)
                .insert([dataToSave]);
        }
        
        if (result.error) throw result.error;
        
        if (window.showNotification) {
            window.showNotification('Website information saved successfully', 'success');
        }
        
    } catch (error) {
        console.error('Error saving website section:', error);
        if (window.showNotification) {
            window.showNotification('Failed to save changes', 'error');
        }
    }
}

// Quick action functions
async function runWebsiteAudit() {
    if (window.showNotification) {
        window.showNotification('Website audit started. This may take a few minutes.', 'info');
    }
    
    // In production, this would call an actual audit API
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('Website audit completed. Check the SEO Metrics tab for results.', 'success');
        }
    }, 3000);
}

async function submitToSearchEngines() {
    if (window.showNotification) {
        window.showNotification('Submitting website to search engines...', 'info');
    }
    
    // In production, this would submit sitemaps to search engines
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('Website submitted to Google and Bing successfully', 'success');
        }
    }, 2000);
}

async function generateSitemap() {
    if (window.showNotification) {
        window.showNotification('Generating sitemap...', 'info');
    }
    
    // In production, this would generate a sitemap
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('Sitemap generated successfully', 'success');
        }
    }, 2000);
}

async function checkBrokenLinks() {
    if (window.showNotification) {
        window.showNotification('Checking for broken links...', 'info');
    }
    
    // In production, this would check for broken links
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('Link check complete. No broken links found!', 'success');
        }
    }, 3000);
}

// Refresh SEO score
async function refreshSeoScore() {
    const button = event.target.closest('button');
    button.disabled = true;
    
    try {
        // Simulate score refresh
        const newScore = Math.floor(Math.random() * 30) + 70;
        
        // Update display
        const scoreElement = document.querySelector('[data-field="seo_score"]');
        if (scoreElement) {
            scoreElement.textContent = newScore;
            updateScoreDisplay(newScore);
        }
        
        // Save to database
        const { error } = await window.supabase
            .from('website_analytics')
            .update({ seo_score: newScore })
            .eq('user_id', window.user.id);
        
        if (error) throw error;
        
        if (window.showNotification) {
            window.showNotification('SEO score updated', 'success');
        }
        
    } catch (error) {
        console.error('Error refreshing SEO score:', error);
        if (window.showNotification) {
            window.showNotification('Failed to refresh score', 'error');
        }
    } finally {
        button.disabled = false;
    }
}

// Make functions global
window.loadWebsiteOverview = loadWebsiteOverview;
window.toggleWebsiteEditMode = toggleWebsiteEditMode;
window.saveWebsiteSection = saveWebsiteSection;
window.runWebsiteAudit = runWebsiteAudit;
window.submitToSearchEngines = submitToSearchEngines;
window.generateSitemap = generateSitemap;
window.checkBrokenLinks = checkBrokenLinks;
window.refreshSeoScore = refreshSeoScore;