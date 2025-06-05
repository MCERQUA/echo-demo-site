-- REPUTATION MANAGEMENT SETUP WITH SAMPLE DATA
-- Run this in Supabase SQL Editor to set up reputation tables and add sample data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE DIRECTORY CITATIONS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS directory_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Directory Information
    site_name VARCHAR(255) NOT NULL,
    directory_type VARCHAR(50), -- 'general', 'industry', 'local', 'niche'
    
    -- Login Credentials
    username VARCHAR(255),
    password TEXT, -- Should be encrypted in production
    
    -- Profile Information
    live_url TEXT,
    profile_claimed BOOLEAN DEFAULT FALSE,
    profile_verified BOOLEAN DEFAULT FALSE,
    
    -- Review Information
    has_reviews BOOLEAN DEFAULT FALSE,
    reviews_url TEXT,
    review_count INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    
    -- Metadata
    last_checked DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'needs_update', 'inactive'
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_directory_citations_client_id ON directory_citations(client_id);
CREATE INDEX IF NOT EXISTS idx_directory_citations_site_name ON directory_citations(site_name);
CREATE INDEX IF NOT EXISTS idx_directory_citations_status ON directory_citations(status);

-- Enable Row Level Security
ALTER TABLE directory_citations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own citations" ON directory_citations;
DROP POLICY IF EXISTS "Users can insert own citations" ON directory_citations;
DROP POLICY IF EXISTS "Users can update own citations" ON directory_citations;
DROP POLICY IF EXISTS "Users can delete own citations" ON directory_citations;

-- Create RLS Policies
CREATE POLICY "Users can view own citations" ON directory_citations 
    FOR SELECT USING (auth.uid() = client_id);
    
CREATE POLICY "Users can insert own citations" ON directory_citations 
    FOR INSERT WITH CHECK (auth.uid() = client_id);
    
CREATE POLICY "Users can update own citations" ON directory_citations 
    FOR UPDATE USING (auth.uid() = client_id);
    
CREATE POLICY "Users can delete own citations" ON directory_citations 
    FOR DELETE USING (auth.uid() = client_id);

-- 2. ENSURE REPUTATION_MANAGEMENT TABLE EXISTS
-- (This should already exist from the main schema, but let's make sure)
CREATE TABLE IF NOT EXISTS reputation_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    platform_name VARCHAR(50),
    profile_url TEXT,
    
    -- Metrics
    total_reviews INTEGER,
    average_rating DECIMAL(2,1),
    
    -- Rating Breakdown
    five_star INTEGER,
    four_star INTEGER,
    three_star INTEGER,
    two_star INTEGER,
    one_star INTEGER,
    
    -- Response Metrics
    response_rate DECIMAL(5,2),
    average_response_time VARCHAR(50),
    
    -- Recent Activity
    last_review_date DATE,
    last_response_date DATE,
    trending VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reputation_management_client_id ON reputation_management(client_id);

-- Enable RLS
ALTER TABLE reputation_management ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON reputation_management;
DROP POLICY IF EXISTS "Users can insert own data" ON reputation_management;
DROP POLICY IF EXISTS "Users can update own data" ON reputation_management;
DROP POLICY IF EXISTS "Users can delete own data" ON reputation_management;

-- Create RLS Policies
CREATE POLICY "Users can view own data" ON reputation_management 
    FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON reputation_management 
    FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON reputation_management 
    FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON reputation_management 
    FOR DELETE USING (auth.uid() = client_id);

-- 3. GET THE USER ID FOR mikecerqua@gmail.com
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the user ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'mikecerqua@gmail.com' LIMIT 1;
    
    IF user_id IS NOT NULL THEN
        -- 4. INSERT SAMPLE DIRECTORY CITATIONS DATA
        -- Clear existing data first
        DELETE FROM directory_citations WHERE client_id = user_id;
        
        -- Insert sample citations
        INSERT INTO directory_citations (client_id, site_name, directory_type, username, password, live_url, status, profile_claimed, profile_verified, has_reviews, review_count, average_rating) VALUES
        (user_id, 'Google Business Profile', 'general', 'echoaisystems', 'password123', 'https://business.google.com/echoaisystems', 'active', true, true, true, 47, 4.8),
        (user_id, 'Yelp', 'general', 'echo-ai-systems', 'yelp2024!', 'https://www.yelp.com/biz/echo-ai-systems', 'active', true, false, true, 23, 4.5),
        (user_id, 'Facebook Business', 'general', 'echoaisystems@gmail.com', 'fb_secure_2024', 'https://facebook.com/echoaisystems', 'active', true, true, true, 112, 4.9),
        (user_id, 'Better Business Bureau', 'general', 'mikecerqua', 'bbb_access_2024', 'https://www.bbb.org/echo-ai-systems', 'active', true, true, true, 8, 5.0),
        (user_id, 'Yellow Pages', 'general', 'echo_ai_admin', 'yp_2024_secure', 'https://www.yellowpages.com/echo-ai-systems', 'pending', false, false, false, 0, NULL),
        (user_id, 'Angi (Angie''s List)', 'industry', 'echoai_tech', 'angi_pass_2024', 'https://www.angi.com/echo-ai-systems', 'active', true, false, true, 15, 4.6),
        (user_id, 'LinkedIn Company', 'general', 'echo-ai-systems', 'linkedin_2024', 'https://linkedin.com/company/echo-ai-systems', 'active', true, true, false, 0, NULL),
        (user_id, 'Trustpilot', 'general', 'echo.ai.systems', 'trust_2024_pilot', 'https://www.trustpilot.com/echo-ai-systems', 'inactive', false, false, false, 0, NULL),
        (user_id, 'Chamber of Commerce', 'local', 'echo_ai_local', 'chamber_2024', 'https://www.localchamber.com/echo-ai', 'active', true, true, false, 0, NULL),
        (user_id, 'Industry Directory', 'industry', 'echo_ai_pro', 'industry_2024', 'https://www.techproviders.com/echo-ai', 'pending', false, false, false, 0, NULL);
        
        -- 5. INSERT SAMPLE REPUTATION MANAGEMENT DATA
        -- Clear existing data first
        DELETE FROM reputation_management WHERE client_id = user_id;
        
        -- Insert sample review platforms
        INSERT INTO reputation_management (
            client_id, platform_name, profile_url, total_reviews, average_rating,
            five_star, four_star, three_star, two_star, one_star,
            response_rate, average_response_time, last_review_date, trending
        ) VALUES
        (user_id, 'Google', 'https://business.google.com/echoaisystems', 47, 4.8, 38, 7, 1, 1, 0, 95.0, '2 hours', CURRENT_DATE - INTERVAL '3 days', 'up'),
        (user_id, 'Yelp', 'https://www.yelp.com/biz/echo-ai-systems', 23, 4.5, 15, 6, 1, 1, 0, 87.0, '4 hours', CURRENT_DATE - INTERVAL '7 days', 'stable'),
        (user_id, 'Facebook', 'https://facebook.com/echoaisystems/reviews', 112, 4.9, 98, 12, 2, 0, 0, 100.0, '1 hour', CURRENT_DATE - INTERVAL '1 day', 'up'),
        (user_id, 'BBB', 'https://www.bbb.org/echo-ai-systems', 8, 5.0, 8, 0, 0, 0, 0, 100.0, 'Same day', CURRENT_DATE - INTERVAL '14 days', 'stable');
        
        RAISE NOTICE 'Sample data inserted successfully for user: %', user_id;
    ELSE
        RAISE NOTICE 'User mikecerqua@gmail.com not found. Please ensure the user exists in auth.users table.';
    END IF;
END $$;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_directory_citations_updated_at ON directory_citations;
CREATE TRIGGER update_directory_citations_updated_at 
    BEFORE UPDATE ON directory_citations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reputation_management_updated_at ON reputation_management;
CREATE TRIGGER update_reputation_management_updated_at 
    BEFORE UPDATE ON reputation_management 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the data was inserted
SELECT 'Directory Citations Count:' as info, COUNT(*) as count FROM directory_citations WHERE client_id = (SELECT id FROM auth.users WHERE email = 'mikecerqua@gmail.com' LIMIT 1)
UNION ALL
SELECT 'Reputation Platforms Count:', COUNT(*) FROM reputation_management WHERE client_id = (SELECT id FROM auth.users WHERE email = 'mikecerqua@gmail.com' LIMIT 1);
