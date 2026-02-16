import React, { useRef } from 'react';
import { View, Animated, StyleSheet, Pressable, PressableProps } from 'react-native';

interface MascotProps extends PressableProps {
    onClick?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ onClick, style, ...props }) => {
    // Animation Value (Scale)
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 10,
        }).start();
    };

    return (
        <Pressable
            onPress={onClick}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={(state) => [
                styles.container,
                typeof style === 'function' ? style(state) : style
            ]}
            {...props}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                {/* Body */}
                <View style={styles.body}>
                    {/* Eyes */}
                    <View style={styles.eyesRow}>
                        <View style={styles.eye} />
                        <View style={styles.eye} />
                    </View>

                    {/* Mouth */}
                    <View style={styles.mouth} />

                    {/* Cheeks */}
                    <View style={[styles.cheek, styles.leftCheek]} />
                    <View style={[styles.cheek, styles.rightCheek]} />
                </View>

                {/* Shine/Highlight */}
                <View style={styles.shine} />
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        // Make sure container doesn't have background
    },
    body: {
        width: 192,
        height: 160,
        backgroundColor: '#FFE082', // manna-yellow
        borderRadius: 48,
        borderWidth: 6,
        borderColor: '#8D6E63', // manna-brown
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    eyesRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 8,
    },
    eye: {
        width: 14,
        height: 14,
        backgroundColor: '#8D6E63',
        borderRadius: 7,
    },
    mouth: {
        width: 40,
        height: 20,
        borderBottomWidth: 6,
        borderColor: '#8D6E63',
        borderRadius: 20,
    },
    cheek: {
        position: 'absolute',
        width: 20,
        height: 12,
        backgroundColor: 'rgba(255, 205, 210, 1)', // red-200ish
        borderRadius: 6,
        top: 80,
    },
    leftCheek: {
        left: 24,
    },
    rightCheek: {
        right: 24,
    },
    shine: {
        position: 'absolute',
        top: 20,
        right: 40,
        width: 32,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 8,
        transform: [{ rotate: '-12deg' }],
    }
});

export default Mascot;
