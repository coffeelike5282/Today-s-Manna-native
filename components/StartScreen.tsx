import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ScreenProps } from '../types/types';
import Mascot from './Mascot';
import { Volume2, VolumeX, Cloud, Star, Heart, Languages } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const StartScreen: React.FC<ScreenProps> = ({ onNext, isMuted, toggleMute, language = 'ko', toggleLanguage }) => {
    return (
        <View style={styles.container}>
            {/* Background Floating Elements - Positioned absolutely */}
            <View style={[styles.floating, { top: height * 0.1, left: width * 0.1 }]}>
                <Cloud size={48} color="#B2EBF2" fill="#B2EBF2" />
            </View>
            <View style={[styles.floating, { top: height * 0.15, right: width * 0.1 }]}>
                <Star size={36} color="#FFECB3" fill="#FFECB3" />
            </View>
            <View style={[styles.floating, { top: height * 0.25, left: width * 0.25 }]}>
                <Heart size={30} color="#F8BBD0" fill="#F8BBD0" />
            </View>
            <View style={[styles.floating, { bottom: height * 0.3, left: width * 0.1 }]}>
                <Cloud size={60} color="#C8E6C9" fill="#C8E6C9" />
            </View>
            <View style={[styles.floating, { bottom: height * 0.2, right: width * 0.1 }]}>
                <Heart size={40} color="#D1C4E9" fill="#D1C4E9" />
            </View>
            <View style={[styles.floating, { bottom: height * 0.35, right: width * 0.2 }]}>
                <Star size={30} color="#FFE082" fill="#FFE082" />
            </View>

            {/* Language Button */}
            <View style={styles.langButtonContainer}>
                <TouchableOpacity
                    onPress={toggleLanguage}
                    style={styles.iconButton}
                >
                    <Text style={styles.langText}>{language === 'ko' ? 'EN' : '한글'}</Text>
                </TouchableOpacity>
            </View>

            {/* Mute Button */}
            <View style={styles.muteButtonContainer}>
                <TouchableOpacity
                    onPress={toggleMute}
                    style={styles.iconButton}
                >
                    {isMuted ? (
                        <VolumeX color="gray" size={24} />
                    ) : (
                        <Volume2 color="#5D4037" size={24} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
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

                <Mascot onClick={onNext} style={styles.mascot} />

                <TouchableOpacity onPress={onNext} style={styles.startButton}>
                    <Text style={styles.startButtonText}>
                        {language === 'ko' ? "터치하여 말씀 시작하기" : "Touch to Start"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {language === 'ko' ? "이어폰 착용을 권장합니다" : "Earphones Recommended"}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    floating: {
        position: 'absolute',
        opacity: 0.6,
    },
    langButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 90, // Positioned to the left of mute button
        zIndex: 100, // Ensure it's on top
        elevation: 10,
    },
    muteButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 30,
        zIndex: 50,
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 0, // Removed gray Android shadow
    },
    langText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5D4037',
        fontFamily: 'NanumGothic_700Bold',
    },
    mainContent: {
        alignItems: 'center',
        zIndex: 20,
    },
    title: {
        fontSize: 40,
        color: '#8D6E63',
        fontFamily: 'Jua_400Regular',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    dateBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dateText: {
        color: '#666',
        fontSize: 18,
        fontFamily: 'NanumGothic_700Bold',
    },
    mascot: {
        marginBottom: 48,
    },
    startButton: {
        marginTop: 10,
    },
    startButtonText: {
        fontSize: 26,
        color: '#444',
        fontFamily: 'NanumGothic_800ExtraBold',
        letterSpacing: -0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(100, 100, 100, 0.6)',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default StartScreen;
