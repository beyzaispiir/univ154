-- Ensure week-12 exists in global week settings for admin toggles
INSERT INTO global_week_settings (week_id, is_globally_available, release_date)
VALUES ('week-12', false, NULL)
ON CONFLICT (week_id) DO NOTHING;
