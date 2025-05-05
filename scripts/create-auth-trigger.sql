-- Create a function that will be triggered when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with more robust null handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    business_name,
    industry,
    sample_quote_url,
    accent_color,
    font_choice,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''), 
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'full_name', NEW.email, 'New Business'),
    COALESCE(NEW.raw_user_meta_data->>'industry', NULL),
    COALESCE(NEW.raw_user_meta_data->>'sample_quote_url', NULL),
    '#7E57C2',
    'Rubik',
    NOW(),
    NOW()
  );
  
  -- Return the result
  RETURN NEW;
EXCEPTION
  -- Catch any errors
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Still allow the user to be created even if profile creation fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to execute this function whenever a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
