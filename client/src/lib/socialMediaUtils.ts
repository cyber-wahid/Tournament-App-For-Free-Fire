/**
 * Utility functions for handling social media links
 * Ensures links open in native apps on mobile devices
 */

/**
 * Opens a social media link in the appropriate way:
 * - On mobile: Attempts to open in native app using deep links
 * - On desktop: Opens in new tab
 * @param url The social media URL to open
 */
export const openSocialLink = (url: string): void => {
  try {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, use location.href to trigger native app opening
      // Deep links like m.me, t.me, wa.me will automatically redirect to native apps
      window.location.href = url;
    } else {
      // For desktop, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    // Fallback: open in new tab
    console.warn('Failed to open social link, using fallback:', error);
    window.open(url, '_blank');
  }
};

/**
 * Checks if a URL is a valid social media deep link
 * @param url The URL to check
 * @returns True if it's a valid social media deep link
 */
export const isValidSocialMediaLink = (url: string): boolean => {
  const socialMediaPatterns = [
    /^https?:\/\/(m\.me|facebook\.com|fb\.com)/i,  // Facebook
    /^https?:\/\/(t\.me|telegram\.me)/i,           // Telegram
    /^https?:\/\/(wa\.me|whatsapp\.com)/i,         // WhatsApp
  ];
  
  return socialMediaPatterns.some(pattern => pattern.test(url));
};
