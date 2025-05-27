# Website Section Setup Guide

## Overview
The Website section of the dashboard requires specific database tables to function properly. This guide will help you set up the necessary tables in your Supabase database.

## Required Tables
1. `website_info` - Stores basic website information
2. `website_analytics` - Stores website metrics and analytics data

## Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to the SQL Editor (usually in the left sidebar)

### Step 2: Run the SQL Script
1. Open the file `docs/website_tables.sql` in this repository
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" to execute the SQL

### Step 3: Verify Tables Were Created
After running the script, you should see the following tables in your database:
- `website_info`
- `website_analytics`

Both tables should have:
- Proper columns for storing website data
- Row Level Security (RLS) enabled
- Policies that allow users to manage their own data
- Automatic timestamp triggers

### Step 4: Test the Website Section
1. Go back to your dashboard
2. Click on the "Website" section in the navigation
3. The Overview tab should now load without errors
4. You should see default values like "Not set" for various fields
5. Click "Edit" to add your website information

## Troubleshooting

### Tables Already Exist Error
If you get an error saying the tables already exist, you can either:
1. Skip the creation (if tables are working properly)
2. Drop and recreate them (WARNING: This will delete any existing data):
```sql
DROP TABLE IF EXISTS website_analytics CASCADE;
DROP TABLE IF EXISTS website_info CASCADE;
```

### Permission Errors
Make sure you're running the SQL as a user with table creation privileges (usually the project owner).

### Website Section Still Not Working
1. Check the browser console for errors
2. Make sure you're logged in to the dashboard
3. Try refreshing the page
4. Verify the tables were created by checking the Table Editor in Supabase

## Database Schema

### website_info Table
- Stores basic website information (URL, domain, platform, etc.)
- One record per user
- Includes fields for SSL status, mobile responsiveness, analytics ID

### website_analytics Table
- Stores website performance metrics
- Can have multiple records per user (for historical data)
- Includes traffic metrics, SEO scores, backlink data

## Next Steps
After setting up the tables, you can:
1. Add your website information
2. View analytics data (once integrated with analytics services)
3. Monitor SEO scores and backlinks
4. Use the quick actions to audit your website

## Support
If you encounter any issues, please check:
1. The browser console for JavaScript errors
2. The Supabase logs for database errors
3. The network tab to see if API calls are failing
