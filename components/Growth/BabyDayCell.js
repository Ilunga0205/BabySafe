import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../../constants/colors';

const BabyDayCell = ({ day, size, onPress }) => {
  const { date, day: dayNumber, hasEntry, entry } = day;
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
  
  // Determine the icon to show based on entry types
  const getEntryIcon = () => {
    if (!hasEntry) return null;
    
    // Priority order for icons
    const iconMapping = {
      milestone: <MaterialIcons name="emoji-events" size={16} color="#FFFFFF" />,
      growth: <MaterialIcons name="show-chart" size={16} color="#FFFFFF" />,
      photo: <MaterialIcons name="photo" size={16} color="#FFFFFF" />,
      audio: <MaterialIcons name="mic" size={16} color="#FFFFFF" />,
      note: <MaterialIcons name="note" size={16} color="#FFFFFF" />
    };
    
    // Find the first matching entry type
    for (const type of Object.keys(iconMapping)) {
      if (entry.entryTypes.includes(type)) {
        return iconMapping[type];
      }
    }
    
    // Default icon
    return <MaterialIcons name="check" size={16} color="#FFFFFF" />;
  };
  
  // Get background color based on entry types
  const getCellBgColor = () => {
    if (!hasEntry) return '#F9F9F9';
    
    // Color mapping based on entry type
    const colorMapping = {
      milestone: '#FFD700', // Gold for milestones
      growth: colors.primary, // Primary for growth
      photo: '#4CAF50', // Green for photos
      audio: '#2196F3', // Blue for audio
      note: '#9C27B0' // Purple for notes
    };
    
    // Find the first matching entry type
    for (const type of Object.keys(colorMapping)) {
      if (entry.entryTypes.includes(type)) {
        return colorMapping[type];
      }
    }
    
    // Default color
    return colors.secondary;
  };
  
  // Determine if cell should be highlighted (future day)
  const isHighlighted = !hasEntry && date > today;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          backgroundColor: hasEntry ? getCellBgColor() : (isToday ? '#FFF0E8' : '#F9F9F9'),
          borderColor: isToday ? colors.primary : (isHighlighted ? colors.secondary : '#EAEAEA')
        }
      ]}
      onPress={() => onPress(day)}
      disabled={false} // You can disable future dates if needed
    >
      <Text 
        style={[
          styles.dayNumber,
          hasEntry ? styles.entryDayNumber : {},
          isToday ? styles.todayNumber : {}
        ]}
      >
        {dayNumber}
      </Text>
      
      {hasEntry && (
        <View style={styles.entryIconContainer}>
          {getEntryIcon()}
        </View>
      )}
      
      {isToday && !hasEntry && (
        <View style={styles.todayIndicator}>
          <View style={styles.todayDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    overflow: 'hidden',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  entryDayNumber: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayNumber: {
    color: colors.primary,
    fontWeight: '700',
  },
  entryIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
    width: '100%',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  }
});

export default BabyDayCell;