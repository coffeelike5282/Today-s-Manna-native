import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Cloud, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const BackgroundDecor = () => {
    const cloud1Anim = useRef(new Animated.Value(0)).current;
    const cloud2Anim = useRef(new Animated.Value(0)).current;
    const starAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Cloud 1 Animation (Left to Right)
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloud1Anim, {
                    toValue: 20,
                    duration: 4000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud1Anim, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Cloud 2 Animation (Right to Left)
        Animated.loop(
            Animated.sequence([
                Animated.timing(cloud2Anim, {
                    toValue: -20,
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(cloud2Anim, {
                    toValue: 0,
                    duration: 5000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Star Animation (Twinkle/Pulse)
        Animated.loop(
            Animated.sequence([
                Animated.timing(starAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(starAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const starOpacity = starAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Cloud 1 */}
            <Animated.View style={[styles.cloud, { top: height * 0.1, left: -20, transform: [{ translateX: cloud1Anim }] }]}>
                <Cloud size={64} color="rgba(255,255,255,0.4)" fill="rgba(255,255,255,0.2)" />
            </Animated.View>

            {/* Cloud 2 */}
            <Animated.View style={[styles.cloud, { top: height * 0.2, right: -20, transform: [{ translateX: cloud2Anim }] }]}>
                <Cloud size={48} color="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.1)" />
            </Animated.View>

            {/* Star 1 */}
            <Animated.View style={[styles.star, { top: height * 0.15, left: width * 0.5, opacity: starOpacity }]}>
                <Star size={24} color="#FFF176" fill="#FFF176" />
            </Animated.View>

            {/* Star 2 */}
            <Animated.View style={[styles.star, { top: height * 0.08, right: width * 0.2, opacity: starOpacity }]}>
                <Star size={16} color="#FFF59D" fill="#FFF59D" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    cloud: {
        position: 'absolute',
    },
    star: {
        position: 'absolute',
    },
});

export default BackgroundDecor;
