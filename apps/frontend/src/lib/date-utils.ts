import { MAX_MONTHS_DISPLAYED } from '@/app/page'
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
 * Format a date range for display
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)

  // If same month and year, show "Nov 19-24, 2025"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`
  }

  // If same year, show "Nov 19 - Dec 24, 2025"
  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  // Different years, show full format
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
}

/**
 * Get the start and end dates for a month in local timezone
 */
export const getMonthDateRange = (month: Date): { startDate: string, endDate: string } => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const endOfSecondMonth = new Date(month.getFullYear(), month.getMonth() + MAX_MONTHS_DISPLAYED, 0)

  return {
    startDate: format(startOfMonth, 'yyyy-MM-dd'),
    endDate: format(endOfSecondMonth, 'yyyy-MM-dd')
  }
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