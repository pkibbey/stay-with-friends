"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateInFuture = exports.isDateToday = exports.isDateInPast = exports.getEndOfDay = exports.getStartOfDay = exports.getTomorrowString = exports.getTodayString = exports.isDateInRange = exports.getDaysBetween = exports.getDaysInRange = exports.addDaysToDate = exports.isValidDateString = exports.parseDate = exports.formatDisplayDate = exports.formatDateTime = exports.formatDate = void 0;
const date_fns_1 = require("date-fns");
/**
 * Date utility functions for consistent date handling across the application
 */
const formatDate = (date, formatString = 'yyyy-MM-dd') => {
    try {
        const parsedDate = typeof date === 'string' ? (0, date_fns_1.parseISO)(date) : date;
        if (!(0, date_fns_1.isValid)(parsedDate)) {
            throw new Error('Invalid date provided');
        }
        return (0, date_fns_1.format)(parsedDate, formatString);
    }
    catch (error) {
        throw new Error(`Failed to format date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return (0, exports.formatDate)(date, 'yyyy-MM-dd HH:mm:ss');
};
exports.formatDateTime = formatDateTime;
const formatDisplayDate = (date) => {
    return (0, exports.formatDate)(date, 'MMM dd, yyyy');
};
exports.formatDisplayDate = formatDisplayDate;
const parseDate = (dateString) => {
    const parsed = (0, date_fns_1.parseISO)(dateString);
    if (!(0, date_fns_1.isValid)(parsed)) {
        throw new Error(`Invalid date string: ${dateString}`);
    }
    return parsed;
};
exports.parseDate = parseDate;
const isValidDateString = (dateString) => {
    try {
        const parsed = (0, date_fns_1.parseISO)(dateString);
        return (0, date_fns_1.isValid)(parsed);
    }
    catch {
        return false;
    }
};
exports.isValidDateString = isValidDateString;
const addDaysToDate = (date, days) => {
    const baseDate = typeof date === 'string' ? (0, exports.parseDate)(date) : date;
    const newDate = (0, date_fns_1.addDays)(baseDate, days);
    return (0, exports.formatDate)(newDate);
};
exports.addDaysToDate = addDaysToDate;
const getDaysInRange = (startDate, endDate) => {
    const start = (0, exports.parseDate)(startDate);
    const end = (0, exports.parseDate)(endDate);
    const days = [];
    let currentDate = start;
    while (currentDate <= end) {
        days.push((0, exports.formatDate)(currentDate));
        currentDate = (0, date_fns_1.addDays)(currentDate, 1);
    }
    return days;
};
exports.getDaysInRange = getDaysInRange;
const getDaysBetween = (startDate, endDate) => {
    const start = (0, exports.parseDate)(startDate);
    const end = (0, exports.parseDate)(endDate);
    return (0, date_fns_1.differenceInDays)(end, start);
};
exports.getDaysBetween = getDaysBetween;
const isDateInRange = (date, startDate, endDate) => {
    const checkDate = (0, exports.parseDate)(date);
    const start = (0, exports.parseDate)(startDate);
    const end = (0, exports.parseDate)(endDate);
    return checkDate >= start && checkDate <= end;
};
exports.isDateInRange = isDateInRange;
const getTodayString = () => {
    return (0, exports.formatDate)(new Date());
};
exports.getTodayString = getTodayString;
const getTomorrowString = () => {
    return (0, exports.addDaysToDate)(new Date(), 1);
};
exports.getTomorrowString = getTomorrowString;
const getStartOfDay = (date) => {
    const baseDate = typeof date === 'string' ? (0, exports.parseDate)(date) : date;
    return (0, date_fns_1.startOfDay)(baseDate);
};
exports.getStartOfDay = getStartOfDay;
const getEndOfDay = (date) => {
    const baseDate = typeof date === 'string' ? (0, exports.parseDate)(date) : date;
    return (0, date_fns_1.endOfDay)(baseDate);
};
exports.getEndOfDay = getEndOfDay;
const isDateInPast = (date) => {
    const checkDate = (0, exports.parseDate)(date);
    const today = (0, date_fns_1.startOfDay)(new Date());
    return checkDate < today;
};
exports.isDateInPast = isDateInPast;
const isDateToday = (date) => {
    const checkDate = (0, exports.formatDate)((0, exports.parseDate)(date));
    const today = (0, exports.formatDate)(new Date());
    return checkDate === today;
};
exports.isDateToday = isDateToday;
const isDateInFuture = (date) => {
    const checkDate = (0, exports.parseDate)(date);
    const today = (0, date_fns_1.endOfDay)(new Date());
    return checkDate > today;
};
exports.isDateInFuture = isDateInFuture;
