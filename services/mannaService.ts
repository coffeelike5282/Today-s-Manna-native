import type { MannaData } from '../types/types';
// @ts-ignore
import { MANNA_DATA } from '../data/mannaData';
import { supabase } from './authService';
import { getLocalDateString } from '../utils/dateUtils';

const GIST_URL = 'https://gist.githubusercontent.com/coffeelike5282/c7cf8073dbd29b6d6fa66450d438803a/raw/content_data.js';

interface RawManna {
    date: string;
    reference: string;
    verse: string;
    meaning_title: string;
    meaning: string;
    mission_title: string;
    mission: string;
    reference_en: string;
    verse_en: string;
    meaning_title_en: string;
    meaning_en: string;
    mission_title_en: string;
    mission_en: string;
}

const BR_REGEX = new RegExp('<br>', 'g');

const mapRawToManna = (raw: any, source: 'DB' | 'Offline' = 'DB'): MannaData => {
    // Supabase column names: verse_text, verse_ref, full_verse, interpretation, mission,
    // verse_text_en, verse_ref_en, full_verse_en, interpretation_en, mission_en, date
    return {
        date: raw.date || raw.day || getLocalDateString(),
        // Korean
        verseRef: raw.verse_ref || raw.reference || raw.verseRef || "말씀 참조",
        verseText: (raw.verse_text || raw.verse || raw.verseText || "오늘의 말씀이 준비 중입니다.").replace(BR_REGEX, '\n'),
        fullVerse: (raw.full_verse || raw.verse || raw.verse_text || "").replace(BR_REGEX, ' '),
        interpretation: (raw.interpretation || raw.meaning || raw.meaning_title || "").replace(BR_REGEX, '\n'),
        mission: raw.mission || raw.daily_mission || "",
        // English
        verseRefEn: raw.verse_ref_en || raw.reference_en || raw.verseRefEn || "",
        verseTextEn: (raw.verse_text_en || raw.verse_en || raw.verseTextEn || "").replace(BR_REGEX, '\n'),
        fullVerseEn: (raw.full_verse_en || raw.verse_en || raw.verse_text_en || "").replace(BR_REGEX, ' '),
        interpretationEn: (raw.interpretation_en || raw.meaning_en || raw.interpretationEn || "").replace(BR_REGEX, '\n'),
        missionEn: raw.mission_en || raw.missionEn || "",
        source: source
    };
};

/**
 * Fetch data from Supabase 'manna_verse' table
 */
const fetchMannaFromSupabase = async (targetDate: string): Promise<RawManna | null> => {
    try {
        const { data, error } = await supabase
            .from('manna_verses')
            .select('*')
            .eq('date', targetDate)
            .single();

        if (error) {
            console.warn("Supabase fetch error for date", targetDate, ":", error.message);
            return null;
        }
        if (data) {
            console.log("[DEBUG-DB] Raw Supabase Data for", targetDate, ":", JSON.stringify(data));
        }
        return data as any;
    } catch (error) {
        console.warn("Failed to fetch manna from Supabase:", error);
        return null;
    }
};


/**
 * Get daily manna based on date
 */
export const getDailyManna = async (dateInput?: Date | string): Promise<MannaData> => {
    const targetDate = typeof dateInput === 'string'
        ? dateInput
        : (dateInput instanceof Date
            ? getLocalDateString(dateInput)
            : getLocalDateString());

    // 1. Try Supabase First ('manna_verse' table)
    const remoteData = await fetchMannaFromSupabase(targetDate);
    if (remoteData) {
        const mapped = mapRawToManna(remoteData, 'DB');
        // If critical fields are still placeholders, consider falling back or logging warning
        if (mapped.verseRef !== "말씀 참조" || !remoteData) {
            console.log("Supabase data found and mapped for:", mapped.verseRef);
            return mapped;
        }
        console.log("Supabase data missing critical fields, falling back to local.");
    }

    // 2. Fallback to Local
    const foundLocal = (MANNA_DATA || []).find(d => d.date === targetDate);
    if (foundLocal) {
        console.log("Local data found for:", foundLocal.verseRef);
        return {
            ...foundLocal,
            source: 'Offline'
        };
    }

    // Default Fallback: Use Jan 1st content but set corrected date
    console.log("No data found for", targetDate, ", falling back to placeholder with current date.");
    return {
        ...MANNA_DATA[0],
        date: targetDate,
        source: 'Offline'
    };
};

export const getUserFavorites = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('date')
            .eq('user_id', userId);

        if (error) throw error;
        return data.map(item => item.date);
    } catch (error) {
        console.error('Failed to fetch user favorites:', error);
        return [];
    }
};
