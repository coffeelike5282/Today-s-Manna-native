import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '../services/authService';
import Mascot from './Mascot';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) {
                onLoginSuccess(user);
            } else {
                console.log("Login cancelled or returned no user.");
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            if (error?.code !== 'SIGN_IN_CANCELLED') {
                // Alert.alert("로그인 오류", "로그인 중 문제가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>오늘의 만나</Text>
                <Text style={styles.subtitle}>매일의 영적 양식</Text>

                <View style={styles.mascotContainer}>
                    <Mascot />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#8D6E63" style={{ marginTop: 20 }} />
                ) : (
                    <GoogleSigninButton
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Light}
                        onPress={handleGoogleLogin}
                        style={{ width: 260, height: 60, marginTop: 40 }}
                    />
                )}

                <Text style={styles.footerText}>Google 계정으로 시작하기</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 42,
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
        marginBottom: 10,
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'NanumGothic_400Regular',
        color: '#8D6E63',
        marginBottom: 50,
    },
    mascotContainer: {
        marginBottom: 20,
    },
    footerText: {
        marginTop: 20,
        fontSize: 14,
        color: '#A1887F',
        fontFamily: 'NanumGothic_400Regular',
    },
});

export default LoginScreen;
