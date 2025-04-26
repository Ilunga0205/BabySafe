import { StyleSheet, Platform, Dimensions } from 'react-native';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    width: '100%',  // Ensure full width
  },
  topImage: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#623131',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textGray,
    marginBottom: 30,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  // New button styles matching Register button
  signInButton: {
    backgroundColor: '#f2d2bf',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',  // Ensure full width
    marginBottom: 20,  // Add bottom margin
  },
  signInButtonText: {
    color: '#623131',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: colors.textGray,
    fontSize: 14,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  createAccountText: {
    color: colors.textGray,
    fontSize: 15,
  },
  createAccountLink: {
    color: '#623131',
    fontSize: 15,
    fontWeight: '600',
  },
});