/**
 * Returns the current date as a string in YYYY-MM-DD format,
 * respecting the device's local timezone.
 * 
 * New Date().toISOString() returns UTC, which can be yesterday in early mornings (e.g. Korea).
 * This function ensures we get the "wall clock" date of the user.
 */
export const getLocalDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
