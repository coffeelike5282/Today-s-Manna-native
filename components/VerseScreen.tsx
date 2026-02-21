import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { ScreenProps } from '../types/types';
import { Volume2, VolumeX, Cloud, Star, ChevronUp, LogOut, Share2, Heart, FolderHeart } from 'lucide-react-native';
import { isFavorited, addFavorite, removeFavorite, getFavoriteDates } from '../services/favoritesService';
import CalendarModal from './CalendarModal';
import { formatDisplayDate, getLocalDateString } from '../utils/dateUtils';
import ComingSoonTooltip from './ComingSoonTooltip';
import { getResolutionCompletions } from '../services/resolutionService';

const { width, height } = Dimensions.get('window');

const VerseScreen: React.FC<ScreenProps> = ({ onNext, data, isMuted, toggleMute, language = 'ko', toggleLanguage = () => { }, onLogout, user }) => {
    // Check if we are in dev mode
    const isDebug = __DEV__;

    const [favorited, setFavorited] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]); // Store favorite dates
    const [resolutionDates, setResolutionDates] = useState<string[]>([]); // Store resolution dates
    const [tooltipVisible, setTooltipVisible] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (user && data.verseRef) {
                // Use data.date instead of current system date
                const status = await isFavorited(user.id, data.date);
                setFavorited(status);

                // Fetch all favorite dates for calendar dots
                const dates = await getFavoriteDates(user.id);
                setFavoriteDates(dates);

                // Fetch all resolution dates for calendar dots
                const resDates = await getResolutionCompletions();
                setResolutionDates(resDates);
            }
        };
        checkStatus();
    }, [user, data, favorited]); // Add favorited dependency to refresh list

    const handleOpenFavorites = () => {
        setCalendarVisible(true);
    };

    const handleSelectDate = (dateString: string) => {
        onNext(dateString);
    };

    const handleToggleFavorite = async () => {
        if (!user) return;
        setLoadingFavorite(true);
        // Use data.date to ensure we favoriting the specific manna's date
        const dateStr = data.date;

        try {
            if (favorited) {
                await removeFavorite(user.id, dateStr);
                setFavorited(false);
            } else {
                await addFavorite(
                    user.id,
                    dateStr,
                    data.verseRef,
                    data.fullVerse,
                    data.interpretation,
                    data.mission,
                    data.verseRefEn,
                    data.fullVerseEn,
                    data.interpretationEn,
                    data.missionEn
                );
                setFavorited(true);
            }
        } catch (error) {
            Alert.alert("Error", "Favorite update failed");
        } finally {
            setLoadingFavorite(false);
        }
    };

    const handleShare = async () => {
        const { Share } = require('react-native');
        const verseRef = language === 'en' ? (data.verseRefEn || data.verseRef) : data.verseRef;
        const fullVerse = language === 'en' ? (data.fullVerseEn || data.fullVerse) : data.fullVerse;
        const interpretation = language === 'en' ? (data.interpretationEn || data.interpretation) : data.interpretation;
        const mission = language === 'en' ? (data.missionEn || data.mission) : data.mission;

        const header = language === 'ko' ? '[오늘의 만나]' : "[Today's Manna]";
        const interpTitle = language === 'ko' ? '오늘의 해석' : "Today's Message";
        const missionTitle = language === 'ko' ? '오늘의 미션' : "Today's Mission";

        let shareMessage = `${header}\n\n"${fullVerse}"\n- ${verseRef}\n\n`;

        if (interpretation) {
            shareMessage += `[${interpTitle}]\n${interpretation}\n\n`;
        } // Check if interpretation exists

        if (mission) {
            shareMessage += `[${missionTitle}]\n${mission}\n\n`;
        }

        shareMessage += language === 'ko' ? "매일 새로운 말씀, '오늘의 만나'" : "Daily Manna, 'Today's Manna'";

        try {
            await Share.share({
                message: shareMessage,
            });
        } catch (error) {
            console.log("Share error:", error);
        }
    };

    // Verify English data availability
    const isEnglishAvailable = !!(data.verseTextEn && data.verseTextEn.length > 0);

    let primaryVerseRef, primaryVerseText;
    let secondaryVerseText;

    if (language === 'ko') {
        // Korean Mode
        primaryVerseRef = data.verseRef;
        primaryVerseText = data.verseText;

        // Secondary is English (only if available)
        secondaryVerseText = data.verseTextEn || "";
    } else {
        // English Mode
        if (isEnglishAvailable) {
            primaryVerseRef = data.verseRefEn || data.verseRef;
            primaryVerseText = data.verseTextEn;

            // Secondary is Korean
            secondaryVerseText = data.verseText;
        } else {
            // English Mode but NO English Data -> Show Korean as Primary, Hide Secondary
            primaryVerseRef = data.verseRef;
            primaryVerseText = data.verseText;

            secondaryVerseText = "";
        }
    }

    return (
        <View style={styles.container}>
            {/* Debug Source Indicator */}
            {isDebug && data.source && (
                <View style={[
                    styles.debugIndicator,
                    { backgroundColor: data.source === 'DB' ? '#4CAF50' : '#FF9800' }
                ]}>
                    <Text style={styles.debugIndicatorText}>{data.source}</Text>
                </View>
            )}

            {/* 1. Centralized Control Island (Top Layer) */}
            <View style={styles.islandContainer}>
                <View style={styles.glassIsland}>
                    {/* Logout Button */}
                    <TouchableOpacity onPress={onLogout} style={styles.iconButton}>
                        <LogOut size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Favorite Button */}
                    <TouchableOpacity
                        onPress={handleToggleFavorite}
                        style={styles.iconButton}
                        disabled={loadingFavorite}
                    >
                        <Heart
                            size={20}
                            color={favorited ? "#E57373" : "#8D6E63"}
                            fill={favorited ? "#E57373" : "transparent"}
                        />
                    </TouchableOpacity>

                    {/* Archive Button - Moved from bottom */}
                    <TouchableOpacity onPress={handleOpenFavorites} style={styles.iconButton}>
                        <FolderHeart size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    {/* Share Button - Moved from bottom */}
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Share2 size={20} color="#8D6E63" />
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

            {/* Main Content (Swipeable/Scrollable) */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.centerHeader}>
                    {/* Title Added Back */}
                    <Text style={styles.pageTitle}>
                        {language === 'ko' ? "오늘의 만나" : "Today's Manna"}
                    </Text>

                    <View style={styles.headerDateBadge}>
                        <Text style={styles.headerDateText}>
                            {formatDisplayDate(data.date, language, true)}
                        </Text>
                    </View>

                    <View style={styles.verseCard}>
                        <Text style={styles.verseRef}>{primaryVerseRef}</Text>
                        <View style={styles.dividerHorizontal} />
                        <Text style={styles.verseText}>
                            {primaryVerseText}
                        </Text>

                        {/* Secondary Text (if applicable) */}
                        {secondaryVerseText ? (
                            <Text style={styles.secondaryText}>
                                {secondaryVerseText}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </ScrollView>

            {/* Next Button (Bottom Center) */}
            <TouchableOpacity onPress={() => onNext()} style={styles.nextButton} activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>
                    {language === 'ko' ? "해설 보러가기" : "Read Interpretation"}
                </Text>
                <ChevronUp color="white" size={24} />
            </TouchableOpacity>

            {/* Calendar Modal */}
            <CalendarModal
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={handleSelectDate}
                selectedDate={data.date || getLocalDateString()}
                favoriteDates={favoriteDates} // Pass favorite dates
                resolutionDates={resolutionDates} // Pass resolution dates
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    islandContainer: {
        position: 'absolute',
        top: 50, // Safe Area Top
        width: '100%',
        alignItems: 'center',
        zIndex: 50,
    },
    glassIsland: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        paddingVertical: 0,
        paddingHorizontal: 20,
        height: 44, // Reduced height (was 54)
        borderWidth: 1,
        borderColor: '#D7CCC8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'space-between',
        minWidth: '92%',
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 150,
        paddingTop: 150, // Final adjustment: +40px as requested (110 -> 150)
    },
    centerHeader: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        // marginTop removed
    },
    pageTitle: {
        fontSize: 28,
        fontFamily: 'Jua_400Regular',
        color: '#4E342E',
        marginBottom: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(255, 255, 255, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    headerDateBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    headerDateText: {
        fontSize: 14,
        color: '#795548',
        fontFamily: 'NanumGothic_700Bold',
    },
    verseCard: {
        backgroundColor: '#FFFEFA',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 520, // Increased further
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(141, 110, 99, 0.1)',
    },
    verseRef: {
        fontSize: 20,
        fontFamily: 'NanumGothic_800ExtraBold',
        color: '#4E342E',
        textAlign: 'center',
        marginBottom: 16,
    },
    dividerHorizontal: {
        width: 40,
        height: 2,
        backgroundColor: '#D7CCC8',
        marginBottom: 20,
        opacity: 0.5,
    },
    verseText: {
        fontSize: 20,
        fontFamily: 'GowunDodum_400Regular',
        color: '#3E2723',
        textAlign: 'center',
        lineHeight: 34,
    },
    secondaryText: {
        marginTop: 20,
        fontSize: 16,
        fontFamily: 'GowunDodum_400Regular',
        color: '#8D6E63',
        textAlign: 'center',
        lineHeight: 26,
        fontStyle: 'italic',
    },
    // Updated Next Button to be a pill with text
    nextButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(78, 52, 46, 0.95)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        gap: 8,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Jua_400Regular',
    },
    debugIndicator: {
        position: 'absolute',
        top: 60,
        right: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 100,
        opacity: 0.8,
    },
    debugIndicatorText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'NanumGothic_700Bold',
    },
});

export default VerseScreen;
