import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Animated, Easing } from 'react-native';
import { ScreenProps } from '../types/types';
import { getDailyManna, getUserFavorites } from '../services/mannaService';
import Mascot from './Mascot';
import { Volume2, VolumeX, Cloud, Star, Heart, User as UserIcon, LogOut, FolderHeart } from 'lucide-react-native';
import CalendarModal from './CalendarModal';

const { width, height } = Dimensions.get('window');

const StartScreen: React.FC<ScreenProps> = ({ onNext, data, isMuted, toggleMute, language = 'ko', toggleLanguage = () => { }, onLogout, user }) => {
    // ... animation refs ...
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]);

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
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    const handleOpenFavorites = () => {
        setCalendarVisible(true);
    };

    const handleSelectDate = (dateString: string) => {
        setCalendarVisible(false);
        onNext(dateString);
    };

    return (
        <View style={styles.container}>
            {/* 1. Centralized Control Island (Unified) */}
            <View style={styles.islandContainer}>
                <View style={styles.glassIsland}>
                    {/* Left: User Info */}
                    <View style={styles.userInfoContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
                        ) : (
                            <View style={styles.defaultAvatar}>
                                <UserIcon size={14} color="#8D6E63" />
                            </View>
                        )}
                        <Text style={styles.islandUserName} numberOfLines={1} ellipsizeMode="tail">
                            {userName}
                        </Text>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
                        <LogOut size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    {/* Archive Button - Added */}
                    <TouchableOpacity onPress={handleOpenFavorites} style={styles.iconButton}>
                        <FolderHeart size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Language Toggle */}
                    <TouchableOpacity onPress={toggleLanguage} style={styles.iconButton}>
                        <Text style={styles.langText}>{language === 'ko' ? 'EN' : '한글'}</Text>
                    </TouchableOpacity>

                    {/* Mute Toggle */}
                    <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                        {isMuted ? (
                            <VolumeX color="#8D6E63" size={20} />
                        ) : (
                            <Volume2 color="#5D4037" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

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

                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

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
                selectedDate={new Date().toISOString().split('T')[0]}
                favoriteDates={favoriteDates}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center', // Restore centering for balance
        backgroundColor: 'transparent',
    },
    floating: {
        position: 'absolute',
        opacity: 0.6,
    },
    islandContainer: {
        position: 'absolute',
        top: 50, // Matches VerseScreen
        width: '100%',
        alignItems: 'center',
        zIndex: 50,
    },
    glassIsland: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity to match others
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#D7CCC8', // Standardized border color
        paddingVertical: 0,
        paddingHorizontal: 20, // Adjusted to match others
        height: 44,
        minWidth: '92%', // Matches others
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4, // Matches others
        elevation: 5,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 'auto', // Push others to right or just standard flex
        // Actually VerseScreen uses space-between. 
        // We can just let flex layout handle it.
        // We have: [User] [Logout] | [Lang] [Mute]
        // Let's group User+Logout? or User separate?
    },
    userAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    defaultAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EFEBE9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    islandUserName: {
        fontSize: 14,
        fontFamily: 'NanumGothic_700Bold',
        color: '#5D4037',
        marginRight: 12,
        maxWidth: 100, // Limit width
    },
    iconButton: {
        padding: 5, // Reduced padding
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: 16, // Reduced height
        backgroundColor: '#D7CCC8',
        marginHorizontal: 4,
    },
    langText: {
        fontSize: 13,
        fontFamily: 'NanumGothic_700Bold',
        color: '#8D6E63',
    },

    // ... Main Content styles ...
    mainContent: {
        alignItems: 'center',
        marginTop: 60, // Nudge down from the island header
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    startButtonText: {
        fontSize: 20, // Refined for a more sophisticated look
        color: '#5D4037',
        fontFamily: 'NanumGothic_800ExtraBold', // Bolder font
    },
});

export default StartScreen;
