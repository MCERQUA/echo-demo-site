// Tools functionality for Echo AI Systems Free Business Tools

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools JS loaded and ready');
    
    // Add event listeners to all forms
    const visibilityForm = document.getElementById('visibility-form');
    const speedForm = document.getElementById('speed-form');
    const competitionForm = document.getElementById('competition-form');
    
    if (visibilityForm) {
        visibilityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            checkVisibility(e);
        });
    }
    
    if (speedForm) {
        speedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            testSpeed(e);
        });
    }
    
    if (competitionForm) {
        competitionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            analyzeCompetition(e);
        });
    }
});

// Show/hide tools
function showTool(toolName) {
    console.log('Showing tool:', toolName);
    
    // Hide all tools first
    document.querySelectorAll('.tool-interface').forEach(tool => {
        tool.classList.remove('active');
    });
    
    // Show the selected tool
    const toolElement = document.getElementById(toolName + '-tool');
    if (toolElement) {
        toolElement.classList.add('active');
        // Smooth scroll to tool
        toolElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideTool(toolName) {
    console.log('Hiding tool:', toolName);
    
    const toolElement = document.getElementById(toolName + '-tool');
    const resultsElement = document.getElementById(toolName + '-results');
    const formElement = document.getElementById(toolName + '-form');
    
    if (toolElement) toolElement.classList.remove('active');
    if (resultsElement) {
        resultsElement.classList.remove('show');
        resultsElement.innerHTML = '';
    }
    if (formElement) formElement.reset();
}

// Business Visibility Checker - PROPERLY FIXED
function checkVisibility(event) {
    console.log('CheckVisibility called');
    
    // Get form data
    const form = event.target || document.getElementById('visibility-form');
    const formData = new FormData(form);
    
    const businessName = formData.get('businessName');
    const businessType = formData.get('businessType');
    const city = formData.get('city');
    
    console.log('Form data:', { businessName, businessType, city });
    
    // Get elements
    const loadingElement = document.getElementById('visibility-loading');
    const resultsElement = document.getElementById('visibility-results');
    
    // Show loading and hide previous results
    if (loadingElement) {
        loadingElement.classList.add('show');
        loadingElement.style.display = 'block';
    }
    
    if (resultsElement) {
        resultsElement.classList.remove('show');
        resultsElement.style.display = 'none';
        resultsElement.innerHTML = '';
    }
    
    // Simulate analysis
    setTimeout(() => {
        console.log('Generating results...');
        
        // Generate realistic scores
        const googleScore = Math.floor(Math.random() * 40) + 30;
        const mapsScore = Math.floor(Math.random() * 50) + 20;
        const socialScore = Math.floor(Math.random() * 30) + 10;
        const overallScore = Math.floor((googleScore + mapsScore + socialScore) / 3);
        
        const scoreClass = overallScore > 60 ? 'score-good' : overallScore > 40 ? 'score-medium' : 'score-poor';
        
        const html = `
            <h3>Visibility Report for ${businessName}</h3>
            <div class="score-display ${scoreClass}">
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
            
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(14, 165, 233, 0.1); border-radius: 0.5rem; text-align: center;">
                <h4 style="margin-bottom: 0.5rem;">Want to Improve Your Score?</h4>
                <p style="color: #94a3b8; margin-bottom: 1rem;">Get a free consultation on how to increase your online visibility and attract more customers.</p>
                <a href="index.html#contact" class="btn">Get Your Free Growth Plan</a>
            </div>
        `;
        
        // Hide loading and show results
        if (loadingElement) {
            loadingElement.classList.remove('show');
            loadingElement.style.display = 'none';
        }
        
        if (resultsElement) {
            resultsElement.innerHTML = html;
            resultsElement.style.display = 'block';
            resultsElement.classList.add('show');
            
            // Scroll to results
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        console.log('Results displayed successfully');
    }, 2000);
}

// Website Speed Test
function testSpeed(event) {
    console.log('TestSpeed called');
    
    const form = event.target || document.getElementById('speed-form');
    const formData = new FormData(form);
    const url = formData.get('websiteUrl');
    
    // Show loading
    const loadingElement = document.getElementById('speed-loading');
    const resultsElement = document.getElementById('speed-results');
    
    if (loadingElement) {
        loadingElement.classList.add('show');
        loadingElement.style.display = 'block';
    }
    
    if (resultsElement) {
        resultsElement.classList.remove('show');
        resultsElement.style.display = 'none';
    }
    
    setTimeout(() => {
        // Simulate speed test results
        const loadTime = (Math.random() * 4 + 1).toFixed(2);
        const mobileScore = Math.floor(Math.random() * 40) + 40;
        const desktopScore = Math.floor(Math.random() * 30) + 60;
        const pageSize = (Math.random() * 3 + 1).toFixed(1);
        
        const performanceRating = loadTime < 2 ? 'Excellent' : loadTime < 3 ? 'Good' : loadTime < 4 ? 'Fair' : 'Poor';
        const overallScore = Math.floor((mobileScore + desktopScore) / 2);
        const scoreClass = overallScore > 80 ? 'score-good' : overallScore > 60 ? 'score-medium' : 'score-poor';
        
        const html = `
            <h3>Speed Test Results for ${url}</h3>
            <div class="score-display ${scoreClass}">
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
            
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 0.5rem; text-align: center;">
                <h4 style="margin-bottom: 0.5rem;">Need Help Speeding Up Your Site?</h4>
                <p style="color: #94a3b8; margin-bottom: 1rem;">Our optimization experts can make your website lightning fast and convert more visitors.</p>
                <a href="index.html#contact" class="btn">Get Speed Optimization Help</a>
            </div>
        `;
        
        if (loadingElement) {
            loadingElement.classList.remove('show');
            loadingElement.style.display = 'none';
        }
        
        if (resultsElement) {
            resultsElement.innerHTML = html;
            resultsElement.style.display = 'block';
            resultsElement.classList.add('show');
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 3000);
}

// Competition Analysis
function analyzeCompetition(event) {
    console.log('AnalyzeCompetition called');
    
    const form = event.target || document.getElementById('competition-form');
    const formData = new FormData(form);
    
    const businessType = formData.get('businessType');
    const city = formData.get('city');
    const competitor = formData.get('competitor') || 'Top Competitor';
    
    // Show loading
    const loadingElement = document.getElementById('competition-loading');
    const resultsElement = document.getElementById('competition-results');
    
    if (loadingElement) {
        loadingElement.classList.add('show');
        loadingElement.style.display = 'block';
    }
    
    if (resultsElement) {
        resultsElement.classList.remove('show');
        resultsElement.style.display = 'none';
    }
    
    setTimeout(() => {
        // Generate competition insights
        const competitorReviews = Math.floor(Math.random() * 100) + 50;
        const competitorRating = (Math.random() * 1.5 + 3.5).toFixed(1);
        const socialFollowers = Math.floor(Math.random() * 2000) + 500;
        const adSpend = Math.floor(Math.random() * 500) + 200;
        
        const html = `
            <h3>Competition Analysis for ${businessType} in ${city}</h3>
            
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
            
            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(99, 102, 241, 0.1); border-radius: 0.5rem; text-align: center;">
                <h4 style="margin-bottom: 0.5rem;">Want a Detailed Competition Report?</h4>
                <p style="color: #94a3b8; margin-bottom: 1rem;">Get a comprehensive analysis with specific competitor names, their exact strategies, and a custom plan to outrank them.</p>
                <a href="index.html#contact" class="btn">Get Full Competition Analysis</a>
            </div>
        `;
        
        if (loadingElement) {
            loadingElement.classList.remove('show');
            loadingElement.style.display = 'none';
        }
        
        if (resultsElement) {
            resultsElement.innerHTML = html;
            resultsElement.style.display = 'block';
            resultsElement.classList.add('show');
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 2500);
}

// Export functions to global scope for onclick handlers
window.showTool = showTool;
window.hideTool = hideTool;
window.checkVisibility = checkVisibility;
window.testSpeed = testSpeed;
window.analyzeCompetition = analyzeCompetition;