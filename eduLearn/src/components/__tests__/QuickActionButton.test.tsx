import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionButton } from '../QuickActionButton';
import { ThemeProvider } from '../../contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('QuickActionButton', () => {
    it('renders with correct label', () => {
        const { getByText } = renderWithTheme(
            <QuickActionButton
                icon="settings-outline"
                label="Settings"
                onPress={() => { }}
            />
        );

        expect(getByText('Settings')).toBeTruthy();
    });

    it('calls onPress when button is pressed', () => {
        const onPress = jest.fn();
        const { getByText } = renderWithTheme(
            <QuickActionButton
                icon="settings-outline"
                label="Settings"
                onPress={onPress}
            />
        );

        fireEvent.press(getByText('Settings'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('has correct accessibility properties', () => {
        const { getByLabelText } = renderWithTheme(
            <QuickActionButton
                icon="settings-outline"
                label="Settings"
                onPress={() => { }}
            />
        );

        const button = getByLabelText('Settings');
        expect(button).toBeTruthy();
    });
});
