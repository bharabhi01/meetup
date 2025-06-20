-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetups table
CREATE TABLE public.meetups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
    user1_id UUID REFERENCES public.profiles(id) NOT NULL,
    user2_id UUID REFERENCES public.profiles(id) NOT NULL,
    user1_location TEXT,
    user2_location TEXT,
    user1_coordinates JSONB,
    user2_coordinates JSONB,
    selected_activities TEXT[],
    midpoint_coordinates JSONB,
    selected_venue JSONB,
    itinerary JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity preferences
CREATE TABLE public.activity_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    activities TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue suggestions
CREATE TABLE public.venue_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meetup_id UUID REFERENCES public.meetups(id) NOT NULL,
    venue_data JSONB NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_suggestions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Meetups policies
CREATE POLICY "Users can view their meetups" ON public.meetups
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create meetups" ON public.meetups
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their meetups" ON public.meetups
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Activity preferences policies
CREATE POLICY "Users can manage own preferences" ON public.activity_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Venue suggestions policies
CREATE POLICY "Users can view venue suggestions for their meetups" ON public.venue_suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.meetups 
            WHERE id = meetup_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can create venue suggestions for their meetups" ON public.venue_suggestions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meetups 
            WHERE id = meetup_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );
