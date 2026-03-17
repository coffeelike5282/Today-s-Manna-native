import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated, Easing, Alert } from 'react-native';
import { ScreenProps } from '../types/types';
import { getDailyManna, getUserFavorites } from '../services/mannaService';
import Mascot from './Mascot';
import { Volume2, VolumeX, Cloud, Star, Heart, User as UserIcon, LogOut, CalendarHeart } from 'lucide-react-native';
import CalendarModal from './CalendarModal';
import IslandHeader from './IslandHeader';
import { formatDisplayDate, getLocalDateString } from '../utils/dateUtils';
import ComingSoonTooltip from './ComingSoonTooltip';

const { width, height } = Dimensions.get('window');

const StartScreen: React.FC<ScreenProps> = ({ onNext, data, isMuted, toggleMute, language = 'ko', toggleLanguage = () => { }, onLogout, onDeleteAccount, user, version }) => {
    // ... animation refs ...
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Fetch favorites when user logs in or screen mounts
    useEffect(() => {
        const fetchFavorites = async () => {
            if (user?.id) {
                const dates = await getUserFavorites(user.id);
                setFavoriteDates(dates);
            } else {
                setFavoriteDates([]);
            }
        };
        fetchFavorites();
    }, [user, calendarVisible]); // Refresh when calendar opens too


    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (language === 'ko' ? "박 사장님" : "User");

    let avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    // Android cleartext traffic workaround: 카카오 등에서 http로 주는 이미지를 https로 강제 변환
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('http://')) {
        avatarUrl = avatarUrl.replace('http://', 'https://');
    }

    const handleOpenFavorites = () => {
        setCalendarVisible(true);
    };

    const handleSelectDate = (dateString: string) => {
        setCalendarVisible(false);
        onNext(dateString);
    };

    return (
        <View style={styles.container}>
            <IslandHeader
                user={user}
                language={language}
                isMuted={isMuted}
                toggleLanguage={toggleLanguage}
                toggleMute={toggleMute}
                onLogout={onLogout}
                onDeleteAccount={onDeleteAccount}
                version={version}
                canGoBack={false}
                canFavorite={false} // Added: disable favorite on start
                canShare={false} // Added: disable share on start
                onOpenCalendar={handleOpenFavorites}
                onShare={() => { }}
                favorited={false}
                loadingFavorite={false}
                onToggleFavorite={() => { }}
            />

            {/* Main Content */}
            <View style={styles.mainContent}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        {language === 'ko' ? "오늘도 환영합니다!" : "Welcome back!"}
                    </Text>
                </View>

                <Text style={styles.title}>
                    {language === 'ko' ? "오늘의 만나" : "Today's Manna"}
                </Text>

                <TouchableOpacity onPress={handleOpenFavorites} activeOpacity={0.7}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                            {formatDisplayDate(data.date, language, true)}
                        </Text>
                    </View>
                </TouchableOpacity>

                <Mascot onClick={() => onNext()} style={styles.mascot} />

                {/* Explicit spacer to prevent overlapping */}
                <View style={styles.spacer} />

                <TouchableOpacity onPress={() => onNext()} style={styles.startButton}>
                    <Text style={styles.startButtonText}>
                        {language === 'ko' ? "터치하여 말씀 시작하기" : "Touch to Start"}
                    </Text>
                </TouchableOpacity>
            </View>


            {/* Calendar Modal */}
            <CalendarModal
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={handleSelectDate}
                selectedDate={getLocalDateString()}
                favoriteDates={favoriteDates}
                language={language}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingTop: 110, // Added padding for the header
    },
    mainContent: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    welcomeContainer: {
        marginBottom: 15, // Slightly more space
    },
    welcomeText: {
        fontSize: 18,
        fontFamily: 'NanumGothic_700Bold',
        color: '#795548',
    },
    title: {
        fontSize: 36, // Slightly reduced for better balance
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    dateBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    dateText: {
        color: '#795548',
        fontSize: 15,
        fontFamily: 'NanumGothic_700Bold',
    },
    mascot: {
        width: width * 0.52,
        height: width * 0.52,
        // marginBottom removed in favor of explicit spacer
    },
    spacer: {
        height: 60, // Explicit gap
    },
    startButton: {
        backgroundColor: 'rgba(78, 52, 46, 0.95)',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    startButtonText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Jua_400Regular',
    },
});

export default StartScreen;
