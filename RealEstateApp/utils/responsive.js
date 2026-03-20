import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device (iPhone 11/12/13/14/15 size is roughly 375x812)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale value based on screen width.
 * @param {number} size 
 * @returns {number}
 */
const scale = (size) => (width / guidelineBaseWidth) * size;

/**
 * Scale value based on screen height.
 * @param {number} size 
 * @returns {number}
 */
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

/**
 * Moderate scale factor (can be adjusted for less aggressive scaling).
 * @param {number} size 
 * @param {number} factor 
 * @returns {number}
 */
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export { scale, verticalScale, moderateScale, width as SCREEN_WIDTH, height as SCREEN_HEIGHT };
