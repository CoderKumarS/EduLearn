import { ColorScheme } from '../types/theme';

// Utility function to create theme-aware class names for NativeWind
export const getThemeClasses = (colors: ColorScheme, isDark: boolean) => {
    return {
        // Background classes
        bgPrimary: isDark ? 'bg-slate-900' : 'bg-white',
        bgSecondary: isDark ? 'bg-slate-800' : 'bg-slate-50',
        bgSurface: isDark ? 'bg-slate-700' : 'bg-white',
        bgCard: isDark ? 'bg-slate-600' : 'bg-white',

        // Text classes
        textPrimary: isDark ? 'text-slate-100' : 'text-slate-900',
        textSecondary: isDark ? 'text-slate-400' : 'text-slate-600',

        // Border classes
        border: isDark ? 'border-slate-600' : 'border-slate-200',

        // Button classes
        btnPrimary: isDark ? 'bg-blue-600' : 'bg-blue-500',
        btnPrimaryText: 'text-white',
        btnSecondary: isDark ? 'bg-slate-600' : 'bg-slate-200',
        btnSecondaryText: isDark ? 'text-slate-100' : 'text-slate-900',
    };
};
