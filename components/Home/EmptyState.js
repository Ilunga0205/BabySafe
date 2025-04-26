import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const EmptyState = ({ onAddBaby }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/picture1.png')}
        style={styles.image}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>No babies added yet</Text>
      
      <Text style={styles.description}>
        Add your baby's information to start tracking their growth, vaccinations, and milestones.
      </Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onAddBaby}
      >
        <Text style={styles.addButtonText}>Add Your Baby</Text>
        <MaterialIcons name="" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  image: {
    width: '80%',
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textGray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#623131',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default EmptyState;