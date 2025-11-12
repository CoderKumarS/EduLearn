export interface ColorScheme {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
}

export interface Spacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}

export interface BorderRadius {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
}

export interface Typography {
    fontSize: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    fontWeight: {
        regular: '400';
        medium: '500';
        semibold: '600';
        bold: '700';
    };
    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
    mode: ThemeMode;
    isDark: boolean;
    colors: ColorScheme;
    spacing: Spacing;
    borderRadius: BorderRadius;
    typography: Typography;
}
