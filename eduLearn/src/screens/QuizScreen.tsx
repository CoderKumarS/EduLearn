import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';
import { courseService } from '../services/courseService';
import { Quiz, Question, Option, QuizSubmission } from '../types/course';
import { handleApiError } from '../utils/errorHandler';

interface QuizScreenProps {
  quizId: string;
  onNavigateBack: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  quizId,
  onNavigateBack,
}) => {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (quizStarted && timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted]);

  const loadQuizData = async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        courseService.getQuiz(quizId),
        courseService.getQuestions(),
      ]);
      
      setQuiz(quizData);
      // Filter questions for this quiz
      const quizQuestions = questionsData.filter(q => q.quiz === quizId);
      setQuestions(quizQuestions);
      setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !selectedAnswers[q.id]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unansweredQuestions.length} unanswered questions. Submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitQuiz },
        ]
      );
      return;
    }

    submitQuiz();
  };

  const submitQuiz = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const submission: QuizSubmission = {
        quiz_id: quiz.id,
        answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
          question: questionId,
          selected_option: optionId,
        })),
      };

      const result = await courseService.submitQuiz(submission);
      
      Alert.alert(
        'Quiz Submitted!',
        `Your score: ${result.score}%\n${result.message}`,
        [{ text: 'OK', onPress: onNavigateBack }]
      );
    } catch (error) {
      const apiError = handleApiError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading quiz...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <ThemedText>Quiz not found.</ThemedText>
          <Button title="Go Back" onPress={onNavigateBack} />
        </View>
      </SafeAreaView>
    );
  }

  if (!quizStarted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.content}>
          <View style={styles.quizIntro}>
            <ThemedText style={styles.quizTitle}>{quiz.title}</ThemedText>
            
            <View style={[styles.quizInfo, { backgroundColor: theme.colors.card }]}>
              <ThemedText style={styles.infoTitle}>Quiz Information</ThemedText>
              <ThemedText style={styles.infoItem}>
                Questions: {questions.length}
              </ThemedText>
              <ThemedText style={styles.infoItem}>
                Time Limit: {quiz.time_limit} minutes
              </ThemedText>
              <ThemedText style={styles.infoItem}>
                Type: Multiple Choice
              </ThemedText>
            </View>

            <View style={styles.instructions}>
              <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
              <ThemedText style={styles.instructionItem}>
                • Answer all questions to the best of your ability
              </ThemedText>
              <ThemedText style={styles.instructionItem}>
                • You can change your answers before submitting
              </ThemedText>
              <ThemedText style={styles.instructionItem}>
                • The quiz will auto-submit when time runs out
              </ThemedText>
              <ThemedText style={styles.instructionItem}>
                • Make sure you have a stable internet connection
              </ThemedText>
            </View>

            <View style={styles.startButtonContainer}>
              <Button
                title="Start Quiz"
                onPress={startQuiz}
                style={styles.startButton}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={onNavigateBack}
                style={styles.cancelButton}
              />
            </View>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Quiz Header */}
      <View style={[styles.quizHeader, { backgroundColor: theme.colors.card }]}>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.headerTitle}>{quiz.title}</ThemedText>
          <ThemedText variant="secondary" style={styles.headerSubtitle}>
            Question {Object.keys(selectedAnswers).length} of {questions.length}
          </ThemedText>
        </View>
        
        <View style={styles.timerContainer}>
          <ThemedText style={[
            styles.timer,
            { color: timeLeft < 300 ? theme.colors.error : theme.colors.text }
          ]}>
            {formatTime(timeLeft)}
          </ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: theme.colors.primary,
              width: `${getProgressPercentage()}%`,
            }
          ]}
        />
      </View>

      {/* Questions */}
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.questionsContainer}>
          {questions.map((question, index) => (
            <View
              key={question.id}
              style={[styles.questionCard, { backgroundColor: theme.colors.card }]}
            >
              <ThemedText style={styles.questionNumber}>
                Question {index + 1}
              </ThemedText>
              <ThemedText style={styles.questionText}>
                {question.text}
              </ThemedText>

              <View style={styles.optionsContainer}>
                {question.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedAnswers[question.id] === option.id
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => handleAnswerSelect(question.id, option.id)}
                  >
                    <ThemedText style={[
                      styles.optionText,
                      {
                        color: selectedAnswers[question.id] === option.id
                          ? '#FFFFFF'
                          : theme.colors.text
                      }
                    ]}>
                      {option.text}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ThemedView>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { backgroundColor: theme.colors.card }]}>
        <Button
          title="Submit Quiz"
          onPress={handleSubmitQuiz}
          loading={submitting}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quizIntro: {
    flex: 1,
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  quizInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  instructions: {
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  startButtonContainer: {
    gap: 12,
  },
  startButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  questionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 20,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  submitButton: {
    marginBottom: 8,
  },
});