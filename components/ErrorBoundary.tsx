import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
                    <Text style={styles.title}>앗! 잠시 문제가 생겼어요</Text>
                    <Text style={styles.subtitle}>
                        앱을 실행하는 도중 오류가 발생했습니다.{'\n'}
                        잠시 후 다시 시도해 주세요.
                    </Text>

                    <ScrollView style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            {this.state.error?.toString()}
                        </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Text style={styles.buttonText}>다시 시도하기</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        fontFamily: 'Jua_400Regular',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
        fontFamily: 'NanumGothic_400Regular',
    },
    errorContainer: {
        maxHeight: 150,
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 15,
        marginBottom: 30,
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B6B',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#2C3E50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'NanumGothic_700Bold',
    },
});

export default ErrorBoundary;
