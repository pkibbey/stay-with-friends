"use strict";
/**
 * Common validation utilities that can be used across frontend and backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = exports.retry = exports.deepClone = exports.omit = exports.pick = exports.chunk = exports.groupBy = exports.unique = exports.safeParseJSON = exports.parseJSON = exports.slugify = exports.capitalizeWords = exports.capitalizeFirst = exports.truncateString = exports.sanitizeString = exports.isInRange = exports.isPositiveInteger = exports.isValidUUID = exports.isValidURL = exports.isValidEmail = exports.isNotEmpty = exports.isEmpty = void 0;
const isEmpty = (value) => {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim().length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
};
exports.isEmpty = isEmpty;
const isNotEmpty = (value) => !(0, exports.isEmpty)(value);
exports.isNotEmpty = isNotEmpty;
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string')
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5 && email.length <= 255;
};
exports.isValidEmail = isValidEmail;
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidURL = isValidURL;
const isValidUUID = (uuid) => {
    if (!uuid || typeof uuid !== 'string')
        return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
const isPositiveInteger = (value) => {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
};
exports.isPositiveInteger = isPositiveInteger;
const isInRange = (value, min, max) => {
    return value >= min && value <= max;
};
exports.isInRange = isInRange;
const sanitizeString = (str) => {
    return str.trim().replace(/\s+/g, ' ');
};
exports.sanitizeString = sanitizeString;
const truncateString = (str, maxLength, suffix = '...') => {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
};
exports.truncateString = truncateString;
const capitalizeFirst = (str) => {
    if (!str)
        return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalizeFirst = capitalizeFirst;
const capitalizeWords = (str) => {
    return str.split(' ').map(exports.capitalizeFirst).join(' ');
};
exports.capitalizeWords = capitalizeWords;
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const parseJSON = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return null;
    }
};
exports.parseJSON = parseJSON;
const safeParseJSON = (jsonString, fallback) => {
    const parsed = (0, exports.parseJSON)(jsonString);
    return parsed !== null ? parsed : fallback;
};
exports.safeParseJSON = safeParseJSON;
// Array utilities
const unique = (array) => {
    return Array.from(new Set(array));
};
exports.unique = unique;
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        groups[groupKey] = groups[groupKey] || [];
        groups[groupKey].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
exports.chunk = chunk;
// Object utilities
const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
exports.pick = pick;
const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
};
exports.omit = omit;
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.deepClone = deepClone;
// Retry utility
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return (0, exports.retry)(fn, retries - 1, delay);
        }
        throw error;
    }
};
exports.retry = retry;
// Debounce utility
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
