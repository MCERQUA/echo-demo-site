# Echo AI Systems - Dashboard Developer Documentation
*Last Updated: May 26, 2025*

## 🚨 CRITICAL: Authentication & API Keys

### Supabase Configuration
- **Project URL**: `https://orhswpgngjpztcxgwbuy.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY`

### Important Notes:
1. **Always use the correct API key** - The anon key above is the current valid key
2. **Check API Settings** if authentication fails: https://app.supabase.com/project/orhswpgngjpztcxgwbuy/settings/api
3. **Session handling** is automatic with Supabase client - no need to manually set headers

## 📁 Dashboard Architecture

### File Structure
```
dist/
├── dashboard.html          # Main dashboard page
├── js/
│   └── dashboard.js       # Core dashboard functionality
├── css/
│   └── dashboard.css      # Dashboard styling
├── sections/              # HTML templates for each section
│   ├── overview.html
│   ├── brand-info.html
│   ├── social-media.html
│   ├── website.html
│   ├── google-business.html
│   ├── reputation.html
│   ├── reports.html
│   ├── billing.html
│   └── support.html
└── images/
    └── icons/            # Social media and other icons
```

## 🗄️ Database Schema

### Current Tables (Created)
```sql
-- business_info (✅ Working)
CREATE TABLE business_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    business_name TEXT,
    legal_entity_name TEXT,
    business_type TEXT,
    primary_industry TEXT,
    services_offered TEXT[],
    business_description TEXT,
    unique_selling_proposition TEXT,
    founded_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Tables Needed (To Be Created)
```sql
-- contact_info
CREATE TABLE contact_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    primary_phone TEXT,
    secondary_phone TEXT,
    primary_email TEXT,
    support_email TEXT,
    headquarters_address JSONB,
    mailing_address JSONB,
    business_hours JSONB,
    timezone TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- brand_assets
CREATE TABLE brand_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    logo_primary_url TEXT,
    logo_secondary_url TEXT,
    favicon_url TEXT,
    brand_colors JSONB,
    typography JSONB,
    tagline TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    brand_guidelines_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- digital_presence
CREATE TABLE digital_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    primary_domain TEXT,
    additional_domains TEXT[],
    website_platform TEXT,
    hosting_provider TEXT,
    ssl_status TEXT,
    cms_type TEXT,
    google_analytics_id TEXT,
    google_tag_manager_id TEXT,
    facebook_pixel_id TEXT,
    other_tracking_codes JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- social_media_accounts
CREATE TABLE social_media_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    platform TEXT NOT NULL,
    profile_url TEXT,
    username TEXT,
    follower_count INTEGER,
    is_verified BOOLEAN DEFAULT false,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_synced TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- google_business_profile
CREATE TABLE google_business_profile (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    profile_name TEXT,
    profile_id TEXT,
    primary_category TEXT,
    additional_categories TEXT[],
    verified BOOLEAN DEFAULT false,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    response_rate DECIMAL(3,2),
    response_time_hours INTEGER,
    posts_per_month INTEGER,
    photos_count INTEGER,
    last_post_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- reputation_management
CREATE TABLE reputation_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    platform_name TEXT NOT NULL,
    profile_url TEXT,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    monthly_review_velocity INTEGER,
    response_rate DECIMAL(3,2),
    last_review_date DATE,
    last_response_date DATE,
    monitoring_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 RLS Policies Required

For each table, create these RLS policies:

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view own data" ON [table_name]
    FOR SELECT USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can insert own data" ON [table_name]
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update own data" ON [table_name]
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Delete policy
CREATE POLICY "Users can delete own data" ON [table_name]
    FOR DELETE USING (auth.uid() = user_id);
```

## 🛠️ Implementation Guidelines

### Adding New Sections
1. **Create the database table** with proper schema
2. **Set up RLS policies** for security
3. **Update dashboard.js** to handle the new data structure
4. **Create section HTML template** if needed
5. **Test thoroughly** with actual data save/load operations

### Error Handling
- Always check for session validity before database operations
- Handle specific Supabase error codes:
  - `42P01`: Table does not exist
  - `PGRST301`: Row-level security violation
  - `Invalid API key`: API key mismatch
- Show user-friendly error messages
- Log detailed errors to console for debugging

### Best Practices
1. **Use `.maybeSingle()` instead of `.single()`** when data might not exist
2. **Always include `updated_at` field** for tracking changes
3. **Use JSONB for complex data** like addresses, hours, colors
4. **Implement proper loading states** during async operations
5. **Save to database only when user clicks Save** (not on every field change)

## 📋 Implementation Plan

### Phase 1: Complete Brand Information Tab (Week 1)
- [x] Business Information section
- [ ] Contact Information section
- [ ] Brand Assets section

### Phase 2: Digital Presence (Week 1-2)
- [ ] Website details
- [ ] Domain management
- [ ] Analytics integration
- [ ] Tracking codes

### Phase 3: Social Media Integration (Week 2)
- [ ] Platform connections
- [ ] OAuth integration
- [ ] Follower tracking
- [ ] Engagement metrics

### Phase 4: Google Business (Week 2-3)
- [ ] Profile connection
- [ ] Review monitoring
- [ ] Post scheduling
- [ ] Analytics

### Phase 5: Reputation Management (Week 3)
- [ ] Review platform integration
- [ ] Sentiment analysis
- [ ] Response tracking
- [ ] Alerts system

### Phase 6: Reports & Analytics (Week 4)
- [ ] Report generation
- [ ] Data visualization
- [ ] Export functionality
- [ ] Scheduled reports

### Phase 7: Billing & Subscriptions (Week 4)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Invoice history
- [ ] Payment methods

## 🧪 Testing Checklist

For each section implementation:
- [ ] Create database table
- [ ] Set up RLS policies
- [ ] Test data save functionality
- [ ] Test data load functionality
- [ ] Test error scenarios
- [ ] Verify data persistence
- [ ] Check mobile responsiveness
- [ ] Test with multiple user accounts
- [ ] Validate all form fields
- [ ] Test edge cases (empty data, special characters)

## 🚀 Deployment Notes

1. **Always test locally first** using Supabase local development
2. **Run migrations** in proper order
3. **Verify RLS policies** are active
4. **Test with actual user accounts** not just service role
5. **Monitor Supabase logs** for any errors

## 📞 Support Resources

- Supabase Dashboard: https://app.supabase.com/project/orhswpgngjpztcxgwbuy
- API Settings: https://app.supabase.com/project/orhswpgngjpztcxgwbuy/settings/api
- Database Tables: https://app.supabase.com/project/orhswpgngjpztcxgwbuy/editor
- Authentication: https://app.supabase.com/project/orhswpgngjpztcxgwbuy/auth/users

## 🔍 Common Issues & Solutions

### Issue: "Invalid API key" error
**Solution**: Update the anon key in dashboard.js with the current key from Supabase dashboard

### Issue: "Row level security violation"
**Solution**: Ensure RLS policies are created for all CRUD operations

### Issue: Data not saving
**Solution**: Check browser console for errors, verify table exists, check RLS policies

### Issue: Data not loading
**Solution**: Verify user_id matches, check if data exists, use .maybeSingle() instead of .single()

---

This documentation should be updated whenever new features are added or issues are discovered.