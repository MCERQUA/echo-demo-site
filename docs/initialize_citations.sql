-- Pre-populate directory citations with common directory sites
-- This will add these for all users when they first access the citations tab

-- Create a function to initialize default citations for a user
CREATE OR REPLACE FUNCTION initialize_default_citations(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Only insert if user has no existing citations
    IF NOT EXISTS (SELECT 1 FROM directory_citations WHERE client_id = p_user_id) THEN
        INSERT INTO directory_citations (client_id, site_name, directory_type, status, has_reviews, notes)
        VALUES 
            -- General Business Directories
            (p_user_id, 'Google Business Profile', 'general', 'pending', true, 'Primary listing - most important for local SEO'),
            (p_user_id, 'Yelp', 'general', 'pending', true, 'Popular review platform'),
            (p_user_id, 'Facebook Business', 'general', 'pending', true, 'Social media business page'),
            (p_user_id, 'Bing Places', 'general', 'pending', true, 'Microsoft search directory'),
            (p_user_id, 'Apple Maps', 'general', 'pending', false, 'Important for iPhone users'),
            (p_user_id, 'Yellow Pages', 'general', 'pending', true, 'Traditional directory'),
            (p_user_id, 'Better Business Bureau (BBB)', 'general', 'pending', true, 'Trust and credibility'),
            
            -- Local Directories
            (p_user_id, 'Foursquare', 'local', 'pending', false, 'Location-based platform'),
            (p_user_id, 'Nextdoor', 'local', 'pending', true, 'Neighborhood social network'),
            (p_user_id, 'MapQuest', 'local', 'pending', false, 'Navigation and local search'),
            (p_user_id, 'Citysearch', 'local', 'pending', true, 'Local business reviews'),
            (p_user_id, 'MerchantCircle', 'local', 'pending', true, 'Local business network'),
            
            -- Industry-Specific (Home Services)
            (p_user_id, 'Angi (Angie''s List)', 'industry', 'pending', true, 'Home services marketplace'),
            (p_user_id, 'HomeAdvisor', 'industry', 'pending', true, 'Home improvement professionals'),
            (p_user_id, 'Houzz', 'industry', 'pending', true, 'Home design and renovation'),
            (p_user_id, 'Thumbtack', 'industry', 'pending', true, 'Local service professionals'),
            (p_user_id, 'Porch', 'industry', 'pending', true, 'Home services platform'),
            
            -- Industry-Specific (Other)
            (p_user_id, 'TripAdvisor', 'industry', 'pending', true, 'Travel and hospitality'),
            (p_user_id, 'OpenTable', 'industry', 'pending', true, 'Restaurant reservations'),
            (p_user_id, 'Healthgrades', 'industry', 'pending', true, 'Healthcare providers'),
            (p_user_id, 'Avvo', 'industry', 'pending', true, 'Legal services'),
            (p_user_id, 'Zillow', 'industry', 'pending', true, 'Real estate professionals'),
            
            -- Data Aggregators
            (p_user_id, 'Yext', 'general', 'pending', false, 'Data aggregator - manages multiple listings'),
            (p_user_id, 'Moz Local', 'general', 'pending', false, 'Local SEO and listings management'),
            (p_user_id, 'BrightLocal', 'general', 'pending', false, 'Citation tracking and management'),
            
            -- Social & Other
            (p_user_id, 'LinkedIn Company Page', 'general', 'pending', false, 'Professional networking'),
            (p_user_id, 'Instagram Business', 'general', 'pending', false, 'Visual social platform'),
            (p_user_id, 'Pinterest Business', 'general', 'pending', false, 'Visual discovery platform'),
            (p_user_id, 'Twitter/X Business', 'general', 'pending', false, 'Social media presence');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically initialize citations for new users
CREATE OR REPLACE FUNCTION auto_initialize_citations()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize default citations for the new user
    PERFORM initialize_default_citations(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on clients table (or auth.users if you prefer)
DROP TRIGGER IF EXISTS initialize_user_citations ON clients;
CREATE TRIGGER initialize_user_citations
    AFTER INSERT ON clients
    FOR EACH ROW
    EXECUTE FUNCTION auto_initialize_citations();

-- Note: To initialize citations for existing users, you can run:
-- SELECT initialize_default_citations(user_id) FROM clients;
