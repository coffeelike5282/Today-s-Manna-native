import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Share, Alert } from 'react-native';

/**
 * Handle sharing the captured image via OS share dialog (Instagram, Kakao, etc.)
 */
export const shareImage = async (uri: string) => {
    try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('공유 불가', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
            return;
        }

        await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: '말씀 카드 공유하기',
            UTI: 'public.png',
        });
    } catch (error) {
        console.error('Error sharing image:', error);
        Alert.alert('오류', '이미지 공유 중 문제가 발생했습니다.');
    }
};

/**
 * Handle saving the captured image to the device's photo gallery
 */
export const saveImageToGallery = async (uri: string) => {
    try {
        // Request permissions first
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                '권한 필요',
                '갤러리에 이미지를 저장하려면 사진 접근 권한이 필요합니다.',
                [{ text: '확인' }]
            );
            return;
        }

        const asset = await MediaLibrary.createAssetAsync(uri);

        // Use a customized album name
        await MediaLibrary.createAlbumAsync("Today's Manna", asset, false);

        Alert.alert('저장 완료', '말씀 카드가 갤러리에 저장되었습니다! ✨');
    } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('오류', '이미지 저장 중 문제가 발생했습니다.');
    }
};

/**
 * Handle standard text sharing
 */
export const shareText = async (
    verseRef: string,
    fullVerse: string,
    interpretation: string,
    mission: string,
    language: 'ko' | 'en'
) => {
    const header = language === 'ko' ? '[오늘의 만나]' : "[Today's Manna]";
    const interpTitle = language === 'ko' ? '오늘의 해석' : "Today's Message";
    const missionTitle = language === 'ko' ? '오늘의 미션' : "Today's Mission";

    let shareMessage = `${header}\n\n"${fullVerse}"\n- ${verseRef}\n\n`;

    if (interpretation) {
        shareMessage += `[${interpTitle}]\n${interpretation}\n\n`;
    }

    if (mission) {
        shareMessage += `[${missionTitle}]\n${mission}\n\n`;
    }

    shareMessage += language === 'ko' ? "매일 새로운 말씀, '오늘의 만나'" : "Daily Manna, 'Today's Manna'";

    try {
        await Share.share({
            message: shareMessage,
        });
    } catch (error) {
        console.error("Text Share error:", error);
    }
};
