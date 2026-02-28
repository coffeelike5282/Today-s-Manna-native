import { supabase } from './authService';

/**
 * 특정 유저의 결단 완료 날짜 목록 가져오기
 */
export const getResolutionDates = async (userId: string): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('resolutions')
            .select('date')
            .eq('user_id', userId);

        if (error) throw error;
        return data.map((item: { date: string }) => item.date);
    } catch (e) {
        console.error('Error fetching resolution completions:', e);
        return [];
    }
};

/**
 * 로그인하지 않은 상태 등을 대비한 하위 호환성 (빈 배열 반환)
 */
export const getResolutionCompletions = async (): Promise<string[]> => {
    return [];
};

/**
 * 결단 완료 저장하기
 */
export const saveResolution = async (userId: string, date: string) => {
    // 중복 방지
    const existing = await isResolutionCompleted(userId, date);
    if (existing) return;

    const { error } = await supabase
        .from('resolutions')
        .insert([{ user_id: userId, date: date }]);

    if (error) {
        console.warn('Error saving resolution:', error);
        throw error;
    }
};

/**
 * 결단 완료 취소하기 (삭제)
 */
export const deleteResolution = async (userId: string, date: string) => {
    const { error } = await supabase
        .from('resolutions')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

    if (error) {
        console.warn('Error deleting resolution:', error);
        throw error;
    }
};

/**
 * 특정 날짜 결단 완료 여부 확인
 */
export const isResolutionCompleted = async (userId: string, date: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('resolutions')
            .select('id')
            .match({ user_id: userId, date: date })
            .maybeSingle();

        if (error) return false;
        return !!data;
    } catch (e) {
        return false;
    }
};
