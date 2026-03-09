import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { ArrowLeft, Heart, CalendarHeart, Share2, Settings, Volume2, VolumeX, LogOut, Globe } from 'lucide-react-native';
import { User, Language } from '../types/types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface IslandHeaderProps {
    user: User | null;
    canGoBack: boolean;
    onBack?: () => void;
    favorited: boolean;
    loadingFavorite: boolean;
    onToggleFavorite: () => void;
    onOpenCalendar: () => void;
    onShare: () => void;
    language: Language;
    toggleLanguage: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    onLogout: () => void;
    canFavorite?: boolean; // Added
    canShare?: boolean; // Added
}

const IslandHeader: React.FC<IslandHeaderProps> = ({
    user,
    canGoBack,
    onBack,
    favorited,
    loadingFavorite,
    onToggleFavorite,
    onOpenCalendar,
    onShare,
    language,
    toggleLanguage,
    isMuted,
    toggleMute,
    onLogout,
    canFavorite = true, // Default to true
    canShare = true // Default to true
}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (language === 'ko' ? '용사님' : 'User');
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    return (
        <View style={styles.container}>
            <View style={[styles.island, expanded && styles.islandExpanded]}>
                {/* 1. Main Row (Fixed Order) */}
                <View style={styles.mainRow}>
                    {/* [1] Back Button - Fixed Position */}
                    <TouchableOpacity
                        onPress={onBack}
                        disabled={!canGoBack}
                        style={[styles.iconButton, { opacity: canGoBack ? 1.0 : 0.25 }]}
                    >
                        <ArrowLeft size={20} color="#8D6E63" />
                    </TouchableOpacity>

                    {/* [2] Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarPlaceholderText}>{userName.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                    </View>

                    {/* Spacer to push tools to the right */}
                    <View style={{ flex: 1 }} />

                    {/* Tools Group */}
                    <View style={styles.toolsGroup}>
                        {/* [4] Favorite */}
                        <TouchableOpacity
                            onPress={onToggleFavorite}
                            disabled={loadingFavorite || !canFavorite}
                            style={[styles.iconButton, { opacity: canFavorite ? 1.0 : 0.25 }]}
                        >
                            <Heart
                                size={20}
                                color={favorited ? "#E57373" : "#8D6E63"}
                                fill={favorited && canFavorite ? "#E57373" : "transparent"}
                            />
                        </TouchableOpacity>

                        {/* [5] Calendar */}
                        <TouchableOpacity onPress={onOpenCalendar} style={styles.iconButton}>
                            <CalendarHeart size={20} color="#8D6E63" />
                        </TouchableOpacity>

                        {/* [6] Share */}
                        <TouchableOpacity
                            onPress={onShare}
                            disabled={!canShare}
                            style={[styles.iconButton, { opacity: canShare ? 1.0 : 0.25 }]}
                        >
                            <Share2 size={20} color="#8D6E63" />
                        </TouchableOpacity>

                        {/* [7] Settings (Gear) - Trigger for expansion */}
                        <TouchableOpacity onPress={toggleExpanded} style={styles.iconButton}>
                            <Settings size={20} color={expanded ? "#5D4037" : "#8D6E63"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. Expanded Menu (Settings) */}
                {expanded && (
                    <View style={styles.expandedMenu}>
                        <View style={styles.menuDivider} />

                        <View style={styles.menuRow}>
                            {/* Language Toggle */}
                            <TouchableOpacity onPress={toggleLanguage} style={styles.menuItem}>
                                <View style={styles.menuIconCircle}>
                                    <Globe size={18} color="#8D6E63" />
                                </View>
                                <Text style={styles.menuItemText}>
                                    {language === 'ko' ? 'English로 변경' : 'Switch to Korean'}
                                </Text>
                            </TouchableOpacity>

                            {/* Mute Toggle */}
                            <TouchableOpacity onPress={toggleMute} style={styles.menuItem}>
                                <View style={styles.menuIconCircle}>
                                    {isMuted ? (
                                        <VolumeX size={18} color="#8D6E63" />
                                    ) : (
                                        <Volume2 size={18} color="#5D4037" />
                                    )}
                                </View>
                                <Text style={[styles.menuItemText, !isMuted && { color: '#5D4037' }]}>
                                    {language === 'ko' ? (isMuted ? '소리 켜기' : '소리 끄기') : (isMuted ? 'Sound On' : 'Mute')}
                                </Text>
                            </TouchableOpacity>

                            {/* Logout */}
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        language === 'ko' ? "로그아웃" : "Logout",
                                        language === 'ko' ? "정말 로그아웃 하시겠습니까?" : "Are you sure you want to logout?",
                                        [
                                            { text: language === 'ko' ? "아니오" : "No", style: "cancel" },
                                            { text: language === 'ko' ? "네" : "Yes", onPress: () => { setExpanded(false); onLogout(); } }
                                        ]
                                    );
                                }}
                                style={styles.menuItem}
                            >
                                <View style={[styles.menuIconCircle, { backgroundColor: '#FBE9E7' }]}>
                                    <LogOut size={18} color="#E64A19" />
                                </View>
                                <Text style={[styles.menuItemText, { color: '#E64A19' }]}>
                                    {language === 'ko' ? '로그아웃' : 'Logout'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50, // Adjustment for safe area
        width: '100%',
        alignItems: 'center',
        zIndex: 1000,
    },
    island: {
        width: '94%',
        backgroundColor: 'rgba(255, 254, 250, 0.95)', // Match VerseCard background
        borderRadius: 24, // Slightly reduced for slimmer look
        borderWidth: 1,
        borderColor: '#D7CCC8',
        paddingHorizontal: 12,
        paddingVertical: 2, // Reduced from 4
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    islandExpanded: {
        borderRadius: 20,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40, // Reduced from 48
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
        maxWidth: 120,
    },
    avatarContainer: {
        width: 24, // Reduced from 28
        height: 24, // Reduced from 28
        borderRadius: 12,
        backgroundColor: '#EFEBE9',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarPlaceholderText: {
        fontSize: 10, // Reduced from 12
        color: '#8D6E63',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 13, // Reduced from 14
        fontFamily: 'NanumGothic_700Bold',
        color: '#5D4037',
        marginLeft: 6, // Reduced from 8
    },
    toolsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    expandedMenu: {
        paddingBottom: 8, // Reduced from 12
        paddingHorizontal: 4,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#EFEBE9',
        marginVertical: 2, // Reduced from 4
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    menuItem: {
        alignItems: 'center',
        flex: 1,
    },
    menuIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    menuItemText: {
        fontSize: 10,
        fontFamily: 'NanumGothic_700Bold',
        color: '#8D6E63',
        textAlign: 'center',
    },
});

export default IslandHeader;
