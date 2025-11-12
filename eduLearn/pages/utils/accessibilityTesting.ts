/**
 * Accessibility Testing Utilities
 * 
 * Helper functions for testing accessibility compliance
 */

import { getContrastRatio, meetsTouchTargetSize, MIN_TOUCH_TARGET_SIZE } from './accessibility';

export interface AccessibilityIssue {
    type: 'contrast' | 'touch-target' | 'label' | 'role' | 'state';
    severity: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    recommendation?: string;
}

/**
 * Test color contrast compliance
 */
export function testColorContrast(
    foreground: string,
    background: string,
    elementName: string,
    isLargeText: boolean = false
): AccessibilityIssue | null {
    const ratio = getContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? 3 : 4.5;
    const level = isLargeText ? 'large text' : 'normal text';

    if (ratio < requiredRatio) {
        return {
            type: 'contrast',
            severity: 'error',
            message: `Insufficient color contrast for ${level}`,
            element: elementName,
            recommendation: `Current ratio: ${ratio.toFixed(2)}:1. Required: ${requiredRatio}:1. Consider using a darker or lighter color.`,
        };
    }

    return null;
}

/**
 * Test touch target size compliance
 */
export function testTouchTargetSize(
    width: number,
    height: number,
    elementName: string
): AccessibilityIssue | null {
    if (!meetsTouchTargetSize(width, height)) {
        return {
            type: 'touch-target',
            severity: 'error',
            message: 'Touch target too small',
            element: elementName,
            recommendation: `Current size: ${width}x${height}. Minimum required: ${MIN_TOUCH_TARGET_SIZE}x${MIN_TOUCH_TARGET_SIZE}. Increase padding or hitSlop.`,
        };
    }

    return null;
}

/**
 * Test if element has accessibility label
 */
export function testAccessibilityLabel(
    hasLabel: boolean,
    elementName: string,
    isInteractive: boolean = true
): AccessibilityIssue | null {
    if (isInteractive && !hasLabel) {
        return {
            type: 'label',
            severity: 'error',
            message: 'Missing accessibility label',
            element: elementName,
            recommendation: 'Add accessibilityLabel prop to describe the element for screen readers.',
        };
    }

    return null;
}

/**
 * Test if element has appropriate accessibility role
 */
export function testAccessibilityRole(
    hasRole: boolean,
    elementName: string,
    isInteractive: boolean = true
): AccessibilityIssue | null {
    if (isInteractive && !hasRole) {
        return {
            type: 'role',
            severity: 'warning',
            message: 'Missing accessibility role',
            element: elementName,
            recommendation: 'Add accessibilityRole prop to provide semantic meaning (e.g., "button", "link").',
        };
    }

    return null;
}

/**
 * Test if element has appropriate accessibility state
 */
export function testAccessibilityState(
    hasState: boolean,
    elementName: string,
    requiresState: boolean = false
): AccessibilityIssue | null {
    if (requiresState && !hasState) {
        return {
            type: 'state',
            severity: 'warning',
            message: 'Missing accessibility state',
            element: elementName,
            recommendation: 'Add accessibilityState prop to indicate element state (e.g., disabled, selected).',
        };
    }

    return null;
}

/**
 * Run all accessibility tests on an element
 */
export function runAccessibilityTests(element: {
    name: string;
    foreground?: string;
    background?: string;
    width?: number;
    height?: number;
    hasLabel?: boolean;
    hasRole?: boolean;
    hasState?: boolean;
    isInteractive?: boolean;
    isLargeText?: boolean;
    requiresState?: boolean;
}): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Test color contrast
    if (element.foreground && element.background) {
        const contrastIssue = testColorContrast(
            element.foreground,
            element.background,
            element.name,
            element.isLargeText
        );
        if (contrastIssue) issues.push(contrastIssue);
    }

    // Test touch target size
    if (element.width !== undefined && element.height !== undefined && element.isInteractive) {
        const sizeIssue = testTouchTargetSize(element.width, element.height, element.name);
        if (sizeIssue) issues.push(sizeIssue);
    }

    // Test accessibility label
    if (element.hasLabel !== undefined) {
        const labelIssue = testAccessibilityLabel(
            element.hasLabel,
            element.name,
            element.isInteractive
        );
        if (labelIssue) issues.push(labelIssue);
    }

    // Test accessibility role
    if (element.hasRole !== undefined) {
        const roleIssue = testAccessibilityRole(
            element.hasRole,
            element.name,
            element.isInteractive
        );
        if (roleIssue) issues.push(roleIssue);
    }

    // Test accessibility state
    if (element.hasState !== undefined) {
        const stateIssue = testAccessibilityState(
            element.hasState,
            element.name,
            element.requiresState
        );
        if (stateIssue) issues.push(stateIssue);
    }

    return issues;
}

/**
 * Generate accessibility report
 */
export function generateAccessibilityReport(issues: AccessibilityIssue[]): string {
    if (issues.length === 0) {
        return '✅ No accessibility issues found!';
    }

    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const info = issues.filter((i) => i.severity === 'info');

    let report = `Accessibility Report\n`;
    report += `====================\n\n`;
    report += `Total Issues: ${issues.length}\n`;
    report += `- Errors: ${errors.length}\n`;
    report += `- Warnings: ${warnings.length}\n`;
    report += `- Info: ${info.length}\n\n`;

    if (errors.length > 0) {
        report += `ERRORS:\n`;
        errors.forEach((issue, index) => {
            report += `${index + 1}. [${issue.type}] ${issue.message}\n`;
            if (issue.element) report += `   Element: ${issue.element}\n`;
            if (issue.recommendation) report += `   Fix: ${issue.recommendation}\n`;
            report += `\n`;
        });
    }

    if (warnings.length > 0) {
        report += `WARNINGS:\n`;
        warnings.forEach((issue, index) => {
            report += `${index + 1}. [${issue.type}] ${issue.message}\n`;
            if (issue.element) report += `   Element: ${issue.element}\n`;
            if (issue.recommendation) report += `   Fix: ${issue.recommendation}\n`;
            report += `\n`;
        });
    }

    return report;
}

/**
 * Log accessibility issues to console
 */
export function logAccessibilityIssues(issues: AccessibilityIssue[]): void {
    if (issues.length === 0) {
        console.log('✅ No accessibility issues found!');
        return;
    }

    console.group('🔍 Accessibility Issues');
    issues.forEach((issue) => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} [${issue.type}] ${issue.message}`);
        if (issue.element) console.log(`   Element: ${issue.element}`);
        if (issue.recommendation) console.log(`   Fix: ${issue.recommendation}`);
    });
    console.groupEnd();
}
