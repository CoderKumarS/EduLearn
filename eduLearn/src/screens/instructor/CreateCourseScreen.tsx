import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { Picker } from '../../components/common/Picker';
import { courseService } from '../../services/courseService';
import { handleApiError } from '../../utils/errorHandler';

interface CreateCourseScreenProps {
  onNavigateBack: () => void;
  onCourseCreated: (courseId: number) => void;
}

export const CreateCourseScreen: React.FC<CreateCourseScreenProps> = ({
  onNavigateBack,
  onCourseCreated,
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [price, setPrice] = useState('0');
  const [isFree, setIsFree] = useState(true);
  const [durationHours, setDurationHours] = useState('0');
  const [creating, setCreating] = useState(false);

  const categories = [
    'Programming',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Business',
    'Marketing',
  ];

  const difficultyLevels = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a course description');
      return;
    }

    setCreating(true);
    try {
      const newCourse = await courseService.createCourse({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty_level: difficultyLevel,
        price: isFree ? '0.00' : price,
        is_free: isFree,
        duration_hours: parseInt(durationHours) || 0,
        is_published: false,
      });

      Alert.alert('Success', 'Course created successfully!', [
        {
          text: 'OK',
          onPress: () => onCourseCreated(newCourse.id),
        },
      ]);
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create New Course</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Course Information</ThemedText>

            <ThemedText style={styles.label}>Title *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter course title"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <ThemedText style={styles.label}>Description *</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter course description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />

            <ThemedText style={styles.label}>Category</ThemedText>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              items={categories.map(cat => ({ label: cat, value: cat }))}
            />

            <ThemedText style={styles.label}>Difficulty Level</ThemedText>
            <Picker
              selectedValue={difficultyLevel}
              onValueChange={setDifficultyLevel}
              items={difficultyLevels}
            />

            <ThemedText style={styles.label}>Duration (hours)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              value={durationHours}
              onChangeText={setDurationHours}
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsFree(!isFree)}
              >
                <Ionicons
                  name={isFree ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={theme.colors.primary}
                />
                <ThemedText style={styles.checkboxLabel}>Free Course</ThemedText>
              </TouchableOpacity>
            </View>

            {!isFree && (
              <>
                <ThemedText style={styles.label}>Price ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onNavigateBack}
              style={[styles.button, { backgroundColor: theme.colors.surface }]}
            />
            <Button
              title="Create Course"
              onPress={handleCreate}
              loading={creating}
              style={styles.button}
            />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    marginTop: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
