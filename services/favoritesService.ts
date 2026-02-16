import { supabase } from './authService';

export interface FavoriteManna {
    id?: string;
    user_id: string;
    date: string;
    reference: string;
    verse: string;
    interpretation?: string;
    mission?: string;
    reference_en?: string;
    verse_en?: string;
    interpretation_en?: string;
    mission_en?: string;
    created_at?: string;
}

/**
 * Get all favorite dates for a user (for calendar dots)
 */
export const getFavoriteDates = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('date')
            .eq('user_id', userId);

        if (error) throw error;

        // Return array of date strings
        return data.map((item: { date: string }) => item.date);
    } catch (error) {
        console.error('Error fetching favorite dates:', error);
        return [];
    }
};

/**
 * Add a manna to favorites
 */
export const addFavorite = async (
    userId: string,
    date: string,
    reference: string,
    verse: string,
    interpretation?: string,
    mission?: string,
    reference_en?: string,
    verse_en?: string,
    interpretation_en?: string,
    mission_en?: string
) => {
    // 1. Check if already exists to prevent duplicates
    const existing = await isFavorited(userId, date);
    if (existing) {
        console.log('Favorite already exists for this date, skipping insert.');
        return null; // Or return existing record if needed
    }

    // 2. Insert if not exists
    const { data, error } = await supabase
        .from('favorites')
        .insert([
            {
                user_id: userId,
                date: date,
                reference: reference,
                verse: verse,
                interpretation: interpretation,
                mission: mission,
                reference_en: reference_en,
                verse_en: verse_en,
                interpretation_en: interpretation_en,
                mission_en: mission_en,
            },
        ])
        .select();

    if (error) {
        console.warn('Error adding favorite:', error);
        throw error;
    }
    return data ? data[0] : null;
};

/**
 * Remove a manna from favorites
 */
export const removeFavorite = async (userId: string, date: string) => {
    // Delete ALL records matching user_id and date (in case of duplicates)
    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

    if (error) {
        console.warn('Error removing favorite:', error);
        throw error;
    }
};

/**
 * Check if a date is favorited by the user
 */
export const isFavorited = async (userId: string, date: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: userId, date: date })
        .maybeSingle();

    if (error) {
        console.warn('Error checking favorite status:', error);
        return false;
    }
    return !!data;
};

/**
 * Get all favorites for a user
 */
export const getFavorites = async (userId: string): Promise<FavoriteManna[]> => {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.warn('Error fetching favorites:', error);
        throw error;
    }
    return data || [];
};
