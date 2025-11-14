-- Create or update the handle_new_user function that auto-creates profile and wallet
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert into profiles table using metadata from signup
  insert into public.profiles (id, full_name, email, phone, zcash_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'Z' || upper(substring(md5(random()::text) from 1 for 8))
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    phone = coalesce(excluded.phone, profiles.phone);

  -- Insert into main_wallets table
  insert into public.main_wallets (user_id, balance, currency)
  values (
    new.id,
    0,
    'NGN'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger that fires after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
