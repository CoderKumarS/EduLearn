import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileHeader } from '../ProfileHeader';
import { ThemeProvider } from '../../contexts/ThemeContext';

const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student' as const,
};

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ProfileHeader', () => {
    it('renders user information correctly', () => {
        const { getByText } = renderWithTheme(
            <ProfileHeader user={mockUser} onEditPress={() => { }} isEditing={false} />
        );

        expect(getByText('Test User')).toBeTruthy();
        expect(getByText('test@example.com')).toBeTruthy();
    });

    it('displays edit button when not editing', () => {
        const { getByText } = renderWithTheme(
            <ProfileHeader user={mockUser} onEditPress={() => { }} isEditing={false} />
        );

        expect(getByText('Edit')).toBeTruthy();
    });

    it('hides edit button when editing', () => {
        const { queryByText } = renderWithTheme(
            <ProfileHeader user={mockUser} onEditPress={() => { }} isEditing={true} />
        );

        expect(queryByText('Edit')).toBeNull();
    });

    it('calls onEditPress when edit button is pressed', () => {
        const onEditPress = jest.fn();
        const { getByText } = renderWithTheme(
            <ProfileHeader user={mockUser} onEditPress={onEditPress} isEditing={false} />
        );

        fireEvent.press(getByText('Edit'));
        expect(onEditPress).toHaveBeenCalledTimes(1);
    });

    it('displays user initials in avatar', () => {
        const { getByText } = renderWithTheme(
            <ProfileHeader user={mockUser} onEditPress={() => { }} isEditing={false} />
        );

        expect(getByText('T')).toBeTruthy();
    });
});
