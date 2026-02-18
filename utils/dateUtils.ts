/**
 * Returns the current date as a string in YYYY-MM-DD format,
 * respecting the device's local timezone.
 */
export const getLocalDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD string into a localized display string.
 * Uses UTC to prevent timezone shifts during display.
 */
export const formatDisplayDate = (dateStr: string, language: 'ko' | 'en' = 'ko', showWeekday: boolean = false): string => {
    if (!dateStr) return "";
    try {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        if (showWeekday) {
            options.weekday = 'long';
        }
        return new Date(dateStr + 'T00:00:00Z').toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
            ...options,
            timeZone: 'UTC'
        });
    } catch (e) {
        return dateStr;
    }
};
