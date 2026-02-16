import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { signInWithGoogle, signInWithKakao, signInWithEmail, signUpWithEmail } from '../services/authService';
import type { User } from '../types/types';
import Mascot from './Mascot';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) onLoginSuccess(user);
        } catch (error: any) {
            console.error("Google Login Error:", error);
            if (error?.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert("로그인 오류", "Google 로그인 중 문제가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithKakao();
            if (user) onLoginSuccess(user);
            else Alert.alert("알림", "카카오 로그인이 취소되었습니다.");
        } catch (error) {
            console.error("Kakao Login Error:", error);
            Alert.alert("오류", "카카오 로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            const user = isSignUp
                ? await signUpWithEmail(email, password)
                : await signInWithEmail(email, password);

            if (user) {
                if (isSignUp) Alert.alert("가입 성공", "회원가입이 완료되었습니다!\n이메일 인증을 확인해주세요.");
                onLoginSuccess(user);
            }
        } catch (error: any) {
            console.error("Email Auth Error:", error);
            Alert.alert("오류", error.message || "이메일 로그인/가입 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>오늘의 만나</Text>
                    <Text style={styles.subtitle}>매일의 영적 양식</Text>

                    <View style={styles.mascotContainer}>
                        <Mascot />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#8D6E63" style={{ marginTop: 20 }} />
                    ) : showEmailLogin ? (
                        <View style={styles.emailForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="이메일"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity style={styles.emailAuthButton} onPress={handleEmailAuth}>
                                <Text style={styles.emailAuthButtonText}>
                                    {isSignUp ? "회원가입" : "로그인"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.emailFooter}>
                                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                                    <Text style={styles.linkText}>
                                        {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowEmailLogin(false)} style={{ marginTop: 10 }}>
                                    <Text style={styles.linkText}>뒤로가기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <GoogleSigninButton
                                size={GoogleSigninButton.Size.Wide}
                                color={GoogleSigninButton.Color.Light}
                                onPress={handleGoogleLogin}
                                style={{ width: 260, height: 60, marginTop: 20 }}
                            />

                            <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
                                <Ionicons name="chatbubble-ellipses" size={20} color="#000000" style={{ marginRight: 10 }} />
                                <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
                            </TouchableOpacity>

                            {/* Email Login Hidden */}
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
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
        marginBottom: 30, // Reduced from 50
    },
    mascotContainer: {
        marginBottom: 20,
    },
    kakaoButton: {
        backgroundColor: '#FEE500',
        width: 252, // Match Google button visual width roughly
        height: 48,
        borderRadius: 4, // Google button style
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        elevation: 2,
    },
    kakaoButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Roboto', // System font usually matches Google button
    },
    emailLoginLink: {
        marginTop: 15,
        fontSize: 14,
        color: '#A1887F',
        textDecorationLine: 'underline',
        fontFamily: 'NanumGothic_400Regular',
    },
    emailForm: {
        width: '80%',
        marginTop: 20,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#D7CCC8',
        fontSize: 16,
    },
    emailAuthButton: {
        backgroundColor: '#8D6E63',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    emailAuthButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emailFooter: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#795548',
        fontSize: 14,
    },
});

export default LoginScreen;
