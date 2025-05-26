# Reputation Management Setup Guide

## Quick Setup Instructions

### 1. Run the Database Schema

First, you need to create the citations table in your Supabase database:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `docs/citations_table.sql`
4. Click "Run" to create the table

### 2. Access the Reputation Section

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
- Empty table by default (no fake data)
- Add citations manually using the "+ Add Citation" button
- Track for each citation:
  - Site Name
  - Username (optional)
  - Password (securely hidden by default)
  - Live profile URL
  - Whether it has reviews
  - Reviews URL (if applicable)
  - Status (pending/active/needs update/inactive)
  - Notes
- Edit or delete any citation
- Passwords can be shown/hidden with toggle button

## Adding Citations

You have two options for adding citations:

### Option 1: Add Manually via Dashboard
1. Click the "+ Add Citation" button
2. Fill in the citation details
3. Save to add it to your table

### Option 2: Add via Supabase (or have Echo add them)
Citations can be added directly to Supabase and will automatically appear in the dashboard.

## Managing Citations

- Click the ✏️ icon to edit any citation
- Click the 🗑️ icon to delete a citation
- Use the "Show" button to reveal passwords when needed
- Update the status as you create or claim each listing
- Add notes for any special instructions or reminders

## Data Security

- All data is stored in your Supabase database
- Passwords are hidden by default in the interface
- Only you can see your own citations (Row Level Security)
- Data is loaded in real-time from Supabase
