# Reputation Management Setup Guide
*Updated: May 27, 2025*

## Quick Setup Instructions

### 1. Run the Database Schema

First, you need to create the citations table in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `docs/citations_table.sql`
4. Click "Run" to create the table

### 2. Access the Reputation Section

1. Log into your Echo AI Systems dashboard at https://echoaisystem.com/dashboard
2. Click on "Reputation" in the sidebar
3. Navigate through the three tabs:
   - **Overview**: See your overall reputation metrics
   - **Reviews**: Manage review platforms
   - **Directory Citations**: Manage your business listings

## Features

### Overview Tab
- Average rating across all platforms
- Total review count
- Active citations count
- Response rate metrics
- Recent activity feed
- Platform summary

### Reviews Tab
- Add/edit review platforms
- Track ratings and review counts
- Monitor trending (up/down)
- Quick links to profiles

### Directory Citations Tab (Fixed May 27, 2025)
- Clean table interface similar to Business Info tab
- Add citations using the "+ Add Citation" button
- Track for each citation:
  - Directory Name (e.g., Yelp, Yellow Pages)
  - Directory URL
  - Username (optional)
  - Password (securely hidden by default with show/hide toggle)
  - Status (Active/Pending/Inactive)
- Edit or delete any citation with action buttons
- Real-time data sync with Supabase
- Error handling for missing database tables

## Adding Citations

### Via Dashboard Interface
1. Click the "+ Add Citation" button
2. Fill in the citation details in the modal form:
   - Directory Name (required)
   - Directory URL (optional)
   - Username and Password (optional)
   - Status (defaults to Active)
3. Click "Save Citation" to add to your table

### Via Supabase Direct Entry
Citations can be added directly to the `directory_citations` table in Supabase and will automatically appear in the dashboard.

## Managing Citations

- **Edit**: Click the ✏️ icon to modify any citation
- **Delete**: Click the 🗑️ icon to remove a citation (with confirmation)
- **View Passwords**: Use the "Show" button to reveal passwords when needed
- **Update Status**: Track citation status as Active, Pending, or Inactive
- **Quick Links**: Click URLs to open directories in new tabs

## Technical Implementation Details

### Architecture
- **Modular Design**: Reputation section uses independent modules
- **File Structure**:
  - `dist/sections/reputation.html` - Main reputation container
  - `dist/sections/reputation/citations.html` - Citations tab content
  - `dist/js/sections/reputation.js` - Module initialization
- **Dynamic Loading**: Tab content loads on demand for performance

### Data Flow
1. User clicks Reputation → loads reputation.html
2. User clicks Citations tab → loads citations.html
3. Script initializes → calls loadCitationsData()
4. Data fetched from Supabase → displayed in table
5. CRUD operations → update Supabase in real-time

### Error Handling
- Missing database table shows setup instructions
- Failed data loads show user-friendly error messages
- Network errors handled gracefully with retry options

## Data Security

- **Row Level Security**: Only authenticated users see their own citations
- **Password Protection**: Passwords hidden by default in the interface
- **Secure Storage**: All data encrypted in Supabase database
- **Session Management**: Auto-logout on session expiration

## Troubleshooting

### Citations Not Loading
1. Check browser console for errors
2. Verify database table exists (run citations_table.sql)
3. Confirm user is authenticated
4. Check Supabase connection

### Modal Not Opening
1. Clear browser cache
2. Check for JavaScript errors
3. Ensure all files loaded properly

### Data Not Saving
1. Verify Supabase RLS policies
2. Check network connection
3. Confirm all required fields filled

## Recent Updates (May 27, 2025)
- Fixed tab initialization issues
- Improved data loading timing
- Simplified UI to match Business Info pattern
- Enhanced error messages for better UX
- Added proper module initialization
- Standardized styling across all tabs
