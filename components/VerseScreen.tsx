import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ScreenProps } from '../types/types';
import { Volume2, VolumeX, Cloud, Star, ChevronUp } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const VerseScreen: React.FC<ScreenProps> = ({ onNext, data, isMuted, toggleMute, language = 'ko', toggleLanguage = () => { } }) => {

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
            {/* Background Floating Elements */}
            <View style={[styles.floating, { top: height * 0.1, left: 30, opacity: 0.4 }]}>
                <Cloud size={60} color="white" fill="white" />
            </View>
            <View style={[styles.floating, { top: height * 0.2, right: 30, opacity: 0.5 }]}>
                <Star size={36} color="#FFF59D" fill="#FFF59D" />
            </View>
            <View style={[styles.floating, { bottom: height * 0.4, left: 40, opacity: 0.3 }]}>
                <Star size={24} color="#8D6E63" fill="#8D6E63" />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={toggleLanguage} style={styles.iconBox}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8D6E63' }}>
                            {language === 'ko' ? 'EN' : '한글'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {language === 'ko' ? "오늘의 만나" : "Today's Manna"}
                    </Text>
                    <TouchableOpacity onPress={toggleMute} style={styles.smallMuteButton}>
                        {isMuted ? <VolumeX color="gray" size={20} /> : <Volume2 color="#5D4037" size={20} />}
                    </TouchableOpacity>
                </View>
                <View style={styles.headerDateBadge}>
                    <Text style={styles.headerDateText}>
                        {new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                {/* Mascot Mini - Static View version */}
                <View style={styles.mascotMini}>
                    <View style={styles.mascotMiniBody}>
                        <View style={styles.mascotMiniEyes}>
                            <View style={styles.mascotMiniEye} />
                            <View style={styles.mascotMiniEye} />
                        </View>
                        <View style={styles.mascotMiniMouth} />
                    </View>
                </View>
            </View>

            {/* Main Card */}
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <View style={styles.verseRefBadge}>
                        <Text style={styles.verseRefText}>{primaryVerseRef}</Text>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Primary Verse (Based on Language Mode) */}
                        {(primaryVerseText || "").split('\n').map((line, i) => {
                            const isHighlight = language === 'ko' && (line.includes("합력하여") || line.includes("기쁨"));
                            return (
                                <Text key={`primary-${i}`} style={[styles.verseLine, isHighlight && styles.highlightText]}>
                                    {line}
                                </Text>
                            );
                        })}

                        <Text style={styles.divider}>—</Text>

                        {/* Secondary Verse (Translation) */}
                        <View style={styles.secondaryContainer}>
                            {secondaryVerseText.split('\n').map((line, i) => (
                                <Text key={`secondary-${i}`} style={styles.secondaryVerseLine}>
                                    {line}
                                </Text>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Footer Action */}
            <View style={styles.footer}>
                <View style={styles.chevronBox}>
                    <ChevronUp size={36} color="#8D6E63" strokeWidth={3} />
                </View>
                <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>
                        {language === 'ko' ? "해석과 미션 보기" : "View Meaning & Mission"}
                    </Text>
                </TouchableOpacity>
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
    header: {
        paddingTop: 60,
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 8,
        position: 'relative',
    },
    iconBox: {
        position: 'absolute',
        left: 0,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 0,
        zIndex: 100,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Jua_400Regular',
        color: '#8D6E63',
    },
    smallMuteButton: {
        position: 'absolute',
        right: 0,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 0,
    },
    headerDateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 15,
        marginBottom: 20,
    },
    headerDateText: {
        color: '#777',
        fontSize: 14,
        fontFamily: 'NanumGothic_700Bold',
    },
    mascotMini: {
        marginBottom: 24,
    },
    mascotMiniBody: {
        width: 80,
        height: 64,
        backgroundColor: '#FFE082',
        borderRadius: 24,
        borderWidth: 3,
        borderColor: 'rgba(141, 110, 99, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascotMiniEyes: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    mascotMiniEye: {
        width: 6,
        height: 6,
        backgroundColor: '#8D6E63',
        borderRadius: 3,
    },
    mascotMiniMouth: {
        width: 16,
        height: 6,
        borderBottomWidth: 3,
        borderColor: '#8D6E63',
        borderRadius: 8,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 40,
        padding: 24,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    verseRefBadge: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#E8F5E9',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(165, 214, 167, 0.2)',
        marginBottom: 24,
    },
    verseRefText: {
        color: '#689F38',
        fontFamily: 'NanumGothic_800ExtraBold',
        fontSize: 22,
    },
    scrollView: {
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    verseLine: {
        fontSize: 22,
        lineHeight: 34,
        textAlign: 'center',
        color: '#444',
        fontFamily: 'GowunDodum_400Regular',
        marginBottom: 8,
    },
    highlightText: {
        color: '#689F38',
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 16,
        color: '#ccc',
        fontSize: 18,
    },
    fullVerse: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 26,
        fontFamily: 'GowunDodum_400Regular',
        marginTop: 10,
    },
    secondaryContainer: {
        width: '100%',
        alignItems: 'center',
        opacity: 0.8,
    },
    secondaryVerseLine: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
        color: '#888',
        fontFamily: 'GowunDodum_400Regular',
        marginBottom: 6,
    },
    secondaryFullVerse: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
        fontFamily: 'NanumGothic_400Regular',
        fontStyle: 'italic',
        marginTop: 8,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    chevronBox: {
        alignItems: 'center',
        marginBottom: 8,
    },
    nextButton: {
        width: '100%',
        height: 64,
        backgroundColor: '#FF9E80',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 22,
        fontFamily: 'NanumGothic_800ExtraBold',
    },
});

export default VerseScreen;
