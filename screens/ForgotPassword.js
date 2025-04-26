import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Keyboard,
  Animated,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

// Custom components
import Header from '../components/Register/Header';
import FormInput from '../components/Register/FormInput';
import CustomButton from '../components/CustomButton';

// Constants and styles
import colors from '../constants/colors';
import styles from './styles/ForgotPasswordStyles';

export default function ForgotPassword({ navigation }) {
  // Form state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Validation state
  const [errors, setErrors] = useState({
    email: '',
  });
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    Shrikhand: require('../assets/fonts/Shrikhand-Regular.ttf'),
  });
  
  useEffect(() => {
    // Animate content on mount
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
    
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // Cleanup
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Input validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
    };
    
    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission
  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      try {
        // For demo purposes, simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success state
        setResetSent(true);
      } catch (error) {
        Alert.alert(
          "Password Reset Failed",
          "We couldn't process your request. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Return to sign in
  const handleBackToSignIn = () => {
    navigation.navigate('SignIn');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <Header
            title="Babysafe"
            onBackPress={() => navigation.goBack()}
          />

          {/* Forgot Password form */}
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            {/* Decorative top image */}
            <Image 
              source={require('../assets/babysafe_logo.png')} 
              style={styles.topImage}
              resizeMode="contain"
            />
            
            <Text style={styles.titleText}>Forgot Password</Text>
            
            {!resetSent ? (
              <>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password
                </Text>

                {/* Form fields */}
                <FormInput
                  icon="email"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Reset Password button */}
                <CustomButton
                  title="Send Reset Link"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={styles.resetButton}
                  textStyle={styles.resetButtonText}
                />
              </>
            ) : (
              // Success state
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successMessage}>
                  We've sent a password reset link to {email}. Please check your inbox and follow 
                  the instructions to reset your password.
                </Text>
                <CustomButton
                  title="Back to Sign In"
                  onPress={handleBackToSignIn}
                  style={styles.resetButton}
                  textStyle={styles.resetButtonText}
                />
              </View>
            )}

            {/* Return to Sign In link */}
            {!resetSent && (
              <TouchableOpacity 
                style={styles.signInContainer}
                onPress={handleBackToSignIn}
              >
                <Text style={styles.signInText}>Remember your password? </Text>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            )}
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}