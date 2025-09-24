import { format, startOfDay } from 'date-fns'

/**
 * Utility functions for handling dates consistently across timezones
 *
 * TIMEZONE HANDLING APPROACH:
 * - All dates are stored in the database as YYYY-MM-DD strings (no time component)
 * - Frontend treats these as local dates (start of day in user's timezone)
 * - This ensures consistent display regardless of user's timezone
 * - Date ranges are inclusive of start date, exclusive of end date (standard booking practice)
 */

/**
 * Convert a date string (YYYY-MM-DD) to a local Date object at start of day
 * This ensures consistent timezone handling
 */
export const parseLocalDate = (dateString: string): Date => {
  // Parse the date string and set it to the start of the day in local timezone
  const date = new Date(dateString + 'T00:00:00')
  return startOfDay(date)
}

/**
 * Format a date for display in a consistent way
 */
export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseLocalDate(date) : date
  return format(dateObj, 'MMM d, yyyy')
}

/**
 * Format a date for URL parameters (YYYY-MM-DD format in local timezone)
 * This ensures consistent URL state regardless of user's timezone
 */
export const formatDateForUrl = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parse a date from URL parameter (YYYY-MM-DD format) as local date
 * This ensures consistent timezone handling when reading from URLs
 */
export const parseDateFromUrl = (dateString: string): Date => {
  return parseLocalDate(dateString)
}

export const convertAvailabilityDates = (dateStrings: string[]): Date[] => {
  return dateStrings.map(dateStr => parseLocalDate(dateStr))
}