import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { ScreenProps } from '../types/types';
import { Sparkles, ClipboardCheck, Volume2, VolumeX, LogOut, Share2, Heart, FolderHeart, ArrowLeft, Cloud, Star } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import { isFavorited, addFavorite, removeFavorite, getFavoriteDates } from '../services/favoritesService';
import CalendarModal from './CalendarModal';
import ComingSoonTooltip from './ComingSoonTooltip';

const { width, height } = Dimensions.get('window');

const DetailScreen: React.FC<ScreenProps> = ({ onBack, data, isMuted, toggleMute, onNext, language = 'ko', toggleLanguage = () => { }, onLogout, user }) => {

    const [favorited, setFavorited] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]); // Store favorite dates
    const [tooltipVisible, setTooltipVisible] = useState(false);

    // Select data based on language (fallback to Korean if English missing)
    const interpretation = language === 'en' ? (data.interpretationEn || data.interpretation) : data.interpretation;
    const mission = language === 'en' ? (data.missionEn || data.mission) : data.mission;
    const verseRef = language === 'en' ? (data.verseRefEn || data.verseRef) : data.verseRef;
    const fullVerse = language === 'en' ? (data.fullVerseEn || data.fullVerse) : data.fullVerse;

    useEffect(() => {
        const checkStatus = async () => {
            if (user && data.verseRef) {
                // Use data.date instead of current system date
                const status = await isFavorited(user.id, data.date);
                setFavorited(status);

                // Fetch all favorite dates for calendar dots
                const dates = await getFavoriteDates(user.id);
                setFavoriteDates(dates);
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

    const handleShare = async () => {
        const { Share } = require('react-native');

        const header = language === 'ko' ? '[오늘의 만나]' : "[Today's Manna]";
        const interpTitle = language === 'ko' ? '오늘의 해석' : "Today's Message";
        const missionTitle = language === 'ko' ? '오늘의 미션' : "Today's Mission";

        let shareMessage = `${header}\n\n"${fullVerse}"\n- ${verseRef}\n\n`;

        if (interpretation) {
            shareMessage += `[${interpTitle}]\n${interpretation}\n\n`;
        }

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

    const handleToggleFavorite = async () => {
        if (!user) return;
        setLoadingFavorite(true);
        // Use data.date instead of system date
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

    return (
        <View style={styles.container}>


            {/* 1. Centralized Control Island (Top Layer) */}
            <View style={styles.islandContainer}>
                <View style={styles.glassIsland}>
                    {/* Back Button */}
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft size={20} color="#8D6E63" />
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
                            color={favorited ? "#FF5252" : "#8D6E63"}
                            fill={favorited ? "#FF5252" : "transparent"}
                        />
                    </TouchableOpacity>

                    {/* Favorites List Button */}
                    <TouchableOpacity onPress={handleOpenFavorites} style={styles.iconButton}>
                        <FolderHeart size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    {/* Share Button */}
                    <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                        <Share2 size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Language Toggle */}
                    <TouchableOpacity onPress={toggleLanguage} style={styles.iconButton}>
                        <Text style={styles.langText}>{language === 'ko' ? 'EN' : '한글'}</Text>
                    </TouchableOpacity>

                    {/* Mute Toggle */}
                    <TouchableOpacity onPress={() => setTooltipVisible(true)} style={styles.iconButton}>
                        {isMuted ? (
                            <VolumeX color="#8D6E63" size={20} />
                        ) : (
                            <Volume2 color="#5D4037" size={20} />
                        )}
                        <ComingSoonTooltip
                            visible={tooltipVisible}
                            onHide={() => setTooltipVisible(false)}
                            message={language === 'ko' ? "지원 예정입니다" : "Coming Soon"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content (Scrollable) */}
            <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 2. Content Sheet (White Paper Style) */}
                <View style={[styles.sheet, { marginTop: 120 }]}>
                    <View style={{ flex: 1, width: '100%', alignItems: 'center', paddingBottom: 80 }}>
                        {/* Header Date Badge */}
                        <View style={[styles.headerDateBadge, { marginBottom: 20 }]}>
                            <Text style={styles.headerDateText}>
                                {new Date(data.date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </Text>
                        </View>

                        {/* Verse Reference */}
                        <View style={styles.titleSection}>
                            <Text style={styles.verseRef}>{verseRef}</Text>
                        </View>

                        <View style={styles.dividerHorizontal} />

                        {/* Interpretation Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Sparkles size={20} color="#FFD54F" style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>
                                    {language === 'ko' ? "오늘의 해설" : "Today's Interpretation"}
                                </Text>
                            </View>
                            <Text style={styles.sectionContent}>
                                {interpretation}
                            </Text>
                        </View>

                        <View style={styles.dividerHorizontal} />

                        {/* Mission Section */}
                        {/* Only show mission if it exists */}
                        {mission ? (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <ClipboardCheck size={20} color="#81C784" style={{ marginRight: 8 }} />
                                    <Text style={styles.sectionTitle}>
                                        {language === 'ko' ? "오늘의 미션" : "Today's Mission"}
                                    </Text>
                                </View>
                                <Text style={styles.sectionContent}>
                                    {mission}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Footer Quote */}
                    <View style={styles.footerQuote}>
                        <Text style={styles.footerText}>
                            {language === 'ko'
                                ? "말씀이 삶이 되는 하루 보내세요 🌿"
                                : "Let the Word become life today 🌿"}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Calendar Modal */}
            <CalendarModal
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDate={handleSelectDate}
                selectedDate={new Date().toISOString().split('T')[0]}
                favoriteDates={favoriteDates} // Pass favorite dates
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    floating: {
        position: 'absolute',
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity
        borderRadius: 30,
        paddingVertical: 0,
        paddingHorizontal: 20,
        height: 44, // Reduced height to match VerseScreen
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
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: 16,
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
    },
    sheet: {
        backgroundColor: '#FFFEFA', // Match VerseCard background
        borderRadius: 24, // Consistent radius
        padding: 30,
        paddingTop: 40,
        minHeight: height * 0.7 + 40, // Adjust height logic
        width: '90%', // Add side margins (90% width)
        alignSelf: 'center', // Center horizontally
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        alignItems: 'center',
        paddingBottom: 150,
    },
    headerDateBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 16,
        marginBottom: 20,
        alignSelf: 'center',
    },
    headerDateText: {
        fontSize: 14,
        color: '#5D4037', // Brown
        fontFamily: 'NanumGothic_700Bold',
    },
    titleSection: {
        marginBottom: 20,
        alignItems: 'center',
    },
    verseRef: {
        fontSize: 22,
        fontFamily: 'Jua_400Regular',
        color: '#4E342E', // Darker brown
        textAlign: 'center',
        marginBottom: 8,
    },
    dividerHorizontal: {
        width: 40,
        height: 2,
        backgroundColor: '#D7CCC8',
        marginBottom: 24,
        opacity: 0.5,
    },
    section: {
        marginBottom: 32,
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'NanumGothic_800ExtraBold',
        color: '#5D4037',
    },
    sectionContent: {
        fontSize: 18, // Increased font size
        fontFamily: 'GowunDodum_400Regular',
        color: '#4E342E',
        lineHeight: 30, // Increased line height for readability
    },
    footerQuote: {
        position: 'absolute', // Force to bottom
        bottom: 30,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(141, 110, 99, 0.1)',
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'NanumGothic_700Bold', // Bold
        color: '#8D6E63',
        fontStyle: 'italic',
    },
});

export default DetailScreen;
