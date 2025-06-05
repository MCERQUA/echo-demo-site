-- Online Reputation and Reviews Tables for Echo AI Systems Dashboard
-- These tables store reputation overview and individual review data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS online_reputation CASCADE;

-- Online Reputation Overview Table
CREATE TABLE online_reputation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    
    -- Google Reviews
    google_rating DECIMAL(2,1),
    google_review_count INTEGER DEFAULT 0,
    google_profile_url TEXT,
    
    -- Facebook Reviews
    facebook_rating DECIMAL(2,1),
    facebook_review_count INTEGER DEFAULT 0,
    facebook_profile_url TEXT,
    
    -- Yelp Reviews
    yelp_rating DECIMAL(2,1),
    yelp_review_count INTEGER DEFAULT 0,
    yelp_profile_url TEXT,
    
    -- Aggregate Metrics
    average_rating DECIMAL(2,1),
    total_reviews INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Tracking
    last_review_date DATE,
    last_sync_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Individual Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    
    -- Review Details
    platform VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'yelp', etc.
    review_id VARCHAR(255), -- Platform-specific review ID
    reviewer_name VARCHAR(255),
    reviewer_avatar_url TEXT,
    
    -- Review Content
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date DATE NOT NULL,
    
    -- Response
    response_text TEXT,
    response_date DATE,
    responded_by VARCHAR(255),
    
    -- Metadata
    is_verified BOOLEAN DEFAULT FALSE,
    sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
    keywords TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Prevent duplicate reviews
    UNIQUE(client_id, platform, review_id)
);

-- Create indexes for better performance
CREATE INDEX idx_online_reputation_client_id ON online_reputation(client_id);
CREATE INDEX idx_reviews_client_id ON reviews(client_id);
CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_review_date ON reviews(review_date);

-- Row Level Security (RLS) Policies
ALTER TABLE online_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for online_reputation
CREATE POLICY "Users can view own reputation data" ON online_reputation
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own reputation data" ON online_reputation
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own reputation data" ON online_reputation
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own reputation data" ON online_reputation
    FOR DELETE USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Policies for reviews
CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own reviews" ON reviews
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (
        client_id IN (
            SELECT id FROM clients WHERE user_id = auth.uid()
        )
    );

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update timestamps
CREATE TRIGGER update_online_reputation_updated_at
    BEFORE UPDATE ON online_reputation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to calculate aggregate reputation metrics
CREATE OR REPLACE FUNCTION calculate_reputation_metrics(p_client_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_reviews INTEGER;
    v_total_rating_sum NUMERIC;
    v_average_rating NUMERIC;
    v_google_reviews INTEGER;
    v_google_rating NUMERIC;
    v_facebook_reviews INTEGER;
    v_facebook_rating NUMERIC;
    v_yelp_reviews INTEGER;
    v_yelp_rating NUMERIC;
BEGIN
    -- Calculate Google metrics
    SELECT COUNT(*), AVG(rating)
    INTO v_google_reviews, v_google_rating
    FROM reviews
    WHERE client_id = p_client_id AND platform = 'google';
    
    -- Calculate Facebook metrics
    SELECT COUNT(*), AVG(rating)
    INTO v_facebook_reviews, v_facebook_rating
    FROM reviews
    WHERE client_id = p_client_id AND platform = 'facebook';
    
    -- Calculate Yelp metrics
    SELECT COUNT(*), AVG(rating)
    INTO v_yelp_reviews, v_yelp_rating
    FROM reviews
    WHERE client_id = p_client_id AND platform = 'yelp';
    
    -- Calculate totals
    v_total_reviews := COALESCE(v_google_reviews, 0) + COALESCE(v_facebook_reviews, 0) + COALESCE(v_yelp_reviews, 0);
    
    IF v_total_reviews > 0 THEN
        v_average_rating := (
            (COALESCE(v_google_rating, 0) * COALESCE(v_google_reviews, 0)) +
            (COALESCE(v_facebook_rating, 0) * COALESCE(v_facebook_reviews, 0)) +
            (COALESCE(v_yelp_rating, 0) * COALESCE(v_yelp_reviews, 0))
        ) / v_total_reviews;
    ELSE
        v_average_rating := NULL;
    END IF;
    
    -- Update or insert reputation summary
    INSERT INTO online_reputation (
        client_id,
        google_rating, google_review_count,
        facebook_rating, facebook_review_count,
        yelp_rating, yelp_review_count,
        average_rating, total_reviews
    ) VALUES (
        p_client_id,
        v_google_rating, v_google_reviews,
        v_facebook_rating, v_facebook_reviews,
        v_yelp_rating, v_yelp_reviews,
        v_average_rating, v_total_reviews
    )
    ON CONFLICT (client_id) DO UPDATE SET
        google_rating = EXCLUDED.google_rating,
        google_review_count = EXCLUDED.google_review_count,
        facebook_rating = EXCLUDED.facebook_rating,
        facebook_review_count = EXCLUDED.facebook_review_count,
        yelp_rating = EXCLUDED.yelp_rating,
        yelp_review_count = EXCLUDED.yelp_review_count,
        average_rating = EXCLUDED.average_rating,
        total_reviews = EXCLUDED.total_reviews,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Insert test data for mikecerqua@gmail.com
DO $$
DECLARE
    test_client_id UUID;
BEGIN
    -- Get the client ID for mikecerqua@gmail.com
    SELECT id INTO test_client_id 
    FROM clients 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'mikecerqua@gmail.com')
    LIMIT 1;
    
    IF test_client_id IS NOT NULL THEN
        -- Insert sample reviews
        INSERT INTO reviews (client_id, platform, reviewer_name, rating, review_text, review_date) VALUES
        (test_client_id, 'google', 'Sarah Johnson', 5, 'Excellent printing service! Fast turnaround and high quality.', CURRENT_DATE - INTERVAL '5 days'),
        (test_client_id, 'google', 'Mike Thompson', 4, 'Good service, but a bit pricey. Quality is top-notch though.', CURRENT_DATE - INTERVAL '10 days'),
        (test_client_id, 'facebook', 'Jennifer Lee', 5, 'PrintGuys Pro saved our conference! Last minute order delivered on time.', CURRENT_DATE - INTERVAL '15 days'),
        (test_client_id, 'yelp', 'David Chen', 5, 'Professional team, great customer service. Highly recommend!', CURRENT_DATE - INTERVAL '20 days'),
        (test_client_id, 'google', 'Lisa Anderson', 3, 'Quality was good but communication could be better.', CURRENT_DATE - INTERVAL '25 days')
        ON CONFLICT (client_id, platform, review_id) DO NOTHING;
        
        -- Calculate and store reputation metrics
        PERFORM calculate_reputation_metrics(test_client_id);
        
        RAISE NOTICE 'Test data inserted successfully for reputation section';
    ELSE
        RAISE NOTICE 'Test client not found, skipping test data insertion';
    END IF;
END $$;

-- Grant permissions to authenticated users
GRANT ALL ON online_reputation TO authenticated;
GRANT ALL ON reviews TO authenticated;