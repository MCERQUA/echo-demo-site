# Dashboard Architecture - NEW MODULAR SYSTEM

## File Structure (Each file under 150 lines)

```
dist/
├── dashboard.html (minimal - just loads core)
├── js/
│   ├── dashboard-core.js (auth + module loader only)
│   ├── sections/
│   │   ├── overview.js
│   │   ├── brand-info.js
│   │   ├── social-media.js
│   │   ├── website.js
│   │   ├── google-business.js
│   │   ├── reputation.js
│   │   ├── reports.js
│   │   ├── billing.js
│   │   └── support.js
│   └── tabs/
│       ├── contact-info.js
│       ├── business-details.js
│       ├── brand-assets.js
│       └── certifications.js
├── sections/
│   ├── overview.html
│   ├── brand-info.html
│   ├── social-media.html
│   ├── website.html
│   ├── google-business.html
│   ├── reputation.html
│   ├── reports.html
│   ├── billing.html
│   ├── support.html
│   └── brand-info/
│       ├── contact-info.html
│       ├── business-details.html
│       ├── brand-assets.html
│       └── certifications.html
```

## How It Works

1. **dashboard.html** - Just the HTML structure + loads dashboard-core.js
2. **dashboard-core.js** - Handles auth + loads section modules dynamically
3. **section modules** - Each handles one section (brand-info, social-media, etc.)
4. **tab modules** - Each handles one tab within a section
5. **HTML templates** - Just HTML, no embedded scripts

## Benefits

- Each file is tiny and focused
- Easy to add new sections/tabs
- No conflicts between modules
- Easy to debug specific features
- Can work on one piece without breaking others

## Adding New Features

To add a new section:
1. Create `sections/new-section.html`
2. Create `js/sections/new-section.js`
3. Add nav link to dashboard.html

To add a tab to brand-info:
1. Create `sections/brand-info/new-tab.html`
2. Create `js/tabs/new-tab.js`
3. Add tab button to brand-info.html

No more giant files!
