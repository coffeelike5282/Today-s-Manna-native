import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, Platform } from 'react-native';
import { ScreenProps } from '../types/types';
import { Volume2, VolumeX, Cloud, Star, ChevronUp, LogOut, Share2, Heart, CalendarHeart, Settings } from 'lucide-react-native';
import IslandHeader from './IslandHeader';
import { isFavorited, addFavorite, removeFavorite, getFavoriteDates } from '../services/favoritesService';
import CalendarModal from './CalendarModal';
import { formatDisplayDate, getLocalDateString } from '../utils/dateUtils';
import ComingSoonTooltip from './ComingSoonTooltip';
import { getResolutionDates } from '../services/resolutionService';
import ShareActionSheet from './ShareActionSheet';
import VerseCard from './VerseCard';
import ViewShot from 'react-native-view-shot';
import { shareImage, saveImageToGallery, shareText } from '../services/shareService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const VerseScreen: React.FC<ScreenProps> = ({ onNext, onBack, data, isMuted, toggleMute, language = 'ko', toggleLanguage = () => { }, onLogout, user }) => {
    // Check if we are in dev mode
    const isDebug = __DEV__;

    const [favorited, setFavorited] = useState(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [favoriteDates, setFavoriteDates] = useState<string[]>([]); // Store favorite dates
    const [resolutionDates, setResolutionDates] = useState<string[]>([]); // Store resolution dates
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const viewShotRef = React.useRef<ViewShot>(null);

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
                const resDates = await getResolutionDates(user.id);
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
        const verseRefToShare = language === 'en' ? (data.verseRefEn || data.verseRef) : data.verseRef;
        const fullVerseToShare = language === 'en' ? (data.fullVerseEn || data.fullVerse) : data.fullVerse;
        const interpretationToShare = language === 'en' ? (data.interpretationEn || data.interpretation) : data.interpretation;
        const missionToShare = language === 'en' ? (data.missionEn || data.mission) : data.mission;

        await shareText(verseRefToShare, fullVerseToShare, interpretationToShare, missionToShare, language);
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

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            {/* ... keep original rest ... */}
            {/* Debug Source Indicator */}
            {isDebug && data.source && (
                <View style={[
                    styles.debugIndicator,
                    { backgroundColor: data.source === 'DB' ? '#4CAF50' : '#FF9800' }
                ]}>
                    <Text style={styles.debugIndicatorText}>{data.source}</Text>
                </View>
            )}

            {/* 1. Integrated Island Header (Dynamic) */}
            <IslandHeader
                user={user ?? null}
                canGoBack={true} // Enabled to go back to StartScreen
                onBack={onBack}
                favorited={favorited}
                loadingFavorite={loadingFavorite}
                onToggleFavorite={handleToggleFavorite}
                onOpenCalendar={handleOpenFavorites}
                onShare={handleSharePress}
                language={language as any}
                toggleLanguage={toggleLanguage ?? (() => { })}
                isMuted={isMuted ?? false}
                toggleMute={toggleMute ?? (() => { })}
                onLogout={onLogout ?? (() => { })}
            />

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

                    <TouchableOpacity onPress={handleOpenFavorites} activeOpacity={0.7}>
                        <View style={styles.headerDateBadge}>
                            <Text style={styles.headerDateText}>
                                {formatDisplayDate(data.date, language, true)}
                            </Text>
                        </View>
                    </TouchableOpacity>

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
            <TouchableOpacity
                onPress={() => onNext()}
                style={[styles.nextButton, { bottom: insets.bottom + 20 }]}
                activeOpacity={0.8}
            >
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
                        verseRef={language === 'en' ? (data.verseRefEn || data.verseRef) : data.verseRef}
                        verseText={language === 'en' ? (data.verseTextEn || data.verseText) : data.verseText}
                        date={data.date}
                        language={language}
                        explanation={language === 'en' ? (data.interpretationEn || data.interpretation) : data.interpretation}
                        mission={language === 'en' ? (data.missionEn || data.mission) : data.mission}
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
        paddingTop: 105, // Adjusted for slimmer header (40px + 55px top)
        paddingBottom: 40,
        // paddingHorizontal: 16 removed to match DetailScreen full width alignment
    },
    centerHeader: {
        alignItems: 'center',
        width: '100%',
        paddingBottom: 20,
        // paddingHorizontal removed to allow verseCard (90%) to match DetailScreen width
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
        padding: 30, // Matched with DetailScreen sheet padding
        width: '90%',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 520,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10, // Increased to match DetailScreen sheet elevation
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
        width: '100%',
        fontSize: 20,
        fontFamily: 'GowunDodum_400Regular',
        color: '#3E2723',
        textAlign: 'center',
        lineHeight: 34,
    },
    secondaryText: {
        width: '100%',
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
