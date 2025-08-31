-- Create week_access table to manage student access to different weeks
CREATE TABLE IF NOT EXISTS week_access (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    week_id TEXT NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    release_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, week_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_week_access_user_email ON week_access(user_email);
CREATE INDEX IF NOT EXISTS idx_week_access_week_id ON week_access(week_id);

-- Insert default data for week 1 access for all existing users
INSERT INTO week_access (user_email, week_id, is_available, release_date)
SELECT DISTINCT email, 'week-1', true, NOW()
FROM user_profiles
ON CONFLICT (user_email, week_id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE week_access ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only see their own week access
CREATE POLICY "Users can view their own week access" ON week_access
    FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Only admins can insert/update week access
CREATE POLICY "Admins can manage week access" ON week_access
    FOR ALL USING (
        auth.jwt() ->> 'email' IN (
            'macmoser@alumni.rice.edu',
            'km108@rice.edu',
            'cl202@rice.edu',
            'jjz3@rice.edu',
            'bi6@rice.edu',
            'beyza.ispir@rice.edu'
        )
    );

-- Create function to automatically create week access for new users
CREATE OR REPLACE FUNCTION create_default_week_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert week 1 access for new user
    INSERT INTO week_access (user_email, week_id, is_available, release_date)
    VALUES (NEW.email, 'week-1', true, NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registrations
CREATE TRIGGER create_week_access_on_user_registration
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_week_access(); 