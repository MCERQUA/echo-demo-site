-- Verification Script for Website Tables
-- Run this after creating the tables to verify everything is set up correctly

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('website_info', 'website_analytics') THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name IN ('website_info', 'website_analytics');

-- Check RLS is enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('website_info', 'website_analytics');

-- Check if test data was inserted
SELECT 
    'website_info' as table_name,
    COUNT(*) as record_count
FROM website_info
UNION ALL
SELECT 
    'website_analytics' as table_name,
    COUNT(*) as record_count
FROM website_analytics;

-- Show sample data from website_info
SELECT 
    website_url,
    platform,
    ssl_status,
    mobile_responsive,
    created_at
FROM website_info
LIMIT 1;

-- Show latest analytics data
SELECT 
    monthly_visitors,
    monthly_pageviews,
    seo_score,
    total_backlinks,
    metric_date
FROM website_analytics
ORDER BY metric_date DESC
LIMIT 5;

-- If you see data in the results above, the website section should now work!
