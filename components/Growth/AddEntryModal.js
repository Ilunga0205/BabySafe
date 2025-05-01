import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Keyboard
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av'; // Changed the import style
import colors from '../../constants/colors';

const AddEntryModal = ({ visible, day, onClose, onSave, existingEntry }) => {
  // Form state
  const [entryData, setEntryData] = useState({
    entryTypes: [],
    growthData: {
      weight: '',
      height: '',
      headCircumference: ''
    },
    milestones: [],
    mediaItems: [],
    notes: '',
    mood: ''
  });
  
  // Current step in multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const [newMilestone, setNewMilestone] = useState('');
  
  // Audio recording states
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  
  // Reset form when modal opens or when existing entry changes
  useEffect(() => {
    if (visible) {
      if (existingEntry) {
        // Initialize with existing data
        setEntryData({
          entryTypes: [...existingEntry.entryTypes],
          growthData: existingEntry.growthData ? { ...existingEntry.growthData } : {
            weight: '',
            height: '',
            headCircumference: ''
          },
          milestones: existingEntry.milestones ? [...existingEntry.milestones] : [],
          mediaItems: existingEntry.mediaItems ? [...existingEntry.mediaItems] : [],
          notes: existingEntry.notes || '',
          mood: existingEntry.mood || ''
        });
      } else {
        // Reset to defaults for new entry
        setEntryData({
          entryTypes: ['note'],
          growthData: {
            weight: '',
            height: '',
            headCircumference: ''
          },
          milestones: [],
          mediaItems: [],
          notes: '',
          mood: ''
        });
      }
      setCurrentStep(1);
    }
  }, [visible, existingEntry]);
  
  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  const toggleEntryType = (type) => {
    setEntryData(prev => {
      const updatedTypes = prev.entryTypes.includes(type)
        ? prev.entryTypes.filter(t => t !== type)
        : [...prev.entryTypes, type];
      
      return { ...prev, entryTypes: updatedTypes };
    });
  };

  const updateGrowthData = (field, value) => {
    setEntryData(prev => ({
      ...prev,
      growthData: {
        ...prev.growthData,
        [field]: value
      }
    }));
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setEntryData(prev => ({
        ...prev,
        milestones: [...prev.milestones, newMilestone.trim()]
      }));
      setNewMilestone('');
    }
  };

  const removeMilestone = (index) => {
    setEntryData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const pickImage = async () => {
    // Request permissions directly from ImagePicker
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission Required', 'You need to allow access to your photos to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newMedia = {
        type: 'image',
        uri: asset.uri,
        filename: asset.uri.split('/').pop() || 'image.jpg',
      };
      
      setEntryData(prev => ({
        ...prev,
        mediaItems: [...prev.mediaItems, newMedia]
      }));
    }
  };

  const takePicture = async () => {
    // Request camera permissions directly from ImagePicker
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Permission Required', 'We need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newMedia = {
        type: 'image',
        uri: asset.uri,
        filename: asset.uri.split('/').pop() || 'camera.jpg',
      };
      
      setEntryData(prev => ({
        ...prev,
        mediaItems: [...prev.mediaItems, newMedia]
      }));
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      const newMedia = {
        type: 'document',
        uri: result.uri,
        filename: result.name,
      };
      
      setEntryData(prev => ({
        ...prev,
        mediaItems: [...prev.mediaItems, newMedia]
      }));
    }
  };
  
  // Audio recording functions - FIXED
  const startRecording = async () => {
    try {
      // Request permissions using the Audio API directly
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission Required', 'We need microphone permissions to record audio.');
        return;
      }
      
      // Set up recorder
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      
      // Set up timer
      let seconds = 0;
      const timer = setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
      }, 1000);
      
      setRecordingTimer(timer);
      
    } catch (error) {
      console.error('Failed to start recording', error);
      alert('Error', 'Failed to start recording: ' + error.message);
    }
  };
  
  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      // Stop the timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      // Stop recording
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      
      // Add to media items
      if (uri) {
        const timestamp = new Date().toISOString();
        const filename = `audio_${timestamp}.m4a`;
        
        const newMedia = {
          type: 'audio',
          uri: uri,
          filename: filename,
          duration: recordingTime, // Store duration in seconds
        };
        
        setEntryData(prev => ({
          ...prev,
          mediaItems: [...prev.mediaItems, newMedia]
        }));
      }
      
      // Reset states
      setRecording(null);
      setIsRecording(false);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Failed to stop recording', error);
      alert('Error', 'Failed to stop recording: ' + error.message);
    }
  };
  
  // Format recording time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Play audio recording
  const playAudio = async (uri) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
      alert('Error', 'Failed to play the audio: ' + error.message);
    }
  };

  const removeMedia = (index) => {
    setEntryData(prev => ({
      ...prev,
      mediaItems: prev.mediaItems.filter((_, i) => i !== index)
    }));
  };

  const setMood = (mood) => {
    setEntryData(prev => ({
      ...prev,
      mood
    }));
  };

  // Determine the next step to show based on selected entry types
  const getNextStep = (currentStep) => {
    if (currentStep === 1) {
      if (entryData.entryTypes.includes('growth') || entryData.entryTypes.includes('milestone')) {
        return 2;
      } else if (entryData.entryTypes.includes('media')) {
        return 3;
      }
      // If only note is selected, there's no next step
      return null;
    } else if (currentStep === 2) {
      if (entryData.entryTypes.includes('media')) {
        return 3;
      }
      // If no media, there's no next step
      return null;
    }
    // No more steps after 3
    return null;
  };

  // Handle next step in the form
  const handleNextStep = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  // Handle previous step in the form
  const handlePreviousStep = () => {
    if (currentStep === 3 && !entryData.entryTypes.includes('growth') && !entryData.entryTypes.includes('milestone')) {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if there are any more steps
  const hasMoreSteps = () => {
    return getNextStep(currentStep) !== null;
  };

  const handleSave = () => {
    // Ensure at least one entry type is selected
    if (entryData.entryTypes.length === 0) {
      alert('Please select at least one entry type');
      return;
    }
    
    onSave(day, entryData);
    onClose();
  };

  // Format a display date, handling the case where day might be null
  const getFormattedDate = () => {
    if (!day) return "New Entry";
    try {
      return day.format('MMMM D');
    } catch (error) {
      return "New Entry";
    }
  };
  
  // Render step indicators - now based on actual steps needed
  const renderStepIndicators = () => {
    // Determine how many steps are needed based on selected entry types
    let totalSteps = 1; // Always have at least Step 1 (Notes)
    
    if (entryData.entryTypes.includes('growth') || entryData.entryTypes.includes('milestone')) {
      totalSteps++;
    }
    
    if (entryData.entryTypes.includes('media')) {
      totalSteps++;
    }
    
    return (
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
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

  // Render form step 1 - Entry Type and Notes
  const renderStep1 = () => {
    return (
      <>
        <View style={styles.stepHeading}>
          <Text style={styles.stepTitle}>Entry Details</Text>
          <Text style={styles.stepSubtitle}>Add your observations and notes</Text>
        </View>

        {/* Entry Types */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Entry Types:</Text>
          <View style={styles.entryTypeContainer}>
            <TouchableOpacity
              style={[
                styles.entryTypeButton,
                entryData.entryTypes.includes('note') && styles.entryTypeButtonSelected
              ]}
              onPress={() => toggleEntryType('note')}
            >
              <MaterialIcons 
                name="note" 
                size={22} 
                color={entryData.entryTypes.includes('note') ? 'white' : colors.primary} 
              />
              <Text 
                style={[
                  styles.entryTypeText,
                  entryData.entryTypes.includes('note') && styles.entryTypeTextSelected
                ]}
              >
                Note
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.entryTypeButton,
                entryData.entryTypes.includes('growth') && styles.entryTypeButtonSelected
              ]}
              onPress={() => toggleEntryType('growth')}
            >
              <MaterialIcons 
                name="straighten" 
                size={22} 
                color={entryData.entryTypes.includes('growth') ? 'white' : colors.primary} 
              />
              <Text 
                style={[
                  styles.entryTypeText,
                  entryData.entryTypes.includes('growth') && styles.entryTypeTextSelected
                ]}
              >
                Growth
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.entryTypeButton,
                entryData.entryTypes.includes('milestone') && styles.entryTypeButtonSelected
              ]}
              onPress={() => toggleEntryType('milestone')}
            >
              <MaterialIcons 
                name="emoji-events" 
                size={22} 
                color={entryData.entryTypes.includes('milestone') ? 'white' : colors.primary} 
              />
              <Text 
                style={[
                  styles.entryTypeText,
                  entryData.entryTypes.includes('milestone') && styles.entryTypeTextSelected
                ]}
              >
                Milestone
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.entryTypeButton,
                entryData.entryTypes.includes('media') && styles.entryTypeButtonSelected
              ]}
              onPress={() => toggleEntryType('media')}
            >
              <MaterialIcons 
                name="photo-camera" 
                size={22} 
                color={entryData.entryTypes.includes('media') ? 'white' : colors.primary} 
              />
              <Text 
                style={[
                  styles.entryTypeText,
                  entryData.entryTypes.includes('media') && styles.entryTypeTextSelected
                ]}
              >
                Media
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="Write your observations, thoughts, or anything you want to remember about today..."
            value={entryData.notes}
            onChangeText={(text) => setEntryData(prev => ({ ...prev, notes: text }))}
            textAlignVertical="top"
          />
        </View>
            
        {/* Baby's Mood */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Baby's Mood</Text>
          <View style={styles.moodContainer}>
            {['happy', 'calm', 'tired', 'fussy', 'sick'].map((mood) => (
              <TouchableOpacity 
                key={mood}
                style={[
                  styles.moodButton,
                  entryData.mood === mood && styles.moodButtonSelected
                ]}
                onPress={() => setMood(mood)}
              >
                <Text style={[
                  styles.moodText,
                  entryData.mood === mood && styles.moodTextSelected
                ]}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    );
  };

  // Render form step 2 - Growth & Milestones
  const renderStep2 = () => {
    return (
      <>
        <View style={styles.stepHeading}>
          <Text style={styles.stepTitle}>Growth & Milestones</Text>
          <Text style={styles.stepSubtitle}>Track your baby's development</Text>
        </View>

        {/* Growth Data - Only show if growth type is selected */}
        {entryData.entryTypes.includes('growth') && (
          <View style={styles.inputGroup}>
            <Text style={styles.sectionSubtitle}>Growth Data</Text>
              
            <Text style={styles.inputLabel}>Weight</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.growthInput}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={entryData.growthData.weight}
                onChangeText={(value) => updateGrowthData('weight', value)}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
            
            <Text style={styles.inputLabel}>Height</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.growthInput}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={entryData.growthData.height}
                onChangeText={(value) => updateGrowthData('height', value)}
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
            
            <Text style={styles.inputLabel}>Head Circumference</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.growthInput}
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={entryData.growthData.headCircumference}
                onChangeText={(value) => updateGrowthData('headCircumference', value)}
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
          </View>
        )}

        {/* Milestones - Only show if milestone type is selected */}
        {entryData.entryTypes.includes('milestone') && (
          <View style={styles.inputGroup}>
            <Text style={styles.sectionSubtitle}>Milestones</Text>
            
            <View style={styles.addMilestoneContainer}>
              <TextInput
                style={styles.milestoneInput}
                placeholder="Add a new milestone..."
                value={newMilestone}
                onChangeText={setNewMilestone}
              />
              <TouchableOpacity style={styles.addButton} onPress={addMilestone}>
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.milestonesList}>
              {entryData.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <Text style={styles.milestoneText}>{milestone}</Text>
                  <TouchableOpacity onPress={() => removeMilestone(index)}>
                    <MaterialIcons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </>
    );
  };

  // Render form step 3 - Media
  const renderStep3 = () => {
    return (
      <>
        <View style={styles.stepHeading}>
          <Text style={styles.stepTitle}>Photos, Audio & Documents</Text>
          <Text style={styles.stepSubtitle}>Add memories and important files</Text>
        </View>

        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <FontAwesome5 name="images" size={22} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton} onPress={takePicture}>
            <FontAwesome5 name="camera" size={22} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton} onPress={pickDocument}>
            <FontAwesome5 name="file-alt" size={22} color={colors.primary} />
            <Text style={styles.mediaButtonText}>Document</Text>
          </TouchableOpacity>
        </View>
        
        {/* Audio Recording Section */}
        <View style={styles.audioRecordingSection}>
          <Text style={styles.sectionSubtitle}>Audio Recording</Text>
          
          <TouchableOpacity 
            style={[styles.mediaButton, isRecording && styles.recordingActiveButton]} 
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.mediaButtonContent}>
              {isRecording ? (
                <>
                  <FontAwesome5 name="stop" size={22} color="white" />
                  <Text style={styles.recordingActiveText}>
                    Recording... {formatTime(recordingTime)}
                  </Text>
                </>
              ) : (
                <>
                  <FontAwesome5 name="microphone" size={22} color={colors.primary} />
                  <Text style={styles.mediaButtonText}>Record Audio</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mediaGallery} contentContainerStyle={styles.mediaGalleryContent}>
          {entryData.mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
              ) : item.type === 'audio' ? (
                <TouchableOpacity 
                  style={styles.audioItem}
                  onPress={() => playAudio(item.uri)}
                >
                  <FontAwesome5 name="play" size={18} color={colors.primary} />
                  <View style={styles.audioItemDetails}>
                    <Text style={styles.audioItemText}>Audio {index + 1}</Text>
                    <Text style={styles.audioDuration}>{formatTime(item.duration)}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.documentItem}>
                  <FontAwesome5 name="file-alt" size={24} color={colors.primary} />
                  <Text style={styles.documentName} numberOfLines={1}>
                    {item.filename}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.removeMediaButton}
                onPress={() => removeMedia(index)}
              >
                <MaterialIcons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.completionMessage}>
          <MaterialIcons name="check-circle" size={24} color={colors.success} />
          <Text style={styles.completionText}>
            All set! Tap "Save Entry" to save your changes.
          </Text>
        </View>
      </>
    );
  };

  // Render the content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <View>
                  <MaterialIcons name="close" size={24} color={colors.textGray} />
                </View>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {existingEntry ? 'Edit Entry' : 'New Entry'}{day ? ` - ${getFormattedDate()}` : ''}
              </Text>
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
              
              {hasMoreSteps() ? (
                <TouchableOpacity 
                  style={[styles.nextButton, currentStep === 1 && !currentStep > 1 && styles.fullWidthButton]}
                  onPress={handleNextStep}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <View>
                    <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.submitButton, (currentStep === 1 || currentStep === 3) && !currentStep > 1 && styles.fullWidthButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.submitButtonText}>Save</Text>
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
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: 8,
  },
  entryTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  entryTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  entryTypeButtonSelected: {
    backgroundColor: colors.primary,
  },
  entryTypeText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  entryTypeTextSelected: {
    color: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: '#FFFFFF',
    height: 120,
    textAlignVertical: 'top',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  moodButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  moodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  moodText: {
    color: colors.textDark,
    fontWeight: '500',
  },
  moodTextSelected: {
    color: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  growthInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: '#FFFFFF',
  },
  inputUnit: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.textDark,
    width: 30,
  },
  addMilestoneContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  milestoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textDark,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 10,
  },
  milestonesList: {
    maxHeight: 180,
  },
  milestoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  milestoneText: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mediaButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    width: '31%',
  },
  mediaButtonText: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  mediaGallery: {
    marginBottom: 20,
    maxHeight: 220,
  },
  mediaGalleryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mediaItem: {
    width: 90,
    height: 90,
    margin: 5,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  documentItem: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  documentName: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    color: colors.textDark,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    },
    /* Audio Recording Specific Styles */
    audioRecordingSection: {
      marginVertical: 20,
    },
    mediaButtonContent: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    recordingActiveButton: {
      backgroundColor: '#E53935',
      borderColor: '#E53935',
      width: '100%',
    },
    recordingActiveText: {
      marginTop: 8,
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
    },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '500',
  },
  stopRecordingButton: {
    backgroundColor: '#E53935',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioItem: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F8FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  audioItemDetails: {
    marginLeft: 10,
  },
  audioItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
  },
  audioDuration: {
    fontSize: 12,
    color: colors.textGray,
    marginTop: 3,
  }
  });

  export default AddEntryModal;