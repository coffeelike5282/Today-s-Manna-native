import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Image as ImageIcon, Download, Type, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ShareActionSheetProps {
    visible: boolean;
    onClose: () => void;
    onShareImage: () => void;
    onSaveImage: () => void;
    onShareText: () => void;
    language?: 'ko' | 'en';
}

const { width, height } = Dimensions.get('window');

const ShareActionSheet: React.FC<ShareActionSheetProps> = ({
    visible,
    onClose,
    onShareImage,
    onSaveImage,
    onShareText,
    language = 'ko',
}) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + 20 }]}>
                            <View style={styles.dragHandle} />

                            <Text style={styles.title}>
                                {language === 'ko' ? "말씀 공유하기" : "Share Manna"}
                            </Text>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        setTimeout(() => onShareImage(), 300); // 딜레이를 주어 모달이 닫힌 후 실행
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                                        <ImageIcon size={24} color="#4CAF50" />
                                    </View>
                                    <Text style={styles.optionText}>
                                        {language === 'ko' ? "이미지 공유" : "Share Image"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        setTimeout(() => onSaveImage(), 300);
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                        <Download size={24} color="#FF9800" />
                                    </View>
                                    <Text style={styles.optionText}>
                                        {language === 'ko' ? "이미지 저장" : "Save Image"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        setTimeout(() => onShareText(), 300);
                                    }}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <Type size={24} color="#2196F3" />
                                    </View>
                                    <Text style={styles.optionText}>
                                        {language === 'ko' ? "텍스트 복사" : "Copy Text"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>
                                    {language === 'ko' ? "취소" : "Cancel"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 12,
        alignItems: 'center',
    },
    dragHandle: {
        width: 40,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: 'NanumGothic_800ExtraBold',
        color: '#333',
        marginBottom: 24,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    optionButton: {
        alignItems: 'center',
        width: 100,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'NanumGothic_700Bold',
        color: '#555',
    },
    cancelButton: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontFamily: 'NanumGothic_700Bold',
        color: '#666',
    },
});

export default ShareActionSheet;
