import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { X } from 'lucide-react-native';
import { getLocalDateString } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

// Korean Localization
LocaleConfig.locales['ko'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (dateString: string) => void;
    selectedDate: string;
    favoriteDates?: string[]; // New prop for dots
}

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose, onSelectDate, selectedDate, favoriteDates = [] }) => {
    // Generate marked dates
    const markedDates: any = {
        // Selected Date (Circle background, no dot by default)
        [selectedDate]: { selected: true, selectedColor: '#8D6E63' }
    };

    // Add dots for favorites (Red Color #FF0000)
    favoriteDates.forEach(date => {
        if (markedDates[date]) {
            // Merge with existing (e.g. selected)
            markedDates[date] = {
                ...markedDates[date],
                marked: true,
                dotColor: '#FF0000'
            };
        } else {
            // New mark (Just the red dot)
            markedDates[date] = {
                marked: true,
                dotColor: '#FF0000'
            };
        }
    });

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>지난 말씀 보기</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#5D4037" />
                        </TouchableOpacity>
                    </View>

                    {/* Calendar */}
                    <Calendar
                        current={selectedDate}
                        minDate={'2026-01-01'}
                        maxDate={'2026-12-31'}
                        onDayPress={(day: any) => {
                            onSelectDate(day.dateString);
                            onClose();
                        }}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#8D6E63',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#8D6E63',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#FF0000', // Default red
                            selectedDotColor: '#ffffff',
                            arrowColor: '#8D6E63',
                            monthTextColor: '#5D4037',
                            indicatorColor: 'blue',
                            textDayFontFamily: 'NanumGothic_700Bold',
                            textMonthFontFamily: 'Jua_400Regular',
                            textDayHeaderFontFamily: 'NanumGothic_700Bold',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 16,
                            textMonthFontSize: 20,
                            textDayHeaderFontSize: 14
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.9,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Jua_400Regular',
        color: '#5D4037',
    },
    closeButton: {
        padding: 5,
    },
});

export default CalendarModal;
