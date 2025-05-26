# Dashboard Implementation Roadmap

## 🎯 Project Overview
Complete the Echo AI Systems client dashboard with full database integration, ensuring all sections save and retrieve data from Supabase.

## 📊 Current Progress
- ✅ Authentication system working
- ✅ Business Information section functional
- ✅ Proper API key configuration
- ✅ Developer documentation created
- 🔄 Contact Information section (next)
- ⏳ Brand Assets section
- ⏳ All other sections

## 🚀 Implementation Schedule

### Week 1: Complete Brand Information Tab
**Goal**: All three sections under Brand Info fully functional

#### Day 1-2: Contact Information
1. Create Supabase table:
```sql
CREATE TABLE contact_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    primary_phone TEXT,
    secondary_phone TEXT,
    primary_email TEXT,
    secondary_email TEXT,
    headquarters_address JSONB,
    mailing_address JSONB,
    billing_address JSONB,
    business_hours JSONB,
    emergency_contact JSONB,
    preferred_contact_method TEXT,
    website_url TEXT,
    social_media_links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact info" ON contact_info
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contact info" ON contact_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contact info" ON contact_info
    FOR UPDATE USING (auth.uid() = user_id);
```

2. Update dashboard.js to handle contact_info table
3. Test save/load functionality
4. Add validation for phone numbers and emails

#### Day 3-4: Brand Assets
1. Create Supabase table:
```sql
CREATE TABLE brand_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    logo_primary_url TEXT,
    logo_secondary_url TEXT,
    logo_icon_url TEXT,
    favicon_url TEXT,
    brand_colors JSONB, -- {primary: '#hex', secondary: '#hex', accent: '#hex'}
    fonts JSONB, -- {heading: 'Font Name', body: 'Font Name'}
    tagline TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    core_values TEXT[],
    brand_voice_guidelines TEXT,
    style_guide_url TEXT,
    brand_guidelines_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and policies
```

2. Add file upload functionality for logos
3. Add color picker for brand colors
4. Test complete Brand Info tab

### Week 2: Core Digital Presence

#### Day 5-6: Website Tab
1. Create table:
```sql
CREATE TABLE digital_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    primary_domain TEXT,
    secondary_domains TEXT[],
    website_platform TEXT,
    cms_type TEXT,
    hosting_provider TEXT,
    ssl_status TEXT,
    ssl_expiry DATE,
    domain_registrar TEXT,
    domain_expiry DATE,
    google_analytics_id TEXT,
    google_tag_manager_id TEXT,
    facebook_pixel_id TEXT,
    other_tracking_codes JSONB,
    sitemap_url TEXT,
    robots_txt_status TEXT,
    page_speed_score INTEGER,
    mobile_responsive BOOLEAN DEFAULT true,
    last_backup_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Day 7-8: Social Media Tab
1. Create table:
```sql
CREATE TABLE social_media_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    platform TEXT NOT NULL,
    profile_url TEXT,
    username TEXT,
    account_id TEXT,
    is_verified BOOLEAN DEFAULT false,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL,
    last_post_date TIMESTAMPTZ,
    account_status TEXT DEFAULT 'active',
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, platform)
);
```

2. Build platform connection interface
3. Add OAuth for major platforms (if time permits)

### Week 3: Business Profiles

#### Day 9-10: Google Business Tab
1. Create table:
```sql
CREATE TABLE google_business_profile (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    profile_name TEXT,
    profile_url TEXT,
    profile_id TEXT,
    primary_category TEXT,
    secondary_categories TEXT[],
    description TEXT,
    attributes JSONB,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL,
    response_rate DECIMAL,
    average_response_time TEXT,
    posts_count INTEGER DEFAULT 0,
    photos_count INTEGER DEFAULT 0,
    verified_status BOOLEAN DEFAULT false,
    suspension_status TEXT,
    service_areas JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Day 11-12: Reputation Tab
1. Create table:
```sql
CREATE TABLE reputation_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    platform_name TEXT NOT NULL,
    platform_url TEXT,
    profile_url TEXT,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL,
    rating_distribution JSONB,
    response_rate DECIMAL,
    claimed_status BOOLEAN DEFAULT false,
    last_review_date TIMESTAMPTZ,
    last_response_date TIMESTAMPTZ,
    monitoring_enabled BOOLEAN DEFAULT true,
    alert_threshold DECIMAL DEFAULT 3.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Week 4: Analytics & Admin

#### Day 13-14: Reports Tab
1. Create report generation system
2. Add export functionality
3. Create report templates

#### Day 15-16: Billing Tab
1. Basic subscription display
2. Payment method management
3. Invoice history

#### Day 17-18: Testing & Polish
1. Full system testing
2. Bug fixes
3. Performance optimization
4. Mobile responsiveness check

## 🛠️ Technical Standards

### For Each Section:
1. **Database First**: Create table with RLS before frontend
2. **Test Authentication**: Ensure user can only see their data
3. **Error Handling**: Show user-friendly messages
4. **Loading States**: Show spinner during data operations
5. **Success Feedback**: Confirm when data saves
6. **Validation**: Check data before saving
7. **Documentation**: Update docs with new tables

### Code Patterns to Follow:
```javascript
// Loading data
const { data, error } = await supabaseClient
    .from('table_name')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();

// Saving data
const { data, error } = await supabaseClient
    .from('table_name')
    .upsert(saveData, { onConflict: 'user_id' });

// Error handling
if (error) {
    if (error.code === '42P01') {
        showNotification('Table not created yet', 'warning');
    }
    return;
}
```

## 📈 Success Metrics
- All sections save/load data correctly
- No authentication errors
- <2 second load times
- Mobile responsive
- Zero data loss
- Proper error messages

## 🚨 Risk Mitigation
- Test each section thoroughly before moving on
- Keep backups of working code
- Document all database schemas
- Test with multiple user accounts
- Monitor Supabase logs daily

## 📞 Support Process
1. Check browser console
2. Check Supabase logs
3. Verify table exists
4. Check RLS policies
5. Confirm API keys match

This roadmap ensures systematic completion of the dashboard with minimal issues.