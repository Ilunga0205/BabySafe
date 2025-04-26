import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import colors from '../../constants/colors';

const BabyCard = ({ baby, onPress, onVaccinationPress }) => {
  const getAgeText = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    
    const monthsDiff = (today.getFullYear() - birthDateObj.getFullYear()) * 12 + 
                       (today.getMonth() - birthDateObj.getMonth());
    
    if (monthsDiff < 1) {
      // Calculate days
      const timeDiff = Math.abs(today.getTime() - birthDateObj.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      return `${daysDiff} days old`;
    } else if (monthsDiff < 24) {
      // Show months if less than 2 years
      return `${monthsDiff} month${monthsDiff !== 1 ? 's' : ''} old`;
    } else {
      // Show years
      const years = Math.floor(monthsDiff / 12);
      return `${years} year${years !== 1 ? 's' : ''} old`;
    }
  };

  // Format birth date for display
  const formatBirthDate = (birthDate) => {
    const date = new Date(birthDate);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format birth time for display
  const formatBirthTime = (birthTime) => {
    if (!birthTime) return '';
    const time = new Date(birthTime);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Get upcoming event (vaccination, checkup, etc.)
  const getUpcomingEvent = () => {
    // In a real app, this would come from stored events
    // For demo purposes, we're checking if the baby has vaccinations scheduled
    if (baby.vaccinations && baby.vaccinations.length > 0) {
      // Find the next upcoming vaccination
      const today = new Date();
      const upcomingVaccinations = baby.vaccinations
        .filter(vacc => new Date(vacc.date) > today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (upcomingVaccinations.length > 0) {
        const nextVacc = upcomingVaccinations[0];
        const timeDiff = Math.abs(new Date(nextVacc.date).getTime() - today.getTime());
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
          type: 'vaccination',
          daysRemaining,
          name: nextVacc.name
        };
      }
    }
    
    // Return null if no vaccinations are scheduled
    return null;
  };

  const upcomingEvent = getUpcomingEvent();
  
  // Default placeholder image if no photo provided
  const babyImage = baby.photo 
    ? { uri: baby.photo } 
    : require('../../assets/picture1.png');

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.photoContainer}>
          <Image 
            source={babyImage} 
            style={styles.babyPhoto} 
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.nameContainer}>
          <Text style={styles.babyName}>{baby.name}</Text>
          <Text style={styles.ageText}>{getAgeText(baby.birthDate)}</Text>
        </View>
        
        <View style={styles.genderBadge}>
          <FontAwesome5 
            name={baby.gender.toLowerCase() === 'male' ? 'mars' : 'venus'} 
            size={12} 
            color="#FFFFFF" 
          />
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color={colors.textGray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <FontAwesome5 name="weight" size={14} color={colors.textGray} solid />
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>
              {baby.weight ? `${baby.weight} kg` : 'Not recorded'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={14} color={colors.textGray} />
            <Text style={styles.detailLabel}>Height</Text>
            <Text style={styles.detailValue}>
              {baby.height ? `${baby.height} cm` : 'Not recorded'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome5 name="hospital" size={14} color={colors.textGray} />
            <Text style={styles.detailLabel}>Birth Place</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {baby.hospital || 'Not recorded'}
            </Text>
          </View>
        </View>
        
        <View style={styles.birthInfoContainer}>
          <View style={styles.birthDateContainer}>
            <MaterialIcons name="event" size={14} color={colors.primary} />
            <Text style={styles.birthDateText}>{formatBirthDate(baby.birthDate)}</Text>
          </View>
          
          {baby.birthTime && (
            <View style={styles.birthTimeContainer}>
              <MaterialIcons name="access-time" size={14} color={colors.primary} />
              <Text style={styles.birthTimeText}>{formatBirthTime(baby.birthTime)}</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.reminderContainer}
        onPress={() => onVaccinationPress(baby)}
      >
        <View style={styles.reminderIconContainer}>
          <FontAwesome5 name="syringe" size={14} color="#1976D2" />
        </View>
        
        {upcomingEvent ? (
          <>
            <Text style={styles.reminderText}>
              {upcomingEvent.name} in {upcomingEvent.daysRemaining} days
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#1976D2" />
          </>
        ) : (
          <>
            <Text style={styles.reminderText}>Add vaccination schedule</Text>
            <MaterialIcons name="add-circle-outline" size={20} color="#1976D2" />
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  photoContainer: {
    marginRight: 12,
  },
  babyPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  nameContainer: {
    flex: 1,
  },
  babyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  ageText: {
    fontSize: 14,
    color: colors.textGray,
  },
  genderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: (props) => props.baby && props.baby.gender && props.baby.gender.toLowerCase() === 'male' ? '#2196F3' : '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  moreButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
    width: '30%',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textGray,
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
    textAlign: 'center',
  },
  birthInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  birthDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  birthDateText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  birthTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  birthTimeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  reminderIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1976D2',
  },
});

export default BabyCard;