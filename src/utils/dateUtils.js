/**
 * Date/Time Utilities for Session Management
 * 
 * IMPORTANT: All session timestamps MUST use UTC to ensure consistency
 * between frontend and backend across different timezones.
 * 
 * Backend sends: ISO strings with 'Z' suffix (e.g., "2025-09-30T18:34:11.701Z")
 * Frontend uses: UTC milliseconds via Date.now() and .getTime()
 */

/**
 * Get current UTC timestamp in milliseconds
 * @returns {number} UTC timestamp in milliseconds
 */
export const getNowUTC = () => {
  return Date.now(); // Always UTC milliseconds
};

/**
 * Parse backend timestamp (ISO string with Z) to UTC milliseconds
 * @param {string|number} timestamp - ISO string with Z or millisecond timestamp
 * @returns {number} UTC timestamp in milliseconds, or 0 if invalid
 */
export const parseUTCTimestamp = (timestamp) => {
  if (!timestamp) {
    console.warn('⚠️ parseUTCTimestamp: null/undefined timestamp');
    return 0;
  }

  // Already a number (milliseconds)
  if (typeof timestamp === 'number') {
    return timestamp;
  }

  // Parse ISO string
  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) {
    console.error('❌ parseUTCTimestamp: Invalid timestamp format:', timestamp);
    return 0;
  }

  return parsed.getTime(); // UTC milliseconds
};

/**
 * Calculate elapsed time in seconds from a start timestamp
 * @param {string|number} startTimestamp - Start time (ISO string with Z or milliseconds)
 * @param {number} [currentTime] - Current time in milliseconds (defaults to now)
 * @returns {number} Elapsed seconds (non-negative)
 */
export const calculateElapsedSeconds = (startTimestamp, currentTime = null) => {
  const startMs = parseUTCTimestamp(startTimestamp);
  const nowMs = currentTime || getNowUTC();
  
  if (startMs === 0) {
    return 0;
  }

  const elapsedMs = nowMs - startMs;

  // Sanity checks
  if (elapsedMs < 0) {
    console.error('❌ calculateElapsedSeconds: Start time is in the future!', {
      startMs,
      nowMs,
      diff: elapsedMs
    });
    return 0;
  }

  if (elapsedMs > 86400000) { // > 24 hours
    console.warn('⚠️ calculateElapsedSeconds: Session running for more than 24 hours');
  }

  return Math.floor(elapsedMs / 1000);
};

/**
 * Format seconds as MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (e.g., "05:30")
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds as HH:MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (e.g., "01:05:30")
 */
export const formatDurationLong = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get current UTC time as ISO string with Z suffix (for sending to backend)
 * @returns {string} ISO string with Z (e.g., "2025-09-30T18:34:11.701Z")
 */
export const getUTCISOString = () => {
  return new Date().toISOString(); // Always includes Z
};

/**
 * Validate that a timestamp is within reasonable bounds
 * @param {string|number} timestamp - Timestamp to validate
 * @param {number} maxAgeHours - Maximum age in hours (default 24)
 * @returns {boolean} True if valid and recent
 */
export const isRecentTimestamp = (timestamp, maxAgeHours = 24) => {
  const timestampMs = parseUTCTimestamp(timestamp);
  if (timestampMs === 0) return false;

  const nowMs = getNowUTC();
  const ageMs = nowMs - timestampMs;

  return ageMs >= 0 && ageMs <= (maxAgeHours * 3600000);
};
