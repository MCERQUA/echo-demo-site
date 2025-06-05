-- Website Section Tables for Echo AI Systems Dashboard
-- These tables store website information and analytics data

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS website_analytics CASCADE;
DROP TABLE IF EXISTS website_info CASCADE;

-- Website Information Table
CREATE TABLE website_info (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    website_url TEXT,
    primary_domain TEXT,
    platform TEXT,
    ssl_status TEXT DEFAULT 'Unknown',
    mobile_responsive TEXT DEFAULT 'Unknown',
    analytics_id TEXT,
    sitemap_url TEXT,
    last_updated TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Website Analytics Table
CREATE TABLE website_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    monthly_visitors INTEGER DEFAULT 0,
    monthly_pageviews INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    technical_seo_score INTEGER DEFAULT 0,
    content_score INTEGER DEFAULT 0,
    total_backlinks INTEGER DEFAULT 0,
    referring_domains INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    avg_session_duration INTEGER,
    pages_per_session DECIMAL(4,2),
    metric_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_website_info_user_id ON website_info(user_id);
CREATE INDEX idx_website_info_client_id ON website_info(client_id);
CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_client_id ON website_analytics(client_id);
CREATE INDEX idx_website_analytics_metric_date ON website_analytics(metric_date);

-- Row Level Security (RLS) Policies
ALTER TABLE website_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for website_info
CREATE POLICY "Users can view own website info" ON website_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website info" ON website_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own website info" ON website_info
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own website info" ON website_info
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for website_analytics
CREATE POLICY "Users can view own analytics" ON website_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON website_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON website_analytics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics" ON website_analytics
    FOR DELETE USING (auth.uid() = user_id);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_website_info_updated_at
    BEFORE UPDATE ON website_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_website_analytics_updated_at
    BEFORE UPDATE ON website_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert test data for mikecerqua@gmail.com (PrintGuys Pro)
DO $$
DECLARE
    test_user_id UUID;
    test_client_id UUID;
BEGIN
    -- Get the user ID for mikecerqua@gmail.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'mikecerqua@gmail.com';
    
    -- Get the client ID for PrintGuys Pro
    SELECT id INTO test_client_id FROM clients WHERE user_id = test_user_id LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insert website info
        INSERT INTO website_info (
            user_id, client_id, website_url, primary_domain, platform,
            ssl_status, mobile_responsive, analytics_id, sitemap_url,
            last_updated
        ) VALUES (
            test_user_id, test_client_id, 'https://printguyspro.com', 
            'printguyspro.com', 'WordPress',
            'Active', 'Yes', 'UA-123456789', 
            'https://printguyspro.com/sitemap.xml',
            NOW()
        );
        
        -- Insert current analytics data
        INSERT INTO website_analytics (
            user_id, client_id, monthly_visitors, monthly_pageviews,
            seo_score, technical_seo_score, content_score,
            total_backlinks, referring_domains, bounce_rate,
            avg_session_duration, pages_per_session, metric_date
        ) VALUES (
            test_user_id, test_client_id, 15426, 42318,
            85, 92, 78,
            342, 87, 32.5,
            185, 2.74, CURRENT_DATE
        );
        
        -- Insert historical analytics data (last 30 days)
        FOR i IN 1..30 LOOP
            INSERT INTO website_analytics (
                user_id, client_id, monthly_visitors, monthly_pageviews,
                seo_score, technical_seo_score, content_score,
                total_backlinks, referring_domains, bounce_rate,
                avg_session_duration, pages_per_session, metric_date
            ) VALUES (
                test_user_id, test_client_id, 
                15000 + floor(random() * 1000)::int,
                40000 + floor(random() * 5000)::int,
                83 + floor(random() * 5)::int,
                90 + floor(random() * 5)::int,
                75 + floor(random() * 8)::int,
                340 + floor(random() * 10)::int,
                85 + floor(random() * 5)::int,
                30 + (random() * 5)::decimal(5,2),
                180 + floor(random() * 20)::int,
                2.5 + (random() * 0.5)::decimal(4,2),
                CURRENT_DATE - i
            );
        END LOOP;
        
        RAISE NOTICE 'Test data inserted successfully for website section';
    ELSE
        RAISE NOTICE 'Test user not found, skipping test data insertion';
    END IF;
END $$;

-- Grant permissions to authenticated users
GRANT ALL ON website_info TO authenticated;
GRANT ALL ON website_analytics TO authenticated;
