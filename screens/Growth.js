import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Styles
import styles from './styles/GrowthStyles';

// Constants
import colors from '../constants/colors';

// Components
import BabyTimeline from '../components/Growth/BabyTimeline';
import AddEntryModal from '../components/Growth/AddEntryModal';

export default function Growth({ route, navigation }) {
  const { baby } = route.params || { baby: null };
  const insets = useSafeAreaInsets();
  
  // State
  const [activeTab, setActiveTab] = useState('journal'); // 'chart', 'journal', 'milestones'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [journalEntries, setJournalEntries] = useState({}); // Object with date keys
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAddEntryVisible, setIsAddEntryVisible] = useState(false);
  
  // Handle navigation back to Home screen with 'babies' tab selected
  const handleGoBack = () => {
    // Navigate back to Home and pass a parameter to indicate that the 'babies' tab should be selected
    navigation.navigate('Home', { initialTab: 'babies' });
  };

  // Mocked data - in a real app, fetch from your database
  useEffect(() => {
    if (baby) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        // Generate some mock journal entries for demonstration
        const mockEntries = {};
        const today = new Date();
        
        // Create entries for random days in current month
        for (let i = 1; i <= 10; i++) {
          const day = Math.floor(Math.random() * 28) + 1;
          const date = new Date(today.getFullYear(), today.getMonth(), day);
          const dateStr = date.toISOString().split('T')[0];
          
          mockEntries[dateStr] = {
            date: dateStr,
            entryTypes: getRandomEntryTypes(),
            growthData: Math.random() > 0.5 ? {
              weight: 5 + Math.random() * 5, // 5-10kg
              height: 50 + Math.random() * 30, // 50-80cm
              headCircumference: 35 + Math.random() * 10 // 35-45cm
            } : null,
            milestones: Math.random() > 0.7 ? ['First smile', 'Rolled over'] : [],
            mediaItems: [],
            notes: Math.random() > 0.5 ? 'Baby was very active today!' : '',
            mood: ['happy', 'sleepy', 'fussy'][Math.floor(Math.random() * 3)]
          };
        }
        
        setJournalEntries(mockEntries);
        setLoading(false);
      }, 1000);
    }
  }, [baby]);

  // Helper to generate random entry types for mock data
  const getRandomEntryTypes = () => {
    const allTypes = ['growth', 'photo', 'milestone', 'audio', 'note'];
    const typesCount = Math.floor(Math.random() * 3) + 1; // 1-3 types
    const selectedTypes = [];
    
    for (let i = 0; i < typesCount; i++) {
      const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
      if (!selectedTypes.includes(randomType)) {
        selectedTypes.push(randomType);
      }
    }
    
    return selectedTypes;
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Handle day selection
  const handleDayPress = (day) => {
    setSelectedDay(day);
    setIsAddEntryVisible(true);
  };

  // Save new journal entry
  const handleSaveEntry = (entry) => {
    if (!selectedDay) return;
    
    const updatedEntries = { ...journalEntries };
    updatedEntries[selectedDay.dateStr] = {
      ...entry,
      date: selectedDay.dateStr
    };
    
    setJournalEntries(updatedEntries);
    setIsAddEntryVisible(false);
    setSelectedDay(null);
  };

  // Render month name and navigation
  const renderMonthHeader = () => {
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return (
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.monthNavButton}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>{monthName}</Text>
        
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.monthNavButton}>
          <MaterialIcons name="chevron-right" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  // Calculate header padding based on platform and insets
  const headerTopPadding = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 24;

  // Header with baby info - Updated to match Home screen style
  return (
    <View style={styles.container}>
      {/* StatusBar configuration - Matched with Home screen */}
      <StatusBar 
        backgroundColor="transparent"
        barStyle="light-content" 
        translucent={true}
      />
      
      {/* Header area - Updated to match Home screen */}
      <View style={[styles.headerContainer, { paddingTop: headerTopPadding }]}>
        <LinearGradient
          colors={['#7a3e3e', colors.primary]} // Darker shade of primary for gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          {/* Header content */}
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.logoText}>Growth</Text>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialIcons name="calendar-today" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Baby info section */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              {baby?.name || 'Your Baby'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              {baby?.age || '6 months old'}
            </Text>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {['chart', 'journal', 'milestones'].map((tab) => {
              const isActive = activeTab === tab;
              let icon;
              let label;
              
              switch(tab) {
                case 'chart':
                  icon = <MaterialIcons name="bar-chart" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "Growth Charts";
                  break;
                case 'journal':
                  icon = <MaterialIcons name="calendar-today" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "BabyDays";
                  break;
                case 'milestones':
                  icon = <MaterialIcons name="emoji-events" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "Milestones";
                  break;
                default:
                  break;
              }
              
              return (
                <TouchableOpacity 
                  key={tab}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  {icon}
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'journal' && (
          <>
            {renderMonthHeader()}
            
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
              <BabyTimeline
              month={currentMonth}
              journalEntries={journalEntries}
              onDayPress={handleDayPress}
              onAddEntry={handleDayPress}
              onViewEntry={(day) => {
                navigation.navigate('BabyTimelineDetails', {
                  entry: journalEntries[day.dateStr],
                  dateStr: day.dateStr
                });
              }}
              colors={colors}
            />
            
            )}
          </>
        )}
        
        {activeTab === 'chart' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Growth Charts</Text>
              <Text style={styles.comingSoonText}>WHO-standard growth charts coming soon!</Text>
              
              <Image 
                source={require('../assets/picture1.png')} 
                style={styles.chartPlaceholder}
                resizeMode="contain"
              />
            </View>
          </ScrollView>
        )}
        
        {activeTab === 'milestones' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
            <View style={styles.milestonesContainer}>
              <Text style={styles.sectionTitle}>Development Milestones</Text>
              <Text style={styles.comingSoonText}>Track your baby's development journey!</Text>
              
              {/* Milestone timeline would go here */}
              <View style={styles.milestonePlaceholder}>
                <MaterialIcons name="emoji-events" size={64} color={colors.textDark} />
                <Text style={styles.placeholderText}>Milestone tracking coming soon!</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
      
      {/* Modal for adding/editing entries */}
      <AddEntryModal 
        visible={isAddEntryVisible}
        day={selectedDay}
        onClose={() => {
          setIsAddEntryVisible(false);
          setSelectedDay(null);
        }}
        onSave={handleSaveEntry}
        existingEntry={selectedDay?.entry}
      />
    </View>
  );
}