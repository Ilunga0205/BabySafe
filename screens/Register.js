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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

// Custom components
import Header from '../components/Register/Header';
import FormInput from '../components/Register/FormInput';
import CustomButton from '../components/CustomButton';
import SocialLogin from '../components/Register/SocialLogin';
import SignInPrompt from '../components/Register/SignInPrompt';

// Constants and styles
import colors from '../constants/colors';
import styles from './styles/Registerstyles';

export default function Register({ navigation }) {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Validation state
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
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
  
  const validatePassword = (password) => {
    return password.length >= 8;
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    // Validate full name
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
      isValid = false;
    }
    
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
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission
  const handleRegister = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      try {
        // For demo purposes, simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Navigate to next screen on success
        navigation.navigate('NameYourBaby');
      } catch (error) {
        Alert.alert(
          "Registration Failed",
          "There was a problem creating your account. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    }
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

          {/* Registration form */}
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
            
            <Text style={styles.welcomeText}>Join Babysafe</Text>
            <Text style={styles.subtitle}>Create an account to ensure your baby's safety</Text>

            {/* Form fields */}
            <FormInput
              icon="person"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
            />

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

            <FormInput
              icon="lock"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry={confirmSecureTextEntry}
              toggleSecureEntry={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
              autoCapitalize="none"
            />

            {/* Register button */}
            <CustomButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
            />

            {/* Social login options */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.divider} />
            </View>

            <SocialLogin />

            {/* Sign in link */}
            <SignInPrompt 
              onPress={() => navigation.navigate('SignIn')} 
            />
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}