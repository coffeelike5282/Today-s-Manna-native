import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { NanumGothic_400Regular, NanumGothic_700Bold, NanumGothic_800ExtraBold } from '@expo-google-fonts/nanum-gothic';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import StartScreen from './components/StartScreen';
import VerseScreen from './components/VerseScreen';
import DetailScreen from './components/DetailScreen';
import { INITIAL_DATA } from './constants/constants';
import { getDailyManna } from './services/mannaService';
import { ScreenState, MannaData } from './types/types';
// import { fetchDailyManna } from './services/geminiService';

export default function App() {
    const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
    const [mannaData, setMannaData] = useState<MannaData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [sound, setSound] = useState<Audio.Sound>();
    const [isMuted, setIsMuted] = useState(false);
    const [language, setLanguage] = useState<'ko' | 'en'>('ko'); // Language State

    const [fontsLoadedState, setFontsLoadedState] = useState(false);

    const [fontsLoaded, error] = useFonts({
        Jua_400Regular,
        NanumGothic_400Regular,
        NanumGothic_700Bold,
        NanumGothic_800ExtraBold,
        GowunDodum_400Regular,
    });

    useEffect(() => {
        if (error) {
            console.error("Font loading error:", error);
            setFontsLoadedState(true); // Fallback to render without fonts
        }
        if (fontsLoaded) {
            setFontsLoadedState(true);
        }
    }, [fontsLoaded, error]);

    // Force load content if fonts take too long (avoid infinite loading screen)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!fontsLoadedState) {
                console.warn("Font loading timed out, forcing app render.");
                setFontsLoadedState(true);
            }
        }, 3000); // 3 seconds timeout

        return () => clearTimeout(timer);
    }, [fontsLoadedState]);

    const isLoading = !fontsLoadedState;

    // ... (rest of useEffects remain the same) ...

    useEffect(() => {
        const loadData = async () => {
            try {
                // setLoading(true); // Don't block UI with full screen loader, let it render using INITIAL_DATA first if needed
                console.log("App mounted, fetching daily manna...");
                const data = await getDailyManna();
                if (data) {
                    console.log("Data loaded successfully:", data.verseRef);
                    setMannaData(data);
                } else {
                    console.log("No data returned from service");
                }
            } catch (e) {
                console.error("Failed to load data:", e);
            } finally {
                // setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        let currentSound: Audio.Sound | undefined;
        async function loadSound() {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('./assets/bgm.wav'),
                    { isLooping: true, volume: 0.3 }
                );
                currentSound = sound;
                setSound(sound);
                if (!isMuted) {
                    await sound.playAsync();
                }
            } catch (error) {
                console.log("Audio load error (non-critical):", error);
            }
        }
        loadSound();

        return () => {
            currentSound?.unloadAsync();
        };
    }, []);

    useEffect(() => {
        async function updateMute() {
            if (sound) {
                await sound.setIsMutedAsync(isMuted);
            }
        }
        updateMute();
    }, [isMuted, sound]);

    const attemptPlay = async () => {
        if (sound) {
            const status = await sound.getStatusAsync();
            // @ts-ignore
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

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // TEMPORARILY DISABLED GEMINI API DUE TO KEY ERROR
            // const newData = await fetchDailyManna();

            // Just reload local data for now
            const newData = await getDailyManna();
            if (newData) {
                setMannaData(newData);
            }
        } catch (error) {
            console.error("Refresh failed:", error);
            // Optionally show an alert to the user, or just log it
        } finally {
            setLoading(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        attemptPlay();
    };

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
    }, []);

    // RESTORED MAIN RENDER
    if (!fontsLoadedState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A5D6A7" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#E0F7FA', '#B2EBF2', '#E0F7FA']}
                style={styles.gradient}
            >
                <View style={styles.screenContainer}>
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

                    <View style={styles.refreshButtonContainer}>
                        <TouchableOpacity
                            onPress={handleRefresh}
                            disabled={loading}
                            style={styles.refreshButton}
                        >
                            <RefreshCw size={24} color={loading ? "#888" : "#000"} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    /*
    // SIMPLIFIED RENDER FOR DEBUGGING
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Text style={{ fontSize: 30, color: 'black' }}>TEST: Hello World</Text>
            <Text style={{ fontSize: 20, color: 'blue', marginTop: 20 }}>Refactored Babel Config</Text>
        </View>
    );
    */
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    gradient: {
        flex: 1,
    },
    screenContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    refreshButtonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        zIndex: 999,
        opacity: 0.3,
    },
    refreshButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 20,
    },
});
