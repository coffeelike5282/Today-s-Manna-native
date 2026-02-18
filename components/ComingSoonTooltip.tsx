import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

interface ComingSoonTooltipProps {
    visible: boolean;
    onHide: () => void;
    message?: string;
}

const ComingSoonTooltip: React.FC<ComingSoonTooltipProps> = ({ visible, onHide, message = "지원 예정입니다" }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.delay(1800),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onHide();
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.arrow} />
                <View style={styles.bubble}>
                    <Text style={styles.text} numberOfLines={1}>{message}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 25,
        right: 0,
        width: 1, // Anchor point
        height: 1,
        zIndex: 5000,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: 100,
        position: 'absolute',
        top: 0,
        right: -10, // Offset to shift leftward since it's on the far right
        alignItems: 'center',
    },
    bubble: {
        backgroundColor: 'rgba(62, 39, 35, 0.98)',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        width: '100%',
    },
    text: {
        color: '#FFF',
        fontSize: 11,
        fontFamily: 'NanumGothic_700Bold',
        textAlign: 'center',
    },
    arrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'rgba(62, 39, 35, 0.98)',
        marginBottom: -1,
    },
});

export default ComingSoonTooltip;
