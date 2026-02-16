import type { MannaData } from '../types/types';
// @ts-ignore
import { MANNA_DATA } from '../data/mannaData';
// const MANNA_DATA: any[] = [];

import { supabase } from './authService';

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

const mapRawToManna = (raw: RawManna): MannaData => {
    return {
        date: raw.date,
        verseRef: raw.reference,
        verseText: raw.verse.replace(BR_REGEX, '\n'),
        fullVerse: raw.verse.replace(BR_REGEX, ' '), // fallback
        interpretation: raw.meaning.replace(BR_REGEX, '\n'),
        mission: raw.mission,
        // English fields
        verseRefEn: raw.reference_en,
        verseTextEn: raw.verse_en?.replace(BR_REGEX, '\n'),
        fullVerseEn: raw.verse_en?.replace(BR_REGEX, ' '),
        interpretationEn: raw.meaning_en?.replace(BR_REGEX, '\n'),
        missionEn: raw.mission_en,
    };
};

/**
 * Fetch data from Gist (JavaScript file containing JSON variable)
 */
const fetchRemoteManna = async (): Promise<RawManna[] | null> => {
    try {
        const response = await fetch(GIST_URL);
        const text = await response.text();

        // Extract JSON from "const content_data = [...];"
        const jsonMatch = text.match(/const\s+content_data\s*=\s*(\[[\s\S]*\]);/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        return null;
    } catch (error) {
        console.warn("Failed to fetch remote manna:", error);
        return null;
    }
};

/**
 * Get daily manna based on date
 */
export const getDailyManna = async (dateInput: Date | string = new Date()): Promise<MannaData> => {
    const targetDate = typeof dateInput === 'string' ? dateInput : dateInput.toISOString().split('T')[0];

    // 1. Try Remote First
    const remoteDataList = await fetchRemoteManna();
    if (remoteDataList) {
        const remoteData = remoteDataList.find(d => d.date === targetDate);
        if (remoteData) {
            console.log("Remote data found:", remoteData.reference);
            return mapRawToManna(remoteData);
        }
    }

    // 2. Fallback to Local
    const localData = MANNA_DATA.find(d => d.date === targetDate) || MANNA_DATA[0];
    console.log("Local data found:", localData.verseRef);
    return localData;
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
