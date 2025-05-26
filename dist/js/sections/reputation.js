// Reputation Section Module
console.log('Reputation module loaded');

document.addEventListener('DOMContentLoaded', initReputation);

function initReputation() {
    console.log('Initializing reputation section');
    // The individual tabs will handle their own initialization
    // This module is just for section-wide functionality if needed
}

// Export any shared functions that might be needed by tabs
window.reputationUtils = {
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    // Format percentage
    formatPercentage: function(value) {
        return `${Math.round(value)}%`;
    },
    
    // Calculate average rating
    calculateAverageRating: function(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    },
    
    // Get status color
    getStatusColor: function(status) {
        const colors = {
            'active': '#10b981',
            'pending': '#f59e0b',
            'needs_update': '#ef4444',
            'inactive': '#6b7280'
        };
        return colors[status] || colors.inactive;
    }
};
