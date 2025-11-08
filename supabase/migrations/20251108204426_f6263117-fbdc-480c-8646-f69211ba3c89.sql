-- Create profiles table for users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create skill_profiles table to store analyzed skill profiles
CREATE TABLE IF NOT EXISTS public.skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL,
  data_sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill profiles"
  ON public.skill_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill profiles"
  ON public.skill_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill profiles"
  ON public.skill_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create validated_skills table to store user validations
CREATE TABLE IF NOT EXISTS public.validated_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'rejected', 'edited')),
  original_confidence INTEGER,
  edited_confidence INTEGER,
  original_evidence JSONB,
  edited_evidence JSONB,
  user_feedback TEXT,
  validated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.validated_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own validated skills"
  ON public.validated_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validated skills"
  ON public.validated_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own validated skills"
  ON public.validated_skills FOR UPDATE
  USING (auth.uid() = user_id);

-- Create skill_timeline table to store temporal skill data
CREATE TABLE IF NOT EXISTS public.skill_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  first_observed_date DATE,
  last_observed_date DATE,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.skill_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill timeline"
  ON public.skill_timeline FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill timeline"
  ON public.skill_timeline FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill timeline"
  ON public.skill_timeline FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_profiles_updated_at
  BEFORE UPDATE ON public.skill_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();