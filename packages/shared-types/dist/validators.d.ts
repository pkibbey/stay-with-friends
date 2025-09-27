import { z } from 'zod';
import { User, Host, Availability, BookingRequest, Connection, Invitation } from './entities';
export declare const validate: {
    user: (data: unknown) => User;
    host: (data: unknown) => Host;
    availability: (data: unknown) => Availability;
    bookingRequest: (data: unknown) => BookingRequest;
    connection: (data: unknown) => Connection;
    invitation: (data: unknown) => Invitation;
};
export declare const safeParse: {
    user: (data: unknown) => z.ZodSafeParseResult<Record<string, string | undefined>>;
    host: (data: unknown) => z.ZodSafeParseResult<Record<string, string | number | string[] | undefined>>;
    availability: (data: unknown) => z.ZodSafeParseResult<Record<string, string | undefined>>;
    bookingRequest: (data: unknown) => z.ZodSafeParseResult<Record<string, string | number | undefined>>;
    connection: (data: unknown) => z.ZodSafeParseResult<Record<string, string | undefined>>;
    invitation: (data: unknown) => z.ZodSafeParseResult<Record<string, string | undefined>>;
};
export declare const validateEmail: (email: string) => void;
export declare const validateName: (name: string) => void;
export declare const validateOptionalText: (text: string | undefined, fieldName: string, maxLength: number) => void;
export declare const validateCoordinates: (lat: number | undefined, lng: number | undefined) => void;
export declare const validatePositiveInteger: (value: number | undefined, fieldName: string, max?: number) => void;
export declare const validateUUID: (value: string | undefined, fieldName: string) => void;
export declare const validateDateRange: (startDate: string, endDate: string) => void;
export declare const validateStatus: (status: string, validStatuses: string[]) => void;
export declare const transformToFrontend: {
    user: (backendUser: any) => User;
    host: (backendHost: any) => Host;
};
export declare const transformToBackend: {
    user: (frontendUser: any) => User;
    host: (frontendHost: any) => Host;
};
