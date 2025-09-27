/**
 * Date utility functions for consistent date handling across the application
 */
export declare const formatDate: (date: string | Date, formatString?: string) => string;
export declare const formatDateTime: (date: string | Date) => string;
export declare const formatDisplayDate: (date: string | Date) => string;
export declare const parseDate: (dateString: string) => Date;
export declare const isValidDateString: (dateString: string) => boolean;
export declare const addDaysToDate: (date: string | Date, days: number) => string;
export declare const getDaysInRange: (startDate: string, endDate: string) => string[];
export declare const getDaysBetween: (startDate: string, endDate: string) => number;
export declare const isDateInRange: (date: string, startDate: string, endDate: string) => boolean;
export declare const getTodayString: () => string;
export declare const getTomorrowString: () => string;
export declare const getStartOfDay: (date: string | Date) => Date;
export declare const getEndOfDay: (date: string | Date) => Date;
export declare const isDateInPast: (date: string) => boolean;
export declare const isDateToday: (date: string) => boolean;
export declare const isDateInFuture: (date: string) => boolean;
