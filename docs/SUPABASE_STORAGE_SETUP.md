# Supabase Storage Setup Instructions

To enable logo and certificate uploads in the Brand Information dashboard, you need to create storage buckets in your Supabase project.

## Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar

## Step 2: Create Storage Buckets

### Create Brand Logos Bucket:
1. Click "New bucket"
2. Name: `brand-logos`
3. Public bucket: ✅ (Check this box)
4. Click "Create bucket"

### Create Certificates Bucket:
1. Click "New bucket"
2. Name: `certificates`
3. Public bucket: ✅ (Check this box)
4. Click "Create bucket"

## Step 3: Set Bucket Policies (Optional)

If you want more control over who can upload:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'brand-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all logos" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-logos');

CREATE POLICY "Users can update their own logos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'brand-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own logos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'brand-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Same policies for certificates bucket
CREATE POLICY "Users can upload their own certificates" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all certificates" ON storage.objects
FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Users can update their own certificates" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own certificates" ON storage.objects
FOR DELETE USING (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 4: Enable CORS (if needed)

If you encounter CORS issues:

1. Go to Settings → API
2. Add your domain to allowed origins:
   - `https://echoaisystem.com`
   - `http://localhost:3000` (for development)

## File Structure

Files will be organized as follows:
- Logos: `brand-logos/{user_id}/primary_{timestamp}.{ext}`
- Certificates: `certificates/{user_id}/cert_{timestamp}_{filename}`

## Testing

After setup:
1. Go to your dashboard
2. Navigate to Brand Information → Brand Assets
3. Try uploading a logo
4. Navigate to Certifications tab
5. Try uploading a certificate

## Troubleshooting

**"Bucket not found" error:**
- Make sure bucket names match exactly: `brand-logos` and `certificates`
- Ensure buckets are set to public

**"Permission denied" error:**
- Check that the user is authenticated
- Verify RLS policies if implemented

**Files not displaying:**
- Verify the bucket is public
- Check browser console for errors
- Ensure file URLs are being stored correctly in the database

## Storage Limits

Default Supabase limits:
- File size: 50MB per file
- Storage: 1GB total (Free tier)
- Bandwidth: 2GB/month (Free tier)

Our implementation limits:
- Logos: 10MB max
- Certificates: 20MB max
