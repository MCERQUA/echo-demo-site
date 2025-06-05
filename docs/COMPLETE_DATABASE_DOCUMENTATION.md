# Echo AI System - Complete Database Documentation

Last Updated: June 4, 2025

## Overview

The Echo AI System uses a PostgreSQL database hosted on Supabase with a comprehensive schema designed to track all aspects of a company's digital presence, brand reputation, and marketing efforts. The database follows a client-based architecture where all data is linked through the central `clients` table.

## Database Architecture

### Core Principles

1. **Client-Based Architecture**: All data is linked through the `clients` table using `client_id` foreign keys
2. **Row Level Security (RLS)**: All tables have RLS enabled to ensure data isolation between users
3. **Automatic Timestamps**: All tables include `created_at` and `updated_at` fields with automatic triggers
4. **Audit Trail**: The `data_change_history` table tracks all modifications
5. **Flexible JSON Storage**: Using JSONB fields for flexible, schema-less data where appropriate

## Complete Table Structure

### 1. clients
**Purpose**: Main account table linking auth.users to all client data

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| status | VARCHAR(50) | active, inactive, pending, suspended |
| onboarding_completed | BOOLEAN | Tracks onboarding status |
| ai_research_enabled | BOOLEAN | Enable/disable AI features |

### 2. business_info
**Purpose**: Comprehensive business details and certifications

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| business_name | VARCHAR(255) | Display name |
| legal_entity_name | VARCHAR(255) | Legal name |
| dba_names | TEXT[] | Doing Business As names |
| business_type | VARCHAR(100) | LLC, Corp, etc. |
| ein_tax_id | VARCHAR(20) | Tax ID |
| primary_industry | VARCHAR(100) | Main industry |
| services_offered | TEXT[] | List of services |
| licenses | JSONB | Business licenses |
| certifications | JSONB | Professional certifications |
| insurance_policies | JSONB | Insurance details |

### 3. contact_info
**Purpose**: All contact details and locations

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| primary_contact_name | VARCHAR(255) | Main contact person |
| primary_phone | VARCHAR(20) | Primary phone |
| primary_email | VARCHAR(255) | Primary email |
| headquarters_address | JSONB | Main office location |
| locations | JSONB[] | Multiple locations |
| business_hours | JSONB | Operating hours |
| social_media_links | JSONB | Social profiles |

### 4. brand_assets
**Purpose**: Brand identity and guidelines

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| logo_primary_url | TEXT | Main logo URL |
| logo_variations | JSONB[] | Logo versions |
| brand_colors | JSONB[] | Color palette |
| typography | JSONB | Font specifications |
| brand_personality | TEXT[] | Brand traits |
| tagline | VARCHAR(255) | Company tagline |
| mission_statement | TEXT | Mission statement |
| vision_statement | TEXT | Vision statement |

### 5. digital_presence
**Purpose**: Website and technical infrastructure

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| primary_domain | VARCHAR(255) | Main website |
| website_platform | VARCHAR(100) | CMS type |
| hosting_provider | VARCHAR(100) | Host name |
| ssl_status | VARCHAR(50) | SSL certificate status |
| google_analytics_id | VARCHAR(50) | GA tracking ID |
| current_monthly_traffic | INTEGER | Traffic volume |
| current_seo_score | INTEGER | SEO health score |

### 6. social_media_accounts
**Purpose**: Social platform connections and metrics

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| platform | VARCHAR(50) | Platform name |
| username | VARCHAR(100) | Account handle |
| follower_count | INTEGER | Followers |
| engagement_rate | DECIMAL(5,2) | Engagement % |
| connected | BOOLEAN | API connected |
| last_post_date | DATE | Recent activity |

### 7. google_business_profile
**Purpose**: Google My Business data

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| profile_name | VARCHAR(255) | Business name |
| place_id | VARCHAR(100) | Google Place ID |
| total_reviews | INTEGER | Review count |
| average_rating | DECIMAL(2,1) | Star rating |
| response_rate | DECIMAL(5,2) | Response % |
| total_photos | INTEGER | Photo count |

### 8. online_reputation
**Purpose**: Multi-platform review aggregation

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| platform | VARCHAR(50) | Review platform |
| total_reviews | INTEGER | Review count |
| average_rating | DECIMAL(2,1) | Star rating |
| response_rate | DECIMAL(5,2) | Response % |
| trending | VARCHAR(20) | up, down, stable |

### 9. reviews
**Purpose**: Individual review tracking

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| reputation_id | UUID | References online_reputation.id |
| platform | VARCHAR(50) | Source platform |
| rating | INTEGER | 1-5 stars |
| review_text | TEXT | Review content |
| response_text | TEXT | Business response |
| sentiment | VARCHAR(20) | positive, negative, neutral |

### 10. competitors
**Purpose**: Competitive analysis

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| competitor_name | VARCHAR(255) | Business name |
| website_url | TEXT | Website |
| market_position | VARCHAR(50) | Market ranking |
| strengths | TEXT[] | Competitive advantages |
| weaknesses | TEXT[] | Disadvantages |

### 11. marketing_campaigns
**Purpose**: Campaign tracking and ROI

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| campaign_name | VARCHAR(255) | Campaign title |
| status | VARCHAR(50) | planning, active, completed |
| budget_amount | DECIMAL(10,2) | Budget |
| spent_amount | DECIMAL(10,2) | Actual spend |
| roi | DECIMAL(10,2) | Return on investment |

### 12. seo_data
**Purpose**: SEO metrics and performance

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| tracked_keywords | JSONB | Keyword list |
| site_health_score | INTEGER | Technical SEO |
| total_backlinks | INTEGER | Link count |
| domain_authority | INTEGER | DA score |

### 13. keywords
**Purpose**: Individual keyword tracking

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| keyword | VARCHAR(255) | Search term |
| search_volume | INTEGER | Monthly searches |
| current_position | INTEGER | SERP position |
| featured_snippet | BOOLEAN | Snippet status |

### 14. customer_insights
**Purpose**: Target audience analysis

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| primary_age_range | VARCHAR(50) | Age demographic |
| gender_distribution | JSONB | Gender breakdown |
| interests | TEXT[] | Customer interests |
| customer_personas | JSONB | Detailed personas |

### 15. content_library
**Purpose**: Content performance tracking

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| content_type | VARCHAR(50) | Blog, video, etc. |
| title | VARCHAR(255) | Content title |
| views | INTEGER | View count |
| engagement_rate | DECIMAL(5,2) | Engagement % |

### 16. social_media_posts
**Purpose**: Post performance metrics

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| account_id | UUID | References social_media_accounts.id |
| platform | VARCHAR(50) | Platform name |
| content | TEXT | Post content |
| reach | INTEGER | People reached |
| engagement | INTEGER | Total engagement |

### 17. subscriptions
**Purpose**: Billing and plan management

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| plan_name | VARCHAR(100) | Subscription plan |
| plan_tier | VARCHAR(50) | starter, professional, enterprise |
| amount | DECIMAL(10,2) | Monthly price |
| features | JSONB | Plan features |

### 18. ai_research_queue
**Purpose**: Automated research task management

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| research_type | VARCHAR(100) | Type of research |
| status | VARCHAR(50) | pending, completed, failed |
| findings | JSONB | Research results |
| confidence_score | DECIMAL(3,2) | Result confidence |

### 19. data_change_history
**Purpose**: Complete audit trail

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References clients.id |
| table_name | VARCHAR(100) | Modified table |
| field_name | VARCHAR(100) | Modified field |
| old_value | JSONB | Previous value |
| new_value | JSONB | New value |
| changed_by | UUID | User who made change |

### 20. directory_citations
**Purpose**: Business directory listings

| Column | Type | Description |
|--------|------|-------------|
| client_id | UUID | References auth.users (legacy) |
| site_name | VARCHAR(255) | Directory name |
| live_url | TEXT | Listing URL |
| profile_claimed | BOOLEAN | Ownership status |
| review_count | INTEGER | Reviews on platform |

## Test Data Summary

### Test Account: PrintGuys Pro
- **User**: mikecerqua@gmail.com
- **Company**: PrintGuys Pro - Professional printing services in Toronto
- **Industry**: Printing & Marketing Services
- **Employees**: 12
- **Revenue**: $1M - $2.5M

### Populated Data:
- ✅ Complete business profile with certifications
- ✅ Full contact information with multiple locations
- ✅ Brand assets including colors (#0066CC, #FF6600) and fonts
- ✅ 5 connected social media accounts with metrics
- ✅ Website data (printguyspro.com, 15k monthly traffic)
- ✅ Google Business Profile (124 reviews, 4.8★)
- ✅ 5 reputation platforms monitored
- ✅ 3 competitor profiles
- ✅ 4 marketing campaigns with ROI data
- ✅ 7 tracked SEO keywords
- ✅ Customer personas (3 detailed profiles)
- ✅ 4 content library items
- ✅ Active subscription ($299/month)

## Security Features

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data:

```sql
CREATE POLICY "Users can view their own data" ON table_name
    FOR SELECT USING (client_id = get_client_id(auth.uid()));
```

### Helper Functions
- `get_client_id(user_uuid)`: Returns client_id for a given user
- `update_updated_at_column()`: Automatically updates timestamps
- `handle_new_user()`: Creates client records on signup

## Best Practices

1. **Always use client_id** for data relationships
2. **Use JSONB** for flexible, evolving data structures
3. **Include timestamps** on all tables
4. **Log changes** to data_change_history for critical fields
5. **Validate data** at the database level with CHECK constraints
6. **Index foreign keys** and frequently queried fields

## Migration History

1. Initial schema creation
2. Added missing tables for complete dashboard support
3. Updated existing tables to use client_id
4. Added test data for PrintGuys Pro account
5. Enhanced tables with additional tracking fields

## Future Enhancements

1. **Partitioning**: Consider partitioning large tables like reviews and social_media_posts
2. **Archiving**: Implement data archiving for historical data
3. **Analytics Views**: Create materialized views for dashboard performance
4. **API Integration**: Add webhook tables for real-time updates
5. **Machine Learning**: Add tables for AI/ML model results and predictions
