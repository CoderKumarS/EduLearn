import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

export interface PickerOption {
    label: string;
    value: string;
}

interface PickerProps {
    label?: string;
    placeholder?: string;
    value: string;
    options: PickerOption[];
    onValueChange: (value: string) => void;
    error?: string;
}

export const Picker: React.FC<PickerProps> = ({
    label,
    placeholder = 'Select an option',
    value,
    options,
    onValueChange,
    error,
}) => {
    const { theme } = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}

            <TouchableOpacity
                style={[
                    styles.pickerButton,
                    {
                        borderColor: error ? theme.colors.error : theme.colors.border,
                        backgroundColor: theme.colors.surface,
                    },
                ]}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.pickerText,
                        {
                            color: selectedOption
                                ? theme.colors.text
                                : theme.colors.textSecondary,
                        },
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.textSecondary}
                />
            </TouchableOpacity>

            {error && (
                <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
                </ThemedText>
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
                        <TouchableWithoutFeedback>
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
                                    <ThemedText style={styles.modalTitle}>
                                        {label || 'Select an option'}
                                    </ThemedText>
                                    <TouchableOpacity
                                        onPress={() => setIsModalVisible(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={options}
                                    keyExtractor={(item) => item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.optionItem,
                                                {
                                                    backgroundColor:
                                                        item.value === value
                                                            ? theme.colors.primary + '20'
                                                            : 'transparent',
                                                },
                                            ]}
                                            onPress={() => handleSelect(item.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    {
                                                        color:
                                                            item.value === value
                                                                ? theme.colors.primary
                                                                : theme.colors.text,
                                                        fontWeight: item.value === value ? '600' : '400',
                                                    },
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                            {item.value === value && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={20}
                                                    color={theme.colors.primary}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        minHeight: 48,
        paddingVertical: 12,
    },
    pickerText: {
        fontSize: 16,
        flex: 1,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '70%',
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    optionText: {
        fontSize: 16,
        flex: 1,
    },
});
