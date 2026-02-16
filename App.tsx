import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Platform, AppState, AppStateStatus, Alert } from 'react-native';
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
import { ScreenState, MannaData, User } from './types/types';
import LoginScreen from './components/LoginScreen';
import { subscribeToAuthChanges, logout } from './services/authService';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundDecor from './components/BackgroundDecor';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
    const [mannaData, setMannaData] = useState<MannaData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    const [audioVersion, setAudioVersion] = useState(0);
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
                console.warn("Failed to load data:", e);
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

    // Use ref for isMuted to avoid stale closures in AppState listener
    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

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

                // Check if already loaded to avoid duplicates
                if (soundRef.current) {
                    const status = await soundRef.current.getStatusAsync();
                    if (status.isLoaded) {
                        // Already loaded, just update playback state
                        if (!isMutedRef.current && !status.isPlaying) {
                            await soundRef.current.playAsync();
                        }
                        setSound(soundRef.current); // Ensure state is synced
                        return;
                    } else {
                        // Unloaded, cleanup
                        try { await soundRef.current.unloadAsync(); } catch (e) { }
                        soundRef.current = null;
                        setSound(null);
                    }
                }

                // Create and Play
                const result = await Audio.Sound.createAsync(
                    require('./assets/bgm.wav'),
                    { isLooping: true, volume: 1.0, shouldPlay: !isMutedRef.current }
                );

                if (!isMounted) {
                    if (result.sound) result.sound.unloadAsync();
                    return;
                }

                currentSound = result.sound;
                soundRef.current = result.sound;
                setSound(result.sound);

                // Verify playback status and apply volume
                const playbackStatus = {
                    isLooping: true,
                    volume: isMutedRef.current ? 0.0 : 1.0,
                    shouldPlay: !isMutedRef.current
                };
                await result.sound.setStatusAsync(playbackStatus);

                if (!isMutedRef.current) {
                    const status = await result.sound.getStatusAsync();
                    if (status.isLoaded && status.isPlaying) {
                        console.log("Audio started successfully on attempt", attempt);
                        return; // Success!
                    } else if (status.isLoaded && !status.isPlaying) {
                        // Loaded but not playing, try explicit play
                        await result.sound.playAsync();
                        return;
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
                console.log("App resumed, checking audio...");
                // Use ref to get current mute state
                if (!isMutedRef.current) {
                    if (!soundRef.current) {
                        console.log("Audio missing on resume, reloading...");
                        await setupAudio(1);
                    } else {
                        try {
                            const status = await soundRef.current.getStatusAsync();
                            if (!status.isLoaded) {
                                console.log("Audio unloaded on resume, reloading...");
                                await setupAudio(1);
                            } else if (!status.isPlaying) {
                                await Audio.setAudioModeAsync({
                                    allowsRecordingIOS: false,
                                    staysActiveInBackground: false,
                                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                                    playsInSilentModeIOS: true,
                                    shouldDuckAndroid: true,
                                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                                    playThroughEarpieceAndroid: false,
                                });
                                await soundRef.current.playAsync();
                            }
                        } catch (e) {
                            console.warn("Resume check failed, reloading:", e);
                            await setupAudio(1);
                        }
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

        // Initial delay to ensure previous sound unloads
        const timer = setTimeout(() => setupAudio(1), 800);

        return () => {
            clearTimeout(timer);
            isMounted = false;
            subscription.remove();
            if (currentSound) {
                currentSound.unloadAsync().catch(err => console.log("Cleanup unload failed", err));
                // We don't nullify currentSound here to ensure the closure keeps reference for unload
            }
            // Clear refs and state to prevent stale usage
            soundRef.current = null;
            setSound(null);
        };
    }, [audioVersion]); // Reload audio only when explicitly triggered

    const toggleMute = async () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);

        // Update ref immediately for any async operations
        isMutedRef.current = newMutedState;

        // Use ref for latest sound instance to ensure we target the correct object
        const activeSound = soundRef.current;
        if (activeSound) {
            try {
                if (newMutedState) {
                    // Double defense: Pause + Volume 0
                    await activeSound.setStatusAsync({
                        shouldPlay: false,
                        volume: 0.0
                    });
                    console.log("Muted: Paused and volume set to 0");
                } else {
                    // Resume + Volume 1
                    await activeSound.setStatusAsync({
                        shouldPlay: true,
                        volume: 1.0
                    });
                    console.log("Unmuted: Playing and volume set to 1");
                }
            } catch (e) {
                console.warn("Toggle mute failed, reloading audio:", e);
                setAudioVersion(v => v + 1);
            }
        } else if (!newMutedState) {
            // If unmuting and no sound, trigger a reload
            console.log("Unmuting with no sound, reloading...");
            setAudioVersion(v => v + 1);
        }
    };

    const attemptPlay = async () => {
        // Use ref for latest sound instance
        if (soundRef.current && !isMutedRef.current) {
            try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded && !status.isPlaying) {
                    await soundRef.current.playAsync();
                }
            } catch (e) {
                console.warn("Attempt play failed, reloading audio:", e);
                setAudioVersion(v => v + 1);
            }
        }
    };

    const handleNext = async (dateStr?: string) => {
        attemptPlay();

        if (dateStr && typeof dateStr === 'string') {
            setLoading(true);
            try {
                // Fetch specific date data
                const targetDate = new Date(dateStr);
                const data = await getDailyManna(targetDate);

                if (data) {
                    setMannaData(data);
                    // Always navigate to Verse screen to show new content
                    setScreen(ScreenState.VERSE);
                } else {
                    // Show friendly alert if data for selected date is missing
                    Alert.alert(
                        "만나를 찾을 수 없습니다",
                        "박 사장님, 죄송합니다! 선택하신 날짜의 말씀이 아직 준비되지 않았습니다. 현재는 2026년 내의 말씀만 확인 가능합니다.",
                        [{ text: "알겠습니다!", style: "default" }]
                    );
                }
            } catch (e) {
                console.warn("Failed to fetch Manna for date:", e);
                Alert.alert("오류 발생", "말씀을 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        } else {
            // Normal Navigation (Next Button)
            if (screen === ScreenState.START) setScreen(ScreenState.VERSE);
            else if (screen === ScreenState.VERSE) setScreen(ScreenState.DETAIL);
        }
    };

    const handleBack = () => {
        if (screen === ScreenState.DETAIL) setScreen(ScreenState.VERSE);
        else setScreen(ScreenState.START);
    };

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
    }, []);

    const handleLoginSuccess = async (loggedInUser: any) => {
        setUser(loggedInUser);
        setScreen(ScreenState.START);
        setIsMuted(false);
        // Don't reload audio here, just resume if needed
        if (soundRef.current) {
            try {
                const status = await soundRef.current.getStatusAsync();
                if (status.isLoaded && !status.isPlaying) {
                    await soundRef.current.playAsync();
                }
            } catch (e) {
                console.warn("Login resume failed:", e);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            setIsMuted(false);
            setAudioVersion(v => v + 1); // Trigger audio reload
        } catch (error) {
            console.warn("Logout failed:", error);
        }
    };

    // Replace Loading Screen logic with Splash Screen logic
    if (!fontsLoaded && !error) {
        return null; // Render nothing, Splash Screen is visible
    }

    return (
        <ErrorBoundary>
            <View style={styles.container} onLayout={onLayoutRootView}>
                <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
                <LinearGradient
                    colors={['#E0F7FA', '#B2EBF2', '#E0F7FA']}
                    style={styles.gradient}
                >
                    <BackgroundDecor />
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
                                        onLogout={handleLogout}
                                        user={user}
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
                                        onLogout={handleLogout}
                                        user={user}
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
                                        onLogout={handleLogout}
                                        user={user}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
    gradient: { flex: 1 },
    screenContainer: { flex: 1, overflow: 'hidden' },
});
