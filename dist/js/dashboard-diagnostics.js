// Dashboard Diagnostics - Testing tool for dashboard functionality
console.log('[Dashboard Diagnostics] Starting diagnostic tests...');

// Test function to verify dashboard components
async function testDashboard() {
    const results = {
        supabase: false,
        auth: false,
        client: false,
        tables: {},
        modules: {}
    };
    
    // 1. Check Supabase connection
    console.log('[Test 1] Testing Supabase connection...');
    if (window.supabase) {
        results.supabase = true;
        console.log('✓ Supabase client found');
        
        // Test database connection
        try {
            const { data, error } = await window.supabase
                .from('clients')
                .select('id')
                .limit(1);
            
            if (error) {
                console.error('✗ Supabase connection error:', error);
            } else {
                console.log('✓ Supabase connected successfully');
            }
        } catch (err) {
            console.error('✗ Supabase test failed:', err);
        }
    } else {
        console.error('✗ Supabase client not initialized');
    }
    
    // 2. Check authentication
    console.log('\n[Test 2] Testing authentication...');
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            results.auth = true;
            console.log('✓ User authenticated:', session.user.email);
        } else {
            console.log('✗ No active session');
        }
    } catch (err) {
        console.error('✗ Auth check failed:', err);
    }
    
    // 3. Check client record
    console.log('\n[Test 3] Testing client record...');
    if (results.auth) {
        try {
            const { data: { session } } = await window.supabase.auth.getSession();
            const { data: client, error } = await window.supabase
                .from('clients')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
            
            if (client) {
                results.client = true;
                results.clientId = client.id;
                console.log('✓ Client record found:', client.id);
            } else {
                console.log('✗ No client record found');
            }
        } catch (err) {
            console.error('✗ Client check failed:', err);
        }
    }
    
    // 4. Check database tables
    console.log('\n[Test 4] Testing database tables...');
    const tables = [
        'website_info',
        'website_analytics',
        'reputation_management',
        'directory_citations',
        'online_reputation',
        'reviews'
    ];
    
    for (const table of tables) {
        try {
            const { data, error } = await window.supabase
                .from(table)
                .select('id')
                .limit(1);
            
            if (error && error.code === '42P01') {
                results.tables[table] = 'missing';
                console.log(`✗ Table ${table}: NOT FOUND`);
            } else if (error) {
                results.tables[table] = 'error';
                console.log(`✗ Table ${table}: ERROR - ${error.message}`);
            } else {
                results.tables[table] = 'exists';
                console.log(`✓ Table ${table}: EXISTS`);
            }
        } catch (err) {
            results.tables[table] = 'error';
            console.error(`✗ Table ${table}: ERROR -`, err);
        }
    }
    
    // 5. Check module loading
    console.log('\n[Test 5] Testing module loading...');
    const modules = {
        'websiteManager': window.websiteManager,
        'reputationManager': window.reputationManager,
        'dashboard-core': window.loadSection,
        'showNotification': window.showNotification
    };
    
    Object.entries(modules).forEach(([name, module]) => {
        results.modules[name] = !!module;
        if (module) {
            console.log(`✓ Module ${name}: LOADED`);
        } else {
            console.log(`✗ Module ${name}: NOT FOUND`);
        }
    });
    
    // 6. Check current section
    console.log('\n[Test 6] Current section info...');
    const currentSection = document.querySelector('.nav-link.active');
    if (currentSection) {
        console.log('Current section:', currentSection.textContent.trim());
    }
    
    // Summary
    console.log('\n[Dashboard Diagnostics] Summary:');
    console.log('================================');
    console.log('Supabase:', results.supabase ? '✓ Connected' : '✗ Not connected');
    console.log('Authentication:', results.auth ? '✓ Authenticated' : '✗ Not authenticated');
    console.log('Client Record:', results.client ? '✓ Found' : '✗ Not found');
    console.log('Tables:', Object.values(results.tables).filter(t => t === 'exists').length + '/' + Object.keys(results.tables).length + ' exist');
    console.log('Modules:', Object.values(results.modules).filter(m => m).length + '/' + Object.keys(results.modules).length + ' loaded');
    console.log('================================');
    
    return results;
}

// Function to manually initialize modules
async function initializeModules() {
    console.log('\n[Dashboard Diagnostics] Manually initializing modules...');
    
    // Check which section is active
    const activeSection = document.querySelector('.nav-link.active');
    const sectionName = activeSection ? activeSection.textContent.trim().toLowerCase() : '';
    
    console.log('Active section:', sectionName);
    
    // Initialize based on current section
    if (sectionName.includes('website')) {
        if (window.initializeWebsiteManager) {
            console.log('Initializing WebsiteManager...');
            window.initializeWebsiteManager();
        } else {
            console.log('WebsiteManager not found');
        }
    } else if (sectionName.includes('reputation')) {
        if (window.initializeReputationManager) {
            console.log('Initializing ReputationManager...');
            window.initializeReputationManager();
        } else {
            console.log('ReputationManager not found');
        }
    } else if (sectionName.includes('google')) {
        if (window.initializeGoogleBusinessManager) {
            console.log('Initializing GoogleBusinessManager...');
            window.initializeGoogleBusinessManager();
        } else {
            console.log('GoogleBusinessManager not found');
        }
    } else if (sectionName.includes('social')) {
        if (window.initializeSocialMediaManager) {
            console.log('Initializing SocialMediaManager...');
            window.initializeSocialMediaManager();
        } else {
            console.log('SocialMediaManager not found');
        }
    }
    
    // Also check for containers and initialize if present
    if (document.querySelector('#website-config') && window.initializeWebsiteManager) {
        window.initializeWebsiteManager();
    }
    if (document.querySelector('#reputation-overview') && window.initializeReputationManager) {
        window.initializeReputationManager();
    }
    if (document.querySelector('#google-business-content') && window.initializeGoogleBusinessManager) {
        window.initializeGoogleBusinessManager();
    }
    if (document.querySelector('#social-media-content') && window.initializeSocialMediaManager) {
        window.initializeSocialMediaManager();
    }
}

// Function to create missing tables
function showTableCreationInstructions() {
    const missingTables = [];
    
    Object.entries(testResults.tables || {}).forEach(([table, status]) => {
        if (status === 'missing') {
            missingTables.push(table);
        }
    });
    
    if (missingTables.length > 0) {
        console.log('\n[Dashboard Diagnostics] Missing tables detected!');
        console.log('Please run the following SQL files in your Supabase SQL editor:');
        
        if (missingTables.includes('website_info') || missingTables.includes('website_analytics')) {
            console.log('- docs/website_tables.sql');
        }
        
        if (missingTables.includes('reputation_management') || missingTables.includes('directory_citations')) {
            console.log('- docs/reputation_setup_with_data.sql');
        }
        
        if (missingTables.includes('online_reputation') || missingTables.includes('reviews')) {
            console.log('- Create online_reputation and reviews tables');
        }
    }
}

// Auto-run diagnostics on load
let testResults = null;

// Wait for page to fully load
window.addEventListener('load', async () => {
    setTimeout(async () => {
        console.log('\n[Dashboard Diagnostics] Running automatic tests...');
        testResults = await testDashboard();
        
        // Show table creation instructions if needed
        showTableCreationInstructions();
        
        // Try to initialize modules if they're missing
        if (!window.websiteManager || !window.reputationManager) {
            await initializeModules();
        }
        
        console.log('\n[Dashboard Diagnostics] Tests complete. Run testDashboard() to test again.');
    }, 2000);
});

// Make functions available globally
window.testDashboard = testDashboard;
window.initializeModules = initializeModules;
window.dashboardDiagnostics = {
    test: testDashboard,
    initModules: initializeModules,
    results: () => testResults
};