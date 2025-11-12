/**
 * Accessibility Utilities
 * 
 * This file contains utilities for ensuring WCAG AA compliance
 * and improving accessibility across the application.
 */

/**
 * Calculate relative luminance of a color
 * Used for contrast ratio calculations
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const val = c / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG AA requires:
 * - 4.5:1 for normal text
 * - 3:1 for large text (18pt+ or 14pt+ bold)
 */
export function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
        return 0;
    }

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsContrastRequirements(
    foreground: string,
    background: string,
    isLargeText: boolean = false
): boolean {
    const ratio = getContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? 3 : 4.5;
    return ratio >= requiredRatio;
}

/**
 * Accessibility labels for common UI elements
 */
export const AccessibilityLabels = {
    // Navigation
    backButton: 'Go back',
    closeButton: 'Close',
    menuButton: 'Open menu',
    searchButton: 'Search',
    filterButton: 'Filter',

    // Actions
    editButton: 'Edit',
    deleteButton: 'Delete',
    saveButton: 'Save',
    cancelButton: 'Cancel',
    submitButton: 'Submit',

    // Media
    playButton: 'Play',
    pauseButton: 'Pause',
    nextButton: 'Next',
    previousButton: 'Previous',

    // Social
    likeButton: 'Like',
    shareButton: 'Share',
    commentButton: 'Comment',

    // Forms
    requiredField: 'Required field',
    optionalField: 'Optional field',

    // Status
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
};

/**
 * Accessibility roles for semantic meaning
 */
export const AccessibilityRoles = {
    button: 'button' as const,
    link: 'link' as const,
    search: 'search' as const,
    image: 'image' as const,
    text: 'text' as const,
    header: 'header' as const,
    adjustable: 'adjustable' as const,
    imagebutton: 'imagebutton' as const,
    keyboardkey: 'keyboardkey' as const,
    summary: 'summary' as const,
    checkbox: 'checkbox' as const,
    radio: 'radio' as const,
    switch: 'switch' as const,
    tab: 'tab' as const,
    tablist: 'tablist' as const,
    menu: 'menu' as const,
    menubar: 'menubar' as const,
    menuitem: 'menuitem' as const,
    progressbar: 'progressbar' as const,
    scrollbar: 'scrollbar' as const,
    spinbutton: 'spinbutton' as const,
    alert: 'alert' as const,
    combobox: 'combobox' as const,
    toolbar: 'toolbar' as const,
    none: 'none' as const,
};

/**
 * Minimum touch target size (44x44 points per Apple HIG and Material Design)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Check if a touch target meets minimum size requirements
 */
export function meetsTouchTargetSize(width: number, height: number): boolean {
    return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
}

/**
 * Generate accessible hint text
 */
export function generateHint(action: string, context?: string): string {
    if (context) {
        return `${action} ${context}`;
    }
    return action;
}

/**
 * Format accessibility announcement for screen readers
 */
export function formatAnnouncement(message: string, polite: boolean = true): string {
    // Screen readers will announce this based on politeness setting
    return message;
}

/**
 * Accessibility state helpers
 */
export const AccessibilityStates = {
    disabled: { disabled: true },
    selected: { selected: true },
    checked: { checked: true },
    expanded: { expanded: true },
    busy: { busy: true },
};

/**
 * Create accessible value for adjustable elements (sliders, steppers)
 */
export function createAccessibleValue(
    value: number,
    min: number,
    max: number,
    unit?: string
): {
    min: number;
    max: number;
    now: number;
    text: string;
} {
    return {
        min,
        max,
        now: value,
        text: unit ? `${value} ${unit}` : `${value}`,
    };
}

/**
 * Validate color contrast for theme colors
 */
export function validateThemeContrast(theme: {
    background: string;
    text: string;
    primary: string;
    surface: string;
}): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Check text on background
    if (!meetsContrastRequirements(theme.text, theme.background)) {
        issues.push('Text color does not have sufficient contrast with background');
    }

    // Check text on surface
    if (!meetsContrastRequirements(theme.text, theme.surface)) {
        issues.push('Text color does not have sufficient contrast with surface');
    }

    // Check primary on background
    if (!meetsContrastRequirements(theme.primary, theme.background, true)) {
        issues.push('Primary color does not have sufficient contrast with background');
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * Screen reader announcement helper
 */
export function announceForAccessibility(message: string): void {
    // This would integrate with AccessibilityInfo.announceForAccessibility
    // in a real implementation
    console.log('[Accessibility Announcement]:', message);
}
