-- Echo AI Systems Dashboard Database Setup
-- Run this in your Supabase SQL Editor to set up all necessary tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all required tables
CREATE TABLE IF NOT EXISTS business_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    business_name VARCHAR(255),
    legal_entity_name VARCHAR(255),
    dba_names TEXT[],
    business_type VARCHAR(100),
    ein_tax_id VARCHAR(20),
    primary_industry VARCHAR(100),
    secondary_industries TEXT[],
    services_offered TEXT[],
    target_market TEXT[],
    service_areas TEXT[],
    founded_date DATE,
    number_of_employees VARCHAR(50),
    annual_revenue_range VARCHAR(50),
    business_description TEXT,
    unique_selling_proposition TEXT,
    company_values TEXT[],
    licenses TEXT[],
    certifications TEXT[],
    insurance_policies TEXT[],
    bonded BOOLEAN DEFAULT false,
    bond_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_verified TIMESTAMP WITH TIME ZONE,
    data_source VARCHAR(100),
    confidence_score DECIMAL(3,2)
);

CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    primary_contact_name VARCHAR(255),
    primary_contact_title VARCHAR(100),
    primary_phone VARCHAR(20),
    primary_email VARCHAR(255),
    main_phone VARCHAR(20),
    toll_free_phone VARCHAR(20),
    fax_number VARCHAR(20),
    general_email VARCHAR(255),
    support_email VARCHAR(255),
    sales_email VARCHAR(255),
    headquarters_address JSONB,
    mailing_address JSONB,
    billing_address JSONB,
    locations JSONB[],
    business_hours JSONB,
    timezone VARCHAR(50),
    holiday_schedule JSONB,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    logo_primary_url TEXT,
    logo_secondary_url TEXT,
    logo_icon_url TEXT,
    favicon_url TEXT,
    brand_colors JSONB,
    typography JSONB,
    tagline TEXT,
    slogans TEXT[],
    mission_statement TEXT,
    vision_statement TEXT,
    brand_voice_guidelines TEXT,
    style_guide_url TEXT,
    brand_assets_folder TEXT,
    marketing_materials JSONB[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS digital_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    primary_domain VARCHAR(255),
    additional_domains TEXT[],
    website_platform VARCHAR(100),
    website_theme VARCHAR(100),
    hosting_provider VARCHAR(100),
    ssl_status VARCHAR(50),
    ssl_expiry DATE,
    domain_registrar VARCHAR(100),
    domain_expiry DATE,
    name_servers TEXT[],
    cdn_provider VARCHAR(100),
    email_provider VARCHAR(100),
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),
    facebook_pixel_id VARCHAR(50),
    other_tracking_codes JSONB,
    sitemap_url TEXT,
    robots_txt_status VARCHAR(50),
    page_speed_score INTEGER,
    mobile_friendly BOOLEAN,
    accessibility_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS google_business_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    profile_name VARCHAR(255),
    profile_url TEXT,
    place_id VARCHAR(100),
    primary_category VARCHAR(100),
    additional_categories TEXT[],
    description TEXT,
    opening_date DATE,
    photos_count INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    response_rate DECIMAL(3,2),
    verification_status VARCHAR(50),
    attributes JSONB,
    services JSONB[],
    products JSONB[],
    posts_enabled BOOLEAN DEFAULT false,
    messaging_enabled BOOLEAN DEFAULT false,
    appointment_url TEXT,
    menu_url TEXT,
    order_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON business_info
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contact_info
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON brand_assets
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON digital_presence
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
    
CREATE TRIGGER set_updated_at BEFORE UPDATE ON google_business_profile
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_business_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON business_info;
DROP POLICY IF EXISTS "Users can insert own data" ON business_info;
DROP POLICY IF EXISTS "Users can update own data" ON business_info;

DROP POLICY IF EXISTS "Users can view own data" ON contact_info;
DROP POLICY IF EXISTS "Users can insert own data" ON contact_info;
DROP POLICY IF EXISTS "Users can update own data" ON contact_info;

DROP POLICY IF EXISTS "Users can view own data" ON brand_assets;
DROP POLICY IF EXISTS "Users can insert own data" ON brand_assets;
DROP POLICY IF EXISTS "Users can update own data" ON brand_assets;

DROP POLICY IF EXISTS "Users can view own data" ON digital_presence;
DROP POLICY IF EXISTS "Users can insert own data" ON digital_presence;
DROP POLICY IF EXISTS "Users can update own data" ON digital_presence;

DROP POLICY IF EXISTS "Users can view own data" ON google_business_profile;
DROP POLICY IF EXISTS "Users can insert own data" ON google_business_profile;
DROP POLICY IF EXISTS "Users can update own data" ON google_business_profile;

-- Create RLS policies with simpler names
CREATE POLICY "Enable read access for users" ON business_info
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users" ON business_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users" ON business_info
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users" ON contact_info
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users" ON contact_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users" ON contact_info
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users" ON brand_assets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users" ON brand_assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users" ON brand_assets
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users" ON digital_presence
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users" ON digital_presence
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users" ON digital_presence
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users" ON google_business_profile
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for users" ON google_business_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for users" ON google_business_profile
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_info_user_id ON business_info(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_info_user_id ON contact_info(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_presence_user_id ON digital_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_google_business_profile_user_id ON google_business_profile(user_id);

-- Insert test data for the existing user
INSERT INTO business_info (user_id, business_name, legal_entity_name, business_type, primary_industry)
VALUES ('5ac45740-05a4-4498-b8a8-ee2a8b3963d4', 'printguys', 'printguys', 'Apparel and merch Printing', 'Retail')
ON CONFLICT (user_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    legal_entity_name = EXCLUDED.legal_entity_name,
    business_type = EXCLUDED.business_type,
    primary_industry = EXCLUDED.primary_industry,
    updated_at = NOW();

-- Success message
SELECT 'Dashboard database setup completed successfully!' as message;