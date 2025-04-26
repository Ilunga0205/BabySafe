import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const SignInPrompt = ({ onPress }) => {
  return (
    <View style={styles.signInContainer}>
      <Text style={styles.signInText}>Already have an account? </Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.signInLink}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signInText: {
    color: colors.textGray,
    fontSize: 15,
  },
  signInLink: {
    color: '#623131',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SignInPrompt;