import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Mascot from './Mascot';
import { formatDisplayDate } from '../utils/dateUtils';

interface VerseCardProps {
    verseRef: string;
    verseText: string;
    date: string;
    language: 'ko' | 'en';
}

const { width } = Dimensions.get('window');
// Card will have a fixed aspect ratio (e.g. 4:5 for Instagram, standard HD etc)
// 1080 x 1350 is good for instagram (4:5)
// We will use a scaled down version for rendering offscreen, say 1080px width is too big. Let's use 800px width.
const CARD_WIDTH = 800;
const CARD_HEIGHT = 1000;

const VerseCard = forwardRef<View, VerseCardProps>(({ verseRef, verseText, date, language }, ref) => {
    return (
        <View
            ref={ref}
            collapsable={false}
            style={styles.cardContainer}
        >
            {/* Background elements */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />

            {/* Header: Date */}
            <View style={styles.header}>
                <Text style={styles.dateText}>
                    {formatDisplayDate(date, language, true)}
                </Text>
            </View>

            {/* Content: Verse */}
            <View style={styles.contentContainer}>
                <Text style={styles.verseRef}>{verseRef}</Text>
                <View style={styles.divider} />
                <Text style={styles.verseText}>{verseText}</Text>
            </View>

            {/* Footer: Mascot and Branding */}
            <View style={styles.footer}>
                <View style={styles.branding}>
                    <Text style={styles.brandTitle}>Today's Manna</Text>
                    <Text style={styles.brandSubtitle}>
                        {language === 'ko' ? '하루를 여는 오늘의 만나' : 'Daily Bread for Your Soul'}
                    </Text>
                </View>

                {/* Scaled down Mascot */}
                <View style={styles.mascotContainer}>
                    <Mascot disabled={true} style={{ transform: [{ scale: 0.6 }] }} />
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#FFF8F0', // Soft pastel cream background
        padding: 60,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'space-between', // Push header to top, footer to bottom
    },
    backgroundCircle1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(255, 235, 238, 0.6)', // Pastel pink
    },
    backgroundCircle2: {
        position: 'absolute',
        bottom: -150,
        right: -100,
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: 'rgba(232, 245, 233, 0.6)', // Pastel green
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
    },
    dateText: {
        fontSize: 24,
        color: '#8D6E63',
        fontFamily: 'NanumGothic_700Bold',
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    verseRef: {
        fontSize: 32,
        fontFamily: 'NanumGothic_800ExtraBold',
        color: '#4E342E',
        marginBottom: 30,
        textAlign: 'center',
    },
    divider: {
        width: 80,
        height: 4,
        backgroundColor: '#D7CCC8',
        marginBottom: 40,
        borderRadius: 2,
    },
    verseText: {
        width: '100%',
        fontSize: 42,
        fontFamily: 'GowunDodum_400Regular',
        color: '#3E2723',
        textAlign: 'center',
        lineHeight: 64,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    branding: {
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    brandTitle: {
        fontSize: 36,
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
        marginBottom: 8,
    },
    brandSubtitle: {
        fontSize: 20,
        color: '#8D6E63',
        fontFamily: 'NanumGothic_400Regular',
    },
    mascotContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -20,
        marginBottom: -20,
    }
});

export default VerseCard;
