-- Echo AI Systems Client Information Database Schema
-- Complete Supabase setup for client data management
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients table (main client account)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    ai_research_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id)
);

-- 2. Business Information
CREATE TABLE IF NOT EXISTS public.business_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    -- Basic Information
    business_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    dba_names TEXT[],
    business_type VARCHAR(100),
    ein_tax_id VARCHAR(20),
    
    -- Industry & Services
    primary_industry VARCHAR(100),
    industry_subcategories TEXT[],
    services_offered JSONB DEFAULT '[]'::jsonb,
    target_market TEXT,
    service_areas JSONB DEFAULT '{}'::jsonb,
    
    -- Company Details
    founded_date DATE,
    number_of_employees INTEGER,
    annual_revenue_range VARCHAR(50),
    business_description TEXT,
    unique_selling_proposition TEXT,
    company_values TEXT[],
    
    -- Certifications & Licenses
    licenses JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    insurance_policies JSONB DEFAULT '[]'::jsonb,
    bonded BOOLEAN DEFAULT FALSE,
    bond_amount DECIMAL(12,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_verified DATE,
    data_source VARCHAR(50) DEFAULT 'manual',
    confidence_score DECIMAL(3,2),
    UNIQUE(client_id)
);

-- 3. Contact Information
CREATE TABLE IF NOT EXISTS public.contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
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
    headquarters_address JSONB DEFAULT '{}'::jsonb,
    mailing_address JSONB DEFAULT '{}'::jsonb,
    billing_address JSONB DEFAULT '{}'::jsonb,
    locations JSONB DEFAULT '[]'::jsonb,
    
    -- Hours of Operation
    business_hours JSONB DEFAULT '{}'::jsonb,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    holiday_schedule JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id)
);

-- 4. Brand Assets
CREATE TABLE IF NOT EXISTS public.brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Visual Identity
    logo_primary_url TEXT,
    logo_variations JSONB DEFAULT '[]'::jsonb,
    brand_colors JSONB DEFAULT '[]'::jsonb,
    typography JSONB DEFAULT '{}'::jsonb,
    
    -- Brand Voice
    brand_personality TEXT[],
    tone_of_voice TEXT,
    messaging_guidelines TEXT,
    tagline VARCHAR(255),
    elevator_pitch TEXT,
    
    -- Brand Guidelines
    do_not_use JSONB DEFAULT '[]'::jsonb,
    brand_story TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    
    -- File Storage
    brand_guide_url TEXT,
    asset_library_urls JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id)
);

-- 5. Digital Presence
CREATE TABLE IF NOT EXISTS public.digital_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Domains
    primary_domain VARCHAR(255),
    additional_domains TEXT[],
    domain_registrar VARCHAR(100),
    domain_expiry_dates JSONB DEFAULT '{}'::jsonb,
    
    -- Website Details
    website_platform VARCHAR(100),
    hosting_provider VARCHAR(100),
    ssl_certificate BOOLEAN DEFAULT FALSE,
    ssl_expiry DATE,
    
    -- Technical Details
    cms_access JSONB DEFAULT '{}'::jsonb,
    ftp_access JSONB DEFAULT '{}'::jsonb,
    database_type VARCHAR(50),
    
    -- Analytics & Tools
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),
    facebook_pixel_id VARCHAR(50),
    other_tracking_codes JSONB DEFAULT '{}'::jsonb,
    
    -- Performance Metrics
    current_monthly_traffic INTEGER,
    current_page_speed_score INTEGER,
    current_seo_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id)
);

-- 6. Social Media Accounts
CREATE TABLE IF NOT EXISTS public.social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,
    account_url TEXT,
    username VARCHAR(100),
    account_id VARCHAR(100),
    
    -- Metrics
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    -- Access
    access_level VARCHAR(50) DEFAULT 'viewer',
    connected BOOLEAN DEFAULT FALSE,
    last_post_date DATE,
    
    -- Platform-Specific Data
    platform_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id, platform)
);

-- 7. Google Business Profile
CREATE TABLE IF NOT EXISTS public.google_business_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Basic Info
    profile_name VARCHAR(255),
    profile_url TEXT,
    place_id VARCHAR(100),
    cid VARCHAR(50),
    
    -- Categories
    primary_category VARCHAR(100),
    additional_categories TEXT[],
    
    -- Attributes
    attributes JSONB DEFAULT '{}'::jsonb,
    
    -- Metrics
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    response_rate DECIMAL(5,2),
    response_time VARCHAR(50),
    
    -- Posts & Updates
    last_post_date DATE,
    post_frequency VARCHAR(50),
    
    -- Q&A
    total_questions INTEGER DEFAULT 0,
    answered_questions INTEGER DEFAULT 0,
    
    -- Photos
    total_photos INTEGER DEFAULT 0,
    owner_photos INTEGER DEFAULT 0,
    customer_photos INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id)
);

-- 8. Online Reputation
CREATE TABLE IF NOT EXISTS public.online_reputation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,
    profile_url TEXT,
    
    -- Metrics
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    
    -- Rating Breakdown
    five_star INTEGER DEFAULT 0,
    four_star INTEGER DEFAULT 0,
    three_star INTEGER DEFAULT 0,
    two_star INTEGER DEFAULT 0,
    one_star INTEGER DEFAULT 0,
    
    -- Response Metrics
    response_rate DECIMAL(5,2),
    average_response_time VARCHAR(50),
    
    -- Recent Activity
    last_review_date DATE,
    last_response_date DATE,
    trending VARCHAR(20) DEFAULT 'stable' CHECK (trending IN ('up', 'down', 'stable')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id, platform)
);

-- 9. Competitors
CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    competitor_name VARCHAR(255) NOT NULL,
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
    social_media_following JSONB DEFAULT '{}'::jsonb,
    review_ratings JSONB DEFAULT '{}'::jsonb,
    
    -- Pricing
    pricing_model TEXT,
    price_comparison VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 10. Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
    
    -- Timeline
    start_date DATE,
    end_date DATE,
    
    -- Budget
    budget_amount DECIMAL(10,2),
    spent_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Goals & KPIs
    goals JSONB DEFAULT '[]'::jsonb,
    kpis JSONB DEFAULT '{}'::jsonb,
    
    -- Results
    results JSONB DEFAULT '{}'::jsonb,
    roi DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 11. SEO Data
CREATE TABLE IF NOT EXISTS public.seo_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Rankings
    tracked_keywords JSONB DEFAULT '[]'::jsonb,
    
    -- Technical SEO
    site_health_score INTEGER,
    crawl_errors INTEGER DEFAULT 0,
    indexed_pages INTEGER DEFAULT 0,
    
    -- Backlinks
    total_backlinks INTEGER DEFAULT 0,
    referring_domains INTEGER DEFAULT 0,
    domain_authority INTEGER,
    
    -- Content
    total_pages INTEGER DEFAULT 0,
    blog_posts INTEGER DEFAULT 0,
    
    -- Local SEO
    local_pack_keywords INTEGER DEFAULT 0,
    citation_accuracy DECIMAL(5,2),
    nap_consistency DECIMAL(5,2),
    
    snapshot_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 12. Customer Insights
CREATE TABLE IF NOT EXISTS public.customer_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Demographics
    primary_age_range VARCHAR(50),
    gender_distribution JSONB DEFAULT '{}'::jsonb,
    income_levels JSONB DEFAULT '{}'::jsonb,
    education_levels JSONB DEFAULT '{}'::jsonb,
    
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
    customer_personas JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(client_id)
);

-- 13. Content Library
CREATE TABLE IF NOT EXISTS public.content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    
    -- Details
    publish_date DATE,
    author VARCHAR(255),
    categories TEXT[],
    tags TEXT[],
    
    -- Performance
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    -- SEO
    target_keywords TEXT[],
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 14. AI Research Queue
CREATE TABLE IF NOT EXISTS public.ai_research_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    research_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    -- Research Details
    parameters JSONB DEFAULT '{}'::jsonb,
    sources_to_check TEXT[],
    
    -- Results
    findings JSONB DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2),
    data_points_found INTEGER DEFAULT 0,
    
    -- Timing
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Approval
    requires_approval BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 15. Data Change History
CREATE TABLE IF NOT EXISTS public.data_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    field_name VARCHAR(100),
    
    -- Change Details
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
    
    -- Source
    changed_by UUID REFERENCES auth.users(id),
    change_source VARCHAR(50) NOT NULL DEFAULT 'manual',
    change_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_business_info_client_id ON public.business_info(client_id);
CREATE INDEX idx_contact_info_client_id ON public.contact_info(client_id);
CREATE INDEX idx_brand_assets_client_id ON public.brand_assets(client_id);
CREATE INDEX idx_digital_presence_client_id ON public.digital_presence(client_id);
CREATE INDEX idx_social_media_accounts_client_id ON public.social_media_accounts(client_id);
CREATE INDEX idx_google_business_profile_client_id ON public.google_business_profile(client_id);
CREATE INDEX idx_online_reputation_client_id ON public.online_reputation(client_id);
CREATE INDEX idx_competitors_client_id ON public.competitors(client_id);
CREATE INDEX idx_marketing_campaigns_client_id ON public.marketing_campaigns(client_id);
CREATE INDEX idx_seo_data_client_id ON public.seo_data(client_id);
CREATE INDEX idx_customer_insights_client_id ON public.customer_insights(client_id);
CREATE INDEX idx_content_library_client_id ON public.content_library(client_id);
CREATE INDEX idx_ai_research_queue_client_id ON public.ai_research_queue(client_id);
CREATE INDEX idx_ai_research_queue_status ON public.ai_research_queue(status);
CREATE INDEX idx_data_change_history_client_id ON public.data_change_history(client_id);
CREATE INDEX idx_data_change_history_table_record ON public.data_change_history(table_name, record_id);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables with updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_info_updated_at BEFORE UPDATE ON public.business_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_presence_updated_at BEFORE UPDATE ON public.digital_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_accounts_updated_at BEFORE UPDATE ON public.social_media_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_business_profile_updated_at BEFORE UPDATE ON public.google_business_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_online_reputation_updated_at BEFORE UPDATE ON public.online_reputation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON public.competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_insights_updated_at BEFORE UPDATE ON public.customer_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON public.content_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_change_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Users can view their own client record" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client record" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client record" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to get client_id from user_id
CREATE OR REPLACE FUNCTION get_client_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM public.clients WHERE user_id = user_uuid LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for all other tables (example for business_info, repeat for others)
CREATE POLICY "Users can view their own business info" ON public.business_info
    FOR SELECT USING (client_id = get_client_id(auth.uid()));

CREATE POLICY "Users can update their own business info" ON public.business_info
    FOR UPDATE USING (client_id = get_client_id(auth.uid()));

CREATE POLICY "Users can insert their own business info" ON public.business_info
    FOR INSERT WITH CHECK (client_id = get_client_id(auth.uid()));

CREATE POLICY "Users can delete their own business info" ON public.business_info
    FOR DELETE USING (client_id = get_client_id(auth.uid()));

-- Apply similar policies to all other tables
-- (Truncated for brevity - repeat the pattern for all tables)

-- Create a function to initialize client data after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_client_id UUID;
BEGIN
    -- Create client record
    INSERT INTO public.clients (user_id)
    VALUES (new.id)
    RETURNING id INTO new_client_id;
    
    -- Initialize empty records for all related tables
    INSERT INTO public.business_info (client_id) VALUES (new_client_id);
    INSERT INTO public.contact_info (client_id) VALUES (new_client_id);
    INSERT INTO public.brand_assets (client_id) VALUES (new_client_id);
    INSERT INTO public.digital_presence (client_id) VALUES (new_client_id);
    INSERT INTO public.google_business_profile (client_id) VALUES (new_client_id);
    INSERT INTO public.customer_insights (client_id) VALUES (new_client_id);
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create client data on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;