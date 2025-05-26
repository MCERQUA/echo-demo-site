-- Create contact_info table
CREATE TABLE IF NOT EXISTS public.contact_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Primary Contact Information
    primary_phone TEXT,
    secondary_phone TEXT,
    primary_email TEXT,
    secondary_email TEXT,
    
    -- Addresses (stored as JSONB for flexibility)
    headquarters_address JSONB DEFAULT '{}',
    mailing_address JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    
    -- Business Hours (stored as JSONB)
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "10:00", "close": "14:00", "closed": false},
        "sunday": {"open": "", "close": "", "closed": true}
    }',
    
    -- Emergency Contact
    emergency_contact JSONB DEFAULT '{}',
    
    -- Contact Preferences
    preferred_contact_method TEXT DEFAULT 'email',
    
    -- Website and Social Media
    website_url TEXT,
    social_media_links JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own contact info
CREATE POLICY "Users can view own contact info" ON public.contact_info
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own contact info
CREATE POLICY "Users can insert own contact info" ON public.contact_info
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own contact info
CREATE POLICY "Users can update own contact info" ON public.contact_info
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own contact info
CREATE POLICY "Users can delete own contact info" ON public.contact_info
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_contact_info_user_id ON public.contact_info(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.contact_info IS 'Stores contact information for businesses';
COMMENT ON COLUMN public.contact_info.headquarters_address IS 'JSON format: {street, city, state, zip, country}';
COMMENT ON COLUMN public.contact_info.business_hours IS 'JSON format: {monday: {open, close, closed}, ...}';
COMMENT ON COLUMN public.contact_info.emergency_contact IS 'JSON format: {name, phone, email, relationship}';
COMMENT ON COLUMN public.contact_info.social_media_links IS 'JSON format: {facebook, twitter, linkedin, instagram, ...}';
