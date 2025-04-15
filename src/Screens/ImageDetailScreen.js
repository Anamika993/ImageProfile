import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '~/utils/ApiService';
import { useRoute } from '@react-navigation/native';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

const ImageDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { image } = route.params;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    user_image: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Valid 10-digit phone number is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };
  const createFormData = () => {
    const data = new FormData();

    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('user_image', {
      uri: image,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    return data;
  };

  const submitForm = useMutation({
    mutationFn: async (requestData) => {
      console.log('Submitting data to server');

      fetcher({
        method: 'post',
        url: '/savedata.php',
        data: requestData,
      });
    },
    onSuccess: (data) => {
      console.log('Form submission successful:', data);
      Alert.alert('Success', 'User has been saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error) => {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'There was an error submitting your information. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (validateForm()) {
      const data = createFormData();
      submitForm.mutate(data);
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.detailImage} resizeMode="cover" />

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Submit Your Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(text) => handleChange('firstName', text)}
            placeholder="Enter your first name"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(text) => handleChange('lastName', text)}
            placeholder="Enter your last name"
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Enter your 10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitForm.isLoading}>
          {submitForm.isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailImage: {
    width: '100%',
    height: 300,
    marginBottom: responsiveHeight(2),
  },
  formContainer: {
    padding: responsiveWidth(3),
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: responsiveHeight(2),
  },
  inputGroup: {
    marginBottom: responsiveHeight(1),
  },
  label: {
    fontSize: 18,
    marginBottom: responsiveHeight(1),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#FF8A05',
    padding: responsiveWidth(4),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: responsiveHeight(2),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ImageDetailScreen;
