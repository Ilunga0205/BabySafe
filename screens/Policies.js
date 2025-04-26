import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Policies({ navigation }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Function to check if user has scrolled to bottom
  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    // Use a platform-specific padding
    const paddingToBottom = Platform.OS === 'android' ? 50 : 20;
    
    if (layoutMeasurement.height + contentOffset.y >= 
        contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };
  
  // Function to handle explicit agreement
  const handleAgree = () => {
    if (hasScrolledToBottom) {
      setAccepted(true);
    } else {
      Alert.alert(
        "Please Read Our Policies",
        "You need to scroll through our terms and policies completely before agreeing.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };
  
  // Function to navigate after checking agreement
  const handleContinue = (screen) => {
    if (accepted) {
      navigation.navigate(screen);
    } else {
      Alert.alert(
        "Agreement Required",
        "You need to agree to our terms and policies before proceeding.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      {/* Platform-specific SafeAreaView wrapper */}
      <SafeAreaView style={{ flex: 0, backgroundColor: '#FFFFFF' }} />
      
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header with platform-specific adjustments */}
        <View style={[
          styles.header,
          Platform.OS === 'android' && { marginTop: StatusBar.currentHeight }
        ]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#623131" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Policies</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <MaterialIcons name="info-outline" size={24} color="#623131" />
          <Text style={styles.instructionText}>
            Please read and agree to our terms and policies before continuing
          </Text>
        </View>
        
        {/* Policy content */}
        <ScrollView 
          style={styles.scrollView}
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScroll}
        >
          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Terms & Conditions (T&C)</Text>
            <Text style={styles.updateDate}>Last updated: April 13, 2025</Text>
            
            <Text style={styles.subHeader}>Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to BabySafe! These Terms and Conditions govern your use of our mobile app. 
              By using the app, you agree to be bound by these terms.
            </Text>
            
            <Text style={styles.subHeader}>Eligibility</Text>
            <Text style={styles.paragraph}>
              You must be 18 years or older to use this app or have permission from a parent or guardian.
            </Text>
            
            <Text style={styles.subHeader}>Use of the App</Text>
            <Text style={styles.paragraph}>
              BabySafe is a health tracking and educational tool for parents and caregivers of babies. 
              It helps track growth, vaccination schedules, and developmental milestones. 
              It does not provide medical advice, diagnosis, or treatment.
            </Text>
            
            <Text style={styles.subHeader}>Prohibited Use</Text>
            <Text style={styles.paragraph}>You agree not to:</Text>
            <Text style={styles.bulletPoint}>• Use the app for any unlawful purposes.</Text>
            <Text style={styles.bulletPoint}>• Attempt to hack, disrupt, or misuse any part of the app.</Text>
            <Text style={styles.bulletPoint}>• Upload harmful content or violate another person's rights.</Text>
            
            <Text style={styles.subHeader}>Intellectual Property</Text>
            <Text style={styles.paragraph}>
              All content in the app, including logos, text, and images, is owned by BabySafe 
              and may not be reused without permission.
            </Text>
            
            <Text style={styles.subHeader}>Changes</Text>
            <Text style={styles.paragraph}>
              We may update these terms at any time. We'll notify users of major changes.
            </Text>
          </View>
          
          {/* Privacy Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Privacy Policy</Text>
            <Text style={styles.updateDate}>Last updated: April 13, 2025</Text>
            
            <Text style={styles.subHeader}>What We Collect</Text>
            <Text style={styles.bulletPoint}>• User account details (name, email, phone)</Text>
            <Text style={styles.bulletPoint}>• Baby profile information (name, DOB, gender)</Text>
            <Text style={styles.bulletPoint}>• App usage data (for improving performance)</Text>
            
            <Text style={styles.subHeader}>How We Use It</Text>
            <Text style={styles.bulletPoint}>• To personalize your experience.</Text>
            <Text style={styles.bulletPoint}>• To send you vaccine reminders or health tips.</Text>
            <Text style={styles.bulletPoint}>• To improve and develop the app.</Text>
            
            <Text style={styles.subHeader}>Data Protection</Text>
            <Text style={styles.paragraph}>
              All sensitive data is encrypted. We will never sell or share your data with third 
              parties without your consent. Firebase and Expo may collect usage data according 
              to their own privacy policies.
            </Text>
            
            <Text style={styles.subHeader}>Children's Privacy</Text>
            <Text style={styles.paragraph}>
              The app is intended for use by parents or guardians — not by children directly.
            </Text>
            
            <Text style={styles.subHeader}>Your Rights</Text>
            <Text style={styles.paragraph}>You may:</Text>
            <Text style={styles.bulletPoint}>• Request access to your data.</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your data.</Text>
            <Text style={styles.bulletPoint}>• Opt-out of notifications or marketing.</Text>
            <Text style={styles.paragraph}>Contact us: support@babysafe.app</Text>
          </View>
          
          {/* Medical Disclaimer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Medical Disclaimer</Text>
            <Text style={styles.importantText}>
              Important: BabySafe does not provide medical advice. All information in the app is for 
              informational and educational purposes only and is not a substitute for professional 
              medical advice, diagnosis, or treatment.
            </Text>
            <Text style={styles.paragraph}>
              Always seek the advice of your doctor or qualified health provider with any 
              questions you may have about a medical condition.
            </Text>
            <Text style={styles.paragraph}>
              In case of emergency, contact your healthcare provider or nearest clinic immediately.
            </Text>
          </View>
          
          {/* Bottom padding to ensure scrollability */}
          <View style={{ height: 100 }} />
        </ScrollView>
        
        {/* Agreement button */}
        <View style={styles.agreementContainer}>
          {!accepted ? (
            <TouchableOpacity 
              style={[
                styles.agreeButton, 
                !hasScrolledToBottom && styles.disabledButton
              ]}
              onPress={handleAgree}
              activeOpacity={hasScrolledToBottom ? 0.8 : 1}
            >
              <MaterialIcons 
                name={accepted ? "check-circle" : "check-circle-outline"} 
                size={24} 
                color={hasScrolledToBottom ? "#623131" : "#999999"} 
              />
              <Text style={[
                styles.agreeButtonText,
                !hasScrolledToBottom && styles.disabledButtonText
              ]}>
                I Agree to Terms & Policies
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.acceptanceIndicator}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.acceptanceText}>
                Thank you for agreeing to our policies
              </Text>
            </View>
          )}
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton, !accepted && styles.disabledButton]}
            onPress={() => handleContinue('Register')}
            activeOpacity={accepted ? 0.8 : 1}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.signInButton, !accepted && styles.disabledButton]}
            onPress={() => handleContinue('SignIn')}
            activeOpacity={accepted ? 0.8 : 1}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#623131',
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0D0',
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#623131',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#623131',
    marginBottom: 8,
  },
  updateDate: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444444',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
    color: '#444444',
    marginBottom: 4,
  },
  importantText: {
    fontWeight: '500',
    color: '#D32F2F',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  agreementContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
  },
  agreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  agreeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#623131',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
  acceptanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  acceptanceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  registerButton: {
    backgroundColor: '#f2d2bf',
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#f2d2bf',
  },
  buttonText: {
    color: '#623131',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signInButtonText: {
    color: '#623131',
    fontWeight: 'bold',
    fontSize: 16,
  },
});