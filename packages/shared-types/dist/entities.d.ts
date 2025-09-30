import { z } from 'zod';
/**
 * ENTITY SCHEMAS - Single Source of Truth
 *
 * These Zod schemas define the complete entity structure including:
 * - Field types and validation
 * - Database table mapping
 * - Frontend/backend transformations
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
            schema: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
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
            schema: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
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
                schema: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
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
                schema: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
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
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    email: z.ZodString | z.ZodOptional<z.ZodString>;
    name: z.ZodString | z.ZodOptional<z.ZodString>;
    email_verified: z.ZodString | z.ZodOptional<z.ZodString>;
    image: z.ZodString | z.ZodOptional<z.ZodString>;
    created_at: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const HostSchema: z.ZodObject<{
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    user_id: z.ZodString | z.ZodOptional<z.ZodString>;
    name: z.ZodString | z.ZodOptional<z.ZodString>;
    location: z.ZodString | z.ZodOptional<z.ZodString>;
    description: z.ZodString | z.ZodOptional<z.ZodString>;
    address: z.ZodString | z.ZodOptional<z.ZodString>;
    city: z.ZodString | z.ZodOptional<z.ZodString>;
    state: z.ZodString | z.ZodOptional<z.ZodString>;
    zip_code: z.ZodString | z.ZodOptional<z.ZodString>;
    country: z.ZodString | z.ZodOptional<z.ZodString>;
    latitude: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
    house_rules: z.ZodString | z.ZodOptional<z.ZodString>;
    check_in_time: z.ZodString | z.ZodOptional<z.ZodString>;
    check_out_time: z.ZodString | z.ZodOptional<z.ZodString>;
    max_guests: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    bedrooms: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    bathrooms: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    photos: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
    created_at: z.ZodString | z.ZodOptional<z.ZodString>;
    updated_at: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AvailabilitySchema: z.ZodObject<{
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    host_id: z.ZodString | z.ZodOptional<z.ZodString>;
    start_date: z.ZodString | z.ZodOptional<z.ZodString>;
    end_date: z.ZodString | z.ZodOptional<z.ZodString>;
    status: z.ZodString | z.ZodOptional<z.ZodString>;
    notes: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const BookingRequestSchema: z.ZodObject<{
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    host_id: z.ZodString | z.ZodOptional<z.ZodString>;
    requester_id: z.ZodString | z.ZodOptional<z.ZodString>;
    start_date: z.ZodString | z.ZodOptional<z.ZodString>;
    end_date: z.ZodString | z.ZodOptional<z.ZodString>;
    guests: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
    message: z.ZodString | z.ZodOptional<z.ZodString>;
    status: z.ZodString | z.ZodOptional<z.ZodString>;
    response_message: z.ZodString | z.ZodOptional<z.ZodString>;
    responded_at: z.ZodString | z.ZodOptional<z.ZodString>;
    created_at: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ConnectionSchema: z.ZodObject<{
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    user_id: z.ZodString | z.ZodOptional<z.ZodString>;
    connected_user_id: z.ZodString | z.ZodOptional<z.ZodString>;
    relationship: z.ZodString | z.ZodOptional<z.ZodString>;
    status: z.ZodString | z.ZodOptional<z.ZodString>;
    created_at: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const InvitationSchema: z.ZodObject<{
    id: z.ZodString | z.ZodOptional<z.ZodString>;
    inviter_id: z.ZodString | z.ZodOptional<z.ZodString>;
    invitee_email: z.ZodString | z.ZodOptional<z.ZodString>;
    message: z.ZodString | z.ZodOptional<z.ZodString>;
    token: z.ZodString | z.ZodOptional<z.ZodString>;
    status: z.ZodString | z.ZodOptional<z.ZodString>;
    expires_at: z.ZodString | z.ZodOptional<z.ZodString>;
    accepted_at: z.ZodString | z.ZodOptional<z.ZodString>;
    created_at: z.ZodString | z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SCHEMAS: {
    readonly User: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        email: z.ZodString | z.ZodOptional<z.ZodString>;
        name: z.ZodString | z.ZodOptional<z.ZodString>;
        email_verified: z.ZodString | z.ZodOptional<z.ZodString>;
        image: z.ZodString | z.ZodOptional<z.ZodString>;
        created_at: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Host: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        user_id: z.ZodString | z.ZodOptional<z.ZodString>;
        name: z.ZodString | z.ZodOptional<z.ZodString>;
        location: z.ZodString | z.ZodOptional<z.ZodString>;
        description: z.ZodString | z.ZodOptional<z.ZodString>;
        address: z.ZodString | z.ZodOptional<z.ZodString>;
        city: z.ZodString | z.ZodOptional<z.ZodString>;
        state: z.ZodString | z.ZodOptional<z.ZodString>;
        zip_code: z.ZodString | z.ZodOptional<z.ZodString>;
        country: z.ZodString | z.ZodOptional<z.ZodString>;
        latitude: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        amenities: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
        house_rules: z.ZodString | z.ZodOptional<z.ZodString>;
        check_in_time: z.ZodString | z.ZodOptional<z.ZodString>;
        check_out_time: z.ZodString | z.ZodOptional<z.ZodString>;
        max_guests: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        bedrooms: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        bathrooms: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        photos: z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodOptional<z.ZodArray<z.ZodString>>> | z.ZodPipe<z.ZodTransform<any, unknown>, z.ZodArray<z.ZodString>>;
        created_at: z.ZodString | z.ZodOptional<z.ZodString>;
        updated_at: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Availability: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        host_id: z.ZodString | z.ZodOptional<z.ZodString>;
        start_date: z.ZodString | z.ZodOptional<z.ZodString>;
        end_date: z.ZodString | z.ZodOptional<z.ZodString>;
        status: z.ZodString | z.ZodOptional<z.ZodString>;
        notes: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly BookingRequest: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        host_id: z.ZodString | z.ZodOptional<z.ZodString>;
        requester_id: z.ZodString | z.ZodOptional<z.ZodString>;
        start_date: z.ZodString | z.ZodOptional<z.ZodString>;
        end_date: z.ZodString | z.ZodOptional<z.ZodString>;
        guests: z.ZodNumber | z.ZodOptional<z.ZodNumber>;
        message: z.ZodString | z.ZodOptional<z.ZodString>;
        status: z.ZodString | z.ZodOptional<z.ZodString>;
        response_message: z.ZodString | z.ZodOptional<z.ZodString>;
        responded_at: z.ZodString | z.ZodOptional<z.ZodString>;
        created_at: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Connection: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        user_id: z.ZodString | z.ZodOptional<z.ZodString>;
        connected_user_id: z.ZodString | z.ZodOptional<z.ZodString>;
        relationship: z.ZodString | z.ZodOptional<z.ZodString>;
        status: z.ZodString | z.ZodOptional<z.ZodString>;
        created_at: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly Invitation: z.ZodObject<{
        id: z.ZodString | z.ZodOptional<z.ZodString>;
        inviter_id: z.ZodString | z.ZodOptional<z.ZodString>;
        invitee_email: z.ZodString | z.ZodOptional<z.ZodString>;
        message: z.ZodString | z.ZodOptional<z.ZodString>;
        token: z.ZodString | z.ZodOptional<z.ZodString>;
        status: z.ZodString | z.ZodOptional<z.ZodString>;
        expires_at: z.ZodString | z.ZodOptional<z.ZodString>;
        accepted_at: z.ZodString | z.ZodOptional<z.ZodString>;
        created_at: z.ZodString | z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
/**
 * Helpers to convert between runtime objects and DB rows using entity metadata.
 * - toDbRow: returns an object mapping column -> value suitable for DB insertion (JSON fields stringified)
 * - toDbValues: returns an array of values in the entity field order (useful for prepared statements)
 * - fromDbRow: parses a DB row into a runtime-typed object using the Zod schema (this also applies preprocessors)
 */
export declare function toDbRow<T extends keyof typeof ENTITIES>(entityName: T, obj: Record<string, unknown>): Record<string, unknown>;
export declare function toDbValues<T extends keyof typeof ENTITIES>(entityName: T, obj: Record<string, unknown>): unknown[];
export declare function fromDbRow<T extends keyof typeof SCHEMAS>(schemaName: T, row: Record<string, unknown>): z.infer<typeof SCHEMAS[T]>;
export type User = z.infer<typeof UserSchema>;
export type Host = z.infer<typeof HostSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type Invitation = z.infer<typeof InvitationSchema>;
export {};
