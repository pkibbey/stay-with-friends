import { z } from 'zod';
/**
 * ENTITY SCHEMAS - Single Source of Truth
 *
 * These Zod schemas define the complete entity structure including:
 * - Field types and validation
 * - Database table mapping
 * - Frontend/backend transformations
 * - GraphQL type generation
 */
interface BaseFieldMeta {
    type: 'string' | 'integer' | 'real' | 'datetime' | 'json';
    primary?: boolean;
    unique?: boolean;
    nullable?: boolean;
    default?: string | number;
    table?: string;
    jsonType?: string;
}
export declare const UserEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        email: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        name: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        email_verified: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        image: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        created_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const HostEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        user_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        name: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        location: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        description: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        address: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        city: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        state: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        zip_code: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        country: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        latitude: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        longitude: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        amenities: {
            schema: z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
            meta: BaseFieldMeta;
        };
        house_rules: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        check_in_time: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        check_out_time: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        max_guests: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        bedrooms: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        bathrooms: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        photos: {
            schema: z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
            meta: BaseFieldMeta;
        };
        created_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        updated_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const AvailabilityEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        host_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        start_date: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        end_date: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        status: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        notes: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const BookingRequestEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        host_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        requester_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        start_date: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        end_date: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        guests: {
            schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
            meta: BaseFieldMeta;
        };
        message: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        status: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        response_message: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        responded_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        created_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const ConnectionEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        user_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        connected_user_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        relationship: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        status: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        created_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const InvitationEntity: {
    table: string;
    fields: {
        id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        inviter_id: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        invitee_email: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        message: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        token: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        status: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        expires_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        accepted_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
        created_at: {
            schema: z.ZodString | z.ZodOptional<z.ZodString>;
            meta: BaseFieldMeta;
        };
    };
};
export declare const ENTITIES: {
    readonly User: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            email: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            name: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            email_verified: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            image: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            created_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
    readonly Host: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            user_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            name: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            location: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            description: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            address: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            city: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            state: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            zip_code: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            country: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            latitude: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            longitude: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            amenities: {
                schema: z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
                meta: BaseFieldMeta;
            };
            house_rules: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            check_in_time: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            check_out_time: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            max_guests: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            bedrooms: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            bathrooms: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            photos: {
                schema: z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
                meta: BaseFieldMeta;
            };
            created_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            updated_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
    readonly Availability: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            host_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            start_date: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            end_date: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            status: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            notes: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
    readonly BookingRequest: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            host_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            requester_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            start_date: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            end_date: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            guests: {
                schema: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
                meta: BaseFieldMeta;
            };
            message: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            status: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            response_message: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            responded_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            created_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
    readonly Connection: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            user_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            connected_user_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            relationship: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            status: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            created_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
    readonly Invitation: {
        table: string;
        fields: {
            id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            inviter_id: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            invitee_email: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            message: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            token: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            status: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            expires_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            accepted_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
            created_at: {
                schema: z.ZodString | z.ZodOptional<z.ZodString>;
                meta: BaseFieldMeta;
            };
        };
    };
};
export declare const UserSchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const HostSchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString> | z.ZodNumber | z.ZodOptional<z.ZodNumber> | z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
}, z.core.$strip>;
export declare const AvailabilitySchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const BookingRequestSchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString> | z.ZodNumber | z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ConnectionSchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const InvitationSchema: z.ZodObject<{
    [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SCHEMAS: {
    readonly User: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Host: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString> | z.ZodNumber | z.ZodOptional<z.ZodNumber> | z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>> | z.ZodOptional<z.ZodType<string[], unknown, z.core.$ZodTypeInternals<string[], unknown>>>;
    }, z.core.$strip>;
    readonly Availability: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly BookingRequest: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString> | z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    readonly Connection: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Invitation: z.ZodObject<{
        [x: string]: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export type User = z.infer<typeof UserSchema>;
export type Host = z.infer<typeof HostSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
export {};
