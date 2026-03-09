import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { ScreenProps } from '../types/types';
import { Sparkles, ClipboardCheck, Volume2, VolumeX, LogOut, Share2, Heart, CalendarHeart, ArrowLeft, Cloud, Star, Settings } from 'lucide-react-native';
import IslandHeader from './IslandHeader';
import * as Sharing from 'expo-sharing';
import { isFavorited, addFavorite, removeFavorite, getFavoriteDates } from '../services/favoritesService';
import CalendarModal from './CalendarModal';
import { formatDisplayDate, getLocalDateString } from '../utils/dateUtils';
import ComingSoonTooltip from './ComingSoonTooltip';
import PrayerResolutionCard from './PrayerResolutionCard';
import { getRandomPrayerResolution } from '../data/prayerResolutions';
import { getResolutionDates, saveResolution, isResolutionCompleted } from '../services/resolutionService';
import ShareActionSheet from './ShareActionSheet';
import VerseCard from './VerseCard';
import ViewShot from 'react-native-view-shot';
import { shareImage, saveImageToGallery, shareText } from '../services/shareService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const DetailScreen: React.FC<ScreenProps> = ({ onBack, data, isMuted, toggleMute, onNext, language = 'ko', toggleLanguage = () => { }, onLogout, user }) => {

    const [favorited, setFavorited] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]); // Store favorite dates
    const [resolutionDates, setResolutionDates] = useState<string[]>([]); // Store resolution dates
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const viewShotRef = React.useRef<ViewShot>(null);

    const prayerData = getRandomPrayerResolution(data.date);
    const prayerText = language === 'ko' ? prayerData.ko.prayer : prayerData.en.prayer;
    const resolutionText = language === 'ko' ? prayerData.ko.resolution : prayerData.en.resolution;

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

                // Check resolution completion
                const completed = await isResolutionCompleted(user.id, data.date);
                setIsCompleted(!!completed);

                // Fetch all favorite dates for calendar dots
                const dates = await getFavoriteDates(user.id);
                setFavoriteDates(dates);

                // Fetch all resolution dates for calendar dots
                const resDates = await getResolutionDates(user.id);
                setResolutionDates(resDates);
            }
        };
        checkStatus();
    }, [user, data, favorited, isCompleted]); // Trigger refresh on favorite or completion change

    const handleOpenFavorites = () => {
        setCalendarVisible(true);
    };

    const handleSelectDate = (dateString: string) => {
        onNext(dateString);
    };

    const handleSharePress = () => {
        setShareModalVisible(true);
    };

    const handleShareImage = async () => {
        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                await shareImage(uri);
            }
        } catch (error) {
            console.error("Capture and share error:", error);
            Alert.alert("공유 실패", "이미지를 생성하는 중 문제가 발생했습니다.");
        }
    };

    const handleSaveImage = async () => {
        try {
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                await saveImageToGallery(uri);
            }
        } catch (error) {
            console.error("Capture and save error:", error);
            Alert.alert("저장 실패", "이미지를 저장하는 중 문제가 발생했습니다.");
        }
    };

    const handleShareText = async () => {
        await shareText(verseRef, fullVerse, interpretation, mission, language);
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

    const handleCompleteResolution = async () => {
        if (!user) return;
        await saveResolution(user.id, data.date);
        setIsCompleted(true);
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            {/* 1. Integrated Island Header (Dynamic) */}
            <IslandHeader
                user={user ?? null}
                canGoBack={true}
                onBack={onBack}
                favorited={favorited}
                loadingFavorite={loadingFavorite}
                onToggleFavorite={handleToggleFavorite}
                onOpenCalendar={handleOpenFavorites}
                onShare={handleSharePress}
                language={language}
                toggleLanguage={toggleLanguage}
                isMuted={isMuted ?? false}
                toggleMute={toggleMute ?? (() => { })}
                onLogout={onLogout ?? (() => { })}
            />

            {/* Main Content (Scrollable) */}
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
            >
                {/* 2. Content Sheet (White Paper Style) */}
                <View style={[styles.sheet, { marginTop: 120 }]}>
                    <View style={{ flex: 1, width: '100%', alignItems: 'center', paddingBottom: 20 }}>
                        {/* Header Date Badge */}
                        <View style={[styles.headerDateBadge, { marginBottom: 20 }]}>
                            <Text style={styles.headerDateText}>
                                {formatDisplayDate(data.date, language, true)}
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

                    {/* 3. Prayer and Resolution Section */}
                    <PrayerResolutionCard
                        prayer={prayerText}
                        resolution={resolutionText}
                        isCompleted={isCompleted}
                        onComplete={handleCompleteResolution}
                        language={language}
                    />

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
                selectedDate={data.date || getLocalDateString()}
                favoriteDates={favoriteDates} // Pass favorite dates
                resolutionDates={resolutionDates} // Pass resolution dates
                language={language}
            />

            {/* Share Action Sheet */}
            <ShareActionSheet
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                onShareImage={handleShareImage}
                onSaveImage={handleSaveImage}
                onShareText={handleShareText}
                language={language}
            />

            {/* Off-screen ViewShot for VerseCard */}
            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                    <VerseCard
                        verseRef={verseRef}
                        verseText={language === 'en' ? (data.verseTextEn || data.verseText) : data.verseText}
                        date={data.date}
                        language={language}
                        explanation={interpretation}
                        mission={mission}
                    />
                </ViewShot>
            </View>
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
        backgroundColor: '#FFFEFA',
        borderRadius: 24,
        padding: 30,
        paddingTop: 40,
        minHeight: height * 0.7 + 40,
        width: '90%',
        alignSelf: 'center',
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
        alignItems: 'center',
        paddingBottom: 60,
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
        color: '#5D4037',
        fontFamily: 'NanumGothic_700Bold',
    },
    titleSection: {
        marginBottom: 20,
        alignItems: 'center',
    },
    verseRef: {
        fontSize: 22,
        fontFamily: 'Jua_400Regular',
        color: '#4E342E',
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
        marginBottom: 24,
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
        fontSize: 18,
        fontFamily: 'GowunDodum_400Regular',
        color: '#4E342E',
        lineHeight: 30,
    },
    footerQuote: {
        marginTop: 40,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(141, 110, 99, 0.1)',
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'NanumGothic_700Bold',
        color: '#8D6E63',
        fontStyle: 'italic',
    },
});

export default DetailScreen;
