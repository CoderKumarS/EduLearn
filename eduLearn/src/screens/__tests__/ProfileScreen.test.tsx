import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../ProfileScreen';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { profileService } from '../../services/profileService';

// Mock the services
jest.mock('../../services/profileService');
jest.mock('../../services/authService');

const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student' as const,
};

const mockStats = {
    coursesEnrolled: 5,
    coursesCompleted: 3,
    totalLearningTime: 120,
    averageScore: 85,
    streak: 7,
    achievements: [],
};

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <NavigationContainer>
            <ThemeProvider>
                <AuthProvider>{component}</AuthProvider>
            </ThemeProvider>
        </NavigationContainer>
    );
};

describe('ProfileScreen Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (profileService.getUserStats as jest.Mock).mockResolvedValue(mockStats);
    });

    it('displays user statistics after loading', async () => {
        const { getByText } = renderWithProviders(<ProfileScreen />);

        await waitFor(() => {
            expect(getByText('5')).toBeTruthy();
            expect(getByText('3')).toBeTruthy();
            expect(getByText('7 days')).toBeTruthy();
        });
    });

    it('handles profile edit flow correctly', async () => {
        const { getByText, getByPlaceholderText } = renderWithProviders(<ProfileScreen />);

        // Click edit button
        const editButton = getByText('Edit');
        fireEvent.press(editButton);

        // Verify edit mode is active
        await waitFor(() => {
            expect(getByPlaceholderText('Enter your name')).toBeTruthy();
        });

        // Click cancel
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);

        // Verify edit mode is closed
        await waitFor(() => {
            expect(getByText('Edit')).toBeTruthy();
        });
    });

    it('validates email format during edit', async () => {
        (profileService.updateUserProfile as jest.Mock).mockResolvedValue({});

        const { getByText, getByPlaceholderText } = renderWithProviders(<ProfileScreen />);

        // Enter edit mode
        fireEvent.press(getByText('Edit'));

        await waitFor(() => {
            const emailInput = getByPlaceholderText('Enter your email');
            fireEvent.changeText(emailInput, 'invalid-email');
        });

        // Verify error message appears
        await waitFor(() => {
            expect(getByText('Please enter a valid email address')).toBeTruthy();
        });
    });

    it('refreshes data on pull-to-refresh', async () => {
        const { getByTestId } = renderWithProviders(<ProfileScreen />);

        // Trigger refresh
        const scrollView = getByTestId('profile-scroll-view');
        fireEvent(scrollView, 'refresh');

        await waitFor(() => {
            expect(profileService.getUserStats).toHaveBeenCalledTimes(2); // Initial + refresh
        });
    });
});
