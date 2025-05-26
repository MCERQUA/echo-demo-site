-- Create brand_assets table
CREATE TABLE IF NOT EXISTS public.brand_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Logo URLs
    logo_primary_url TEXT,
    logo_secondary_url TEXT,
    logo_icon_url TEXT,
    favicon_url TEXT,
    
    -- Brand Colors (stored as JSONB)
    brand_colors JSONB DEFAULT '{
        "primary": "#1a73e8",
        "secondary": "#34a853",
        "accent": "#fbbc04"
    }',
    
    -- Font preferences
    fonts JSONB DEFAULT '{
        "heading": "Inter",
        "body": "Inter"
    }',
    
    -- Brand Messaging
    tagline TEXT,
    brand_story TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    core_values TEXT[],
    
    -- Brand Voice & Guidelines
    brand_voice_guidelines TEXT,
    style_guide_url TEXT,
    brand_guidelines_pdf_url TEXT,
    
    -- Additional Brand Elements
    brand_personality TEXT[],
    target_audience TEXT,
    unique_value_proposition TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own brand assets
CREATE POLICY "Users can view own brand assets" ON public.brand_assets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own brand assets
CREATE POLICY "Users can insert own brand assets" ON public.brand_assets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own brand assets
CREATE POLICY "Users can update own brand assets" ON public.brand_assets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own brand assets
CREATE POLICY "Users can delete own brand assets" ON public.brand_assets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_brand_assets_user_id ON public.brand_assets(user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.brand_assets IS 'Stores brand identity assets and guidelines';
COMMENT ON COLUMN public.brand_assets.brand_colors IS 'JSON format: {primary: "#hex", secondary: "#hex", accent: "#hex", ...}';
COMMENT ON COLUMN public.brand_assets.fonts IS 'JSON format: {heading: "Font Name", body: "Font Name", ...}';
COMMENT ON COLUMN public.brand_assets.core_values IS 'Array of core company values';
COMMENT ON COLUMN public.brand_assets.brand_personality IS 'Array of brand personality traits (e.g., professional, friendly, innovative)';
