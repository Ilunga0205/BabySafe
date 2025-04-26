// AdvancedDatePicker.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdvancedDatePicker = ({ 
  value, 
  onChange, 
  mode = 'date', 
  label, 
  error, 
  maximumDate,
  minimumDate,
  placeholder,
  accentColor = '#623131'
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());
  const [showModal, setShowModal] = useState(false);
  
  // For calendar view
  const [viewDate, setViewDate] = useState(value || new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    if (value) {
      setTempDate(value);
      setViewDate(value);
    }
  }, [value]);

  useEffect(() => {
    if (mode === 'date') {
      generateCalendarDays(viewDate);
    }
  }, [viewDate]);

  // Generate calendar days for the month view
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay();
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create array of days for the calendar
    const days = [];
    
    // Add empty slots for days from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        day: null,
        date: null
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        day: i,
        date: currentDate,
        isToday: isToday(currentDate),
        isSelected: isSameDay(currentDate, tempDate),
        isDisabled: isDateDisabled(currentDate)
      });
    }
    
    setCalendarDays(days);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if date is outside allowed range
  const isDateDisabled = (date) => {
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  // Handle day selection in calendar
  const handleDayPress = (day) => {
    if (day.isDisabled || !day.date) return;
    
    const newDate = new Date(day.date);
    // Preserve time from current selection
    if (tempDate) {
      newDate.setHours(
        tempDate.getHours(),
        tempDate.getMinutes(),
        tempDate.getSeconds()
      );
    }
    
    setTempDate(newDate);
    generateCalendarDays(viewDate); // Refresh to update selection
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  };

  // Handle native picker change (Android)
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate && event.type !== 'dismissed') {
        handleConfirm(selectedDate);
      }
    } else {
      setTempDate(selectedDate || tempDate);
      if (mode === 'date') {
        generateCalendarDays(selectedDate || tempDate);
      }
    }
  };

  // Handle picker button press
  const handlePress = () => {
    if (Platform.OS === 'android' && mode === 'time') {
      setShowPicker(true);
    } else {
      setShowModal(true);
    }
  };

  // Handle confirming date selection
  const handleConfirm = (date) => {
    setShowModal(false);
    onChange(date);
  };

  // Handle canceling date selection
  const handleCancel = () => {
    setShowModal(false);
  };

  // Format date for display
  const formatValue = () => {
    if (!value) return placeholder || 'Select';
    
    if (mode === 'date') {
      return value.toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } else if (mode === 'time') {
      return value.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return value.toString();
  };

  // Get appropriate icon based on mode
  const getIcon = () => {
    if (mode === 'date') {
      return <MaterialIcons name="calendar-today" size={20} color="#757575" />;
    } else if (mode === 'time') {
      return <MaterialIcons name="access-time" size={20} color="#757575" />;
    }
    return null;
  };

  // Render calendar header with month and year
  const renderCalendarHeader = () => {
    const monthName = MONTHS[viewDate.getMonth()];
    const year = viewDate.getFullYear();
    
    return (
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          style={styles.monthArrow}
          onPress={goToPreviousMonth}
          disabled={minimumDate && new Date(viewDate.getFullYear(), viewDate.getMonth(), 0) < minimumDate}
        >
          <Ionicons name="chevron-back" size={24} color={accentColor} />
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>{monthName} {year}</Text>
        
        <TouchableOpacity 
          style={styles.monthArrow}
          onPress={goToNextMonth}
          disabled={maximumDate && new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) > maximumDate}
        >
          <Ionicons name="chevron-forward" size={24} color={accentColor} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render day names row
  const renderDayNames = () => {
    return (
      <View style={styles.daysOfWeekContainer}>
        {DAY_NAMES.map((day, index) => (
          <Text key={index} style={styles.dayNameText}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const chunks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      chunks.push(calendarDays.slice(i, i + 7));
    }
    
    return (
      <View style={styles.calendarGrid}>
        {chunks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayCell,
                  day.isToday && styles.todayCell,
                  day.isSelected && { backgroundColor: accentColor }
                ]}
                onPress={() => handleDayPress(day)}
                disabled={!day.date || day.isDisabled}
              >
                {day.day !== null ? (
                  <Text
                    style={[
                      styles.dayText,
                      day.isToday && styles.todayText,
                      day.isSelected && styles.selectedDayText,
                      day.isDisabled && styles.disabledDayText
                    ]}
                  >
                    {day.day}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    return (
      <View style={styles.calendarContainer}>
        {renderCalendarHeader()}
        {renderDayNames()}
        {renderCalendarGrid()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.pickerButton, 
          error ? styles.errorBorder : null,
          { borderColor: error ? '#FF3B30' : accentColor }
        ]}
        onPress={handlePress}
      >
        <Text style={[
          styles.valueText,
          !value && styles.placeholderText
        ]}>
          {formatValue()}
        </Text>
        {getIcon()}
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Native Android Time Picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={onDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}

      {/* Custom Modal Picker */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCancel}>
                    <Text style={[styles.cancelText, { color: accentColor }]}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.modalTitle}>
                    {mode === 'date' ? 'Select Date' : 'Select Time'}
                  </Text>
                  
                  <TouchableOpacity onPress={() => handleConfirm(tempDate)}>
                    <Text style={[styles.doneText, { color: accentColor }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.pickerContainer}>
                  {mode === 'date' ? (
                    // Custom Calendar View
                    renderCalendarView()
                  ) : (
                    // Time Picker (uses native on iOS)
                    <DateTimePicker
                      value={tempDate}
                      mode="time"
                      display="spinner"
                      onChange={(event, date) => date && setTempDate(date)}
                      style={styles.iOSPicker}
                    />
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  valueText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  errorBorder: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333333',
  },
  cancelText: {
    fontSize: 16,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    paddingVertical: 20,
  },
  iOSPicker: {
    height: 200,
  },
  
  // Calendar specific styles
  calendarContainer: {
    padding: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  monthArrow: {
    padding: 5,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayNameText: {
    width: SCREEN_WIDTH / 7 - 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  calendarGrid: {
    paddingTop: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  todayText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#D0D0D0',
  }
});

export default AdvancedDatePicker;