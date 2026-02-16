import { MannaData } from '../types/types';
// @ts-ignore
import { MANNA_DATA } from '../data/mannaData';

// User's Gist URL for content_data.js
const GITHUB_GIST_URL = "https://gist.githubusercontent.com/coffeelike5282/c7cf8073dbd29b6d6fa66450d438803a/raw/content_data.js";

interface RawManna {
    date: string;
    reference: string;
    verse: string;
    meaning_title: string;
    meaning: string;
    mission_title: string;
    mission: string;

    // Optional English fields
    reference_en?: string;
    verse_en?: string;
    meaning_en?: string;
    mission_en?: string;
}

const mapRawToManna = (rawData: RawManna): MannaData => {
    return {
        date: rawData.date,
        verseRef: rawData.reference,
        verseText: rawData.verse.replace(/<br>/g, '\n'),
        fullVerse: rawData.verse.replace(/<br>/g, ' '),
        interpretation: rawData.meaning.replace(/<br>/g, '\n'),
        mission: rawData.mission,

        // English fields mapping
        verseRefEn: rawData.reference_en,
        verseTextEn: rawData.verse_en?.replace(/<br>/g, '\n'),
        fullVerseEn: rawData.verse_en?.replace(/<br>/g, ' '),
        interpretationEn: rawData.meaning_en?.replace(/<br>/g, '\n'),
        missionEn: rawData.mission_en
    };
};

export const getDailyManna = async (dateInput: Date | string = new Date()): Promise<MannaData | null> => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // 1. Try Gist (Remote) - Handle JS file content
    try {
        const response = await fetch(GITHUB_GIST_URL);
        if (response.ok) {
            const text = await response.text();
            // Extract JSON array from JS "const MANNA_DATA = [...]"
            const jsonStart = text.indexOf('[');
            const jsonEnd = text.lastIndexOf(']') + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonString = text.substring(jsonStart, jsonEnd);
                const remoteDataArray = JSON.parse(jsonString); // Parse the extracted JSON string

                const remoteData = (remoteDataArray as RawManna[]).find((d: RawManna) => d.date === dateString);

                if (remoteData) {
                    console.log("Using Remote Gist Data (Parsed from JS)");
                    const mappedData = mapRawToManna(remoteData);
                    return mappedData;
                } else {
                    console.log(`No remote data found for date: ${dateString}. Falling back to local.`);
                }
            }
        }
    } catch (e) {
        console.log("Gist fetch/parse failed, using local fallback.", e);
    }

    // 2. Fallback (Local)
    console.log(`Attempting to load local data for date: ${dateString}`);
    const localData = (MANNA_DATA as RawManna[]).find((d: RawManna) => d.date === dateString);

    if (!localData) {
        console.error(`No data found for date: ${dateString}`);
        return null;
    }
    console.log("Local data found:", localData.reference);
    return mapRawToManna(localData);
};
