import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StatusBar, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions, Platform, AppState, AppStateStatus, Alert } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen'; // Integrated Splash Screen
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { NanumGothic_400Regular, NanumGothic_700Bold, NanumGothic_800ExtraBold } from '@expo-google-fonts/nanum-gothic';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';

import StartScreen from './components/StartScreen';
import * as Localization from 'expo-localization';
import VerseScreen from './components/VerseScreen';
import DetailScreen from './components/DetailScreen';
import { INITIAL_DATA } from './constants/constants';
import { getDailyManna } from './services/mannaService';
import type { ScreenState, MannaData, User } from './types/types';
import LoginScreen from './components/LoginScreen';
import { subscribeToAuthChanges, logout, initializeAuth } from './services/authService';
import { audioService } from './services/audioService';
import ErrorBoundary from './components/ErrorBoundary';
import BackgroundDecor from './components/BackgroundDecor';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
    // ... (keep state)
    const [screen, setScreen] = useState<ScreenState>('START');
    const [mannaData, setMannaData] = useState<MannaData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    // Removed sound, audioVersion state
    const [isMuted, setIsMuted] = useState(false);
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');
    const [user, setUser] = useState<User | null>(null);

    // ... (keep fonts loaded)
    const [fontsLoaded, error] = useFonts({
        Jua_400Regular: require('./assets/fonts/Jua_400Regular.ttf'),
        NanumGothic_400Regular: require('./assets/fonts/NanumGothic_400Regular.ttf'),
        NanumGothic_700Bold: require('./assets/fonts/NanumGothic_700Bold.ttf'),
        NanumGothic_800ExtraBold: require('./assets/fonts/NanumGothic_800ExtraBold.ttf'),
        GowunDodum_400Regular: require('./assets/fonts/GowunDodum_400Regular.ttf'),
    });

    // ... (keep onLayoutRootView)
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded || error) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    // Initialize Audio Service
    const appState = useRef(AppState.currentState);
    const isAudioInitialized = useRef(false); // 2중 안전 장치! 🫡

    useEffect(() => {
        // [DEBUG] Monitor deep links
        const handleDeepLink = (event: { url: string }) => {
            console.log('[DEBUG-CRITICAL] Global Linking Event:', event.url);
        };
        const subscription = Linking.addEventListener('url', handleDeepLink);

        const loadData = async () => {
            try {
                // Initialize Auth first to clear stale sessions
                await initializeAuth();

                const data = await getDailyManna();
                if (data) setMannaData(data);
            } catch (e) {
                console.warn("Failed to load data or initialize auth:", e);
            }
        };
        loadData();

        // 🌐 Automatic Language Detection
        const detectedLocales = Localization.getLocales();
        if (detectedLocales && detectedLocales.length > 0) {
            const systemLanguage = detectedLocales[0].languageCode;
            console.log('[DEBUG-LANGUAGE] Detected System Language:', systemLanguage);
            if (systemLanguage === 'en') {
                setLanguage('en');
            } else {
                setLanguage('ko');
            }
        }

        const authUnsubscribe = subscribeToAuthChanges((authUser) => {
            console.log("Auth State Changed:", authUser ? authUser.id : "Logged Out");
            setUser(authUser);
        });

        // Initialize Audio
        const initAudio = async () => {
            if (isAudioInitialized.current) return; // 이미 했으면 퇴장! 🫡
            isAudioInitialized.current = true;

            try {
                await audioService.loadSound(require('./assets/bgm.mp3'), isMuted);
            } catch (e) {
                console.error('[App] Failed to init audio:', e);
                isAudioInitialized.current = false; // 실패하면 다시 시도할 수 있게 해제
            }
        };

        setTimeout(() => { initAudio(); }, 1000);

        // AppState Handler for Audio
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            audioService.handleAppStateChange(nextAppState);
            appState.current = nextAppState;
        };
        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            authUnsubscribe();
            appStateSubscription.remove();
            audioService.unloadSound();
        };
    }, []); // Run once on mount

    // 🚀 [6차, 8차 핫픽스 종합] 화면/데이터 전환 시 오디오 심폐소생술 (Ping) 🫡
    // 화면을 그리거나 새로운 날짜 데이터를 불러올 때 CPU 집중으로 오디오가 끊기는 것을 방지!
    useEffect(() => {
        if (!isMuted) {
            audioService.resume();
        }
    }, [screen, mannaData?.date]);

    const toggleMute = async () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        await audioService.toggleMute(newMutedState);
    };

    const handleNext = async (dateStr?: string) => {

        if (dateStr && typeof dateStr === 'string') {
            setLoading(true);
            try {
                // DON'T use new Date(dateStr) here, as it can shift due to timezone
                // getDailyManna already handles strings correctly.
                const data = await getDailyManna(dateStr);

                if (data) {
                    setMannaData(data);
                    setScreen('VERSE');
                } else {
                    Alert.alert(
                        "만나를 찾을 수 없습니다",
                        "박 사장님, 죄송합니다! 선택하신 날짜의 말씀이 아직 준비되지 않았습니다. 현재는 2026년 내의 말씀만 확인 가능합니다.",
                        [{ text: "알겠습니다!", style: "default" }]
                    );
                }
            } catch (e: any) {
                console.error("[DEBUG-CRITICAL] handleNext fetch error:", e);
                console.error("Stack trace:", e?.stack);
                Alert.alert("말씀을 불러올 수 없습니다", "박 사장님, 통신 상태나 데이터에 잠시 문제가 생긴 것 같습니다. 다시 한 번 시도 부탁드립니다! (충성!🫡)");
            } finally {
                setLoading(false);
            }
        } else {
            if (screen === 'START') {
                setScreen('VERSE');
            } else if (screen === 'VERSE') {
                setScreen('DETAIL');
            }
        }
    };

    const handleBack = () => {
        if (screen === 'DETAIL') setScreen('VERSE');
        else setScreen('START');
    };

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
    }, []);

    const handleLoginSuccess = async (loggedInUser: any) => {
        setUser(loggedInUser);
        setScreen('START');
        // Ensure audio state is consistent on login
        setIsMuted(false);
        audioService.toggleMute(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            // Reset audio state on logout
            setIsMuted(false);
            audioService.toggleMute(false);
        } catch (error) {
            console.warn("Logout failed:", error);
        }
    };

    if (!fontsLoaded && !error) {
        return null; // Render nothing, Splash Screen is visible
    }

    const renderContent = () => {
        switch (screen) {
            case 'START':
                return (
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
                );
            case 'VERSE':
                return (
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
                );
            case 'DETAIL':
                return (
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
                );
            default:
                return null;
        }
    };

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
                            <LoginScreen
                                onLoginSuccess={handleLoginSuccess}
                                language={language}
                                toggleLanguage={toggleLanguage}
                            />
                        ) : (
                            renderContent()
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
