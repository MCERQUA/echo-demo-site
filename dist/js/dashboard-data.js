// Dashboard Data Management and Editing
// Toggle edit mode for a section
function toggleEditMode(section) {
    // Special handling for contact_info
    if (section === 'contact_info' && typeof toggleContactInfoEditMode === 'function') {
        toggleContactInfoEditMode();
        return;
    }
    
    if (!window.editMode) window.editMode = {};
    window.editMode[section] = !window.editMode[section];
    
    const button = event.target;
    const sectionCard = button.closest('.section-card');
    const fields = sectionCard.querySelectorAll(`.field-value[data-table="${section}"]`);
    
    if (window.editMode[section]) {
        // Enter edit mode
        button.textContent = 'Save';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary');
        
        fields.forEach(field => {
            if (field.tagName !== 'SELECT' && field.tagName !== 'INPUT') {
                field.style.cursor = 'text';
                field.title = 'Click to edit';
            }
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
        });
        
        // Save all changes
        saveSection(section);
    }
}

// Save entire section data
async function saveSection(section) {
    const tableMap = {
        'business_info': 'businessInfo',
        'contact_info': 'contactInfo',
        'brand_assets': 'brandAssets',
        'digital_presence': 'digitalPresence',
        'google_business_profile': 'googleBusiness'
    };
    
    const dataKey = tableMap[section];
    if (!dataKey || !window.clientData || !window.clientData[dataKey]) {
        if (window.showNotification) {
            window.showNotification('No data to save', 'error');
        }
        return;
    }
    
    try {
        // Prepare data for save
        const saveData = {
            ...window.clientData[dataKey],
            user_id: window.currentUser.id,
            updated_at: new Date().toISOString()
        };
        
        // Remove any null or undefined values
        Object.keys(saveData).forEach(key => {
            if (saveData[key] === null || saveData[key] === undefined || saveData[key] === '') {
                delete saveData[key];
            }
        });
        
        console.log('Saving data to table:', section);
        console.log('Save data:', saveData);
        
        // Save to database
        const { data, error } = await window.supabaseClient
            .from(section)
            .upsert(saveData, { 
                onConflict: 'user_id'
            });
        
        if (error) {
            console.error('Supabase error:', error);
            
            // Handle specific error types
            if (error.code === '42P01') {
                if (window.showNotification) {
                    window.showNotification('Database tables not set up yet. Please contact support.', 'warning');
                }
                return;
            } else if (error.message && error.message.includes('Invalid API key')) {
                if (window.showNotification) {
                    window.showNotification('Authentication error. Please refresh the page and try again.', 'error');
                }
                return;
            } else if (error.code === 'PGRST301') {
                if (window.showNotification) {
                    window.showNotification('Permission denied. Please contact support.', 'error');
                }
                return;
            }
            
            throw error;
        }
        
        if (window.showNotification) {
            window.showNotification(`${formatSectionName(section)} saved successfully!`, 'success');
        }
        
        // Update local data with what we saved
        window.clientData[dataKey] = saveData;
        
        // Recalculate completeness
        if (window.calculateDataCompleteness) {
            window.calculateDataCompleteness();
        }
        if (window.updateUserInterface) {
            window.updateUserInterface();
        }
        
        // Update overview if visible
        if (window.currentSection === 'overview' && window.populateOverview) {
            window.populateOverview();
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Error saving data. ';
        if (error.message) {
            if (error.message.includes('Invalid API key')) {
                errorMessage = 'Authentication error. Please refresh the page and try again.';
            } else if (error.message.includes('JWT')) {
                errorMessage = 'Session expired. Please log in again.';
            } else {
                errorMessage += 'Please try again or contact support.';
            }
        }
        
        if (window.showNotification) {
            window.showNotification(errorMessage, 'error');
        }
    }
}

// Format section name for display
function formatSectionName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// AI Research trigger
async function triggerAIResearch(researchType) {
    try {
        const { data, error } = await window.supabaseClient
            .from('ai_research_queue')
            .insert({
                client_id: window.currentUser.id,
                research_type: researchType,
                status: 'pending',
                priority: 5,
                created_at: new Date().toISOString()
            });
        
        if (error) throw error;
        
        if (window.showNotification) {
            window.showNotification('AI research task queued successfully!', 'success');
        }
    } catch (error) {
        console.error('Error queuing AI research:', error);
        if (window.showNotification) {
            window.showNotification('AI research feature requires database setup', 'info');
        }
    }
}

// Placeholder functions for features not yet implemented
function connectSocialAccount() {
    if (window.showNotification) {
        window.showNotification('Social media connection feature coming soon!', 'info');
    }
}

function viewReport(reportId) {
    if (window.showNotification) {
        window.showNotification('Report viewing feature coming soon!', 'info');
    }
}

function downloadReport(reportId) {
    if (window.showNotification) {
        window.showNotification('Report download feature coming soon!', 'info');
    }
}

// Make functions globally available
window.editMode = window.editMode || {};
window.toggleEditMode = toggleEditMode;
window.saveSection = saveSection;
window.triggerAIResearch = triggerAIResearch;
window.connectSocialAccount = connectSocialAccount;
window.viewReport = viewReport;
window.downloadReport = downloadReport;
