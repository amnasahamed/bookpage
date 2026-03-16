-- -----------------------------------------------------
-- CREATE BOOKADMIN SUPERUSER 
-- 
-- Due to a 'Database error checking email' 500 error occurring 
-- on your Supabase API during regular sign-ups, you must run 
-- this script directly inside the Supabase Dashboard SQL Editor.
-- 
-- Email: admin@bookpage.com
-- Password: AdminPassword!2026
-- -----------------------------------------------------

-- 1. Enable pgcrypto for secure password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@bookpage.com';
    
    IF v_user_id IS NULL THEN
        -- Create new user bypassing standard API triggers
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@bookpage.com',
            crypt('AdminPassword!2026', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Super Admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO v_user_id;

        RAISE NOTICE 'Successfully created new admin user with ID: %', v_user_id;
    ELSE
        -- Update password if the account already existed but was inaccessible
        UPDATE auth.users 
        SET encrypted_password = crypt('AdminPassword!2026', gen_salt('bf')),
            updated_at = now()
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Admin user already exists. Password successfully updated.';
    END IF;

    -- 2. Create the corresponding profile record
    DELETE FROM public.profiles WHERE id = v_user_id;
    
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        v_user_id,
        'admin@bookpage.com',
        'BookPage SuperAdmin'
    );
END $$;
