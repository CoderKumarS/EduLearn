import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { Input } from '../components/Input';
import { Picker, PickerOption } from '../components/Picker';
import { ChapterItem } from '../components/ChapterItem';
import { courseService } from '../services/courseService';
import { handleApiError } from '../utils/errorHandler';
import { Chapter } from '../types/course';

interface CreateCourseScreenProps {
  onNavigateBack: () => void;
  onCourseCreated: () => void;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  duration: string;
}

interface CourseFormErrors {
  title?: string;
  description?: string;
  category?: string;
  duration?: string;
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
    category: '',
    duration: '',
  });

  const [errors, setErrors] = useState<CourseFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [isAddChapterModalVisible, setIsAddChapterModalVisible] = useState(false);
  const [newChapterData, setNewChapterData] = useState({
    title: '',
    contentType: 'video' as 'video' | 'reading' | 'quiz',
    duration: '',
  });
  const [newChapterErrors, setNewChapterErrors] = useState<{
    title?: string;
    duration?: string;
  }>({});

  // Category options
  const categoryOptions: PickerOption[] = [
    { label: 'AI & ML', value: 'ai-ml' },
    { label: 'Programming', value: 'programming' },
    { label: 'Data Science', value: 'data-science' },
    { label: 'Web Development', value: 'web-development' },
    { label: 'Mobile Development', value: 'mobile-development' },
    { label: 'Cloud Computing', value: 'cloud-computing' },
    { label: 'Cybersecurity', value: 'cybersecurity' },
    { label: 'Other', value: 'other' },
  ];

  // Content type options
  const contentTypeOptions: PickerOption[] = [
    { label: 'Video', value: 'video' },
    { label: 'Reading', value: 'reading' },
    { label: 'Quiz', value: 'quiz' },
  ];

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

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Estimated duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
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

  const handleToggleChapter = (chapterId: string) => {
    setExpandedChapterId(expandedChapterId === chapterId ? null : chapterId);
  };

  const handleEditChapter = (chapterId: string) => {
    Alert.alert('Edit Chapter', `Edit chapter ${chapterId}`);
    // TODO: Implement edit chapter functionality
  };

  const handleDeleteChapter = (chapterId: string) => {
    Alert.alert(
      'Delete Chapter',
      'Are you sure you want to delete this chapter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
          },
        },
      ]
    );
  };

  const handleOpenAddChapterModal = () => {
    setNewChapterData({
      title: '',
      contentType: 'video',
      duration: '',
    });
    setNewChapterErrors({});
    setIsAddChapterModalVisible(true);
  };

  const validateNewChapter = (): boolean => {
    const errors: { title?: string; duration?: string } = {};

    if (!newChapterData.title.trim()) {
      errors.title = 'Chapter title is required';
    }

    if (!newChapterData.duration.trim()) {
      errors.duration = 'Duration is required';
    }

    setNewChapterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddChapter = () => {
    if (!validateNewChapter()) {
      return;
    }

    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      courseId: '', // Will be set when course is created
      number: chapters.length + 1,
      title: newChapterData.title,
      contentType: newChapterData.contentType,
      duration: newChapterData.duration,
    };

    setChapters(prev => [...prev, newChapter]);
    setIsAddChapterModalVisible(false);
    setNewChapterData({
      title: '',
      contentType: 'video',
      duration: '',
    });
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
        category: formData.category,
        duration: Number(formData.duration),
        instructor: {
          id: authState.user!.id,
          username: authState.user!.username,
        },
        chapters: chapters,
        status: 'draft',
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
            {/* Course Details Section */}
            <View style={styles.form}>
              <ThemedText style={styles.sectionTitle}>Course Details</ThemedText>

              <Input
                label="Course Title"
                placeholder="Enter course title"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                error={errors.title}
                autoCapitalize="words"
              />

              <View style={styles.descriptionContainer}>
                <Input
                  label="Course Description"
                  placeholder="Enter course description"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  error={errors.description}
                  multiline
                  numberOfLines={6}
                  style={styles.descriptionInput}
                />
              </View>

              <Picker
                label="Category"
                placeholder="Select a category"
                value={formData.category}
                options={categoryOptions}
                onValueChange={(value) => handleInputChange('category', value)}
                error={errors.category}
              />

              <Input
                label="Estimated Duration (hours)"
                placeholder="e.g., 10"
                value={formData.duration}
                onChangeText={(value) => handleInputChange('duration', value)}
                error={errors.duration}
                keyboardType="numeric"
              />
            </View>

            {/* Course Chapters Section */}
            <View style={styles.chaptersSection}>
              <ThemedText style={styles.sectionTitle}>Course Chapters</ThemedText>

              {chapters.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
                  <ThemedText variant="secondary" style={styles.emptyStateText}>
                    No chapters added yet. Add your first chapter to get started.
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.chaptersList}>
                  {chapters.map((chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapterNumber={chapter.number}
                      title={chapter.title}
                      contentType={chapter.contentType}
                      duration={chapter.duration}
                      isExpanded={expandedChapterId === chapter.id}
                      onToggle={() => handleToggleChapter(chapter.id)}
                      onEdit={() => handleEditChapter(chapter.id)}
                      onDelete={() => handleDeleteChapter(chapter.id)}
                    >
                      {/* Manage Content Section */}
                      <View style={styles.manageContent}>
                        <ThemedText style={styles.manageContentTitle}>
                          Manage Content
                        </ThemedText>

                        <View style={styles.contentTypeSelector}>
                          <ThemedText variant="secondary" style={styles.contentTypeLabel}>
                            Content Type: {chapter.contentType.charAt(0).toUpperCase() + chapter.contentType.slice(1)}
                          </ThemedText>
                        </View>

                        {chapter.contentType === 'video' && (
                          <View style={styles.videoSection}>
                            <Input
                              label="Video URL"
                              placeholder="Enter video URL or upload"
                              value={chapter.videoUrl || ''}
                              onChangeText={(value) => {
                                setChapters(prev =>
                                  prev.map(ch =>
                                    ch.id === chapter.id
                                      ? { ...ch, videoUrl: value }
                                      : ch
                                  )
                                );
                              }}
                            />
                            <Button
                              title="Upload Video"
                              variant="outline"
                              onPress={() => Alert.alert('Upload Video', 'Video upload functionality')}
                              style={styles.uploadButton}
                            />
                          </View>
                        )}

                        {chapter.contentType === 'reading' && (
                          <View style={styles.readingSection}>
                            <Input
                              label="Reading Content"
                              placeholder="Enter reading content"
                              value={chapter.readingContent || ''}
                              onChangeText={(value) => {
                                setChapters(prev =>
                                  prev.map(ch =>
                                    ch.id === chapter.id
                                      ? { ...ch, readingContent: value }
                                      : ch
                                  )
                                );
                              }}
                              multiline
                              numberOfLines={6}
                              style={styles.descriptionInput}
                            />
                          </View>
                        )}

                        {chapter.contentType === 'quiz' && (
                          <View style={styles.quizSection}>
                            <ThemedText variant="secondary">
                              Quiz content will be managed separately
                            </ThemedText>
                            <Button
                              title="Manage Quiz"
                              variant="outline"
                              onPress={() => Alert.alert('Manage Quiz', 'Quiz management functionality')}
                              style={styles.uploadButton}
                            />
                          </View>
                        )}
                      </View>
                    </ChapterItem>
                  ))}
                </View>
              )}

              <Button
                title="Add New Chapter"
                variant="outline"
                onPress={handleOpenAddChapterModal}
                style={styles.addChapterButton}
              />
            </View>
          </ThemedView>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.buttonContainer, { backgroundColor: theme.colors.card }]}>
          <Button
            title="Save Course"
            onPress={handleCreateCourse}
            loading={loading}
            style={styles.createButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Add Chapter Modal */}
      <Modal
        visible={isAddChapterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddChapterModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsAddChapterModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardAvoid}
              >
                <View
                  style={[
                    styles.modalContent,
                    {
                      backgroundColor: theme.colors.card,
                      borderRadius: theme.borderRadius.lg,
                    },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Add New Chapter</ThemedText>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={() => setIsAddChapterModalVisible(false)}
                      size="small"
                    />
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <Input
                      label="Chapter Title"
                      placeholder="Enter chapter title"
                      value={newChapterData.title}
                      onChangeText={(value) => {
                        setNewChapterData(prev => ({ ...prev, title: value }));
                        if (newChapterErrors.title) {
                          setNewChapterErrors(prev => ({ ...prev, title: undefined }));
                        }
                      }}
                      error={newChapterErrors.title}
                      autoCapitalize="words"
                    />

                    <Picker
                      label="Content Type"
                      placeholder="Select content type"
                      value={newChapterData.contentType}
                      options={contentTypeOptions}
                      onValueChange={(value) =>
                        setNewChapterData(prev => ({
                          ...prev,
                          contentType: value as 'video' | 'reading' | 'quiz',
                        }))
                      }
                    />

                    <Input
                      label="Duration"
                      placeholder="e.g., 15 min"
                      value={newChapterData.duration}
                      onChangeText={(value) => {
                        setNewChapterData(prev => ({ ...prev, duration: value }));
                        if (newChapterErrors.duration) {
                          setNewChapterErrors(prev => ({ ...prev, duration: undefined }));
                        }
                      }}
                      error={newChapterErrors.duration}
                    />
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Button
                      title="Add Chapter"
                      onPress={handleAddChapter}
                      style={styles.addButton}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 0,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chaptersSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chaptersList: {
    marginTop: 8,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
  },
  manageContent: {
    paddingTop: 8,
  },
  manageContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contentTypeSelector: {
    marginBottom: 16,
  },
  contentTypeLabel: {
    fontSize: 14,
  },
  videoSection: {
    marginTop: 8,
  },
  readingSection: {
    marginTop: 8,
  },
  quizSection: {
    marginTop: 8,
  },
  uploadButton: {
    marginTop: 8,
  },
  addChapterButton: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addButton: {
    marginBottom: 0,
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