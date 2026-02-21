import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, Target, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, withSpring, withSequence, useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PrayerResolutionCardProps {
    prayer: string;
    resolution: string;
    isCompleted: boolean;
    onComplete: () => void;
    language: 'ko' | 'en';
}

const PrayerResolutionCard: React.FC<PrayerResolutionCardProps> = ({
    prayer,
    resolution,
    isCompleted,
    onComplete,
    language
}) => {
    const scale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const handlePress = () => {
        if (isCompleted) return;

        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );
        onComplete();
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(300).duration(800)}
            style={styles.container}
        >
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {language === 'ko' ? "하루를 여는 기도와 결단" : "Morning Prayer & Resolution"}
                    </Text>
                    <View style={styles.headerDivider} />
                </View>

                {/* Prayer Section */}
                <View style={styles.section}>
                    <View style={styles.sectionIconTitle}>
                        <Heart size={20} color="#E57373" fill="#E57373" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>
                            {language === 'ko' ? "오늘의 기도" : "Today's Prayer"}
                        </Text>
                    </View>
                    <Text style={styles.content}>
                        {prayer}
                    </Text>
                </View>

                {/* Resolution Section */}
                <View style={[styles.section, { marginBottom: 24 }]}>
                    <View style={styles.sectionIconTitle}>
                        <Target size={20} color="#4CAF50" style={{ marginRight: 8 }} />
                        <Text style={styles.sectionTitle}>
                            {language === 'ko' ? "오늘의 결단" : "Today's Resolution"}
                        </Text>
                    </View>
                    <Text style={styles.content}>
                        {resolution}
                    </Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    onPress={handlePress}
                    disabled={isCompleted}
                    activeOpacity={0.8}
                >
                    <Animated.View style={[
                        styles.button,
                        isCompleted ? styles.buttonCompleted : styles.buttonActive,
                        animatedButtonStyle
                    ]}>
                        <CheckCircle2
                            size={20}
                            color="#FFF"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.buttonText}>
                            {isCompleted
                                ? (language === 'ko' ? "오늘의 결단 완료!" : "Resolution Complete!")
                                : (language === 'ko' ? "결단 서약 및 완료" : "I Commit & Complete")
                            }
                        </Text>
                    </Animated.View>
                </TouchableOpacity>

                {isCompleted && (
                    <Text style={styles.footerHint}>
                        {language === 'ko'
                            ? "달력에서 녹색 점으로 기록되었습니다 ✨"
                            : "Marked as a green dot on your calendar ✨"}
                    </Text>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#EFEBE9',
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
        marginBottom: 8,
    },
    headerDivider: {
        width: 30,
        height: 3,
        backgroundColor: '#D7CCC8',
        borderRadius: 2,
    },
    section: {
        marginBottom: 20,
    },
    sectionIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'NanumGothic_800ExtraBold',
        color: '#5D4037',
    },
    content: {
        fontSize: 16,
        fontFamily: 'GowunDodum_400Regular',
        color: '#4E342E',
        lineHeight: 24,
    },
    button: {
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonActive: {
        backgroundColor: '#4E342E',
    },
    buttonCompleted: {
        backgroundColor: '#81C784',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'NanumGothic_700Bold',
    },
    footerHint: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 12,
        color: '#8D6E63',
        fontFamily: 'NanumGothic_400Regular',
        fontStyle: 'italic',
    }
});

export default PrayerResolutionCard;
