import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const Header = ({ title, onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
      >
        <MaterialIcons name="arrow-back-ios" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <Text style={styles.logoText}>{title}</Text>
      
      <View style={styles.placeholderView} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  logoText: {
    fontFamily: 'Shrikhand',
    fontSize: 22,
    color: '#623131',
  },
  placeholderView: {
    width: 40, // To balance the header layout
  },
});

export default Header;