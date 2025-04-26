import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const FormInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  toggleSecureEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  return (
    <>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <MaterialIcons name={icon} size={20} color={colors.textGray} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {toggleSecureEntry && (
          <TouchableOpacity style={styles.eyeIcon} onPress={toggleSecureEntry}>
            <MaterialIcons
              name={secureTextEntry ? "visibility" : "visibility-off"}
              size={22}
              color={colors.textGray}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textDark,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 8,
  },
});

export default FormInput;