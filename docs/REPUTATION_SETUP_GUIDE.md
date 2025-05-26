# Reputation Management Setup Guide

## Quick Setup Instructions

### 1. Run the Database Schema

First, you need to create the citations table in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `docs/citations_table.sql`
4. Click "Run" to create the table

### 2. (Optional) Initialize Default Citations

If you want to pre-populate the citations with common directory sites:

1. Copy and paste the contents of `docs/initialize_citations.sql`
2. Run it in the SQL Editor
3. This will create functions to automatically add default citations

### 3. Access the Reputation Section

1. Log into your Echo AI Systems dashboard
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

### Citations Tab
- Pre-populated with 29 common directory sites including:
  - Google Business Profile
  - Yelp
  - Facebook Business
  - Bing Places
  - Apple Maps
  - Industry-specific directories
  - And many more!
- Track username/password (securely hidden)
- Live profile URLs
- Review availability
- Status tracking (pending/active/needs update/inactive)

## Automatic Population

When you first access the Citations tab:
1. The system checks if you have any existing citations
2. If none exist, it automatically creates entries for 29 common directory sites
3. All citations start with "Pending" status
4. You can then update each one with your actual information

## Managing Citations

- Click the ✏️ icon to edit any citation
- Add your username, password, and live URL
- Update the status as you claim/create each listing
- Use the notes field for any special instructions
- Passwords are hidden by default but can be revealed with the "Show" button

## Next Steps

1. Review the pre-populated citations
2. Start with the most important ones (Google Business Profile, Yelp, Facebook)
3. Update each citation as you create or claim your listings
4. Keep track of which directories have reviews
5. Monitor your reputation metrics in the Overview tab
