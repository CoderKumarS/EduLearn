import { Platform } from 'react-native';
import config from '../constants/config';

/**
 * Get the base URL for media files
 * Removes '/api' from the API base URL to get the media base URL
 */
export const getMediaBaseUrl = (): string => {
    const apiBaseUrl = config.apiBaseUrl;

    // Remove '/api' from the end if it exists
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

    return baseUrl;
};

/**
 * Convert a relative image path to a full URL
 * @param imagePath - The relative path from the backend (e.g., '/media/courses/image.jpg' or 'media/courses/image.jpg')
 * @returns Full URL to the image
 */
export const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) {
        return null;
    }

    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const mediaBaseUrl = getMediaBaseUrl();

    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    return `${mediaBaseUrl}/${cleanPath}`;
};

/**
 * Get a placeholder image URL for courses
 * Uses a data URI with a colored background instead of external service
 * @param courseTitle - The course title to display in the placeholder
 * @param courseId - The course ID for consistent color selection
 * @returns Placeholder image data URI
 */
export const getCoursePlaceholderUrl = (courseTitle: string, courseId: number): string => {
    const colors = [
        '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4',
        '#FFEAA7', '#DFE6E9', '#A8E6CF', '#FFD93D'
    ];
    const colorIndex = courseId % colors.length;
    const backgroundColor = colors[colorIndex];

    // Create a simple SVG placeholder
    const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="${backgroundColor}"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
                  fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
                ${courseTitle.substring(0, 20)}
            </text>
        </svg>
    `;

    // Convert SVG to data URI
    const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
    return `data:image/svg+xml,${encodedSvg}`;
};

/**
 * Get the image URL for a course, with fallback to placeholder
 * @param thumbnailImage - The thumbnail image path from the backend
 * @param courseTitle - The course title for placeholder
 * @param courseId - The course ID for placeholder color
 * @returns Full image URL or placeholder
 */
export const getCourseImageUrl = (
    thumbnailImage: string | null | undefined,
    courseTitle: string,
    courseId: number
): string => {
    const fullUrl = getFullImageUrl(thumbnailImage);
    return fullUrl || getCoursePlaceholderUrl(courseTitle, courseId);
};
