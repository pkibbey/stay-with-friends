/**
 * Common validation utilities that can be used across frontend and backend
 */
export declare const isEmpty: (value: unknown) => boolean;
export declare const isNotEmpty: (value: unknown) => boolean;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidURL: (url: string) => boolean;
export declare const isValidUUID: (uuid: string) => boolean;
export declare const isPositiveInteger: (value: unknown) => value is number;
export declare const isInRange: (value: number, min: number, max: number) => boolean;
export declare const sanitizeString: (str: string) => string;
export declare const truncateString: (str: string, maxLength: number, suffix?: string) => string;
export declare const capitalizeFirst: (str: string) => string;
export declare const capitalizeWords: (str: string) => string;
export declare const slugify: (str: string) => string;
export declare const parseJSON: <T>(jsonString: string) => T | null;
export declare const safeParseJSON: <T>(jsonString: string, fallback: T) => T;
export declare const unique: <T>(array: T[]) => T[];
export declare const groupBy: <T, K extends keyof T>(array: T[], key: K) => Record<string, T[]>;
export declare const chunk: <T>(array: T[], size: number) => T[][];
export declare const pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
export declare const omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
export declare const deepClone: <T>(obj: T) => T;
export declare const retry: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<T>;
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void;
