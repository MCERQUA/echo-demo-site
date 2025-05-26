-- Citations Directory Table for Reputation Management
CREATE TABLE IF NOT EXISTS directory_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Directory Information
    site_name VARCHAR(255) NOT NULL,
    directory_type VARCHAR(50), -- 'general', 'industry', 'local', 'niche'
    
    -- Login Credentials
    username VARCHAR(255),
    password TEXT, -- Should be encrypted
    
    -- Profile Information
    live_url TEXT,
    profile_claimed BOOLEAN DEFAULT FALSE,
    profile_verified BOOLEAN DEFAULT FALSE,
    
    -- Review Information
    has_reviews BOOLEAN DEFAULT FALSE,
    reviews_url TEXT,
    review_count INTEGER DEFAULT 0,
    average_rating DECIMAL(2,1),
    
    -- Metadata
    last_checked DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'needs_update', 'inactive'
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_directory_citations_client_id ON directory_citations(client_id);
CREATE INDEX idx_directory_citations_site_name ON directory_citations(site_name);
CREATE INDEX idx_directory_citations_status ON directory_citations(status);

-- Enable Row Level Security
ALTER TABLE directory_citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own citations" ON directory_citations 
    FOR SELECT USING (auth.uid() = client_id);
    
CREATE POLICY "Users can insert own citations" ON directory_citations 
    FOR INSERT WITH CHECK (auth.uid() = client_id);
    
CREATE POLICY "Users can update own citations" ON directory_citations 
    FOR UPDATE USING (auth.uid() = client_id);
    
CREATE POLICY "Users can delete own citations" ON directory_citations 
    FOR DELETE USING (auth.uid() = client_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_directory_citations_updated_at 
    BEFORE UPDATE ON directory_citations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
