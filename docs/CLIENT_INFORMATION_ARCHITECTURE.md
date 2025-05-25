# Client Information Architecture & Database Schema
*Comprehensive plan for client data collection, storage, and management in Echo AI Systems Dashboard*

## Overview
This document outlines all information types we need to collect for each client, how to structure it in Supabase, and how to enable both manual editing and AI-powered automated population.

## Core Principles
1. **Editable Variables**: All data fields attached to client's Supabase account
2. **Dual Input Methods**: 
   - Manual: Mouse/keyboard interaction on dashboard pages
   - Automated: Echo AI using MCP tools to research and populate
3. **Verification Flow**: AI suggestions → Client review → Manual adjustments → Confirmation
4. **Growing Knowledge Base**: Information accumulates over time with version history

## Database Schema Structure

### 1. Client Account (clients)
Primary client account information
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status VARCHAR(50) DEFAULT 'active',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    ai_research_enabled BOOLEAN DEFAULT TRUE
);
```

### 2. Business Information (business_info)
Core business details
```sql
CREATE TABLE business_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    -- Basic Information
    business_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    dba_names TEXT[], -- Array of "Doing Business As" names
    business_type VARCHAR(100), -- LLC, Corporation, Sole Proprietor, etc.
    ein_tax_id VARCHAR(20), -- Encrypted
    
    -- Industry & Services
    primary_industry VARCHAR(100),
    industry_subcategories TEXT[],
    services_offered JSONB, -- Detailed service list with descriptions
    target_market TEXT,
    service_areas JSONB, -- Geographic areas served
    
    -- Company Details
    founded_date DATE,
    number_of_employees INTEGER,
    annual_revenue_range VARCHAR(50),
    business_description TEXT,
    unique_selling_proposition TEXT,
    company_values TEXT[],
    
    -- Certifications & Licenses
    licenses JSONB, -- Array of {type, number, state, expiry}
    certifications JSONB, -- Array of {name, issuer, date, expiry}
    insurance_policies JSONB, -- Array of {type, carrier, policy_number, expiry}
    bonded BOOLEAN DEFAULT FALSE,
    bond_amount DECIMAL(12,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_verified DATE,
    data_source VARCHAR(50), -- 'manual', 'ai_research', 'import'
    confidence_score DECIMAL(3,2) -- AI confidence in data accuracy
);
```

### 3. Contact Information (contact_info)
All contact methods and locations
```sql
CREATE TABLE contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
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
    headquarters_address JSONB, -- {street, city, state, zip, country}
    mailing_address JSONB,
    billing_address JSONB,
    locations JSONB[], -- Array of all physical locations
    
    -- Hours of Operation
    business_hours JSONB, -- {monday: {open, close}, ...}
    timezone VARCHAR(50),
    holiday_schedule JSONB,
    emergency_contact JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 4. Brand Assets (brand_assets)
Logo, colors, fonts, and brand guidelines
```sql
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Visual Identity
    logo_primary_url TEXT,
    logo_variations JSONB[], -- Array of {type, url, usage}
    brand_colors JSONB[], -- Array of {name, hex, rgb, usage}
    typography JSONB, -- {primary_font, secondary_font, heading_font}
    
    -- Brand Voice
    brand_personality TEXT[],
    tone_of_voice TEXT,
    messaging_guidelines TEXT,
    tagline VARCHAR(255),
    elevator_pitch TEXT,
    
    -- Brand Guidelines
    do_not_use JSONB[], -- Things to avoid
    brand_story TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    
    -- File Storage
    brand_guide_url TEXT,
    asset_library_urls JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 5. Digital Presence (digital_presence)
Website, domain, and hosting information
```sql
CREATE TABLE digital_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Domains
    primary_domain VARCHAR(255),
    additional_domains TEXT[],
    domain_registrar VARCHAR(100),
    domain_expiry_dates JSONB,
    
    -- Website Details
    website_platform VARCHAR(100), -- WordPress, Shopify, Custom, etc.
    hosting_provider VARCHAR(100),
    ssl_certificate BOOLEAN DEFAULT FALSE,
    ssl_expiry DATE,
    
    -- Technical Details
    cms_access JSONB, -- Encrypted credentials storage reference
    ftp_access JSONB,
    database_type VARCHAR(50),
    
    -- Analytics & Tools
    google_analytics_id VARCHAR(50),
    google_tag_manager_id VARCHAR(50),
    facebook_pixel_id VARCHAR(50),
    other_tracking_codes JSONB,
    
    -- Performance Metrics
    current_monthly_traffic INTEGER,
    current_page_speed_score INTEGER,
    current_seo_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 6. Social Media Accounts (social_media_accounts)
All social platform information
```sql
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    platform VARCHAR(50), -- facebook, instagram, linkedin, etc.
    account_url TEXT,
    username VARCHAR(100),
    account_id VARCHAR(100),
    
    -- Metrics
    follower_count INTEGER,
    following_count INTEGER,
    post_count INTEGER,
    engagement_rate DECIMAL(5,2),
    
    -- Access
    access_level VARCHAR(50), -- admin, editor, viewer
    connected BOOLEAN DEFAULT FALSE,
    last_post_date DATE,
    
    -- Platform-Specific Data
    platform_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 7. Google Business Profile (google_business_profile)
Google My Business / Business Profile data
```sql
CREATE TABLE google_business_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic Info
    profile_name VARCHAR(255),
    profile_url TEXT,
    place_id VARCHAR(100),
    cid VARCHAR(50),
    
    -- Categories
    primary_category VARCHAR(100),
    additional_categories TEXT[],
    
    -- Attributes
    attributes JSONB, -- All Google attributes
    
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
```

### 8. Online Reputation (online_reputation)
Reviews and ratings across platforms
```sql
CREATE TABLE online_reputation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    platform VARCHAR(50), -- google, yelp, facebook, bbb, etc.
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
    trending VARCHAR(20), -- up, down, stable
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 9. Competitors (competitors)
Competitive landscape information
```sql
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    competitor_name VARCHAR(255),
    website_url TEXT,
    
    -- Market Position
    market_position VARCHAR(50), -- leader, challenger, follower
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
    price_comparison VARCHAR(50), -- higher, similar, lower
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 10. Marketing Campaigns (marketing_campaigns)
Active and historical marketing efforts
```sql
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    campaign_name VARCHAR(255),
    campaign_type VARCHAR(50), -- seo, ppc, social, email, etc.
    status VARCHAR(50), -- planning, active, paused, completed
    
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
```

### 11. SEO Data (seo_data)
Search engine optimization metrics
```sql
CREATE TABLE seo_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Rankings
    tracked_keywords JSONB[], -- Array of {keyword, position, search_volume}
    
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
```

### 12. Customer Data (customer_insights)
Target audience and customer information
```sql
CREATE TABLE customer_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
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
    customer_personas JSONB[], -- Detailed persona profiles
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 13. Content Library (content_library)
Blog posts, videos, and other content
```sql
CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50), -- blog, video, infographic, etc.
    title VARCHAR(255),
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
```

### 14. AI Research Queue (ai_research_queue)
Track AI research tasks and status
```sql
CREATE TABLE ai_research_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    research_type VARCHAR(100), -- business_info, competitors, reviews, etc.
    status VARCHAR(50), -- pending, in_progress, completed, failed
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
```

### 15. Data Change History (data_change_history)
Track all changes for audit and rollback
```sql
CREATE TABLE data_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    table_name VARCHAR(100),
    record_id UUID,
    field_name VARCHAR(100),
    
    -- Change Details
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(50), -- create, update, delete
    
    -- Source
    changed_by UUID,
    change_source VARCHAR(50), -- manual, ai_research, import, api
    change_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Implementation Features

### 1. Manual Input Interface
- **Form-based editing**: Clean, intuitive forms for each data category
- **Inline editing**: Click to edit individual fields
- **Bulk import**: CSV/Excel upload for initial data
- **Rich text editors**: For descriptions and long-form content
- **File uploads**: Drag-and-drop for logos, documents
- **Auto-save**: Changes saved automatically with undo/redo

### 2. AI Research Integration
- **One-click research**: Button to trigger AI research for any section
- **Research scope selection**: Choose what to research (all, specific sections)
- **Source preferences**: Prioritize certain data sources
- **Confidence indicators**: Show AI confidence for each data point
- **Suggested changes**: AI proposes updates with explanations
- **Batch processing**: Research multiple clients overnight

### 3. Verification Workflow
- **Change proposals**: AI suggestions shown as pending changes
- **Side-by-side comparison**: Current vs. proposed data
- **Accept/Reject/Modify**: Granular control over each change
- **Bulk actions**: Accept all high-confidence suggestions
- **Audit trail**: Track who approved what and when
- **Rollback capability**: Revert to previous versions

### 4. Data Quality Features
- **Completeness scoring**: Show % complete for each section
- **Data freshness indicators**: Highlight stale information
- **Validation rules**: Ensure data format consistency
- **Duplicate detection**: Identify potential duplicates
- **Cross-reference checking**: Verify data across sources
- **Regular review reminders**: Prompt periodic updates

### 5. Research Sources for AI
- **Public sources**:
  - Company website scraping
  - Google Business Profile API
  - Social media APIs
  - Review platform APIs
  - Government databases (licenses, registrations)
  - Industry directories
  
- **SEO/Marketing sources**:
  - Google Search Console API
  - Google Analytics API
  - SEMrush/Ahrefs APIs
  - Social media insights
  
- **Structured data extraction**:
  - Schema.org markup
  - Open Graph data
  - JSON-LD structured data

### 6. Security & Privacy
- **Role-based access**: Control who can view/edit what
- **Field-level encryption**: Sensitive data encrypted at rest
- **Audit logging**: Track all access and changes
- **Data retention policies**: Automatic cleanup of old data
- **GDPR compliance**: Right to access, correct, delete
- **API rate limiting**: Prevent abuse of AI research

## User Interface Sections

### 1. Dashboard Overview
- **Completeness widget**: Overall data completeness %
- **Recent changes**: Timeline of recent updates
- **AI research status**: Pending/completed research tasks
- **Action items**: Data needing review or update
- **Quick stats**: Key metrics at a glance

### 2. Company Profile
- **Basic info tab**: Business name, type, founding date
- **Services tab**: What they offer, service areas
- **Team tab**: Key personnel, org structure
- **Legal tab**: Licenses, insurance, certifications

### 3. Brand Center
- **Visual identity**: Logos, colors, fonts
- **Brand voice**: Personality, messaging guidelines
- **Assets library**: Downloadable brand assets
- **Guidelines**: Do's and don'ts

### 4. Digital Presence
- **Website**: Domain, hosting, technical details
- **Social media**: All connected accounts
- **Listings**: Directory presence
- **Reviews**: Reputation across platforms

### 5. Marketing Hub
- **Campaigns**: Active and historical
- **Content**: Blog posts, videos, resources
- **SEO**: Rankings, technical health
- **Competitors**: Competitive analysis

### 6. Research Center
- **AI research queue**: Pending and completed tasks
- **Manual research notes**: Team observations
- **Data sources**: Connected APIs and access
- **Verification queue**: Changes awaiting approval

## Next Steps
1. Set up Supabase tables with proper indexes
2. Create RLS (Row Level Security) policies
3. Build API endpoints for CRUD operations
4. Implement real-time subscriptions for updates
5. Create UI components for each section
6. Integrate AI research pipeline
7. Set up automated data quality checks
8. Implement version control system
9. Create onboarding flow for new clients
10. Build reporting and export features

## Success Metrics
- Data completeness: Target 85%+ within 30 days
- AI accuracy: 90%+ confidence on automated data
- User engagement: Weekly dashboard visits
- Time savings: 80% reduction in manual research
- Data freshness: Updated within last 90 days