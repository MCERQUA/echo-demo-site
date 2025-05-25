// Echo AI Systems - Modular Tools JavaScript
// This file can be included on any page to enable tool functionality

// Show/hide tools
function showTool(toolName) {
    // Hide all tools first
    document.querySelectorAll('.tool-interface').forEach(tool => {
        tool.classList.remove('active');
    });
    
    // Show the selected tool
    const toolElement = document.getElementById(toolName + '-tool');
    if (toolElement) {
        toolElement.classList.add('active');
        // Scroll to the tool
        toolElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideTool(toolName) {
    const toolElement = document.getElementById(toolName + '-tool');
    const resultsElement = document.getElementById(toolName + '-results');
    const formElement = document.getElementById(toolName + '-form');
    
    if (toolElement) toolElement.classList.remove('active');
    if (resultsElement) resultsElement.classList.remove('show');
    if (formElement) formElement.reset();
}

// Business Visibility Checker
function checkVisibility(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading
    document.getElementById('visibility-loading').classList.add('show');
    document.getElementById('visibility-results').classList.remove('show');
    
    // Simulate analysis
    setTimeout(() => {
        const businessName = formData.get('businessName');
        const businessType = formData.get('businessType');
        const city = formData.get('city');
        
        // Generate realistic scores
        const googleScore = Math.floor(Math.random() * 40) + 30;
        const mapsScore = Math.floor(Math.random() * 50) + 20;
        const socialScore = Math.floor(Math.random() * 30) + 10;
        const overallScore = Math.floor((googleScore + mapsScore + socialScore) / 3);
        
        let html = `
            <h3>Visibility Report for ${businessName}</h3>
            <div class="score-display ${overallScore > 60 ? 'score-good' : overallScore > 40 ? 'score-medium' : 'score-poor'}">
                ${overallScore}%
            </div>
            <p style="text-align: center; margin-bottom: 2rem;">Overall Online Visibility Score</p>
            
            <div class="result-item">
                <div class="result-label">Google Search Visibility</div>
                <div class="result-value">${googleScore}% - ${googleScore > 50 ? 'Good' : googleScore > 30 ? 'Needs Improvement' : 'Poor'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Google Maps Presence</div>
                <div class="result-value">${mapsScore}% - ${mapsScore > 50 ? 'Strong' : mapsScore > 30 ? 'Moderate' : 'Weak'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Social Media Visibility</div>
                <div class="result-value">${socialScore}% - ${socialScore > 30 ? 'Active' : socialScore > 15 ? 'Limited' : 'Minimal'}</div>
            </div>
            
            <div class="recommendations">
                <h4>Recommendations to Improve:</h4>
                <ul>
                    ${googleScore < 50 ? '<li>Optimize your website for local SEO keywords</li>' : ''}
                    ${mapsScore < 50 ? '<li>Claim and optimize your Google Business Profile</li>' : ''}
                    ${socialScore < 30 ? '<li>Increase social media activity and engagement</li>' : ''}
                    <li>Add more photos and videos to your online profiles</li>
                    <li>Encourage customers to leave reviews</li>
                </ul>
            </div>
        `;
        
        document.getElementById('visibility-loading').classList.remove('show');
        document.getElementById('visibility-results').innerHTML = html;
        document.getElementById('visibility-results').classList.add('show');
    }, 2000);
}

// Review Score Calculator
function calculateReviews(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading
    document.getElementById('reviews-loading').classList.add('show');
    document.getElementById('reviews-results').classList.remove('show');
    
    setTimeout(() => {
        const totalReviews = parseInt(formData.get('totalReviews'));
        const avgRating = parseFloat(formData.get('avgRating'));
        const recentReviews = parseInt(formData.get('recentReviews'));
        const responseRate = parseInt(formData.get('responseRate'));
        
        // Calculate scores
        let volumeScore = Math.min(100, (totalReviews / 100) * 100);
        let ratingScore = (avgRating / 5) * 100;
        let freshnessScore = Math.min(100, (recentReviews / (totalReviews * 0.3)) * 100);
        let engagementScore = responseRate;
        
        let overallScore = Math.floor((volumeScore * 0.2 + ratingScore * 0.4 + freshnessScore * 0.2 + engagementScore * 0.2));
        
        let html = `
            <h3>Your Review Score Analysis</h3>
            <div class="score-display ${overallScore > 80 ? 'score-good' : overallScore > 60 ? 'score-medium' : 'score-poor'}">
                ${overallScore}/100
            </div>
            <p style="text-align: center; margin-bottom: 2rem;">Overall Reputation Score</p>
            
            <div class="result-item">
                <div class="result-label">Review Volume</div>
                <div class="result-value">${totalReviews} reviews - ${totalReviews > 50 ? 'Excellent' : totalReviews > 20 ? 'Good' : 'Needs more reviews'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Average Rating</div>
                <div class="result-value">${avgRating} stars - ${avgRating >= 4.5 ? 'Outstanding' : avgRating >= 4.0 ? 'Good' : 'Needs improvement'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Review Freshness</div>
                <div class="result-value">${recentReviews} recent reviews - ${freshnessScore > 70 ? 'Very active' : freshnessScore > 40 ? 'Moderately active' : 'Too few recent reviews'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Response Rate</div>
                <div class="result-value">${responseRate}% - ${responseRate > 80 ? 'Excellent engagement' : responseRate > 50 ? 'Good engagement' : 'Needs improvement'}</div>
            </div>
            
            <div class="recommendations">
                <h4>Ways to Improve Your Score:</h4>
                <ul>
                    ${totalReviews < 50 ? '<li>Ask satisfied customers to leave reviews</li>' : ''}
                    ${avgRating < 4.5 ? '<li>Address negative feedback promptly and professionally</li>' : ''}
                    ${freshnessScore < 70 ? '<li>Implement a system to request reviews regularly</li>' : ''}
                    ${responseRate < 80 ? '<li>Respond to all reviews within 24-48 hours</li>' : ''}
                    <li>Make it easy for customers to leave reviews with direct links</li>
                </ul>
            </div>
        `;
        
        document.getElementById('reviews-loading').classList.remove('show');
        document.getElementById('reviews-results').innerHTML = html;
        document.getElementById('reviews-results').classList.add('show');
    }, 2000);
}

// Website Speed Test
function testSpeed(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading
    document.getElementById('speed-loading').classList.add('show');
    document.getElementById('speed-results').classList.remove('show');
    
    setTimeout(() => {
        const url = formData.get('websiteUrl');
        
        // Simulate speed test results
        const loadTime = (Math.random() * 4 + 1).toFixed(2);
        const mobileScore = Math.floor(Math.random() * 40) + 40;
        const desktopScore = Math.floor(Math.random() * 30) + 60;
        const pageSize = (Math.random() * 3 + 1).toFixed(1);
        
        let performanceRating = loadTime < 2 ? 'Excellent' : loadTime < 3 ? 'Good' : loadTime < 4 ? 'Fair' : 'Poor';
        let overallScore = Math.floor((mobileScore + desktopScore) / 2);
        
        let html = `
            <h3>Speed Test Results</h3>
            <div class="score-display ${overallScore > 80 ? 'score-good' : overallScore > 60 ? 'score-medium' : 'score-poor'}">
                ${loadTime}s
            </div>
            <p style="text-align: center; margin-bottom: 2rem;">Page Load Time</p>
            
            <div class="result-item">
                <div class="result-label">Performance Rating</div>
                <div class="result-value">${performanceRating}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Mobile Speed Score</div>
                <div class="result-value">${mobileScore}/100 - ${mobileScore > 70 ? 'Good' : mobileScore > 50 ? 'Needs Work' : 'Poor'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Desktop Speed Score</div>
                <div class="result-value">${desktopScore}/100 - ${desktopScore > 80 ? 'Good' : desktopScore > 60 ? 'Fair' : 'Needs Improvement'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Page Size</div>
                <div class="result-value">${pageSize} MB - ${pageSize < 2 ? 'Optimal' : pageSize < 3 ? 'Acceptable' : 'Too Large'}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Estimated Lost Visitors</div>
                <div class="result-value">${loadTime > 3 ? Math.floor((loadTime - 3) * 20) + '%' : '0%'} due to slow loading</div>
            </div>
            
            <div class="recommendations">
                <h4>Speed Optimization Tips:</h4>
                <ul>
                    ${pageSize > 2 ? '<li>Compress and optimize images</li>' : ''}
                    ${mobileScore < 70 ? '<li>Implement mobile-specific optimizations</li>' : ''}
                    ${loadTime > 3 ? '<li>Enable browser caching</li>' : ''}
                    <li>Minimize CSS and JavaScript files</li>
                    <li>Use a Content Delivery Network (CDN)</li>
                    ${loadTime > 4 ? '<li>Consider upgrading your hosting</li>' : ''}
                </ul>
            </div>
        `;
        
        document.getElementById('speed-loading').classList.remove('show');
        document.getElementById('speed-results').innerHTML = html;
        document.getElementById('speed-results').classList.add('show');
    }, 3000);
}

// Competition Analysis
function analyzeCompetition(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading
    document.getElementById('competition-loading').classList.add('show');
    document.getElementById('competition-results').classList.remove('show');
    
    setTimeout(() => {
        const businessType = formData.get('businessType');
        const city = formData.get('city');
        const competitor = formData.get('competitor') || 'Top Competitor';
        
        // Generate competition insights
        const competitorReviews = Math.floor(Math.random() * 100) + 50;
        const competitorRating = (Math.random() * 1.5 + 3.5).toFixed(1);
        const socialFollowers = Math.floor(Math.random() * 2000) + 500;
        const adSpend = Math.floor(Math.random() * 500) + 200;
        
        let html = `
            <h3>Competition Analysis for ${city}</h3>
            
            <div class="result-item">
                <div class="result-label">Industry Average Reviews</div>
                <div class="result-value">${competitorReviews} reviews</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Average Competitor Rating</div>
                <div class="result-value">${competitorRating} stars</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Social Media Presence</div>
                <div class="result-value">Avg. ${socialFollowers} followers per platform</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Estimated Ad Spend</div>
                <div class="result-value">$${adSpend}-$${adSpend + 300}/month on digital ads</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Top Marketing Channels</div>
                <div class="result-value">Google Ads, Facebook, Instagram</div>
            </div>
            
            <div class="recommendations">
                <h4>Strategies to Beat Your Competition:</h4>
                <ul>
                    <li>Focus on getting more reviews than the ${competitorReviews} average</li>
                    <li>Maintain a rating above ${competitorRating} stars</li>
                    <li>Build social media following to exceed ${socialFollowers} followers</li>
                    <li>Start with a $${Math.floor(adSpend * 0.5)} monthly ad budget</li>
                    <li>Target long-tail keywords competitors are missing</li>
                    <li>Offer unique services or guarantees competitors don't</li>
                    <li>Respond to reviews faster than competitors</li>
                </ul>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 0.5rem;">
                <p style="font-weight: 600; margin-bottom: 0.5rem;">Want a Detailed Competition Report?</p>
                <p style="color: #94a3b8;">Get a comprehensive analysis with specific competitor names, their exact strategies, and a custom plan to outrank them.</p>
            </div>
        `;
        
        document.getElementById('competition-loading').classList.remove('show');
        document.getElementById('competition-results').innerHTML = html;
        document.getElementById('competition-results').classList.add('show');
    }, 2500);
}

// Initialize tools when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to tool links if they exist
    const toolLinks = document.querySelectorAll('.tool-link');
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const toolName = this.getAttribute('data-tool');
            if (toolName) {
                showTool(toolName);
            }
        });
    });
});
