import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Platform, AppState, AppStateStatus } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen'; // Integrated Splash Screen
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { NanumGothic_400Regular, NanumGothic_700Bold, NanumGothic_800ExtraBold } from '@expo-google-fonts/nanum-gothic';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { LinearGradient } from 'expo-linear-gradient';

import StartScreen from './components/StartScreen';
import VerseScreen from './components/VerseScreen';
import DetailScreen from './components/DetailScreen';
import { INITIAL_DATA } from './constants/constants';
import { getDailyManna } from './services/mannaService';
import { ScreenState, MannaData } from './types/types';
import LoginScreen from './components/LoginScreen';
import { subscribeToAuthChanges, User } from './services/authService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
    const [mannaData, setMannaData] = useState<MannaData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    const [user, setUser] = useState<User | null>(null);

    const [fontsLoaded, error] = useFonts({
        Jua_400Regular: require('./assets/fonts/Jua_400Regular.ttf'),
        NanumGothic_400Regular: require('./assets/fonts/NanumGothic_400Regular.ttf'),
        NanumGothic_700Bold: require('./assets/fonts/NanumGothic_700Bold.ttf'),
        NanumGothic_800ExtraBold: require('./assets/fonts/NanumGothic_800ExtraBold.ttf'),
        GowunDodum_400Regular: require('./assets/fonts/GowunDodum_400Regular.ttf'),
    });

    // Callback when layout happens (fonts are ready)
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || error) {
            // Hide splash screen immediately when fonts are loaded or error occurred
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getDailyManna();
                if (data) setMannaData(data);
            } catch (e) {
                console.error("Failed to load data:", e);
            }
        };
        loadData();

        const unsubscribe = subscribeToAuthChanges((authUser) => {
            console.log("Auth State Changed:", authUser ? authUser.id : "Logged Out");
            setUser(authUser);
        });

        return () => unsubscribe();
    }, []);

    // Audio State Ref
    const soundRef = useRef<Audio.Sound | null>(null);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        let isMounted = true;
        let currentSound: Audio.Sound | null = null;

        const setupAudio = async (attempt = 1) => {
            if (!isMounted) return;
            const maxAttempts = 5;

            try {
                // Configure Audio Mode
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                    playThroughEarpieceAndroid: false,
                });

                // Create and Play immediately
                const result = await Audio.Sound.createAsync(
                    require('./assets/bgm.wav'),
                    { isLooping: true, volume: 1.0, shouldPlay: !isMuted }
                );

                if (!isMounted) {
                    if (result.sound) result.sound.unloadAsync();
                    return;
                }

                currentSound = result.sound;
                soundRef.current = result.sound;
                setSound(result.sound);

                // Verify playback status
                if (!isMuted) {
                    const status = await result.sound.getStatusAsync();
                    if (status.isLoaded && status.isPlaying) {
                        console.log("Audio started successfully on attempt", attempt);
                        return; // Success!
                    } else {
                        throw new Error("Loaded but not playing (State mismatch)");
                    }
                }

            } catch (e) {
                console.warn(`Audio init attempt ${attempt} failed:`, e);

                if (currentSound) {
                    try { await currentSound.unloadAsync(); } catch (err) { }
                    currentSound = null;
                    soundRef.current = null;
                    setSound(null);
                }

                // Retry logic
                if (attempt < maxAttempts) {
                    setTimeout(() => setupAudio(attempt + 1), 1500);
                }
            }
        };

        // AppState Handler
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (soundRef.current && !isMuted) {
                    try {
                        await Audio.setAudioModeAsync({
                            allowsRecordingIOS: false,
                            staysActiveInBackground: false,
                            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                            playsInSilentModeIOS: true,
                            shouldDuckAndroid: true,
                            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                            playThroughEarpieceAndroid: false,
                        });

                        const status = await soundRef.current.getStatusAsync();
                        if (status.isLoaded && !status.isPlaying) {
                            await soundRef.current.playAsync();
                        }
                    } catch (e) {
                        console.warn("Resume failed:", e);
                    }
                }
            } else if (nextAppState.match(/inactive|background/)) {
                if (soundRef.current) {
                    try {
                        const status = await soundRef.current.getStatusAsync();
                        if (status.isLoaded && status.isPlaying) {
                            await soundRef.current.pauseAsync();
                        }
                    } catch (e) { console.warn("Pause failed:", e); }
                }
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Initial delay
        setTimeout(() => setupAudio(1), 500);

        return () => {
            isMounted = false;
            subscription.remove();
            if (currentSound) {
                currentSound.unloadAsync();
            }
        };
    }, []); // Removed isMuted dependency

    const toggleMute = async () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (sound) {
            if (newMutedState) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        }
    };

    const attemptPlay = async () => {
        if (sound && !isMuted) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && !status.isPlaying) {
                await sound.playAsync();
            }
        }
    };

    const handleNext = () => {
        attemptPlay();
        if (screen === ScreenState.START) setScreen(ScreenState.VERSE);
        else if (screen === ScreenState.VERSE) setScreen(ScreenState.DETAIL);
    };

    const handleBack = () => {
        if (screen === ScreenState.DETAIL) setScreen(ScreenState.VERSE);
        else setScreen(ScreenState.START);
    };

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
    }, []);

    const handleLoginSuccess = (loggedInUser: any) => {
        setUser(loggedInUser);
        setScreen(ScreenState.START);
    };

    // Replace Loading Screen logic with Splash Screen logic
    if (!fontsLoaded && !error) {
        return null; // Render nothing, Splash Screen is visible
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#E0F7FA', '#B2EBF2', '#E0F7FA']}
                style={styles.gradient}
            >
                <View style={styles.screenContainer}>
                    {!user ? (
                        <LoginScreen onLoginSuccess={handleLoginSuccess} />
                    ) : (
                        <>
                            {screen === ScreenState.START && (
                                <StartScreen
                                    onNext={handleNext}
                                    data={mannaData}
                                    isMuted={isMuted}
                                    toggleMute={toggleMute}
                                    language={language}
                                    toggleLanguage={toggleLanguage}
                                />
                            )}
                            {screen === ScreenState.VERSE && (
                                <VerseScreen
                                    onNext={handleNext}
                                    data={mannaData}
                                    isMuted={isMuted}
                                    toggleMute={toggleMute}
                                    language={language}
                                    toggleLanguage={toggleLanguage}
                                />
                            )}
                            {screen === ScreenState.DETAIL && (
                                <DetailScreen
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    data={mannaData}
                                    isMuted={isMuted}
                                    toggleMute={toggleMute}
                                    language={language}
                                    toggleLanguage={toggleLanguage}
                                />
                            )}
                        </>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
    gradient: { flex: 1 },
    screenContainer: { flex: 1, overflow: 'hidden' },
});
