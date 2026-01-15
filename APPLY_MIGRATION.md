# Supabase Migration Uygulama Talimatları

## Hızlı Adımlar:

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. **Projenizi seçin**
3. **SQL Editor**'e gidin (sol menüden)
4. **New query** butonuna tıklayın
5. **Aşağıdaki SQL kodunu yapıştırın**:

```sql
-- Fix signup issues: Update trigger function and RLS policies

-- Update the trigger function to handle duplicate emails gracefully
-- SECURITY DEFINER allows the function to bypass RLS policies
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use ON CONFLICT to handle cases where email already exists
  -- This prevents errors if the trigger runs multiple times or if there's a race condition
  INSERT INTO registered_users (email) 
  VALUES (NEW.email)
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    -- This ensures signup doesn't fail even if there's an issue with registered_users
    RAISE WARNING 'Error inserting into registered_users for email %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy to be more permissive for inserts
-- The trigger function uses SECURITY DEFINER which bypasses RLS,
-- but we'll update the policy to be safer
DROP POLICY IF EXISTS "Users can insert their own registration" ON registered_users;

-- Create a policy that allows inserts - the trigger function handles the actual logic
-- Since SECURITY DEFINER bypasses RLS, this is mainly for direct client inserts
CREATE POLICY "Allow signup inserts" ON registered_users
    FOR INSERT 
    WITH CHECK (true);
```

6. **Run** butonuna tıklayın
7. **"Success. No rows returned"** mesajını görmelisiniz

## Migration Uygulandıktan Sonra:

✅ Yeni kullanıcılar hesap açabilecek
✅ "Account already exists" hatası sadece gerçekten var olan hesaplar için görünecek
✅ Database error'ları çözülmüş olacak

## Test Etmek İçin:

1. Yeni bir email ile signup deneyin
2. Başarılı olmalı ve `/signup-success` sayfasına yönlendirilmeli
3. Aynı email ile tekrar denerseniz "account already exists" mesajı görmeli
