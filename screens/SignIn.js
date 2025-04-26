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
import SocialLogin from '../components/Register/SocialLogin';

// Constants and styles
import colors from '../constants/colors';
import styles from './styles/Signinstyles';

export default function SignIn({ navigation }) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Validation state
  const [errors, setErrors] = useState({
    email: '',
    password: ''
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
      password: ''
    };
    
    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission
  const handleSignIn = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      try {
        // For demo purposes, simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate to main app screen on success
        navigation.navigate('Home'); // or whatever your main screen is
      } catch (error) {
        Alert.alert(
          "Sign In Failed",
          "Invalid email or password. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Forgot password handler
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword'); // Create this screen later if needed
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

          {/* Sign In form */}
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
            
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Babysafe</Text>

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

            <FormInput
              icon="lock"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={secureTextEntry}
              toggleSecureEntry={() => setSecureTextEntry(!secureTextEntry)}
              autoCapitalize="none"
            />

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In button - Fixed styling */}
            <CustomButton
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.signInButton}  // Added custom style
              textStyle={styles.signInButtonText}  // Added custom text style
            />

            {/* Social login options */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or sign in with</Text>
              <View style={styles.divider} />
            </View>

            <SocialLogin />

            {/* Create account link */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.createAccountLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}