import AsyncStorage from '@react-native-async-storage/async-storage';

export const getResolutionCompletions = async (): Promise<string[]> => {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const resolutionKeys = allKeys.filter(key => key.startsWith('RESOLUTION_COMPLETE_'));

        // Extract dates from keys: RESOLUTION_COMPLETE_YYYY-MM-DD -> YYYY-MM-DD
        const dates = resolutionKeys.map(key => key.replace('RESOLUTION_COMPLETE_', ''));
        return dates;
    } catch (e) {
        console.error('Error fetching resolution completions:', e);
        return [];
    }
};
