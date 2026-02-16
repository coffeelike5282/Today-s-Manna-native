import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials in .env file');
}

// Configure Google Sign-In
const webClientId = '545497224947-013dv70g675p2151849o0dkqoartdfdv.apps.googleusercontent.com';
console.log('[DEBUG] Configuring Google Sign-In with HARDCODED WebClientId:', webClientId);
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

import { User } from '../types/types';

export type AuthStateCallback = (user: User | null) => void;

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthChanges = (callback: AuthStateCallback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
};

/**
 * Sign out the current user
 */
export const logout = async () => {
    try {
        await GoogleSignin.signOut(); // Clear Google Session
        await supabase.auth.signOut(); // Clear Supabase Session
        console.log("User signed out successfully (Google & Supabase)");
    } catch (error) {
        console.warn("Logout failed:", error);
        throw error;
    }
};

/**
 * Google Sign-In with Supabase
 */
export const signInWithGoogle = async () => {
    try {
        console.log('[DEBUG-RUNTIME] Signing in. Env ClientID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
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
            // User cancelled the sign-in flow
            console.log('Google Sign-In was cancelled by user (userInfo.type !== success)');
            return null;
        }
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    // user cancelled the login flow
                    console.log('Google Sign-In was cancelled by user (SIGN_IN_CANCELLED)');
                    return null;
                case statusCodes.IN_PROGRESS:
                    // operation (e.g. sign in) is in progress already
                    console.log('Google Sign-In is already in progress');
                    return null;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    // play services not available or outdated
                    console.warn('Play services not available or outdated');
                    break;
                default:
                    // some other error happened
                    console.warn('Google Sign-In error code:', error.code);
            }
        } else {
            console.warn("Google Sign-In failed (non-code error):", error);
        }
        throw error;
    }
};
