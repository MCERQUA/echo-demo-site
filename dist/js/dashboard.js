// Dashboard JavaScript - Enhanced for Client Information Management
// Initialize Supabase client
const SUPABASE_URL = 'https://ibcmkwlmqhrsxpwbqiph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliY21rd2xtcWhyc3hwd2JxaXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTAxOTU2NjAsImV4cCI6MjAyNTc3MTY2MH0.SuLyV8ruJpQ3x0QJzQAqHQTUn8uBSL4SvDJUgIsz5GI';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let clientData = null;
let currentSection = 'overview';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    await loadClientData();
    updateUserInterface();
    loadSection('overview');
});

// Load client data from all tables
async function loadClientData() {
    try {
        // Get client record
        const { data: client, error: clientError } = await supabaseClient
            .from('clients')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (clientError) {
            // If no client record exists, create one
            if (clientError.code === 'PGRST116') {
                const { data: newClient, error: createError } = await supabaseClient
                    .from('clients')
                    .insert({ user_id: currentUser.id })
                    .select()
                    .single();
                
                if (createError) throw createError;
                client = newClient;
            } else {
                throw clientError;
            }
        }
        
        // Load all related data in parallel
        const [
            businessInfo,
            contactInfo,
            brandAssets,
            digitalPresence,
            socialMedia,
            googleBusiness,
            reputation,
            competitors,
            campaigns,
            seoData,
            customerInsights,
            contentLibrary,
            aiQueue
        ] = await Promise.all([
            supabaseClient.from('business_info').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('contact_info').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('brand_assets').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('digital_presence').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('social_media_accounts').select('*').eq('client_id', client.id),
            supabaseClient.from('google_business_profile').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('online_reputation').select('*').eq('client_id', client.id),
            supabaseClient.from('competitors').select('*').eq('client_id', client.id),
            supabaseClient.from('marketing_campaigns').select('*').eq('client_id', client.id),
            supabaseClient.from('seo_data').select('*').eq('client_id', client.id).order('snapshot_date', { ascending: false }).limit(1),
            supabaseClient.from('customer_insights').select('*').eq('client_id', client.id).single(),
            supabaseClient.from('content_library').select('*').eq('client_id', client.id),
            supabaseClient.from('ai_research_queue').select('*').eq('client_id', client.id)
        ]);
        
        // Combine all data
        clientData = {
            client,
            businessInfo: businessInfo.data || {},
            contactInfo: contactInfo.data || {},
            brandAssets: brandAssets.data || {},
            digitalPresence: digitalPresence.data || {},
            socialMedia: socialMedia.data || [],
            googleBusiness: googleBusiness.data || {},
            reputation: reputation.data || [],
            competitors: competitors.data || [],
            campaigns: campaigns.data || [],
            seoData: seoData.data ? seoData.data[0] : {},
            customerInsights: customerInsights.data || {},
            contentLibrary: contentLibrary.data || [],
            aiQueue: aiQueue.data || []
        };
        
        // Calculate data completeness
        calculateDataCompleteness();
        
    } catch (error) {
        console.error('Error loading client data:', error);
        showNotification('Error loading data. Please refresh the page.', 'error');
    }
}

// Calculate overall data completeness
function calculateDataCompleteness() {
    const sections = {
        businessInfo: ['business_name', 'primary_industry', 'services_offered', 'business_description'],
        contactInfo: ['primary_phone', 'primary_email', 'headquarters_address', 'business_hours'],
        brandAssets: ['logo_primary_url', 'brand_colors', 'tagline', 'mission_statement'],
        digitalPresence: ['primary_domain', 'website_platform', 'google_analytics_id'],
        socialMedia: ['length'], // Check if any social accounts exist
        googleBusiness: ['profile_name', 'primary_category', 'total_reviews'],
        customerInsights: ['primary_age_range', 'interests', 'pain_points']
    };
    
    let totalFields = 0;
    let completedFields = 0;
    
    Object.entries(sections).forEach(([section, fields]) => {
        if (section === 'socialMedia') {
            totalFields += 1;
            if (clientData[section].length > 0) completedFields += 1;
        } else {
            fields.forEach(field => {
                totalFields += 1;
                if (clientData[section][field] && 
                    clientData[section][field] !== '' && 
                    clientData[section][field] !== '[]' &&
                    clientData[section][field] !== '{}') {
                    completedFields += 1;
                }
            });
        }
    });
    
    clientData.completeness = Math.round((completedFields / totalFields) * 100);
}

// Update user interface with user data
function updateUserInterface() {
    // Update user name and avatar
    const userName = clientData.businessInfo.business_name || currentUser.email.split('@')[0];
    const initials = userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userAvatar').textContent = initials;
}

// Show section
async function showSection(sectionName) {
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the clicked link
    const clickedLink = event ? event.target.closest('.nav-link') : 
                       document.querySelector(`[onclick*="${sectionName}"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${sectionName}-section`);
    sectionElement.classList.add('active');
    
    // Load section content if not already loaded
    if (!sectionElement.dataset.loaded || sectionElement.dataset.loaded === 'false') {
        await loadSection(sectionName);
        sectionElement.dataset.loaded = 'true';
    }
    
    currentSection = sectionName;
}

// Load section content
async function loadSection(sectionName) {
    const sectionElement = document.getElementById(`${sectionName}-section`);
    
    try {
        // Load section template
        const response = await fetch(`sections/${sectionName}.html`);
        if (!response.ok) {
            throw new Error('Section template not found');
        }
        
        const template = await response.text();
        sectionElement.innerHTML = template;
        
        // Populate section with data
        populateSection(sectionName);
        
        // Initialize section-specific features
        initializeSectionFeatures(sectionName);
        
    } catch (error) {
        console.error(`Error loading section ${sectionName}:`, error);
        sectionElement.innerHTML = `
            <div class="error-message">
                <h2>Section Under Construction</h2>
                <p>This section is being developed. Please check back soon!</p>
            </div>
        `;
    }
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
    }
}

// Populate overview section
function populateOverview() {
    // Update completeness
    const completenessElement = document.querySelector('[data-field="completeness"]');
    const completenessBarElement = document.querySelector('[data-field="completeness-bar"]');
    
    if (completenessElement) {
        completenessElement.textContent = `${clientData.completeness}%`;
    }
    
    if (completenessBarElement) {
        completenessBarElement.style.width = `${clientData.completeness}%`;
    }
    
    // Update quick stats
    const totalReviewsElement = document.querySelector('[data-field="total-reviews"]');
    if (totalReviewsElement) {
        totalReviewsElement.textContent = 
            clientData.reputation.reduce((sum, platform) => sum + (platform.total_reviews || 0), 0);
    }
    
    const averageRatingElement = document.querySelector('[data-field="average-rating"]');
    if (averageRatingElement) {
        averageRatingElement.textContent = calculateAverageRating();
    }
    
    const socialFollowersElement = document.querySelector('[data-field="social-followers"]');
    if (socialFollowersElement) {
        socialFollowersElement.textContent = 
            clientData.socialMedia.reduce((sum, account) => sum + (account.follower_count || 0), 0).toLocaleString();
    }
    
    // Update AI research status
    updateAIResearchStatus();
}

// Calculate average rating across all platforms
function calculateAverageRating() {
    const ratings = clientData.reputation.filter(p => p.average_rating);
    if (ratings.length === 0) return 'N/A';
    
    const sum = ratings.reduce((acc, p) => acc + parseFloat(p.average_rating), 0);
    return (sum / ratings.length).toFixed(1);
}

// Update AI research status
function updateAIResearchStatus() {
    const pendingResearch = clientData.aiQueue.filter(item => item.status === 'pending').length;
    const inProgressResearch = clientData.aiQueue.filter(item => item.status === 'in_progress').length;
    const completedResearch = clientData.aiQueue.filter(item => item.status === 'completed').length;
    
    const pendingElement = document.querySelector('[data-field="pending-research"]');
    const inProgressElement = document.querySelector('[data-field="in-progress-research"]');
    const completedElement = document.querySelector('[data-field="completed-research"]');
    
    if (pendingElement) pendingElement.textContent = pendingResearch;
    if (inProgressElement) inProgressElement.textContent = inProgressResearch;
    if (completedElement) completedElement.textContent = completedResearch;
}

// Initialize section-specific features
function initializeSectionFeatures(sectionName) {
    switch (sectionName) {
        case 'brand-info':
            initializeBrandInfoFeatures();
            break;
        case 'social-media':
            initializeSocialMediaFeatures();
            break;
        case 'website':
            initializeWebsiteFeatures();
            break;
    }
}

// Populate brand info (placeholder for section-specific function)
function populateBrandInfo() {
    // This function is defined in the brand-info.html section
    if (typeof window.populateBrandInfo === 'function') {
        window.populateBrandInfo();
    }
}

// Save field changes
async function saveField(tableName, fieldName, value) {
    try {
        const updates = { [fieldName]: value };
        
        const { error } = await supabaseClient
            .from(tableName)
            .update(updates)
            .eq('client_id', clientData.client.id);
        
        if (error) throw error;
        
        // Update local data
        clientData[tableName][fieldName] = value;
        
        // Record change in history
        await recordChange(tableName, fieldName, value);
        
        showNotification('Changes saved successfully', 'success');
        
    } catch (error) {
        console.error('Error saving field:', error);
        showNotification('Error saving changes', 'error');
    }
}

// Record change in history
async function recordChange(tableName, fieldName, newValue) {
    try {
        await supabaseClient
            .from('data_change_history')
            .insert({
                client_id: clientData.client.id,
                table_name: tableName,
                record_id: clientData[tableName].id,
                field_name: fieldName,
                new_value: newValue,
                change_type: 'update',
                changed_by: currentUser.id,
                change_source: 'manual'
            });
    } catch (error) {
        console.error('Error recording change:', error);
    }
}

// Trigger AI research
async function triggerAIResearch(researchType, parameters = {}) {
    try {
        const { data, error } = await supabaseClient
            .from('ai_research_queue')
            .insert({
                client_id: clientData.client.id,
                research_type: researchType,
                parameters: parameters,
                sources_to_check: getSourcesForResearchType(researchType)
            });
        
        if (error) throw error;
        
        showNotification('AI research queued successfully', 'success');
        
        // Reload AI queue
        await loadAIQueue();
        
    } catch (error) {
        console.error('Error queuing AI research:', error);
        showNotification('Error starting AI research', 'error');
    }
}

// Get sources for research type
function getSourcesForResearchType(researchType) {
    const sourceMap = {
        'business_info': ['website', 'google_business', 'government_databases'],
        'competitors': ['google_search', 'competitor_websites', 'review_platforms'],
        'reviews': ['google', 'yelp', 'facebook', 'bbb'],
        'social_media': ['facebook', 'instagram', 'linkedin', 'twitter'],
        'seo_analysis': ['website', 'google_search_console', 'semrush'],
        'full_audit': ['all']
    };
    
    return sourceMap[researchType] || ['website'];
}

// Load AI research queue
async function loadAIQueue() {
    const { data, error } = await supabaseClient
        .from('ai_research_queue')
        .select('*')
        .eq('client_id', clientData.client.id)
        .order('created_at', { ascending: false });
    
    if (!error) {
        clientData.aiQueue = data;
        updateAIResearchStatus();
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.querySelector('.main-content').classList.toggle('expanded');
}

// Toggle user dropdown
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

// Sign out
async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'login.html';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown').classList.remove('show');
    }
});

// Auto-save on input change
document.addEventListener('input', debounce(async (e) => {
    if (e.target.dataset.field && e.target.dataset.table) {
        await saveField(e.target.dataset.table, e.target.dataset.field, e.target.value);
    }
}, 1000));

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enable/disable edit mode
function toggleEditMode(section) {
    const sectionElement = document.querySelector(`[data-section="${section}"]`);
    const isEditing = sectionElement.classList.toggle('editing');
    
    // Toggle input fields
    sectionElement.querySelectorAll('.field-value').forEach(field => {
        field.contentEditable = isEditing;
    });
    
    // Update button text
    const editButton = sectionElement.querySelector('.edit-button');
    editButton.textContent = isEditing ? 'Save Changes' : 'Edit';
    
    if (!isEditing) {
        // Save all changes
        saveAllChanges(section);
    }
}

// Save all changes in a section
async function saveAllChanges(section) {
    const sectionElement = document.querySelector(`[data-section="${section}"]`);
    const updates = {};
    
    sectionElement.querySelectorAll('[data-field]').forEach(field => {
        const fieldName = field.dataset.field;
        const value = field.textContent.trim();
        updates[fieldName] = value;
    });
    
    await saveField(section, updates);
}

// Placeholder functions for sections not yet implemented
function populateSocialMedia() {
    console.log('Social media section loaded');
}

function populateWebsite() {
    console.log('Website section loaded');
}

function populateGoogleBusiness() {
    console.log('Google Business section loaded');
}

function populateReputation() {
    console.log('Reputation section loaded');
}

function populateReports() {
    console.log('Reports section loaded');
}

function populateBilling() {
    console.log('Billing section loaded');
}

function initializeSocialMediaFeatures() {
    console.log('Social media features initialized');
}

function initializeWebsiteFeatures() {
    console.log('Website features initialized');
}

// Make functions globally available
window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.toggleDropdown = toggleDropdown;
window.signOut = signOut;
window.triggerAIResearch = triggerAIResearch;
window.toggleEditMode = toggleEditMode;
window.populateBrandInfo = populateBrandInfo;
window.initializeBrandInfoFeatures = initializeBrandInfoFeatures;