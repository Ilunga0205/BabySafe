import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import colors from '../../constants/colors';
import AdvancedDatePicker from '../../components/AdvancedDatePicker'

const AddBabyModal = ({ visible, onClose, onAddBaby }) => {
  // Form state - extended with new fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthTime, setBirthTime] = useState(new Date());
  const [photo, setPhoto] = useState(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [hospital, setHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [notes, setNotes] = useState('');
  
  // Current form step (for multi-step form)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form validation
  const [errors, setErrors] = useState({
    name: '',
    gender: '',
    birthDate: '',
    weight: '',
    height: ''
  });
  
  // Reset form
  const resetForm = () => {
    setName('');
    setGender('');
    setBirthDate(new Date());
    setBirthTime(new Date());
    setPhoto(null);
    setWeight('');
    setHeight('');
    setHospital('');
    setDoctor('');
    setBloodType('');
    setNotes('');
    setCurrentStep(1);
    setErrors({
      name: '',
      gender: '',
      birthDate: '',
      weight: '',
      height: ''
    });
  };
  
  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setBirthDate(date);
  };
  
  // Handle time change
  const handleTimeChange = (time) => {
    setBirthTime(time);
  };
  
  // Image picker
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to allow access to your photos to upload an image.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error picking the image.');
    }
  };
  
  // Take photo
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to allow access to your camera to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error taking the photo.');
    }
  };
  
  // Validate current step
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      let isValid = true;
      const newErrors = {
        name: '',
        gender: '',
        birthDate: ''
      };
      
      // Validate name
      if (!name.trim()) {
        newErrors.name = 'Baby name is required';
        isValid = false;
      }
      
      // Validate gender
      if (!gender) {
        newErrors.gender = 'Please select gender';
        isValid = false;
      }
      
      // Validate birthdate
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
        isValid = false;
      }
      
      setErrors(newErrors);
      return isValid;
    } else if (currentStep === 2) {
      // Validate measurements
      let isValid = true;
      const newErrors = {
        weight: '',
        height: ''
      };
      
      // Weight validation (optional but if provided must be numeric)
      if (weight && isNaN(parseFloat(weight))) {
        newErrors.weight = 'Weight must be a number';
        isValid = false;
      }
      
      // Height validation (optional but if provided must be numeric)
      if (height && isNaN(parseFloat(height))) {
        newErrors.height = 'Height must be a number';
        isValid = false;
      }
      
      setErrors(newErrors);
      return isValid;
    }
    
    return true;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Submit form
  const handleSubmit = () => {
    if (validateCurrentStep()) {
      const newBaby = {
        name,
        gender,
        birthDate: birthDate.toISOString(),
        birthTime: birthTime.toISOString(),
        photo,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        hospital,
        doctor,
        bloodType,
        notes
      };
      
      onAddBaby(newBaby);
      resetForm();
    }
  };

  // Render form step 1 - Basic Info
  const renderBasicInfoStep = () => {
    return (
      <>
        {/* Photo upload */}
        <View style={styles.photoUploadContainer}>
          <View style={styles.photoPreview}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <FontAwesome5 name="baby" size={40} color={colors.textLight} />
              </View>
            )}
          </View>
          
          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={takePhoto}
            >
              <MaterialIcons name="photo-camera" size={18} color="#FFFFFF" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={pickImage}
            >
              <MaterialIcons name="photo-library" size={18} color="#FFFFFF" />
              <Text style={styles.photoButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Name input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Baby's Name</Text>
          <TextInput
            style={[styles.textInput, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="Enter baby's name"
            placeholderTextColor={colors.textLight}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>
        
        {/* Gender selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Male' && styles.genderButtonSelected
              ]}
              onPress={() => setGender('Male')}
            >
              <FontAwesome5 
                name="mars" 
                size={24} 
                color={gender === 'Male' ? '#FFFFFF' : colors.primary} 
              />
              <Text 
                style={[
                  styles.genderButtonText,
                  gender === 'Male' && styles.genderButtonTextSelected
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Female' && styles.genderButtonSelected
              ]}
              onPress={() => setGender('Female')}
            >
              <FontAwesome5 
                name="venus" 
                size={24} 
                color={gender === 'Female' ? '#FFFFFF' : colors.primary} 
              />
              <Text 
                style={[
                  styles.genderButtonText,
                  gender === 'Female' && styles.genderButtonTextSelected
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        </View>
        
        {/* Birth date and time pickers */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            {/* Using our custom date picker component */}
            <AdvancedDatePicker
              value={birthDate}
              onChange={handleDateChange}
              mode="date"
              label="Date of Birth"
              error={errors.birthDate}
              maximumDate={new Date()}
              placeholder="Select birth date"
            />
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            {/* Using our custom date picker component for time too */}
            <AdvancedDatePicker
              value={birthTime}
              onChange={handleTimeChange}
              mode="time"
              label="Time of Birth"
              placeholder="Select birth time"
            />
          </View>
        </View>
      </>
    );
  };
  
  // Render form step 2 - Measurements & Medical Info
  const renderMeasurementsStep = () => {
    return (
      <>
        <View style={styles.stepHeading}>
          <Text style={styles.stepTitle}>Measurements & Medical Info</Text>
          <Text style={styles.stepSubtitle}>Optional details to track your baby's stats</Text>
        </View>
        
        {/* Weight and Height */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Birth Weight (kg)</Text>
            <TextInput
              style={[styles.textInput, errors.weight ? styles.inputError : null]}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 3.2"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />
            {errors.weight ? <Text style={styles.errorText}>{errors.weight}</Text> : null}
          </View>
          
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.inputLabel}>Birth Length (cm)</Text>
            <TextInput
              style={[styles.textInput, errors.height ? styles.inputError : null]}
              value={height}
              onChangeText={setHeight}
              placeholder="e.g. 50"
              placeholderTextColor={colors.textLight}
              keyboardType="decimal-pad"
            />
            {errors.height ? <Text style={styles.errorText}>{errors.height}</Text> : null}
          </View>
        </View>
        
        {/* Hospital */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Hospital / Birth Place</Text>
          <TextInput
            style={styles.textInput}
            value={hospital}
            onChangeText={setHospital}
            placeholder="Where was your baby born?"
            placeholderTextColor={colors.textLight}
          />
        </View>
        
        {/* Doctor */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Doctor / Midwife</Text>
          <TextInput
            style={styles.textInput}
            value={doctor}
            onChangeText={setDoctor}
            placeholder="Who delivered your baby?"
            placeholderTextColor={colors.textLight}
          />
        </View>
        
        {/* Blood Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Blood Type (if known)</Text>
          <View style={styles.bloodTypeContainer}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.bloodTypeButton,
                  bloodType === type && styles.bloodTypeButtonSelected
                ]}
                onPress={() => setBloodType(type)}
              >
                <Text
                  style={[
                    styles.bloodTypeButtonText,
                    bloodType === type && styles.bloodTypeButtonTextSelected
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    );
  };
  
  // Render form step 3 - Additional Notes
  const renderNotesStep = () => {
    return (
      <>
        <View style={styles.stepHeading}>
          <Text style={styles.stepTitle}>Additional Notes</Text>
          <Text style={styles.stepSubtitle}>Anything special you'd like to remember</Text>
        </View>
        
        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special memories or details you want to record"
            placeholderTextColor={colors.textLight}
            multiline={true}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.completionMessage}>
          <MaterialIcons name="check-circle" size={24} color={colors.success} />
          <Text style={styles.completionText}>
            All set! Tap "Add Baby" to save this profile.
          </Text>
        </View>
      </>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderMeasurementsStep();
      case 3:
        return renderNotesStep();
      default:
        return null;
    }
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        {[1, 2, 3].map((step) => (
          <View 
            key={step} 
            style={[
              styles.stepIndicator,
              currentStep >= step && styles.activeStepIndicator
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={colors.textGray} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Your Baby</Text>
              <View style={{ width: 24 }} />
            </View>
            
            {renderStepIndicators()}
            
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContentContainer}
            >
              {renderStepContent()}
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handlePreviousStep}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 3 ? (
                <TouchableOpacity 
                  style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.submitButton, currentStep === 3 && styles.fullWidthButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Add Baby</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    width: 24,
    height: 8,
    backgroundColor: colors.primary,
  },
  formContainer: {
    maxHeight: '65%',
  },
  formContentContainer: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: '#FFFFFF',
  },
  notesInput: {
    height: 120,
    paddingTop: 14,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  halfWidth: {
    width: '48%',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '48%',
  },
  genderButtonSelected: {
    backgroundColor: colors.primary,
  },
  genderButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  genderButtonTextSelected: {
    color: '#FFFFFF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: colors.textDark,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bloodTypeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '23%',
    marginBottom: 8,
  },
  bloodTypeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bloodTypeButtonText: {
    color: colors.textDark,
    fontWeight: '500',
  },
  bloodTypeButtonTextSelected: {
    color: '#FFFFFF',
  },
  stepHeading: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textGray,
  },
  completionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  completionText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  backButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidthButton: {
    width: '100%',
    maxWidth: '100%',
  }
});

export default AddBabyModal;