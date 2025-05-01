import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const BabyTimelineDetails = ({ route, navigation }) => {
  const { entry, dateStr } = route.params;
  
  // Format entry date for display
  const entryDate = new Date(dateStr);
  const formattedDate = entryDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    // Navigate to edit screen with entry data
    navigation.navigate('AddEntry', { 
      day: { dateStr: dateStr, dateObj: entryDate },
      existingEntry: entry
    });
  };

  // Render media grid
  const renderMediaGrid = () => {
    if (!entry.mediaItems || entry.mediaItems.length === 0) return null;
    
    return (
      <>
        <Text style={styles.sectionHeader}>Photos & Documents</Text>
        <View style={styles.mediaGrid}>
          {entry.mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
              ) : (
                <View style={styles.documentItem}>
                  <FontAwesome5 name="file-alt" size={24} color={colors.primary} />
                  <Text style={styles.documentName} numberOfLines={1}>
                    {item.filename}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </>
    );
  };

  // Render mood indicator
  const renderMood = () => {
    if (!entry.mood) return null;
    
    const moodIcons = {
      'happy': 'sentiment-very-satisfied',
      'calm': 'sentiment-satisfied',
      'tired': 'sentiment-neutral',
      'fussy': 'sentiment-dissatisfied',
      'sick': 'sick'
    };
    
    return (
      <View style={styles.moodContainer}>
        <MaterialIcons 
          name={moodIcons[entry.mood] || 'sentiment-neutral'} 
          size={24} 
          color={colors.primary} 
        />
        <Text style={styles.moodText}>
          Baby was {entry.mood} today
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Details</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <MaterialIcons name="edit" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date and Entry Type Tags */}
        <Text style={styles.dateLabel}>{formattedDate}</Text>
        
        {entry.entryTypes?.length > 0 && (
          <View style={styles.entryTypesContainer}>
            {entry.entryTypes.map((type) => (
              <View key={type} style={styles.entryTypeTag}>
                <MaterialIcons 
                  name={
                    type === 'media' ? 'photo-camera' :
                    type === 'milestone' ? 'emoji-events' :
                    type === 'note' ? 'note' :
                    type === 'growth' ? 'straighten' :
                    'assignment'
                  }
                  size={14}
                  color="#FFF"
                />
                <Text style={styles.entryTypeText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Entry Title */}
        {entry.title && <Text style={styles.entryTitle}>{entry.title}</Text>}
        
        {/* Mood */}
        {renderMood()}
        
        {/* Notes */}
        {entry.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionHeader}>Notes</Text>
            <Text style={styles.entryText}>{entry.notes}</Text>
          </View>
        ) : null}

        {/* Growth Data */}
        {entry.growthData && (Object.values(entry.growthData).some(value => value)) && (
          <View style={styles.growthContainer}>
            <Text style={styles.sectionHeader}>Growth Data</Text>
            {entry.growthData.weight && (
              <View style={styles.growthItem}>
                <MaterialIcons name="fitness-center" size={20} color={colors.primary} />
                <Text style={styles.growthText}>Weight: {parseFloat(entry.growthData.weight).toFixed(2)} kg</Text>
              </View>
            )}
            {entry.growthData.height && (
              <View style={styles.growthItem}>
                <MaterialIcons name="straighten" size={20} color={colors.primary} />
                <Text style={styles.growthText}>Height: {parseFloat(entry.growthData.height).toFixed(1)} cm</Text>
              </View>
            )}
            {entry.growthData.headCircumference && (
              <View style={styles.growthItem}>
                <MaterialIcons name="panorama-horizontal" size={20} color={colors.primary} />
                <Text style={styles.growthText}>Head: {parseFloat(entry.growthData.headCircumference).toFixed(1)} cm</Text>
              </View>
            )}
          </View>
        )}

        {/* Milestones */}
        {entry.milestones?.length > 0 && (
          <View style={styles.milestonesContainer}>
            <Text style={styles.sectionHeader}>Milestones</Text>
            <View style={styles.milestonesList}>
              {entry.milestones.map((milestone, idx) => (
                <View key={idx} style={styles.milestoneItem}>
                  <MaterialIcons name="star" size={16} color={colors.primary} />
                  <Text style={styles.milestoneText}>{milestone}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Media */}
        {renderMediaGrid()}
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  dateLabel: {
    fontSize: 16,
    color: colors.textGray,
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: colors.primary,
  },
  entryTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  entryTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  entryTypeText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  moodText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#444',
  },
  notesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  entryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  growthContainer: {
    marginBottom: 24,
  },
  growthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  growthText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  milestonesContainer: {
    marginBottom: 24,
  },
  milestonesList: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  milestoneText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  mediaItem: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  documentItem: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  documentName: {
    marginTop: 8,
    textAlign: 'center',
    color: '#333',
  },
});

export default BabyTimelineDetails;