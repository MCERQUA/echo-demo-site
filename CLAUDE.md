# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Echo AI Systems Dashboard - A modular web application for managing digital marketing services including website management, reputation monitoring, social media, and business intelligence.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (no build process)
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **Deployment**: Netlify (automatic deployment from main branch)
- **Authentication**: Supabase Auth
- **File Structure**: Modular architecture with <150 lines per file

## Development Commands

### Local Development
```bash
# No build process needed - files are served directly
# Open dist/index.html in a browser for the main site
# Open dist/dashboard.html for the dashboard

# For local HTTP server (optional):
python -m http.server 8000
# or
npx http-server
```

### Testing
```bash
# No automated tests currently
# Manual testing via browser console
# Check for JavaScript errors in console
# Verify Supabase connection with test queries
```

### Deployment
```bash
# Automatic deployment on push to main branch
git add .
git commit -m "Your commit message"
git push origin main

# Check deployment status at:
# https://app.netlify.com/sites/echo-demo-site/deploys
```

## Architecture & Code Organization

### Modular Dashboard System
The dashboard uses a modular architecture where each feature is isolated:

```
dist/
├── dashboard.html          # Minimal shell that loads modules
├── js/
│   ├── dashboard-core.js   # Authentication and module loader only
│   ├── sections/          # Main dashboard sections (one per feature)
│   │   ├── overview.js
│   │   ├── brand-info.js
│   │   ├── website.js
│   │   └── reputation.js
│   └── tabs/              # Sub-features within sections
│       ├── contact-info.js
│       └── website-overview.js
└── sections/              # HTML templates for each section
```

### Key Design Principles
1. **File Size Limit**: No file exceeds 150 lines
2. **Single Responsibility**: Each module handles one feature
3. **No Cross-Dependencies**: Modules are independent
4. **Data Flow**: All data operations go through `window.supabase`

### Database Schema
The application uses these primary tables:
- `clients` - Main client accounts (linked to auth.users)
- `business_info` - Business details and industry info
- `contact_info` - Contact information and addresses
- `brand_assets` - Logos, colors, brand guidelines
- `website_info` - Website configuration and metrics
- `website_analytics` - Performance tracking data
- `online_reputation` - Review aggregation data
- `reviews` - Individual review records

All tables use Row Level Security (RLS) policies based on user_id or client_id.

## Critical Implementation Details

### Authentication Flow
1. User logs in via Supabase Auth
2. `dashboard-core.js` verifies session
3. Client record is created/retrieved from `clients` table
4. User data stored in `window.userData`
5. Modules use `client_id` for all data queries

### Module Loading Pattern
```javascript
// Each module follows this pattern:
console.log('[ModuleName] module loaded');

// Initialize function to be called by dashboard-core.js
function initWebsiteSection() {
    console.log('Initializing website section');
    
    // CRITICAL: Use pre-loaded data from window.userData
    const websiteData = window.userData?.websiteInfo || {};
    console.log('Using website data:', websiteData);
    
    // Insert content immediately - don't wait for async operations
    insertWebsiteContent(websiteData);
}

function insertWebsiteContent(websiteData) {
    const container = document.getElementById('website-config');
    if (container) {
        container.innerHTML = `
            <div class="card">
                <form id="website-config-form">
                    <input type="url" name="website_url" 
                           value="${websiteData.website_url || ''}" disabled>
                    <!-- More fields with actual data -->
                </form>
            </div>
        `;
    }
}

// Export functions to window for global access
window.initWebsiteSection = initWebsiteSection;
```

### Critical Data Flow Pattern
⚠️ **IMPORTANT**: dashboard-core.js pre-loads ALL data at startup into `window.userData`:
```javascript
window.userData = {
    businessInfo: {},      // from business_info table
    contactInfo: {},       // from contact_info table  
    brandAssets: {},       // from brand_assets table
    websiteInfo: {},       // from website_info table
    reputation: {},        // from online_reputation table
}
```

**DO NOT reload data from Supabase in section modules!** Use the pre-loaded data instead.

### What Works vs What Fails

#### ✅ CORRECT Pattern:
```javascript
function initSection() {
    // Use pre-loaded data
    const data = window.userData?.websiteInfo || {};
    
    // Insert HTML immediately
    const container = document.getElementById('container-id');
    if (container) {
        container.innerHTML = `<input value="${data.field || ''}" disabled>`;
    }
}
```

#### ❌ INCORRECT Pattern (Causes Race Conditions):
```javascript
async function initSection() {
    // DON'T reload data that's already loaded!
    const { data } = await supabase.from('table').select('*');
    
    // DON'T create manager classes
    window.sectionManager = new SectionManager();
    
    // DON'T wait for promises before rendering
    await this.loadData();
}
```

### Data Operations
- Always check for existing client record first
- Use `client_id` (not `user_id`) for data queries
- Use pre-loaded data from `window.userData` for display
- Only query Supabase when saving changes
- Handle empty/missing data gracefully
- Show user-friendly error messages
- Log errors to console for debugging

## Common Development Tasks

### Adding a New Dashboard Section
1. Create HTML template: `dist/sections/new-section.html`
2. Create JS module: `dist/js/sections/new-section.js`
3. Add navigation link in `dashboard.html`
4. Follow the module template pattern

### Debugging Dashboard Issues
1. Check browser console for errors
2. Verify Supabase connection: `console.log(window.supabase)`
3. Check authentication: `await window.supabase.auth.getSession()`
4. Verify client record exists in database
5. Check RLS policies in Supabase dashboard

### Updating Database Schema
1. Make changes in Supabase SQL editor
2. Update corresponding JS modules
3. Test with existing and new users
4. Update documentation if needed

## Environment Variables

The application uses these Supabase credentials (hardcoded in JS files):
- `SUPABASE_URL`: Project URL from Supabase dashboard
- `SUPABASE_ANON_KEY`: Anonymous/public key from Supabase

These are safe to expose as Row Level Security protects the data.

## Troubleshooting Guide

### Dashboard Not Loading
- Check console for module loading messages
- Verify all script tags in dashboard.html
- Ensure Supabase credentials are correct
- Check if `window.userData` is populated: `console.log(window.userData)`

### Data Not Displaying (Most Common Issue)
**Problem**: Sections show "Loading..." or empty fields despite data existing

**Solution**: Use pre-loaded data from `window.userData` instead of reloading:
```javascript
// Check what data is available
console.log('Available data:', window.userData);

// Use it directly in your module
const websiteData = window.userData?.websiteInfo || {};
```

### Module Timing Issues
**Problem**: "Cannot read property of undefined" errors

**Causes & Solutions**:
1. Module initializing before DOM ready → Use `initWebsiteSection` pattern
2. Module initializing before data loaded → Use pre-loaded `window.userData`
3. Container not found → Wait for `dashboard-core.js` to load HTML first

### Data Not Saving
- Check network tab for failed requests
- Verify RLS policies allow INSERT/UPDATE
- Ensure client_id is being passed correctly
- Check for validation errors in form data
- Use `.upsert()` instead of `.insert()` for existing records

### Authentication Issues
- Clear browser cache/cookies
- Check Supabase Auth settings
- Verify email confirmation if required
- Check for session expiration

### Common Anti-Patterns That Cause Issues
1. **Creating Manager Classes**: Complex objects with async initialization
2. **Reloading Data**: Querying Supabase when data is already in `window.userData`
3. **Waiting for Promises**: Delaying UI rendering for async operations
4. **Auto-initialization**: Using `DOMContentLoaded` instead of explicit init calls
5. **Missing Containers**: Not checking if DOM elements exist before using them

## Performance Considerations

- Modules load on-demand to reduce initial load time
- Use browser caching for static assets
- Minimize API calls by caching data in memory
- Batch database operations when possible

## Security Notes

- All data access controlled by Row Level Security
- No sensitive data in client-side code
- API keys are public (anon key) by design
- User sessions expire after inactivity
- Form inputs should be validated before saving

## Dashboard Implementation Best Practices

### Key Lessons Learned

1. **Data is Pre-loaded**: `dashboard-core.js` loads all user data at startup into `window.userData`. Section modules should use this data instead of reloading from Supabase.

2. **Simple is Better**: Static HTML with data interpolation works better than complex JavaScript manager classes with async initialization.

3. **Check Console First**: Always check `console.log(window.userData)` to see what data is available before trying to load it again.

4. **Immediate Rendering**: Insert HTML content immediately with available data. Don't wait for promises or async operations.

5. **Explicit Initialization**: Use explicit init functions called by `dashboard-core.js` rather than auto-initialization with DOMContentLoaded.

### Working Pattern Example
```javascript
// website.js - CORRECT implementation
function initWebsiteSection() {
    const websiteData = window.userData?.websiteInfo || {};
    const container = document.getElementById('website-config');
    
    if (container) {
        container.innerHTML = `
            <form>
                <input value="${websiteData.website_url || ''}" disabled>
            </form>
        `;
    }
}

window.initWebsiteSection = initWebsiteSection;
```

### Section Status Reference
- ✅ Overview: Working
- ✅ Brand Info: Working (follows correct pattern)
- ✅ Website: Fixed (now uses pre-loaded data)
- ⚠️ Reputation: Needs same fix as Website
- ❌ Social Media: Shows fallback (missing JS file)
- ❌ Google Business: Shows fallback (missing JS file)