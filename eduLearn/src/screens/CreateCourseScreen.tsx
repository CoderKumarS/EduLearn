import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { Input } from '../components/Input';
import { courseService } from '../services/courseService';
import { handleApiError } from '../utils/errorHandler';

interface CreateCourseScreenProps {
  onNavigateBack: () => void;
  onCourseCreated: () => void;
}

interface CourseFormData {
  title: string;
  description: string;
}

interface CourseFormErrors {
  title?: string;
  description?: string;
}

export const CreateCourseScreen: React.FC<CreateCourseScreenProps> = ({
  onNavigateBack,
  onCourseCreated,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: CourseFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Course title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Course description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateCourse = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await courseService.createCourse({
        title: formData.title,
        description: formData.description,
        instructor: {
          id: authState.user!.id,
          username: authState.user!.username,
        },
      });
      
      Alert.alert(
        'Success',
        'Course created successfully!',
        [{ text: 'OK', onPress: onCourseCreated }]
      );
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onNavigateBack}
            size="small"
          />
          <ThemedText style={styles.headerTitle}>Create Course</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Form */}
            <View style={styles.form}>
              <Input
                label="Course Title"
                placeholder="Enter course title"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                error={errors.title}
                autoCapitalize="words"
              />

              <View style={styles.descriptionContainer}>
                <ThemedText style={styles.descriptionLabel}>
                  Course Description
                </ThemedText>
                <Input
                  placeholder="Enter course description"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  error={errors.description}
                  multiline
                  numberOfLines={6}
                  style={styles.descriptionInput}
                />
              </View>

              <View style={styles.infoSection}>
                <ThemedText style={styles.infoTitle}>Course Information</ThemedText>
                <ThemedText variant="secondary" style={styles.infoText}>
                  • Students will be able to enroll in your course
                </ThemedText>
                <ThemedText variant="secondary" style={styles.infoText}>
                  • You can add quizzes and track student progress
                </ThemedText>
                <ThemedText variant="secondary" style={styles.infoText}>
                  • Course content can be updated anytime
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </ScrollView>

        {/* Create Button */}
        <View style={[styles.buttonContainer, { backgroundColor: theme.colors.card }]}>
          <Button
            title="Create Course"
            onPress={handleCreateCourse}
            loading={loading}
            style={styles.createButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 20,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButton: {
    marginBottom: 8,
  },
});