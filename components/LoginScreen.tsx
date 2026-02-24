import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { signInWithGoogle, signInWithKakao, signInWithKakaoAccount, signInWithEmail, signUpWithEmail } from '../services/authService';
import type { User } from '../types/types';
import Mascot from './Mascot';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: (user: User) => void;
    language?: 'ko' | 'en';
    toggleLanguage?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, language = 'ko', toggleLanguage }) => {
    const [loading, setLoading] = useState(false);
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    // Localization Strings
    const t = {
        title: language === 'ko' ? "오늘의 만나" : "Today's Manna",
        subtitle: language === 'ko' ? "매일의 영적 양식" : "Daily Spiritual Food",
        googleLogin: language === 'ko' ? "Google 계정으로 로그인" : "Sign in with Google",
        kakaoLogin: language === 'ko' ? "카카오 로그인" : "Login with Kakao",
        emailPlaceholder: language === 'ko' ? "이메일" : "Email",
        passwordPlaceholder: language === 'ko' ? "비밀번호" : "Password",
        // ... (keep others)
        login: language === 'ko' ? "로그인" : "Login",
        signUp: language === 'ko' ? "회원가입" : "Sign Up",
        haveAccount: language === 'ko' ? "이미 계정이 있으신가요? 로그인" : "Already have an account? Login",
        noAccount: language === 'ko' ? "계정이 없으신가요? 회원가입" : "Don't have an account? Sign Up",
        back: language === 'ko' ? "뒤로가기" : "Back",
        loginError: language === 'ko' ? "로그인 오류" : "Login Error",
        googleError: language === 'ko' ? "Google 로그인 중 문제가 발생했습니다." : "A problem occurred during Google login.",
        kakaoCancel: language === 'ko' ? "카카오 로그인이 취소되었습니다." : "Kakao login cancelled.",
        kakaoError: language === 'ko' ? "카카오 로그인에 실패했습니다." : "Kakao login failed.",
        notification: language === 'ko' ? "알림" : "Notification",
        emailPrompt: language === 'ko' ? "이메일과 비밀번호를 입력해주세요." : "Please enter your email and password.",
        signUpSuccess: language === 'ko' ? "가입 성공" : "Sign Up Successful",
        signUpDetail: language === 'ko' ? "회원가입이 완료되었습니다!\n이메일 인증을 확인해주세요." : "Sign up complete!\nPlease check your email for verification.",
        authError: language === 'ko' ? "오류" : "Error",
        authFail: language === 'ko' ? "이메일 로그인/가입 실패" : "Email Login/Sign Up failed"
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) onLoginSuccess(user);
        } catch (error: any) {
            console.error("Google Login Error:", error);
            if (error?.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert(t.loginError, t.googleError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLoginPress = () => {
        Alert.alert(
            language === 'ko' ? "카카오 로그인 방식 선택" : "Select Kakao Login Method",
            language === 'ko' ? "원하시는 로그인 방식을 선택해주세요." : "Please select your login method.",
            [
                {
                    text: language === 'ko' ? "카카오톡으로 빠른 로그인" : "Quick Login with KakaoTalk",
                    onPress: () => handleKakaoLogin(false)
                },
                {
                    text: language === 'ko' ? "다른 카카오 계정으로 로그인" : "Login with other Kakao Account",
                    onPress: () => handleKakaoLogin(true)
                },
                {
                    text: language === 'ko' ? "취소" : "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const handleKakaoLogin = async (useOtherAccount: boolean = false) => {
        setLoading(true);
        try {
            const user = useOtherAccount ? await signInWithKakaoAccount() : await signInWithKakao();
            if (user) onLoginSuccess(user);
            else Alert.alert(t.notification, t.kakaoCancel);
        } catch (error: any) {
            console.error("Kakao Login Error:", error);
            const errMsg = error?.message || '알 수 없는 오류';
            Alert.alert(t.authError, `${t.kakaoError}\n\n상세: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert(t.notification, t.emailPrompt);
            return;
        }
        setLoading(true);
        try {
            const user = isSignUp
                ? await signUpWithEmail(email, password)
                : await signInWithEmail(email, password);

            if (user) {
                if (isSignUp) Alert.alert(t.signUpSuccess, t.signUpDetail);
                onLoginSuccess(user);
            }
        } catch (error: any) {
            console.error("Email Auth Error:", error);
            Alert.alert(t.authError, error.message || t.authFail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                {/* Language Toggle for Login Screen */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
                        <Text style={styles.langButtonText}>{language === 'ko' ? 'English' : '한국어'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>

                    <View style={styles.mascotContainer}>
                        <Mascot />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#8D6E63" style={{ marginTop: 20 }} />
                    ) : showEmailLogin ? (
                        <View style={styles.emailForm}>
                            <TextInput
                                style={styles.input}
                                placeholder={t.emailPlaceholder}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={t.passwordPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity style={styles.emailAuthButton} onPress={handleEmailAuth}>
                                <Text style={styles.emailAuthButtonText}>
                                    {isSignUp ? t.signUp : t.login}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.emailFooter}>
                                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                                    <Text style={styles.linkText}>
                                        {isSignUp ? t.haveAccount : t.noAccount}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowEmailLogin(false)} style={{ marginTop: 10 }}>
                                    <Text style={styles.linkText}>{t.back}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                                <View style={styles.googleIconContainer}>
                                    <FontAwesome5 name="google" size={18} color="#4285F4" />
                                </View>
                                <Text style={styles.googleButtonText}>{t.googleLogin}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLoginPress}>
                                <Ionicons name="chatbubble-ellipses" size={20} color="#000000" style={{ marginRight: 10 }} />
                                <Text style={styles.kakaoButtonText}>{t.kakaoLogin}</Text>
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
    header: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    langButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D7CCC8',
    },
    langButtonText: {
        fontSize: 13,
        fontFamily: 'NanumGothic_700Bold',
        color: '#8D6E63',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        width: 252,
        height: 48,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginTop: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    googleIconContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    googleButtonText: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Roboto',
        textAlign: 'center',
        flex: 1,
        marginRight: 30, // Offset text to center properly
    },
});

export default LoginScreen;
