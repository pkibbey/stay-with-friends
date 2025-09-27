import { format, parseISO, isValid, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Date utility functions for consistent date handling across the application
 */

export const formatDate = (date: string | Date, formatString = 'yyyy-MM-dd'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      throw new Error('Invalid date provided');
    }
    return format(parsedDate, formatString);
  } catch (error) {
    throw new Error(`Failed to format date: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formatDisplayDate = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy');
};

export const parseDate = (dateString: string): Date => {
  const parsed = parseISO(dateString);
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return parsed;
};

export const isValidDateString = (dateString: string): boolean => {
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed);
  } catch {
    return false;
  }
};

export const addDaysToDate = (date: string | Date, days: number): string => {
  const baseDate = typeof date === 'string' ? parseDate(date) : date;
  const newDate = addDays(baseDate, days);
  return formatDate(newDate);
};

export const getDaysInRange = (startDate: string, endDate: string): string[] => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const days: string[] = [];
  
  let currentDate = start;
  while (currentDate <= end) {
    days.push(formatDate(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return days;
};

export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  return differenceInDays(end, start);
};

export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  const checkDate = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  return checkDate >= start && checkDate <= end;
};

export const getTodayString = (): string => {
  return formatDate(new Date());
};

export const getTomorrowString = (): string => {
  return addDaysToDate(new Date(), 1);
};

export const getStartOfDay = (date: string | Date): Date => {
  const baseDate = typeof date === 'string' ? parseDate(date) : date;
  return startOfDay(baseDate);
};

export const getEndOfDay = (date: string | Date): Date => {
  const baseDate = typeof date === 'string' ? parseDate(date) : date;
  return endOfDay(baseDate);
};

export const isDateInPast = (date: string): boolean => {
  const checkDate = parseDate(date);
  const today = startOfDay(new Date());
  return checkDate < today;
};

export const isDateToday = (date: string): boolean => {
  const checkDate = formatDate(parseDate(date));
  const today = formatDate(new Date());
  return checkDate === today;
};

export const isDateInFuture = (date: string): boolean => {
  const checkDate = parseDate(date);
  const today = endOfDay(new Date());
  return checkDate > today;
};