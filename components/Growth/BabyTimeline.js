import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Line, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DAY_ITEM_WIDTH = width * 0.28;
const DAY_ITEM_HEIGHT = 160;
const LINE_HEIGHT = 4;

// Default colors
const DEFAULT_COLORS = {
  primary: '#9C6644'
};

const BabyTimeline = ({ 
  month, 
  journalEntries, 
  onDayPress, 
  colors = DEFAULT_COLORS, // Provide default colors
  activeDate = new Date() 
}) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDateIndex, setActiveDateIndex] = useState(null);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Create styles that depend on props
  const dynamicStyles = {
    activeItem: {
      borderColor: colors.primary,
      borderWidth: 3,
      transform: [{ scale: 1.05 }],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
    }
  };
  
  // Prepare timeline data - only when month or journal entries change
  useEffect(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days = [];
    let foundActiveIndex = -1;
    const today = new Date();
    
    // Create data for each day in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const hasEntry = !!journalEntries[dateStr];
      
      // Check if this is today's date
      const isToday = dateObj.getDate() === today.getDate() && 
                       dateObj.getMonth() === today.getMonth() && 
                       dateObj.getFullYear() === today.getFullYear();
      
      // Check if this is the active date
      const isActiveDate = dateObj.getDate() === activeDate.getDate() && 
                           dateObj.getMonth() === activeDate.getMonth() && 
                           dateObj.getFullYear() === activeDate.getFullYear();
      
      // For activeDateIndex calculation
      if (isActiveDate) {
        foundActiveIndex = day - 1;
      } else if (isToday && foundActiveIndex === -1) {
        // Use today as fallback if no active date is found
        foundActiveIndex = day - 1;
      }
      
      // Check if previous day has entry (for unlocking logic)
      const prevDate = new Date(dateObj);
      prevDate.setDate(day - 1);
      const prevDateStr = prevDate.toISOString().split('T')[0];
      
      // Day is unlocked if it's the first day or previous day has an entry or it's today/past
      const isPastOrToday = dateObj <= today;
      const isUnlocked = day === 1 || !!journalEntries[prevDateStr] || isPastOrToday;
      
      // Check if date is a milestone based on frequency (weekly) or custom milestones
      const isMilestone = day % 7 === 0 || day === 1 || 
                         (journalEntries[dateStr]?.entryTypes?.includes('milestone'));
      
      // Get day name abbreviation
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      days.push({
        day,
        dateObj,
        dateStr,
        dayName,
        hasEntry,
        isToday,
        isActiveDate,
        isUnlocked,
        isMilestone,
        entry: journalEntries[dateStr],
      });
    }
    
    setTimelineData(days);
    
    // Only set activeDateIndex once when the data is prepared
    if (foundActiveIndex >= 0) {
      setActiveDateIndex(foundActiveIndex);
    } else {
      // If no active/today date found in this month, select first day
      setActiveDateIndex(0);
    }
    
    setLoading(false);
    
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
    
  }, [month, journalEntries]); // Remove activeDate from dependency array
  
  // Scroll to active date when data is ready and activeDateIndex is set
  useEffect(() => {
    if (timelineData.length > 0 && scrollViewRef.current && activeDateIndex !== null) {
      // Small delay to ensure rendering is complete
      const scrollTimer = setTimeout(() => {
        // Calculate scroll position to center the active day
        const scrollToX = Math.max(
          0, 
          (activeDateIndex * DAY_ITEM_WIDTH) - (width / 2) + (DAY_ITEM_WIDTH / 2)
        );
        
        scrollViewRef.current.scrollTo({ 
          x: scrollToX, 
          animated: true 
        });
      }, 500);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [timelineData, activeDateIndex]); // Depend on both timelineData and activeDateIndex
  
  // Handle day press with haptic feedback
  const handleDayPress = (day) => {
    if (!day.isUnlocked) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call the parent's onDayPress function with the day data
    if (onDayPress && typeof onDayPress === 'function') {
      onDayPress(day);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading baby's timeline...</Text>
      </View>
    );
  }
  
  // Render timeline item
  const renderTimelineItem = (item, index) => {
    const { day, dayName, hasEntry, isToday, isUnlocked, isMilestone } = item;
    
    // Determine indicator status and style
    let indicatorStyle = [styles.dayIndicator];
    let innerIndicatorStyle = [];
    let indicatorContent = null;
    
    if (hasEntry) {
      indicatorStyle.push(styles.completedIndicator);
      indicatorContent = (
        <MaterialIcons name="check" size={18} color="#FFF" />
      );
    } else if (isToday) {
      indicatorStyle.push(styles.todayIndicator);
      innerIndicatorStyle.push(styles.todayInnerIndicator);
    } else if (isUnlocked) {
      indicatorStyle.push(styles.unlockedIndicator);
      indicatorContent = (
        <MaterialIcons name="add" size={18} color={colors.primary} />
      );
    } else {
      indicatorStyle.push(styles.lockedIndicator);
      indicatorContent = (
        <MaterialIcons name="lock" size={14} color="#AAA" />
      );
    }
    
    // Add milestone styling
    if (isMilestone) {
      indicatorStyle.push(styles.milestoneIndicator);
    }
    
    return (
      <TouchableOpacity 
        key={`day-${day}`}
        style={[
          styles.dayItem,
          isToday && styles.todayItem,
          !isUnlocked && styles.lockedItem,
          // Highlight active date using dynamicStyles
          index === activeDateIndex && dynamicStyles.activeItem
        ]}
        onPress={() => handleDayPress(item)}
        disabled={!isUnlocked}
        activeOpacity={0.7}
      >
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dayNumber}>{day}</Text>
          <Text style={styles.dayName}>{dayName}</Text>
        </View>
        
        {/* Status indicator */}
        <View style={indicatorStyle}>
          {innerIndicatorStyle.length > 0 && (
            <View style={innerIndicatorStyle} />
          )}
          {indicatorContent}
        </View>
        
        {/* Entry details */}
        <View style={styles.entryDetails}>
          {hasEntry ? (
            <>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {item.entry?.title || "Baby's Day"}
              </Text>
              {item.entry?.entryTypes?.map((type, typeIdx) => (
                <View key={`${day}-${type}`} style={styles.entryTypeTag}>
                  <MaterialIcons 
                    name={type === 'photo' ? 'photo' : 
                          type === 'milestone' ? 'star' : 
                          type === 'note' ? 'note' : 'assignment'} 
                    size={12} 
                    color="#FFF" 
                  />
                  <Text style={styles.entryTypeText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              ))}
            </>
          ) : isUnlocked ? (
            <Text style={styles.noEntryText}>Add entry</Text>
          ) : (
            <Text style={styles.lockedText}>Locked</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <LinearGradient
          colors={[colors.primary, '#9C6644']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.monthBadge}
        >
          <Text style={styles.monthText}>
            {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </LinearGradient>
      </View>
      
      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {/* Timeline line */}
        <View style={styles.timelineLine}>
          <Svg height={LINE_HEIGHT} width="100%">
            <Defs>
              <SvgLinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="1" stopColor="#9C6644" stopOpacity="1" />
              </SvgLinearGradient>
            </Defs>
            <Line
              x1="0"
              y1={LINE_HEIGHT / 2}
              x2="100%"
              y2={LINE_HEIGHT / 2}
              stroke="url(#lineGradient)"
              strokeWidth={LINE_HEIGHT}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        
        {/* Timeline items */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineScrollContent}
          decelerationRate="fast"
          snapToInterval={DAY_ITEM_WIDTH}
          snapToAlignment="center"
        >
          {timelineData.map(renderTimelineItem)}
          
          {/* End item */}
          <View style={styles.endItem}>
            <View style={styles.endIndicator}>
              <FontAwesome5 name="flag-checkered" size={20} color="#FFF" />
            </View>
            <Text style={styles.endText}>Month Complete</Text>
          </View>
        </ScrollView>
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="check" size={12} color="#FFF" />
          </View>
          <Text style={styles.legendText}>Completed</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, styles.todayLegend]}>
            <View style={styles.todayInnerLegend} />
          </View>
          <Text style={styles.legendText}>Today</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: '#FFF', borderColor: colors.primary, borderWidth: 1 }]}>
            <MaterialIcons name="add" size={12} color={colors.primary} />
          </View>
          <Text style={styles.legendText}>Available</Text>
        </View>
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          <MaterialIcons name="info-outline" size={14} color="#666" /> 
          Tap on a day to add or view entries
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  monthHeader: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  monthBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  monthText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: LINE_HEIGHT,
    top: DAY_ITEM_HEIGHT / 2 + 20, // Center line with items
  },
  timelineScrollContent: {
    paddingHorizontal: width / 4, // Add padding for better scrolling
  },
  dayItem: {
    width: DAY_ITEM_WIDTH,
    height: DAY_ITEM_HEIGHT,
    marginHorizontal: 5,
    backgroundColor: '#FFF',
    borderRadius: 16,
    justifyContent: 'space-between',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  todayItem: {
    borderColor: '#9C6644',
    borderWidth: 2,
  },
  lockedItem: {
    backgroundColor: '#F7F7F7',
    opacity: 0.8,
  },
  dateHeader: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  completedIndicator: {
    backgroundColor: '#9C6644',
  },
  todayIndicator: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#9C6644',
    borderStyle: 'solid',
  },
  todayInnerIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9C6644',
  },
  unlockedIndicator: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#9C6644',
  },
  lockedIndicator: {
    backgroundColor: '#EEE',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  milestoneIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
  },
  entryDetails: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  entryTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C6644',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 5,
  },
  entryTypeText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 3,
  },
  noEntryText: {
    fontSize: 12,
    color: '#9C6644',
    fontStyle: 'italic',
  },
  lockedText: {
    fontSize: 12,
    color: '#AAA',
    fontStyle: 'italic',
  },
  endItem: {
    width: DAY_ITEM_WIDTH,
    height: DAY_ITEM_HEIGHT,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C6644',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  endText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  todayLegend: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#9C6644',
  },
  todayInnerLegend: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9C6644',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BabyTimeline;