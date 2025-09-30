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
    user: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        email: string | undefined;
        name: string | undefined;
        email_verified: string | undefined;
        image: string | undefined;
        created_at: string | undefined;
    }>;
    host: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        user_id: string | undefined;
        name: string | undefined;
        location: string | undefined;
        description: string | undefined;
        address: string | undefined;
        city: string | undefined;
        state: string | undefined;
        zip_code: string | undefined;
        country: string | undefined;
        latitude: number | undefined;
        longitude: number | undefined;
        amenities: string[] | undefined;
        house_rules: string | undefined;
        check_in_time: string | undefined;
        check_out_time: string | undefined;
        max_guests: number | undefined;
        bedrooms: number | undefined;
        bathrooms: number | undefined;
        photos: string[] | undefined;
        created_at: string | undefined;
        updated_at: string | undefined;
    }>;
    availability: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        host_id: string | undefined;
        start_date: string | undefined;
        end_date: string | undefined;
        status: string | undefined;
        notes: string | undefined;
    }>;
    bookingRequest: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        host_id: string | undefined;
        requester_id: string | undefined;
        start_date: string | undefined;
        end_date: string | undefined;
        guests: number | undefined;
        message: string | undefined;
        status: string | undefined;
        response_message: string | undefined;
        responded_at: string | undefined;
        created_at: string | undefined;
    }>;
    connection: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        user_id: string | undefined;
        connected_user_id: string | undefined;
        relationship: string | undefined;
        status: string | undefined;
        created_at: string | undefined;
    }>;
    invitation: (data: unknown) => z.ZodSafeParseResult<{
        id: string | undefined;
        inviter_id: string | undefined;
        invitee_email: string | undefined;
        message: string | undefined;
        token: string | undefined;
        status: string | undefined;
        expires_at: string | undefined;
        accepted_at: string | undefined;
        created_at: string | undefined;
    }>;
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
