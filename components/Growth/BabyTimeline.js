import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Animated,
  StyleSheet,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Line, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DAY_ITEM_WIDTH = width * 0.28;
const DAY_ITEM_HEIGHT = 160;
const LINE_HEIGHT = 4;

// Default colors with expanded palette for modern UI
const DEFAULT_COLORS = {
  primary: '#9C6644',
  accent: '#D1A77F',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#2196F3',
  light: '#F5F5F5',
  dark: '#333333',
};

const BabyTimeline = ({ 
  month, 
  journalEntries, 
  onDayPress, 
  colors = DEFAULT_COLORS,
  activeDate = new Date(),
  renderMonthHeader,
  onAddEntry // New prop to handle entry addition
}) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDateIndex, setActiveDateIndex] = useState(null);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [entryAdded, setEntryAdded] = useState(false); // New state to track if entry was just added
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollPositionX = useRef(0);
  const hasScrolled = useRef(false);
  const [todayEntryAdded, setTodayEntryAdded] = useState(false);

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
  
  // Improved scroll to active date function
  const scrollToActiveDate = (index) => {
    if (!scrollViewRef.current || timelineData.length === 0) return;
    
    // Calculate exact scroll position with padding adjustment
    const horizontalPadding = width / 4;
    const itemWidth = DAY_ITEM_WIDTH + 10; // 10 is from marginHorizontal: 5 × 2
    
    // Calculate center position for the item
    const scrollToX = Math.max(0, (index * itemWidth) - horizontalPadding + (itemWidth / 2));
    
    console.log(`Scrolling to day at index ${index}, position ${scrollToX}`);
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      scrollViewRef.current.scrollTo({ 
        x: scrollToX, 
        animated: true 
      });
      hasScrolled.current = true;
      scrollPositionX.current = scrollToX;
    });
  };
  
  // Force today's date to be visible
  const forceScrollToToday = () => {
    if (!scrollViewRef.current || timelineData.length === 0) return;
    
    const today = new Date();
    const todayDay = today.getDate();
    
    // Find today's index in the timeline data
    let todayIndex = timelineData.findIndex(item => 
      item.day === todayDay && 
      item.dateObj.getMonth() === today.getMonth() && 
      item.dateObj.getFullYear() === today.getFullYear()
    );
    
    // If today is not found, find the closest day
    if (todayIndex === -1) {
      const sortedDays = [...timelineData].sort((a, b) => 
        Math.abs(a.day - todayDay) - Math.abs(b.day - todayDay)
      );
      todayIndex = timelineData.findIndex(item => item.day === sortedDays[0].day);
    }
    
    if (todayIndex !== -1) {
      // Set the active index
      setActiveDateIndex(todayIndex);
      scrollToActiveDate(todayIndex);
    }
  };
  
  // Prepare timeline data when month or journal entries change
  useEffect(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days = [];
    const today = new Date();
    const todayDay = today.getDate();
    let todayIndex = -1;
    
    console.log(`Today is day ${todayDay} of this month`);
    
    // Create data for each day in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = dateObj.toISOString().split('T')[0];
      const hasEntry = !!journalEntries[dateStr];
      
      // Check if this is today's date - make this VERY explicit
      const isToday = day === todayDay && 
                      month.getMonth() === today.getMonth() && 
                      month.getFullYear() === today.getFullYear();
      
      if (isToday) {
        todayIndex = day - 1;
        console.log(`Found today at index ${todayIndex}, day ${day}`);
        
        // Set today's entry added state based on if there's an entry
        if (hasEntry) {
          setTodayEntryAdded(true);
        }
      }
      
      // Check if this is the active date
      const isActiveDate = day === activeDate.getDate() && 
                           month.getMonth() === activeDate.getMonth() && 
                           month.getFullYear() === activeDate.getFullYear();
      
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
    
    // Reset hasScrolled ref when data changes
    hasScrolled.current = false;
    
    // Set activeDateIndex explicitly to today
    if (todayIndex !== -1) {
      setActiveDateIndex(todayIndex);
    } else {
      // If today's not in this month, try to use activeDate
      const activeDayIndex = days.findIndex(item => item.isActiveDate);
      if (activeDayIndex !== -1) {
        setActiveDateIndex(activeDayIndex);
      } else {
        // Fallback to first day
        setActiveDateIndex(0);
      }
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
    
  }, [month, journalEntries]);
  
  // Improved scroll to active date when data is ready
  useEffect(() => {
    if (timelineData.length === 0 || activeDateIndex === null) return;
    
    // Use a staggered approach with multiple attempts for reliable scrolling
    const scrollAttempts = [100, 500, 1000, 2000];
    
    // Clear any existing timers
    const timers = [];
    
    scrollAttempts.forEach((delay) => {
      const timer = setTimeout(() => {
        if (!hasScrolled.current) {
          console.log(`Attempt to scroll at ${delay}ms`);
          scrollToActiveDate(activeDateIndex);
        }
      }, delay);
      timers.push(timer);
    });
    
    // Cleanup function
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [timelineData, activeDateIndex]);
  
  // Update the handleDayPress function to ensure viewing details works correctly
  const handleDayPress = (day) => {
    if (!day.isUnlocked) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update selected day and active date index
    setSelectedDay(day);
    const newIndex = timelineData.findIndex(item => item.day === day.day);
    if (newIndex !== -1) {
      setActiveDateIndex(newIndex);
    }
    
    // If this is today's entry, set todayEntryAdded state to true
    // This will ensure the View Details button appears
    const today = new Date();
    const isTodayEntry = day.isToday || (
      day.dateObj.getDate() === today.getDate() && 
      day.dateObj.getMonth() === today.getMonth() && 
      day.dateObj.getFullYear() === today.getFullYear()
    );
    
    if (isTodayEntry && day.hasEntry) {
      setTodayEntryAdded(true);
    }
    
    // Call the parent's onDayPress function with the day data
    if (onDayPress && typeof onDayPress === 'function') {
      onDayPress(day);
    }
  };

  
  // Display entry success notification
  const renderEntryAddedNotification = () => {
    return (
      <Animated.View 
        style={[
          styles.entryAddedNotification,
          { backgroundColor: colors.success }
        ]}
      >
        <MaterialIcons name="check-circle" size={18} color="#FFF" />
        <Text style={styles.entryAddedText}>Entry successfully added!</Text>
      </Animated.View>
    );
  };
  
  // Modified renderDailySummary function to always show View Details button for completed entries
  const renderDailySummary = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Find today's data in the timeline
    const todayData = timelineData.find(item => item.isToday);
    
    // Get today's entry from journal entries
    const todayEntry = journalEntries[todayStr];
    
    // Check if today has an entry - this determines if we show the View Details button
    const hasTodayEntry = !!todayEntry || (todayData && todayData.hasEntry);
    
    return (
      <View style={styles.dailySummary}>
        {/* Show notification when entry is added */}
        {entryAdded && renderEntryAddedNotification()}
        
        <Text style={styles.dailySummaryTitle}>
          {hasTodayEntry ? 'Today\'s Entry' : 'No Entry Yet Today'}
        </Text>
        
        {/* If there's an entry, show a preview */}
        {hasTodayEntry ? (
          <View style={styles.todayEntryPreview}>
            {/* Entry title */}
            <Text style={styles.todayEntryTitle}>
              {todayEntry?.title || "Baby's Day"}
            </Text>
            
            {/* Entry notes preview */}
            <Text style={styles.todayEntryText} numberOfLines={2}>
              {todayEntry?.notes || 'Entry added for today!'}
            </Text>
            
            {/* Show entry types if available */}
            {todayEntry?.entryTypes && todayEntry.entryTypes.length > 0 && (
              <View style={styles.entryTypesContainer}>
                {todayEntry.entryTypes.map((type, idx) => (
                  <View key={`today-${type}`} style={[styles.entryTypeTag, { backgroundColor: colors.primary }]}>
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
              </View>
            )}
            
            {/* ALWAYS show View Details button when there's an entry */}
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => todayData && handleDayPress(todayData)}
            >
              <Text style={[styles.viewDetailsText, {color: colors.primary}]}>View Details</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noEntryContainer}> 
          </View>
        )}
      </View>
    );
  };

  // Listen for changes in journalEntries to update todayEntryAdded
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // If today's entry exists in journal entries, set state accordingly
    if (journalEntries[todayStr]) {
      setTodayEntryAdded(true);
    }
    
    // Check if today exists in timelineData and has an entry
    const todayInTimeline = timelineData.find(item => item.isToday);
    if (todayInTimeline?.hasEntry) {
      setTodayEntryAdded(true);
    }
  }, [journalEntries, timelineData]);

  // Update todayEntryAdded when selectedDay changes
  useEffect(() => {
    // Check if selectedDay is today and has an entry
    if (selectedDay && selectedDay.hasEntry && selectedDay.isToday) {
      setTodayEntryAdded(true);
    }
  }, [selectedDay]);

  // Check for newly added entries
  useEffect(() => {
    // Check if an entry was just added via props
    if (entryAdded) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // If today's entry now exists, ensure View Details button appears
      if (journalEntries[todayStr]) {
        setTodayEntryAdded(true);
      }
    }
  }, [entryAdded, journalEntries]);
  
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
          <Text style={[styles.dayNumber, isToday && {color: colors.primary}]}>
            {day}
          </Text>
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
              <View style={styles.entryTypesRow}>
                {item.entry?.entryTypes?.slice(0, 2).map((type, typeIdx) => (
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
                {(item.entry?.entryTypes?.length > 2) && (
                  <Text style={styles.moreTypesText}>+{item.entry.entryTypes.length - 2}</Text>
                )}
              </View>
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
      {/* Daily Summary at the top of the timeline */}
      {renderDailySummary()}
      
      {/* Month header - Now using the passed renderMonthHeader function */}
      {renderMonthHeader && renderMonthHeader()}
      
      {/* Go to Today button for easier navigation */}
      <TouchableOpacity
        style={styles.todayButton}
        onPress={() => {
          forceScrollToToday();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <MaterialIcons name="today" size={16} color="#FFF" style={styles.todayButtonIcon} />
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>
      
      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {/* Timeline line with gradient */}
        <View style={styles.timelineLine}>
          <Svg height={LINE_HEIGHT} width="100%">
            <Defs>
              <SvgLinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.accent} stopOpacity="1" />
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
          snapToInterval={DAY_ITEM_WIDTH + 10} // Account for marginHorizontal: 5 × 2
          snapToAlignment="center"
          onLayout={() => {
            // Try to scroll when layout is complete
            if (!hasScrolled.current && activeDateIndex !== null) {
              scrollToActiveDate(activeDateIndex);
            }
          }}
          onScroll={(event) => {
            // Save scroll position
            scrollPositionX.current = event.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialIcons name="info-outline" size={14} color="#666" />
          <Text style={[styles.instructionsText, {marginLeft: 4}]}>
            Tap on a day to add or view entries
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    overflow: 'hidden',
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
    fontWeight: '500',
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
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#9C6644',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  todayButtonIcon: {
    marginRight: 6,
  },
  todayButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
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
  entryTypesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  entryTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C6644',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  entryTypeText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 3,
  },
  moreTypesText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
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
    paddingVertical: 10,
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9C6644',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  instructionsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  // Daily summary styles
  dailySummary: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dailySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  todayEntryPreview: {
    paddingVertical: 8,
  },
  todayEntryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  todayEntryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  entryTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 5,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  entryAddedNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  entryAddedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  }
});

export default BabyTimeline;