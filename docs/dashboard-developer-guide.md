# Dashboard Developer Documentation

## Critical Configuration

### Supabase Setup
- **Project URL**: `https://orhswpgngjpztcxgwbuy.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMzUwNjgsImV4cCI6MjA2MzcxMTA2OH0.UNn_iNSkUOa1uxmoqz3MEdRuts326XVbR9MBHLiTltY`
- **Service Role Key**: Never use in client-side code!

### Common Issues & Solutions

#### 1. "Invalid API key" Error
**Cause**: Using incorrect or outdated anon key
**Solution**: 
- Get correct key from Supabase Dashboard > Settings > API
- Update in dashboard.js, login.js, and any other files using Supabase

#### 2. 401 Unauthorized Errors
**Cause**: RLS policies not configured or session expired
**Solution**:
- Ensure RLS policies exist for all tables
- Check user session is valid
- Verify user_id matches auth.uid()

#### 3. "Table does not exist" Error
**Cause**: Database table not created
**Solution**: Create table with proper schema before using

## Database Schema

### Current Tables

#### business_info ✅
```sql
CREATE TABLE business_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    business_name TEXT,
    legal_entity_name TEXT,
    dba_names TEXT[],
    business_type TEXT,
    ein_tax_id TEXT,
    primary_industry TEXT,
    secondary_industries TEXT[],
    services_offered TEXT[],
    target_market TEXT,
    service_areas TEXT[],
    founded_date DATE,
    number_of_employees TEXT,
    annual_revenue_range TEXT,
    business_description TEXT,
    unique_selling_proposition TEXT,
    company_values TEXT[],
    licenses JSONB,
    certifications JSONB,
    insurance_policies JSONB,
    bonded BOOLEAN DEFAULT false,
    bond_amount DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified TIMESTAMPTZ,
    data_source TEXT,
    confidence_score DECIMAL
);

-- Enable RLS
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON business_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON business_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON business_info
    FOR UPDATE USING (auth.uid() = user_id);
```

### Tables to Create

#### contact_info
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Create policies (same pattern as business_info)
```

#### brand_assets
```sql
CREATE TABLE brand_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    logo_primary_url TEXT,
    logo_secondary_url TEXT,
    logo_icon_url TEXT,
    brand_colors JSONB,
    fonts JSONB,
    tagline TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    brand_voice_guidelines TEXT,
    style_guide_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
```

## Frontend Implementation Guidelines

### 1. Always Check Authentication
```javascript
const { data: { session }, error } = await supabaseClient.auth.getSession();
if (!session) {
    redirectToLogin();
    return;
}
```

### 2. Handle Errors Gracefully
```javascript
const { data, error } = await supabaseClient
    .from('table_name')
    .upsert(saveData, { onConflict: 'user_id' });

if (error) {
    if (error.code === '42P01') {
        showNotification('Table not set up yet', 'warning');
    } else if (error.code === 'PGRST301') {
        showNotification('Permission denied', 'error');
    }
    return;
}
```

### 3. Use Consistent Data Structure
```javascript
// Always initialize empty data structure
clientData = {
    businessInfo: {},
    contactInfo: {},
    brandAssets: {},
    // ... etc
};

// Then load from database
const { data } = await supabaseClient
    .from('business_info')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();
```

### 4. Save Pattern
```javascript
// Prepare data
const saveData = {
    ...clientData[dataKey],
    user_id: currentUser.id,
    updated_at: new Date().toISOString()
};

// Remove nulls
Object.keys(saveData).forEach(key => {
    if (saveData[key] === null || saveData[key] === undefined || saveData[key] === '') {
        delete saveData[key];
    }
});

// Save with upsert
const { data, error } = await supabaseClient
    .from(tableName)
    .upsert(saveData, { onConflict: 'user_id' });
```

## Testing Checklist

Before deploying any new section:
- [ ] Create database table with proper schema
- [ ] Enable RLS on the table
- [ ] Create SELECT, INSERT, UPDATE policies
- [ ] Test with a real user account
- [ ] Verify data saves correctly
- [ ] Check data loads on page refresh
- [ ] Test error scenarios (no table, no permission)
- [ ] Ensure proper error messages show

## File Structure

```
dist/
├── js/
│   ├── dashboard.js      # Main dashboard logic
│   └── auth.js          # Authentication utilities
├── css/
│   └── dashboard.css    # Dashboard styles
├── sections/            # HTML templates for each section
│   ├── overview.html
│   ├── brand-info.html
│   └── ...
└── dashboard.html       # Main dashboard page
```

## Deployment Process

1. Always test locally first
2. Check Supabase logs for any errors
3. Clear browser cache after updates
4. Monitor error logs for first 24 hours

## Support

For issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify API keys are correct
4. Ensure tables exist with proper RLS