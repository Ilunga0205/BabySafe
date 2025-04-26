import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import colors from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// More engaging and descriptive content
const slides = [
  {
    key: '1',
    image: require('../assets/picture1.png'),
    title: 'Track Growth',
    caption: 'Monitor your baby\'s growth milestones with beautiful charts and personalized insights.',
    backgroundColor: '#FFE8E8',
  },
  {
    key: '2',
    image: require('../assets/picture2.png'),
    title: 'Health Diary',
    caption: 'Log health data, doctor visits, and medications all in one secure place.',
    backgroundColor: '#E8F8F8',
  },
  {
    key: '3',
    image: require('../assets/picture3.png'),
    title: 'Smart Tips',
    caption: 'Receive customized parenting tips and timely reminders based on your baby\'s age.',
    backgroundColor: '#FFF2E6',
  },
  {
    key: '4',
    image: require('../assets/picture1.png'),
    title: 'Parent Community',
    caption: 'Connect with other parents, share experiences, and get advice from experts.',
    backgroundColor: '#E6F0FF',
  },
  {
    key: '5',
    image: require('../assets/picture2.png'),
    title: 'All-in-One Solution',
    caption: 'Everything you need for your parenting journey, beautifully organized in one app.',
    backgroundColor: '#F0E6FF',
  },
];

export default function Welcome({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const skipAnimValue = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    Shrikhand: require('../assets/fonts/Shrikhand-Regular.ttf'),
  });
  
  // Trigger animation when currentIndex changes
  useEffect(() => {
    // Start with fade out and move up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Reset position below and fade back in
      translateY.setValue(20);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, [currentIndex]);

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ 
        index: currentIndex + 1,
        animated: true
      });
    }
  };

  // Enhanced skip functionality with cool animation
  const handleSkip = () => {
    // Start with a zoom out animation
    skipAnimValue.setValue(0);
    
    // Create a sequence of animations
    Animated.sequence([
      // First zoom out slightly
      Animated.timing(skipAnimValue, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      // Then zoom in more dramatically
      Animated.timing(skipAnimValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Start scrolling to last slide after short delay
    setTimeout(() => {
      flatListRef.current.scrollToIndex({ 
        index: slides.length - 1,
        animated: true 
      });
    }, 250);
  };

  // Animation interpolations for skip effect
  const skipZoom = skipAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1.05] // First zoom out, then zoom in
  });

  // Get current background color
  const backgroundColor = scrollX.interpolate({
    inputRange: slides.map((_, i) => i * width),
    outputRange: slides.map(slide => slide.backgroundColor),
    extrapolate: 'clamp'
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: backgroundColor }
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="transparent"
          translucent
        />
        
        {/* App logo and branding */}
        <View style={[styles.header, Platform.OS === 'android' ? { marginTop: StatusBar.currentHeight } : {}]}>
          <Text style={styles.logoText}>BabySafe</Text>
        </View>

        {/* Onboarding slides */}
        <Animated.FlatList
          data={slides}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          ref={flatListRef}
          keyExtractor={(item) => item.key}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            // Calculate scale and opacity for the carousel effect
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            const imageScale = scrollX.interpolate({
              inputRange,
              outputRange: [0.85, 1, 0.85],
              extrapolate: 'clamp'
            });

            return (
              <View style={styles.slide}>
                <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
                  <Image source={item.image} style={styles.image} resizeMode="contain" />
                </Animated.View>
                
                {/* Text content with animation */}
                <Animated.View style={[
                  styles.textContent,
                  { opacity: fadeAnim, transform: [{ translateY }] }
                ]}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.caption}>{item.caption}</Text>
                </Animated.View>
              </View>
            );
          }}
        />

        {/* Enhanced pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            
            // Animate dot width for current slide
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp'
            });
            
            // Animate dot opacity
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth,
                    opacity,
                    backgroundColor: index === currentIndex ? '#623131' : colors.border
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {currentIndex === slides.length - 1 ? (
            <View style={styles.finalButtons}>
              <TouchableOpacity 
                style={styles.startButton} 
                onPress={() => navigation.navigate('Policies')}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextText}>Next</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#623131" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontFamily: 'Shrikhand',
    fontSize: 28,
    color: '#623131',
    letterSpacing: 0.5,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: 'transparent', // Ensure transparency for Android
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#623131',
    marginBottom: 16,
    textAlign: 'center',
  },
  caption: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5c5c5c',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  footer: {
    paddingHorizontal: 24,
    marginBottom: 40,
    marginTop: 20,
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#5c5c5c',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  nextText: {
    color: '#623131',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  finalButtons: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#f2d2bf',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    elevation: Platform.OS === 'android' ? 3 : 0, // Add elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  startButtonText: { 
    color: '#623131', 
    fontWeight: 'bold',
    fontSize: 18,
  },
});