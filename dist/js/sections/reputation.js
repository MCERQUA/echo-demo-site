// Reputation Section Module - Uses pre-loaded data
console.log('Reputation module loaded');

// Initialize function to be called by dashboard-core.js
function initReputationSection() {
    console.log('Initializing reputation section');
    
    // Get the pre-loaded data
    const reputationData = window.userData?.reputation || {};
    const reviewsData = window.userData?.reviews || [];
    
    console.log('Using reputation data:', reputationData);
    console.log('Using reviews data:', reviewsData);
    
    // Insert reputation overview content
    insertReputationOverview(reputationData, reviewsData);
    
    // Load the default tab if tab system exists
    if (typeof window.showReputationTab === 'function') {
        window.showReputationTab('overview');
    }
}

function insertReputationOverview(reputationData, reviewsData) {
    const overviewContainer = document.getElementById('reputation-overview');
    if (!overviewContainer) {
        console.log('Reputation overview container not found');
        return;
    }
    
    // Calculate average rating
    const avgRating = calculateAverageRating(reputationData);
    const totalReviews = (reputationData.google_review_count || 0) + 
                        (reputationData.facebook_review_count || 0) + 
                        (reputationData.yelp_review_count || 0);
    
    overviewContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3>Reputation Overview</h3>
                <button class="btn-primary" onclick="showAddReviewModal()" disabled>
                    <i class="fas fa-plus"></i> Add Review
                    <span class="badge">Coming Soon</span>
                </button>
            </div>
            <div class="card-body">
                <div class="reputation-stats">
                    <div class="stat-card">
                        <div class="stat-value">${avgRating > 0 ? avgRating.toFixed(1) : '--'}</div>
                        <div class="stat-label">Average Rating</div>
                        <div class="star-rating">${renderStars(avgRating)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalReviews}</div>
                        <div class="stat-label">Total Reviews</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${reputationData.response_rate || 0}%</div>
                        <div class="stat-label">Response Rate</div>
                    </div>
                </div>

                <div class="platform-breakdown">
                    ${renderPlatformCard('Google', reputationData.google_rating, 
                                        reputationData.google_review_count, 'fa-google')}
                    ${renderPlatformCard('Facebook', reputationData.facebook_rating, 
                                        reputationData.facebook_review_count, 'fa-facebook')}
                    ${renderPlatformCard('Yelp', reputationData.yelp_rating, 
                                        reputationData.yelp_review_count, 'fa-yelp')}
                </div>
            </div>
        </div>
    `;
    
    // Insert recent reviews
    const reviewsContainer = document.getElementById('recent-reviews');
    if (reviewsContainer) {
        reviewsContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Recent Reviews</h3>
                </div>
                <div class="card-body">
                    ${reviewsData.length > 0 ? 
                        reviewsData.map(review => renderReviewCard(review)).join('') :
                        '<p class="no-data">No reviews found yet.</p>'
                    }
                </div>
            </div>
        `;
    }
}

function calculateAverageRating(reputationData) {
    const ratings = [
        { rating: reputationData.google_rating, count: reputationData.google_review_count },
        { rating: reputationData.facebook_rating, count: reputationData.facebook_review_count },
        { rating: reputationData.yelp_rating, count: reputationData.yelp_review_count }
    ].filter(p => p.rating !== null && p.rating !== undefined);

    if (ratings.length === 0) return 0;

    const totalScore = ratings.reduce((sum, p) => sum + (p.rating * (p.count || 0)), 0);
    const totalCount = ratings.reduce((sum, p) => sum + (p.count || 0), 0);

    return totalCount > 0 ? totalScore / totalCount : 0;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return `
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
    `;
}

function renderPlatformCard(platform, rating, count, icon) {
    return `
        <div class="platform-card">
            <div class="platform-header">
                <i class="fab ${icon}"></i>
                <span>${platform}</span>
            </div>
            <div class="platform-stats">
                <div class="rating">${rating !== null && rating !== undefined ? rating.toFixed(1) : '--'}</div>
                <div class="count">${count || 0} reviews</div>
            </div>
            <button class="btn-link" onclick="editPlatformStats('${platform.toLowerCase()}')" disabled>
                Edit <span class="badge-small">Soon</span>
            </button>
        </div>
    `;
}

function renderReviewCard(review) {
    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <strong>${review.reviewer_name || 'Anonymous'}</strong>
                    <span class="platform">${review.platform || 'Unknown'}</span>
                </div>
                <div class="review-date">
                    ${review.review_date ? new Date(review.review_date).toLocaleDateString() : ''}
                </div>
            </div>
            <div class="review-rating">
                ${renderStars(review.rating || 0)}
            </div>
            <div class="review-text">
                ${review.review_text || 'No comment provided'}
            </div>
            ${review.response_text ? `
                <div class="review-response">
                    <strong>Response:</strong> ${review.response_text}
                </div>
            ` : ''}
        </div>
    `;
}

// Stub functions for coming soon features
function showAddReviewModal() {
    showNotification('Add review feature coming soon!', 'info');
}

function editPlatformStats(platform) {
    showNotification(`Edit ${platform} stats coming soon!`, 'info');
}

function showNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    }
}

// Export functions
window.initReputationSection = initReputationSection;
window.showAddReviewModal = showAddReviewModal;
window.editPlatformStats = editPlatformStats;

// Add styles for reputation section
const style = document.createElement('style');
style.textContent = `
    /* Reputation Section Styles */
    .reputation-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        text-align: center;
        padding: 1.5rem;
        background: var(--surface);
        border-radius: 8px;
        border: 1px solid var(--border);
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: var(--primary);
        margin-bottom: 0.5rem;
    }

    .stat-label {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .star-rating {
        color: #f59e0b;
        margin-top: 0.5rem;
        font-size: 1.125rem;
    }

    .platform-breakdown {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .platform-card {
        padding: 1.25rem;
        background: var(--surface);
        border-radius: 8px;
        border: 1px solid var(--border);
    }

    .platform-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }

    .platform-stats {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 1rem;
    }

    .platform-stats .rating {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary);
    }

    .platform-stats .count {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .review-card {
        padding: 1.25rem;
        margin-bottom: 1rem;
        background: var(--surface);
        border-radius: 8px;
        border: 1px solid var(--border);
    }

    .review-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }

    .reviewer-info .platform {
        display: inline-block;
        background: var(--primary-light);
        color: var(--primary);
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-left: 0.5rem;
    }

    .review-date {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .review-rating {
        color: #f59e0b;
        margin-bottom: 0.75rem;
    }

    .review-text {
        color: var(--text-primary);
        line-height: 1.6;
    }

    .review-response {
        margin-top: 1rem;
        padding: 0.75rem;
        background: rgba(26, 115, 232, 0.1);
        border-radius: 6px;
        border-left: 3px solid var(--primary);
    }

    .no-data {
        text-align: center;
        color: var(--text-secondary);
        padding: 2rem;
    }

    .badge {
        display: inline-block;
        background: #f97316;
        color: white;
        font-size: 0.625rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 12px;
        margin-left: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        vertical-align: middle;
    }

    .badge-small {
        display: inline-block;
        background: #f97316;
        color: white;
        font-size: 0.5rem;
        font-weight: 600;
        padding: 0.125rem 0.375rem;
        border-radius: 10px;
        margin-left: 0.375rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        vertical-align: middle;
    }

    .btn-link:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Make sure the reputation functions are available globally
if (!window.showReputationTab) {
    console.log('Setting up reputation tab functions');
    
    // Store loaded tabs to avoid reloading
    const loadedReputationTabs = {};
    
    // Load tab content dynamically
    async function loadReputationTabContent(tabName) {
        if (loadedReputationTabs[tabName]) {
            return loadedReputationTabs[tabName];
        }
        
        // Map tab names to file names
        const fileMap = {
            'overview': 'reputation-overview.html',
            'reviews': 'reviews.html',
            'citations': 'citations.html'
        };
        
        const fileName = fileMap[tabName] || tabName + '.html';
        
        try {
            const response = await fetch(`/sections/reputation/${fileName}`);
            if (!response.ok) throw new Error('Failed to load tab');
            
            const content = await response.text();
            loadedReputationTabs[tabName] = content;
            return content;
        } catch (error) {
            console.error(`Error loading ${tabName} tab:`, error);
            return '<div class="error-state">Failed to load content. Please refresh the page.</div>';
        }
    }
    
    // Show specific tab
    async function showReputationTab(tabName) {
        console.log('Showing reputation tab:', tabName);
        
        // Update button states
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Find the clicked button
        const clickedButton = document.querySelector(`[onclick="showReputationTab('${tabName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
        
        // Load and display tab content
        const container = document.getElementById('reputation-tabs');
        if (!container) {
            console.error('Reputation tabs container not found');
            return;
        }
        
        container.innerHTML = '<div class="loading-state">Loading...</div>';
        
        const content = await loadReputationTabContent(tabName);
        container.innerHTML = content;
        
        // Initialize tab-specific features
        initializeReputationTabFeatures(tabName);
    }
    
    // Initialize features for specific tabs
    function initializeReputationTabFeatures(tabName) {
        console.log('Initializing features for:', tabName);
        
        if (tabName === 'citations') {
            // The citations.html file has its own script that defines loadCitationsData
            // We need to wait a bit for the script to be parsed and executed
            setTimeout(() => {
                if (typeof window.loadCitationsData === 'function') {
                    console.log('Loading citations data...');
                    window.loadCitationsData();
                } else {
                    console.error('loadCitationsData function not found');
                }
            }, 100);
        }
    }
    
    // Make functions globally available
    window.showReputationTab = showReputationTab;
    window.loadReputationTabContent = loadReputationTabContent;
    window.initializeReputationTabFeatures = initializeReputationTabFeatures;
}

// Export for module usage
window.initReputation = initReputation;