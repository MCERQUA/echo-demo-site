-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Client Account Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status VARCHAR(50) DEFAULT 'active',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    ai_research_enabled BOOLEAN DEFAULT TRUE
);

-- 2. Business Information Table
CREATE TABLE IF NOT EXISTS business_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    -- Basic Information
    business_name VARCHAR(255),
    legal_entity_name VARCHAR(255),
    dba_names TEXT[],
    business_type VARCHAR(100),
    ein_tax_id VARCHAR(20),
    
    -- Industry & Services
    primary_industry VARCHAR(100),
    secondary_industries TEXT[],
    services_offered TEXT[],
    target_market TEXT,
    service_areas JSONB,
    
    -- Company Details
    founded_date DATE,
    number_of_employees INTEGER,
    annual_revenue_range VARCHAR(50),
    business_description TEXT,
    unique_selling_proposition TEXT,
    company_values TEXT[],
    
    -- Certifications & Licenses
    licenses JSONB,
    certifications JSONB,
    insurance_policies JSONB,
    bonded BOOLEAN DEFAULT FALSE,
    bond_amount DECIMAL(12,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_verified DATE,
    data_source VARCHAR(50),
    confidence_score DECIMAL(3,2)
);

-- 3. Contact Information Table
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Primary Contact
    primary_contact_name VARCHAR(255),
    primary_contact_title VARCHAR(100),
    primary_phone VARCHAR(20),
    primary_email VARCHAR(255),
    
    -- Business Contacts
    main_phone VARCHAR(20),
    toll_free_phone VARCHAR(20),
    fax_number VARCHAR(20),
    general_email VARCHAR(255),
    support_email VARCHAR(255),
    sales_email VARCHAR(255),
    
    -- Physical Locations
    headquarters_address JSONB,
    mailing_address JSONB,
    billing_address JSONB,
    locations JSONB[],
    
    -- Hours of Operation
    business_hours JSONB,
    timezone VARCHAR(50),
    holiday_schedule JSONB,
    emergency_contact JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Brand Assets Table
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Visual Identity
    logo_primary_url TEXT,
    logo_variations JSONB[],
    brand_colors JSONB[],
    typography JSONB,
    
    -- Brand Voice
    brand_personality TEXT[],
    tone_of_voice TEXT,
    messaging_guidelines TEXT,
    tagline VARCHAR(255),
    elevator_pitch TEXT,
    
    -- Brand Guidelines
    do_not_use JSONB[],
    brand_story TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    unique_value_proposition TEXT,
    
    -- File Storage
    brand_guide_url TEXT,
    asset_library_urls JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Digital Presence Table
CREATE TABLE IF NOT EXISTS digital_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Domains
    primary_domain VARCHAR(255),
    additional_domains TEXT[],
    domain_registrar VARCHAR(100),
    domain_expiry_dates JSONB,
    
    -- Website Details
    website_platform VARCHAR(100),
    hosting_provider VARCHAR(100),
    ssl_status VARCHAR(50),
    ssl_expiry DATE,
    
    -- Technical Details
    cms_access JSONB,
    ftp_access JSONB,
    database_type VARCHAR(50),
    
    -- Analytics & Tools
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),
    facebook_pixel_id VARCHAR(50),
    google_search_console_verified BOOLEAN DEFAULT FALSE,
    other_tracking_codes JSONB,
    
    -- Performance Metrics
    current_monthly_traffic INTEGER,
    current_page_speed_score INTEGER,
    current_seo_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Social Media Accounts Table
CREATE TABLE IF NOT EXISTS social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    platform VARCHAR(50),
    profile_url TEXT,
    username VARCHAR(100),
    account_id VARCHAR(100),
    
    -- Metrics
    follower_count INTEGER,
    following_count INTEGER,
    post_count INTEGER,
    engagement_rate DECIMAL(5,2),
    
    -- Access
    access_level VARCHAR(50),
    connected BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_post_date DATE,
    
    -- Platform-Specific Data
    platform_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Google Business Profile Table
CREATE TABLE IF NOT EXISTS google_business_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Basic Info
    profile_name VARCHAR(255),
    profile_url TEXT,
    place_id VARCHAR(100),
    cid VARCHAR(50),
    
    -- Categories
    primary_category VARCHAR(100),
    secondary_categories TEXT[],
    
    -- Attributes
    attributes JSONB,
    
    -- Metrics
    total_reviews INTEGER,
    average_rating DECIMAL(2,1),
    response_rate DECIMAL(5,2),
    response_time VARCHAR(50),
    
    -- Posts & Updates
    last_post_date DATE,
    post_frequency VARCHAR(50),
    
    -- Q&A
    total_questions INTEGER,
    answered_questions INTEGER,
    
    -- Photos
    total_photos INTEGER,
    owner_photos INTEGER,
    customer_photos INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Reputation Management Table
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

-- 9. Competitor Analysis Table
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    competitor_name VARCHAR(255),
    website_url TEXT,
    
    -- Market Position
    market_position VARCHAR(50),
    estimated_market_share DECIMAL(5,2),
    
    -- Strengths & Weaknesses
    strengths TEXT[],
    weaknesses TEXT[],
    unique_features TEXT[],
    
    -- Digital Presence
    seo_visibility_score INTEGER,
    social_media_following JSONB,
    review_ratings JSONB,
    
    -- Pricing
    pricing_model TEXT,
    price_comparison VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Campaign Data Table
CREATE TABLE IF NOT EXISTS campaign_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    campaign_name VARCHAR(255),
    campaign_type VARCHAR(50),
    status VARCHAR(50),
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    
    -- Budget
    budget_amount DECIMAL(10,2),
    spent_amount DECIMAL(10,2),
    
    -- Goals & KPIs
    goals JSONB,
    kpis JSONB,
    
    -- Results
    results JSONB,
    roi DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 11. SEO Data Table
CREATE TABLE IF NOT EXISTS seo_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rankings
    tracked_keywords JSONB[],
    
    -- Technical SEO
    site_health_score INTEGER,
    crawl_errors INTEGER,
    indexed_pages INTEGER,
    
    -- Backlinks
    total_backlinks INTEGER,
    referring_domains INTEGER,
    domain_authority INTEGER,
    
    -- Content
    total_pages INTEGER,
    blog_posts INTEGER,
    
    -- Local SEO
    local_pack_keywords INTEGER,
    citation_accuracy DECIMAL(5,2),
    nap_consistency DECIMAL(5,2),
    
    snapshot_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 12. Customer Insights Table
CREATE TABLE IF NOT EXISTS customer_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Demographics
    primary_age_range VARCHAR(50),
    gender_distribution JSONB,
    income_levels JSONB,
    education_levels JSONB,
    
    -- Psychographics
    interests TEXT[],
    values TEXT[],
    pain_points TEXT[],
    buying_motivations TEXT[],
    
    -- Behavior
    buying_cycle_length VARCHAR(50),
    decision_factors TEXT[],
    preferred_channels TEXT[],
    
    -- Personas
    customer_personas JSONB[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 13. Content Library Table
CREATE TABLE IF NOT EXISTS content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    url TEXT,
    
    -- Details
    publish_date DATE,
    author VARCHAR(255),
    categories TEXT[],
    tags TEXT[],
    
    -- Performance
    views INTEGER,
    shares INTEGER,
    comments INTEGER,
    engagement_rate DECIMAL(5,2),
    
    -- SEO
    target_keywords TEXT[],
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 14. AI Research Queue Table
CREATE TABLE IF NOT EXISTS ai_research_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    research_type VARCHAR(100),
    status VARCHAR(50),
    priority INTEGER DEFAULT 5,
    
    -- Research Details
    parameters JSONB,
    sources_to_check TEXT[],
    
    -- Results
    findings JSONB,
    confidence_score DECIMAL(3,2),
    data_points_found INTEGER,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Approval
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 15. Data Change History Table
CREATE TABLE IF NOT EXISTS data_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    table_name VARCHAR(100),
    record_id UUID,
    field_name VARCHAR(100),
    
    -- Change Details
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(50),
    
    -- Source
    changed_by UUID,
    change_source VARCHAR(50),
    change_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_business_info_user_id ON business_info(user_id);
CREATE INDEX idx_contact_info_user_id ON contact_info(user_id);
CREATE INDEX idx_brand_assets_user_id ON brand_assets(user_id);
CREATE INDEX idx_digital_presence_user_id ON digital_presence(user_id);
CREATE INDEX idx_google_business_profile_user_id ON google_business_profile(user_id);
CREATE INDEX idx_social_media_accounts_client_id ON social_media_accounts(client_id);
CREATE INDEX idx_reputation_management_client_id ON reputation_management(client_id);
CREATE INDEX idx_competitor_analysis_client_id ON competitor_analysis(client_id);
CREATE INDEX idx_campaign_data_client_id ON campaign_data(client_id);
CREATE INDEX idx_seo_data_client_id ON seo_data(client_id);
CREATE INDEX idx_customer_insights_client_id ON customer_insights(client_id);
CREATE INDEX idx_content_library_client_id ON content_library(client_id);
CREATE INDEX idx_ai_research_queue_client_id ON ai_research_queue(client_id);
CREATE INDEX idx_data_change_history_client_id ON data_change_history(client_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_change_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON business_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON business_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON business_info FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON contact_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON contact_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON contact_info FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON brand_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON brand_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON brand_assets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON digital_presence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON digital_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON digital_presence FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own data" ON google_business_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON google_business_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON google_business_profile FOR UPDATE USING (auth.uid() = user_id);

-- For tables using client_id reference
CREATE POLICY "Users can view own data" ON social_media_accounts FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON social_media_accounts FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON social_media_accounts FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON social_media_accounts FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON reputation_management FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON reputation_management FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON reputation_management FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON reputation_management FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON competitor_analysis FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON competitor_analysis FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON competitor_analysis FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON competitor_analysis FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON campaign_data FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON campaign_data FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON campaign_data FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON campaign_data FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON seo_data FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON seo_data FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON seo_data FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON seo_data FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON customer_insights FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON customer_insights FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON customer_insights FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON customer_insights FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON content_library FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON content_library FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON content_library FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON content_library FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON ai_research_queue FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON ai_research_queue FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own data" ON ai_research_queue FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Users can delete own data" ON ai_research_queue FOR DELETE USING (auth.uid() = client_id);

CREATE POLICY "Users can view own data" ON data_change_history FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can insert own data" ON data_change_history FOR INSERT WITH CHECK (auth.uid() = client_id);