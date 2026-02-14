import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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

export type User = {
    id: string;
    email?: string;
    user_metadata?: any;
};

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
        await supabase.auth.signOut();
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Logout failed:", error);
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
            throw new Error('Google Sign-In was cancelled');
        }
    } catch (error) {
        console.error("Google Sign-In failed:", error);
        throw error;
    }
};
