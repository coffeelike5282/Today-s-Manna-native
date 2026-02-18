import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
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
            if (error.message.includes('refresh_token_not_found') || error.message.includes('Refresh Token Not Found')) {
                console.warn('Stale session detected, clearing storage...');
                await supabase.auth.signOut();
                await AsyncStorage.removeItem('supabase.auth.token'); // Force clear
            }
            throw error;
        }
        return session?.user ?? null;
    } catch (error) {
        console.warn('Auth initialization failed:', error);
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

        const redirectUrl = 'https://coffeelike5282.github.io/Today-s-Manna-native/docs/logout.html';
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

/**
 * Sign In with Kakao
 */
export const signInWithKakao = async () => {
    try {
        const redirectUrl = 'todaysmanna://auth/callback';

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
                scopes: 'profile_nickname profile_image account_email',
                queryParams: { prompt: 'login' },
            },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No OAuth URL returned');

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success' && result.url) {
            const params = extractParamsFromUrl(result.url);
            const { access_token, refresh_token } = params;

            if (access_token && refresh_token) {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });
                if (sessionError) throw sessionError;
                return sessionData.user;
            }
        }
        return null;
    } catch (error) {
        console.error('Kakao login failed:', error);
        throw error;
    }
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
