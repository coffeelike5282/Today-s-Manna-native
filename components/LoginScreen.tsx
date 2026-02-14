import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn } from 'lucide-react-native';
import { signInWithGoogle } from '../services/authService';
import Mascot from './Mascot';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
    onLoginSuccess: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            if (user) {
                onLoginSuccess(user);
            }
        } catch (error) {
            console.error("Login Error:", error);
            // Handle error UI if needed
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#E0F7FA', '#B2EBF2', '#E0F7FA']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Mascot / Logo Area */}
                    <View style={styles.logoContainer}>
                        <Mascot
                            style={styles.mascot}
                        />
                        <Text style={styles.title}>오늘의 만나</Text>
                        <Text style={styles.subtitle}>따뜻한 위로와 격려의 시간</Text>
                    </View>

                    {/* Login Button Area */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={handleGoogleLogin}
                            style={styles.loginButton}
                            activeOpacity={0.8}
                        >
                            <LogIn color="white" size={24} style={styles.buttonIcon} />
                            <Text style={styles.loginButtonText}>Google로 계속하기</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            로그인하여 오늘의 말씀을 보관하고 공유해보세요.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    mascot: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 30,
    },
    title: {
        fontSize: 42,
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'GowunDodum_400Regular',
        color: '#8D6E63',
        letterSpacing: 1,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        backgroundColor: '#4285F4', // Google Blue
        width: '100%',
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    buttonIcon: {
        marginRight: 12,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'GowunDodum_400Regular',
    },
    footerText: {
        marginTop: 20,
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    }
});

export default LoginScreen;
