import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import AdvancedDatePicker from '../components/AdvancedDatePicker'; // Import our new component

const { width } = Dimensions.get('window');

const Vaccination = ({ route, navigation }) => {
  const { baby } = route.params;
  
  // State for vaccinations
  const [vaccinations, setVaccinations] = useState(baby.vaccinations || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  
  // Set navigation title and options
  useEffect(() => {
    navigation.setOptions({
      title: `${baby.name}'s Vaccinations`,
      headerStyle: {
        backgroundColor: colors.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: '600',
      },
    });
  }, [navigation, baby]);
  
  // Update marked dates whenever vaccinations change
  useEffect(() => {
    const newMarkedDates = {};
    
    vaccinations.forEach(vacc => {
      const dateStr = new Date(vacc.date).toISOString().split('T')[0];
      newMarkedDates[dateStr] = { 
        selected: true, 
        marked: true, 
        selectedColor: colors.primary,
        dotColor: '#FFFFFF'
      };
    });
    
    setMarkedDates(newMarkedDates);
  }, [vaccinations]);

  // Initialize selectedDate with current date in proper format
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setSelectedDate(todayString);
    setSelectedDateObj(today);
  }, []);
  
  // Handle date selection from AdvancedDatePicker
  const handleDateChange = (date) => {
    setSelectedDateObj(date);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  };
  
  // Add new vaccination handler
  const handleAddVaccination = () => {
    if (!vaccineName.trim()) {
      Alert.alert('Required Field', 'Please enter a vaccine name');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Required Field', 'Please select a date');
      return;
    }
    
    const newVaccination = {
      id: Date.now().toString(),
      name: vaccineName,
      date: selectedDateObj.toISOString(),
      notes: vaccineNotes
    };
    
    const updatedVaccinations = [...vaccinations, newVaccination];
    setVaccinations(updatedVaccinations);
    
    // In a real app, you would save to database/storage here
    // For now, just update the local state
    
    // Reset form
    setVaccineName('');
    setVaccineNotes('');
    
    setShowAddModal(false);
    
    // Show success message
    Alert.alert('Success', 'Vaccination scheduled successfully');
  };
  
  // Delete vaccination handler
  const handleDeleteVaccination = (id) => {
    Alert.alert(
      'Delete Vaccination',
      'Are you sure you want to delete this vaccination?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedVaccinations = vaccinations.filter(v => v.id !== id);
            setVaccinations(updatedVaccinations);
          }
        }
      ]
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Check if date is past
  const isPastDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date < today;
  };
  
  // Check if date is today
  const isToday = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };
  
  // Sort vaccinations by date
  const sortedVaccinations = [...vaccinations].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  
  // Group vaccinations by upcoming and past
  const upcomingVaccinations = sortedVaccinations.filter(v => !isPastDate(v.date));
  const pastVaccinations = sortedVaccinations.filter(v => isPastDate(v.date));

  // Handler for calendar day press
  const handleDayPress = (day) => {
    const dateObj = new Date(day.timestamp);
    setSelectedDateObj(dateObj);
    setSelectedDate(day.dateString);
    
    // Check if there's any vaccination on this day
    const vaccsOnDay = vaccinations.filter(v => {
      const vaccDate = new Date(v.date).toISOString().split('T')[0];
      return vaccDate === day.dateString;
    });
    
    if (vaccsOnDay.length > 0) {
      // Show details
      Alert.alert(
        'Vaccinations on ' + formatDate(day.dateString),
        vaccsOnDay.map(v => `- ${v.name}`).join('\n'),
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header gradient effect */}
      <LinearGradient
        colors={[colors.primary, '#9e5f5f']}
        style={styles.headerGradient}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: colors.textDark,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: colors.primary,
              dayTextColor: colors.textDark,
              textDisabledColor: colors.textLight,
              dotColor: colors.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: colors.primary,
              monthTextColor: colors.textDark,
              indicatorColor: colors.primary,
              textDayFontWeight: '300',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
            }}
          />
        </View>
        
        {/* Header with Add Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vaccinations</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add Vaccination</Text>
            <MaterialIcons name="add" size={18} color="#623131" />
          </TouchableOpacity>
        </View>
        
        {/* Upcoming Vaccinations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          
          {upcomingVaccinations.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="calendar-check" size={24} color={colors.textLight} />
              <Text style={styles.emptyStateText}>No upcoming vaccinations</Text>
            </View>
          ) : (
            upcomingVaccinations.map(vaccination => (
              <View key={vaccination.id} style={styles.vaccinationCard}>
                <View style={styles.vaccinationHeader}>
                  <View style={styles.vaccinationIconContainer}>
                    <FontAwesome5 name="syringe" size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.vaccinationHeaderContent}>
                    <Text style={styles.vaccinationName}>{vaccination.name}</Text>
                    <View style={styles.dateContainer}>
                      <MaterialIcons name="event" size={14} color={colors.textGray} />
                      <Text style={styles.dateText}>{formatDate(vaccination.date)}</Text>
                      {isToday(vaccination.date) && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayText}>TODAY</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteVaccination(vaccination.id)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <MaterialIcons name="close" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                
                {vaccination.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{vaccination.notes}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        
        {/* Past Vaccinations */}
        {pastVaccinations.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Completed</Text>
            
            {pastVaccinations.map(vaccination => (
              <View key={vaccination.id} style={[styles.vaccinationCard, styles.pastVaccinationCard]}>
                <View style={styles.vaccinationHeader}>
                  <View style={[styles.vaccinationIconContainer, styles.pastVaccinationIcon]}>
                    <FontAwesome5 name="check" size={14} color="#FFFFFF" />
                  </View>
                  <View style={styles.vaccinationHeaderContent}>
                    <Text style={styles.vaccinationName}>{vaccination.name}</Text>
                    <View style={styles.dateContainer}>
                      <MaterialIcons name="event" size={14} color={colors.textGray} />
                      <Text style={styles.dateText}>{formatDate(vaccination.date)}</Text>
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>COMPLETED</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteVaccination(vaccination.id)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <MaterialIcons name="close" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                
                {vaccination.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{vaccination.notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Add Vaccination Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowAddModal(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <MaterialIcons name="close" size={24} color={colors.textGray} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Vaccination</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView 
              style={styles.modalFormContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalFormContent}
            >
              {/* Vaccine Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vaccine Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={vaccineName}
                  onChangeText={setVaccineName}
                  placeholder="e.g. DTaP, MMR, Polio"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              
              {/* Vaccination Date - Using AdvancedDatePicker */}
              <View style={styles.inputGroup}>
                <AdvancedDatePicker
                  label="Vaccination Date"
                  value={selectedDateObj}
                  onChange={handleDateChange}
                  placeholder="Select vaccination date"
                  minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))} // 1 year in past
                  maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 5))} // 5 years in future
                />
              </View>
              
              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  value={vaccineNotes}
                  onChangeText={setVaccineNotes}
                  placeholder="Any additional information, dose number, doctor's notes, etc."
                  placeholderTextColor={colors.textLight}
                  multiline={true}
                  textAlignVertical="top"
                  numberOfLines={4}
                />
              </View>
              
              {/* Vaccination Reminders */}
              <View style={styles.infoBox}>
                <MaterialIcons name="info-outline" size={20} color={colors.primary} />
                <Text style={styles.infoBoxText}>
                  You'll receive reminders for upcoming vaccinations. Make sure to set up notifications in your profile settings.
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleAddVaccination}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save Vaccination</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 24,
    zIndex: 1,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#7e4747',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addButtonText: {
    color: '#623131',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  vaccinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pastVaccinationCard: {
    backgroundColor: '#F8F8F8',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  vaccinationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pastVaccinationIcon: {
    backgroundColor: colors.success,
  },
  vaccinationHeaderContent: {
    flex: 1,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: colors.textGray,
    marginLeft: 4,
    marginRight: 8,
  },
  todayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  notesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    paddingLeft: 64,
  },
  notesText: {
    fontSize: 13,
    color: colors.textGray,
    lineHeight: 18,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textGray,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  modalFormContainer: {
    flex: 1,
  },
  modalFormContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: '#FFFFFF',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: colors.textGray,
    marginLeft: 12,
    lineHeight: 18,
  },
  modalButtonContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Vaccination;