import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

// Custom components
import BabyCard from '../components/Home/BabyCard';
import AddBabyModal from '../components/Home/AddBabyModal';
import EmptyState from '../components/Home/EmptyState';
import styles from './styles/HomeStyles';

// Constants
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

export default function Home({ navigation, route }) {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // State variables
  const [babies, setBabies] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the initialTab from navigation params if available
  const initialTabFromParams = route.params?.initialTab;
  const [selectedTab, setSelectedTab] = useState(initialTabFromParams || 'babies');
  
  // Update selected tab if navigation parameters change
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedTab(route.params.initialTab);
      // Clear the parameter after using it to prevent unexpected tab changes
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab]);
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Shrikhand: require('../assets/fonts/Shrikhand-Regular.ttf'),
  });

  // Mock function to add a baby to the state
  const handleAddBaby = (newBaby) => {
    // Generate unique ID for the baby
    const babyWithId = {
      ...newBaby,
      id: Date.now().toString(),
    };
    
    setBabies([...babies, babyWithId]);
    setIsAddModalVisible(false);
  };

  // Navigate to baby detail screen
  const navigateToBabyDetails = (baby) => {
    navigation.navigate('BabyDetails', { baby });
  };

  // Handle user profile navigation
  const navigateToProfile = () => {
    navigation.navigate('UserProfile');
  };

  // Take me to vaccination screen  
  const navigateToVaccinations = (baby) => {
    navigation.navigate('Vaccination', { baby });
  };
  
  // Handle notifications navigation
  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Calculate header padding based on platform and insets
  const headerTopPadding = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 24;

  return (
    <View style={styles.container}>
      {/* StatusBar configuration */}
      <StatusBar 
        backgroundColor="transparent"
        barStyle="light-content" 
        translucent={true}
      />
      
      {/* Header area */}
      <View style={[styles.headerContainer, { paddingTop: headerTopPadding }]}>
        <LinearGradient
          colors={['#7a3e3e', colors.primary]} // Darker shade of primary for gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          {/* Header content */}
          <View style={styles.headerContent}>
            <Text style={styles.logoText}>Babysafe</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
                <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
                <FontAwesome5 name="user-circle" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Welcome message */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome, Parent
            </Text>
            <Text style={styles.welcomeSubtext}>
              Track your baby's growth and development
            </Text>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {['babies', 'events', 'growth', 'tips'].map((tab) => {
              const isActive = selectedTab === tab;
              let icon;
              let label;
              
              switch(tab) {
                case 'babies':
                  icon = <FontAwesome5 name="baby" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "My Babies";
                  break;
                case 'events':
                  icon = <MaterialIcons name="event-note" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "Events";
                  break;
                case 'growth':
                  icon = <MaterialIcons name="show-chart" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "Growth";
                  break;
                case 'tips':
                  icon = <MaterialIcons name="lightbulb" size={16} color={isActive ? colors.primary : '#FFFFFF'} />;
                  label = "Tips";
                  break;
                default:
                  break;
              }
              
              return (
                <TouchableOpacity 
                  key={tab}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => {
                    setSelectedTab(tab);
                    // Navigate to Growth screen when the growth tab is clicked
                    if (tab === 'growth') {
                      // Pass the first baby if available, otherwise null
                      navigation.navigate('Growth', { baby: babies.length > 0 ? babies[0] : null });
                    }
                  }}
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
      
      {/* Main content */}
      <View style={styles.contentContainer}>
        {selectedTab === 'babies' && (
          <>
            {babies.length === 0 ? (
              <EmptyState onAddBaby={() => setIsAddModalVisible(true)} />
            ) : (
              <>
                <View style={styles.babyListHeader}>
                  <Text style={styles.babyListTitle}>Your Babies</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setIsAddModalVisible(true)}
                  >
                    <Text style={styles.addButtonText}>Add Baby</Text>
                    <MaterialIcons name="add" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={babies}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <BabyCard 
                      baby={item} 
                      onPress={() => navigateToBabyDetails(item)}
                      onVaccinationPress={navigateToVaccinations} 
                    />
                  )}
                  contentContainerStyle={styles.babyList}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
          </>
        )}
        
        {selectedTab === 'events' && (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="event-note" size={64} color={colors.textDark} />
            <Text style={styles.placeholderText}>Events Calendar Coming Soon</Text>
            <Text style={styles.placeholderSubtext}>
              Keep track of vaccinations, doctor visits, and other important milestones
            </Text>
          </View>
        )}
        
      
        
        {selectedTab === 'tips' && (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="lightbulb" size={64} color={colors.textDark} />
            <Text style={styles.placeholderText}>Parenting Tips Coming Soon</Text>
            <Text style={styles.placeholderSubtext}>
              Get personalized advice and tips based on your baby's age and development
            </Text>
          </View>
        )}
      </View>

      {/* Add baby modal */}
      <AddBabyModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddBaby={handleAddBaby}
      />
    </View>
  );
}