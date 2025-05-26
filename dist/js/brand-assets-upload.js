// Brand Assets Upload Handler
// Handles logo and certificate uploads to Supabase Storage

// Initialize storage bucket names
const STORAGE_BUCKETS = {
    logos: 'brand-logos',
    certificates: 'certificates'
};

// Initialize upload functionality when document loads
document.addEventListener('DOMContentLoaded', () => {
    initializeUploadHandlers();
});

// Set up all upload handlers
function initializeUploadHandlers() {
    // Logo upload handler
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        setupLogoUpload(logoUpload);
    }

    // Certificate upload handler
    const certUploadBtn = document.getElementById('cert-upload-btn');
    if (certUploadBtn) {
        certUploadBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.jpg,.jpeg,.png';
            input.multiple = true;
            input.onchange = handleCertificateUpload;
            input.click();
        });
    }
}

// Setup logo upload with drag and drop
function setupLogoUpload(uploadArea) {
    // Click to upload
    uploadArea.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => handleLogoUpload(e.target.files[0], 'primary');
        input.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleLogoUpload(file, 'primary');
        }
    });
}

// Handle logo upload to Supabase Storage
async function handleLogoUpload(file, logoType = 'primary') {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    try {
        showNotification('Uploading logo...', 'info');

        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}/${logoType}_${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from(STORAGE_BUCKETS.logos)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from(STORAGE_BUCKETS.logos)
            .getPublicUrl(fileName);

        // Update brand_assets table with logo URL
        await updateBrandAssets({
            [`logo_${logoType}_url`]: publicUrl
        });

        // Update UI with uploaded logo
        displayUploadedLogo(publicUrl, logoType);

        showNotification('Logo uploaded successfully!', 'success');

    } catch (error) {
        console.error('Error uploading logo:', error);
        showNotification('Failed to upload logo. Please try again.', 'error');
    }
}

// Handle certificate upload
async function handleCertificateUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
        showNotification('Uploading certificates...', 'info');

        const uploadPromises = [];
        
        for (const file of files) {
            // Validate file
            if (!isValidCertificateFile(file)) {
                showNotification(`${file.name} is not a valid certificate file`, 'error');
                continue;
            }

            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/cert_${Date.now()}_${file.name}`;

            // Upload to Supabase Storage
            uploadPromises.push(
                supabaseClient.storage
                    .from(STORAGE_BUCKETS.certificates)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    })
            );
        }

        const results = await Promise.allSettled(uploadPromises);
        
        const successfulUploads = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && !result.value.error) {
                const fileName = result.value.data.path;
                const { data: { publicUrl } } = supabaseClient.storage
                    .from(STORAGE_BUCKETS.certificates)
                    .getPublicUrl(fileName);
                
                successfulUploads.push({
                    name: files[index].name,
                    url: publicUrl,
                    uploadedAt: new Date().toISOString()
                });
            }
        });

        if (successfulUploads.length > 0) {
            // Store certificate info in database
            await saveCertificates(successfulUploads);
            
            // Update UI
            displayCertificates(successfulUploads);
            
            showNotification(`${successfulUploads.length} certificate(s) uploaded successfully!`, 'success');
        }

    } catch (error) {
        console.error('Error uploading certificates:', error);
        showNotification('Failed to upload certificates. Please try again.', 'error');
    }
}

// Update brand assets in database
async function updateBrandAssets(updates) {
    try {
        // First check if record exists
        const { data: existing } = await supabaseClient
            .from('brand_assets')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();

        if (existing) {
            // Update existing record
            const { error } = await supabaseClient
                .from('brand_assets')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUser.id);

            if (error) throw error;
        } else {
            // Create new record
            const { error } = await supabaseClient
                .from('brand_assets')
                .insert({
                    user_id: currentUser.id,
                    ...updates
                });

            if (error) throw error;
        }

    } catch (error) {
        console.error('Error updating brand assets:', error);
        throw error;
    }
}

// Save certificates to database
async function saveCertificates(certificates) {
    try {
        // Get existing certificates
        const { data: brandAssets } = await supabaseClient
            .from('brand_assets')
            .select('brand_guidelines_pdf_url')
            .eq('user_id', currentUser.id)
            .single();

        // Parse existing certificates or create new array
        let existingCerts = [];
        if (brandAssets?.brand_guidelines_pdf_url) {
            try {
                existingCerts = JSON.parse(brandAssets.brand_guidelines_pdf_url);
            } catch (e) {
                existingCerts = [];
            }
        }

        // Add new certificates
        const updatedCerts = [...existingCerts, ...certificates];

        // Update database
        await updateBrandAssets({
            brand_guidelines_pdf_url: JSON.stringify(updatedCerts)
        });

    } catch (error) {
        console.error('Error saving certificates:', error);
        throw error;
    }
}

// Display uploaded logo in UI
function displayUploadedLogo(url, logoType) {
    const uploadArea = document.getElementById('logo-upload');
    if (!uploadArea) return;

    // Create image element
    const img = document.createElement('img');
    img.src = url;
    img.alt = `${logoType} logo`;
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'contain';

    // Clear upload area and add image
    uploadArea.innerHTML = '';
    uploadArea.appendChild(img);

    // Add change button
    const changeBtn = document.createElement('button');
    changeBtn.className = 'btn-secondary btn-sm';
    changeBtn.textContent = 'Change Logo';
    changeBtn.style.marginTop = '1rem';
    changeBtn.onclick = (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => handleLogoUpload(e.target.files[0], logoType);
        input.click();
    };
    uploadArea.appendChild(changeBtn);
}

// Display certificates in UI
function displayCertificates(certificates) {
    const certList = document.getElementById('certifications-list');
    if (!certList) return;

    // Remove empty state
    const emptyState = certList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    // Add certificates to list
    certificates.forEach(cert => {
        const certCard = document.createElement('div');
        certCard.className = 'certification-card';
        certCard.innerHTML = `
            <div class="cert-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                </svg>
            </div>
            <div class="cert-info">
                <h4>${cert.name}</h4>
                <span class="cert-date">Uploaded ${new Date(cert.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div class="cert-actions">
                <a href="${cert.url}" target="_blank" class="btn-icon" title="View">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </a>
                <button class="btn-icon" title="Delete" onclick="deleteCertificate('${cert.url}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>`;
        certList.appendChild(certCard);
    });
}

// Delete certificate
async function deleteCertificate(url) {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
        // Extract file path from URL
        const urlParts = url.split('/');
        const fileName = urlParts.slice(-2).join('/'); // user_id/filename

        // Delete from storage
        const { error: storageError } = await supabaseClient.storage
            .from(STORAGE_BUCKETS.certificates)
            .remove([fileName]);

        if (storageError) {
            console.error('Storage deletion error:', storageError);
        }

        // Update database
        const { data: brandAssets } = await supabaseClient
            .from('brand_assets')
            .select('brand_guidelines_pdf_url')
            .eq('user_id', currentUser.id)
            .single();

        if (brandAssets?.brand_guidelines_pdf_url) {
            try {
                let certs = JSON.parse(brandAssets.brand_guidelines_pdf_url);
                certs = certs.filter(cert => cert.url !== url);
                
                await updateBrandAssets({
                    brand_guidelines_pdf_url: JSON.stringify(certs)
                });

                // Remove from UI
                location.reload(); // Simple reload to refresh the list
                
                showNotification('Certificate deleted successfully', 'success');
            } catch (e) {
                console.error('Error updating certificates:', e);
            }
        }

    } catch (error) {
        console.error('Error deleting certificate:', error);
        showNotification('Failed to delete certificate', 'error');
    }
}

// Validate certificate file
function isValidCertificateFile(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!validTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

// Load existing brand assets on page load
async function loadBrandAssets() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient
            .from('brand_assets')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            console.error('Error loading brand assets:', error);
            return;
        }

        if (data) {
            // Display logo if exists
            if (data.logo_primary_url) {
                displayUploadedLogo(data.logo_primary_url, 'primary');
            }

            // Display certificates if exist
            if (data.brand_guidelines_pdf_url) {
                try {
                    const certificates = JSON.parse(data.brand_guidelines_pdf_url);
                    if (Array.isArray(certificates) && certificates.length > 0) {
                        displayCertificates(certificates);
                    }
                } catch (e) {
                    console.error('Error parsing certificates:', e);
                }
            }
        }
    } catch (error) {
        console.error('Error loading brand assets:', error);
    }
}

// Initialize when brand info tab is shown
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('dashboard')) {
        // Load assets when brand assets tab is shown
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'brand-assets' && 
                    mutation.target.classList.contains('active')) {
                    loadBrandAssets();
                }
            });
        });

        const brandAssetsTab = document.getElementById('brand-assets');
        if (brandAssetsTab) {
            observer.observe(brandAssetsTab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
    }
});

// Export functions for use in other modules
window.brandAssetsUpload = {
    handleLogoUpload,
    handleCertificateUpload,
    loadBrandAssets
};
