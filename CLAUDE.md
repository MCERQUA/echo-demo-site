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

document.addEventListener('DOMContentLoaded', initModule);

function initModule() {
    // 1. Get client_id from session
    // 2. Load module-specific data
    // 3. Populate UI
    // 4. Attach event handlers
}

// Export functions to window for global access
window.functionName = functionName;
```

### Data Operations
- Always check for existing client record first
- Use `client_id` (not `user_id`) for data queries
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

### Data Not Saving
- Check network tab for failed requests
- Verify RLS policies allow INSERT/UPDATE
- Ensure client_id is being passed correctly
- Check for validation errors in form data

### Authentication Issues
- Clear browser cache/cookies
- Check Supabase Auth settings
- Verify email confirmation if required
- Check for session expiration

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