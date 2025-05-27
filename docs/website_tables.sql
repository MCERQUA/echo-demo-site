-- Website Information and Analytics Tables
-- These tables are required for the Website section of the dashboard

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Website Information Table
CREATE TABLE IF NOT EXISTS website_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Basic Website Info
    website_url VARCHAR(255),
    primary_domain VARCHAR(255),
    platform VARCHAR(100),
    ssl_status VARCHAR(50) DEFAULT 'Active',
    mobile_responsive VARCHAR(50) DEFAULT 'Yes',
    
    -- Technical Details
    analytics_id VARCHAR(100),
    sitemap_url VARCHAR(255),
    robots_txt_url VARCHAR(255),
    
    -- Status Information
    last_updated DATE,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Website Analytics Table
CREATE TABLE IF NOT EXISTS website_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    
    -- Traffic Metrics
    monthly_visitors INTEGER DEFAULT 0,
    monthly_pageviews INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    
    -- SEO Metrics
    seo_score INTEGER DEFAULT 0,
    technical_seo_score INTEGER DEFAULT 0,
    content_score INTEGER DEFAULT 0,
    
    -- Backlink Metrics
    total_backlinks INTEGER DEFAULT 0,
    referring_domains INTEGER DEFAULT 0,
    domain_authority INTEGER DEFAULT 0,
    
    -- Performance Metrics
    page_speed_score INTEGER DEFAULT 0,
    mobile_speed_score INTEGER DEFAULT 0,
    
    -- Time Period
    period_start DATE,
    period_end DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_website_info_user_id ON website_info(user_id);
CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_created_at ON website_analytics(created_at);

-- Enable Row Level Security
ALTER TABLE website_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for website_info
CREATE POLICY "Users can view own website info" 
    ON website_info FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website info" 
    ON website_info FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website info" 
    ON website_info FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own website info" 
    ON website_info FOR DELETE 
    USING (auth.uid() = user_id);

-- Create RLS Policies for website_analytics
CREATE POLICY "Users can view own website analytics" 
    ON website_analytics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website analytics" 
    ON website_analytics FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website analytics" 
    ON website_analytics FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own website analytics" 
    ON website_analytics FOR DELETE 
    USING (auth.uid() = user_id);

-- Create update timestamp trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update the updated_at timestamp
CREATE TRIGGER update_website_info_updated_at BEFORE UPDATE ON website_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_analytics_updated_at BEFORE UPDATE ON website_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional - remove in production)
-- This will only insert if the user exists
/*
INSERT INTO website_info (user_id, website_url, primary_domain, platform, analytics_id, sitemap_url)
SELECT 
    id,
    'https://example.com',
    'example.com',
    'WordPress',
    'GA-123456789',
    'https://example.com/sitemap.xml'
FROM auth.users
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO website_analytics (user_id, monthly_visitors, monthly_pageviews, seo_score, technical_seo_score, content_score, total_backlinks, referring_domains)
SELECT 
    id,
    1250,
    3750,
    82,
    88,
    76,
    145,
    23
FROM auth.users
LIMIT 1;
*/
