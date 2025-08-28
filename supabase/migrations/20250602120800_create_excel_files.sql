-- Create excel_files table
CREATE TABLE excel_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE excel_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
    ON excel_files FOR SELECT
    USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own files"
    ON excel_files FOR INSERT
    WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own files"
    ON excel_files FOR UPDATE
    USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own files"
    ON excel_files FOR DELETE
    USING (auth.jwt() ->> 'email' = user_email);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_excel_files_updated_at
    BEFORE UPDATE ON excel_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage policies for excel_files bucket
CREATE POLICY "Users can view their own Excel files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'excel_files' AND (auth.jwt() ->> 'email') = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload Excel files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'excel_files' 
        AND (auth.jwt() ->> 'email') = (storage.foldername(name))[1]
        AND (LOWER(storage.extension(name)) = '.xlsx' OR LOWER(storage.extension(name)) = '.xls')
    );

CREATE POLICY "Users can update their Excel files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'excel_files'
        AND (auth.jwt() ->> 'email') = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their Excel files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'excel_files'
        AND (auth.jwt() ->> 'email') = (storage.foldername(name))[1]
    );
