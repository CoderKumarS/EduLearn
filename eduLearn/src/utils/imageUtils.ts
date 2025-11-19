import config from '../constants/config';

/**
 * Get the full image URL from a relative path
 * @param imagePath - Relative image path from the backend (e.g., "/media/courses/image.jpg")
 * @returns Full URL or null if no image path provided
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) {
        return null;
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Remove /api from base URL and append the image path
    const baseUrl = config.apiBaseUrl.replace('/api', '');

    // Ensure the path starts with /
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    return `${baseUrl}${path}`;
};

/**
 * Check if an image URL is valid
 * @param imageUrl - Image URL to validate
 * @returns true if valid, false otherwise
 */
export const isValidImageUrl = (imageUrl: string | null | undefined): boolean => {
    if (!imageUrl) {
        return false;
    }

    return imageUrl.startsWith('http://') || imageUrl.startsWith('https://');
};

/**
 * Alias for getImageUrl - Get the full image URL from a relative path
 * @param imagePath - Relative image path from the backend
 * @returns Full URL or null if no image path provided
 */
export const getFullImageUrl = getImageUrl;

/**
 * Get course image URL with fallback to placeholder
 * @param imagePath - Course thumbnail image path
 * @param courseTitle - Course title for generating placeholder
 * @param courseId - Course ID for color variation
 * @returns Image URL or null (let the component handle placeholder)
 */
export const getCourseImageUrl = (
    imagePath: string | null | undefined,
    courseTitle?: string,
    courseId?: number
): string | null => {
    const imageUrl = getImageUrl(imagePath);

    if (imageUrl) {
        return imageUrl;
    }

    // Return null to let the component handle the placeholder
    // This avoids network errors from trying to load external placeholder services
    return null;
};
