import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { User } from '../types/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials in .env file');
}

// Configure Google Sign-In
const webClientId = '545497224947-013dv70g675p2151849o0dkqoartdfdv.apps.googleusercontent.com';
GoogleSignin.configure({
    webClientId: webClientId,
    offlineAccess: true,
});

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export type AuthStateCallback = (user: User | null) => void;

/**
 * Initialize Auth and check for stale sessions
 */
export const initializeAuth = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('refresh_token_not_found') || msg.includes('refresh token not found')) {
                console.warn('[DEBUG-AUTH] Stale session detected, forcing clear...');
                
                // 1. Sign out (try gracefully)
                await supabase.auth.signOut().catch(() => {});
                
                // 2. Force clear all possible storage keys
                const keys = await AsyncStorage.getAllKeys();
                const supabaseKeys = keys.filter(key => key.includes('supabase') || key.startsWith('sb-'));
                for (const key of supabaseKeys) {
                    await AsyncStorage.removeItem(key);
                }
                
                console.log('[DEBUG-AUTH] Storage cleared for keys:', supabaseKeys);
            }
            throw error;
        }
        return session?.user ?? null;
    } catch (error: any) {
        console.warn('[DEBUG-AUTH] Auth initialization failed:', error?.message || error);
        // If it's a critical auth error, return null to force login
        return null;
    }
};

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (callback: AuthStateCallback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
};

// Kakao Logout URL
const KAKAO_LOGOUT_URL = 'https://kauth.kakao.com/oauth/logout';

/**
 * Perform a full Kakao logout to clear browser session
 */
const logoutFromKakao = async () => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
        if (!apiKey) {
            console.warn('Kakao REST API Key is missing. Skipping browser logout.');
            return;
        }

        const redirectUrl = 'https://coffeelike5282.github.io/Today-s-Manna-native/logout.html';
        const logoutUrl = `${KAKAO_LOGOUT_URL}?client_id=${apiKey}&logout_redirect_uri=${redirectUrl}`;

        await WebBrowser.openAuthSessionAsync(logoutUrl, redirectUrl);
    } catch (error) {
        console.error('Failed to logout from Kakao browser session:', error);
    }
};

/**
 * Sign out the current user
 */
export const logout = async () => {
    try {
        const { data: session } = await supabase.auth.getSession();
        const isKakao = session.session?.user?.app_metadata?.provider === 'kakao';

        await GoogleSignin.signOut();
        await supabase.auth.signOut();

        if (isKakao) {
            await logoutFromKakao();
        }
    } catch (error) {
        console.warn("Logout failed:", error);
        throw error;
    }
};

/**
 * Delete account and all user data
 * Note: This usually requires a server-side function (Edge Function) or RPC 
 * to handle secure deletion of user records in Supabase.
 */
export const deleteAccount = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Call a Supabase RPC or Edge Function to delete data from tables
        // Assuming we have an RPC named 'delete_user_data' or similar
        const { error: rpcError } = await supabase.rpc('delete_user_data');
        if (rpcError) console.warn('RPC deletion error:', rpcError);

        // 2. Sign out and clear local session
        await logout();
        
        // 3. (Optional) If we had a way to delete the auth user directly from client:
        // const { error } = await supabase.auth.admin.deleteUser(user.id);
        // But admin functions shouldn't be on client.
    } catch (error) {
        console.error('Account deletion failed:', error);
        throw error;
    }
};

// Helper to extract params from URL hash or query
const extractParamsFromUrl = (url: string) => {
    const params: { [key: string]: string } = {};
    const queryString = url.split('#')[1] || url.split('?')[1];
    if (!queryString) return params;

    queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
            params[key] = decodeURIComponent(value);
        }
    });
    return params;
};

let loginInProgress = false;

/**
 * Sign In with Kakao (Supabase OAuth via WebBrowser)
 * 이 방식은 큰형님께서 설정하신 Supabase Redirect URI를 활용하여 무한 로딩을 해결합니다.
 */
export const signInWithKakao = async () => {
    if (loginInProgress) return;

    try {
        loginInProgress = true;
        console.log('[DEBUG-AUTH] Starting Supabase Kakao OAuth flow...');

        // 1. Supabase OAuth 로그인 URL 생성
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: Linking.createURL('login-callback'),
                skipBrowserRedirect: true,
            }
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

        // 2. 브라우저 세션 오픈
        const result = await WebBrowser.openAuthSessionAsync(data.url, Linking.createURL('login-callback'));

        if (result.type === 'success' && result.url) {
            console.log('[DEBUG-AUTH] Browser redirect success, parsing tokens...');
            
            // 3. 리다이렉트 URL에서 세션 정보(access_token, refresh_token) 추출
            const params = extractParamsFromUrl(result.url);
            const { access_token, refresh_token } = params;

            if (access_token && refresh_token) {
                const { data: { user }, error: authError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (authError) throw authError;
                console.log('[DEBUG-AUTH] Supabase session established for:', user?.id);
                return user;
            }
        }
        
        return null;
    } catch (error: any) {
        console.error('[DEBUG-AUTH] Kakao OAuth failed:', error?.message || error);
        throw error;
    } finally {
        loginInProgress = false;
    }
};

/**
 * Sign In with Kakao Account (Supabase OAuth와 동일하게 처리)
 */
export const signInWithKakaoAccount = async () => {
    // 계정 선택 옵션이 필요할 경우 prompt 파라미터를 추가할 수 있으나, 
    // 기본적으로 signInWithKakao와 동일하게 처리합니다.
    return signInWithKakao();
};

/**
 * Sign In with Email
 */
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.user;
};

/**
 * Sign Up with Email
 */
export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data.user;
};

/**
 * Google Sign-In with Supabase
 */
export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if (userInfo.type === 'success') {
            const { idToken } = userInfo.data;
            if (!idToken) throw new Error('No ID token present');

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) throw error;
            return data.user;
        } else {
            return null;
        }
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    return null;
                case statusCodes.IN_PROGRESS:
                    return null;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.warn('Play services not available or outdated');
                    break;
                default:
                    console.warn('Google Sign-In error code:', error.code);
            }
        } else {
            console.warn("Google Sign-In failed (non-code error):", error);
        }
        throw error;
    }
};
