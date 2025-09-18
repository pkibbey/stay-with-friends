# Stay With Friends - Entity Specification

## Overview

Stay With Friends is a platform that enables friends to share their homes with each other, creating a trusted network of accommodations. The application facilitates hosting opportunities, availability management, booking requests, and social connections between friends.

### Core Concepts

The platform operates on several key principles:
- **Trust-based Network**: Users connect with friends to create a trusted accommodation network
- **Host-Guest Relationships**: Friends can offer their homes as hosts and stay as guests
- **Availability Management**: Hosts control when their properties are available for stays
- **Booking Coordination**: Simple request system for coordinating stays between friends
- **Social Connections**: User network management for building trusted relationships

---

## Entity Definitions

### 1. User Entity

**Purpose**: Represents registered users of the platform who can both host and request accommodations.

**Properties**:
- `id` (string): Unique identifier for the user
- `email` (string, required, unique): User's email address for authentication and communication
- `name` (string, optional): Display name of the user
- `emailVerified` (string, optional): Timestamp when email was verified
- `image` (string, optional): URL to user's profile picture
- `createdAt` (string, required): Timestamp when user account was created

**Relationships**:
- One-to-Many with `Host` (user can create multiple hosting properties)
- One-to-Many with `Connection` (user can have multiple friend connections)
- One-to-Many with `BookingRequest` (user can make multiple booking requests)

**Business Rules**:
- Email must be unique across the platform
- Users must verify their email to fully participate
- Users can act as both hosts and guests

**Database Schema**:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified DATETIME,
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

### 2. Host Entity (Property/Listing)

**Purpose**: Represents a property or accommodation that a user offers to friends for stays.

**Properties**:
- `id` (string): Unique identifier for the hosting property
- `name` (string, required): Title/name of the property (e.g., "Cozy Downtown Apartment")
- `email` (string, optional): Contact email for the host (may differ from user email)
- `location` (string, optional): General location description
- `availability` (string, optional): General availability description
- `description` (string, optional): Detailed description of the property
- `address` (string, optional): Street address
- `city` (string, optional): City name
- `state` (string, optional): State/province
- `zipCode` (string, optional): Postal code
- `country` (string, optional): Country name
- `latitude` (number, optional): GPS latitude coordinate
- `longitude` (number, optional): GPS longitude coordinate
- `amenities` (string[], optional): List of available amenities
- `houseRules` (string, optional): Rules and guidelines for guests
- `checkInTime` (string, optional): Standard check-in time (e.g., "3:00 PM")
- `checkOutTime` (string, optional): Standard check-out time (e.g., "11:00 AM")
- `maxGuests` (number, optional): Maximum number of guests allowed
- `bedrooms` (number, optional): Number of bedrooms
- `bathrooms` (number, optional): Number of bathrooms
- `photos` (string[], optional): Array of photo URLs
- `isActive` (boolean, required): Whether the hosting is currently active
- `createdAt` (string, required): When the hosting was created
- `updatedAt` (string, required): When the hosting was last updated

**Relationships**:
- Many-to-One with `User` (user owns the hosting)
- One-to-Many with `Availability` (host has multiple availability periods)
- One-to-Many with `BookingRequest` (host can receive multiple booking requests)

**Business Rules**:
- Name is required for all hosts
- Email should be unique if provided
- Inactive hosts are hidden from search results
- Location information helps with discovery and planning
- Photos enhance property presentation

**Database Schema**:
```sql
CREATE TABLE hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  location TEXT,
  availability TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  amenities TEXT, -- JSON array stored as text
  house_rules TEXT,
  check_in_time TEXT,
  check_out_time TEXT,
  max_guests INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  photos TEXT -- JSON array stored as text
)
```

---

### 3. Availability Entity

**Purpose**: Represents specific date ranges when a host property is available for bookings.

**Properties**:
- `id` (string): Unique identifier for the availability period
- `hostId` (string, required): Reference to the host property
- `startDate` (string, required): Start date of availability (ISO date format)
- `endDate` (string, required): End date of availability (ISO date format)
- `status` (string, required): Current status ("available", "booked", "blocked")
- `notes` (string, optional): Additional notes about this availability period

**Relationships**:
- Many-to-One with `Host` (availability belongs to a host)

**Business Rules**:
- Start date must be before or equal to end date
- Overlapping availability periods for the same host should be merged or flagged
- Status determines whether period can be booked
- Default status is "available"

**Valid Status Values**:
- `available`: Open for booking requests
- `booked`: Already reserved by a guest
- `blocked`: Temporarily unavailable (host blocked dates)

**Database Schema**:
```sql
CREATE TABLE availabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  notes TEXT,
  FOREIGN KEY (host_id) REFERENCES hosts (id)
)
```

---

### 4. BookingRequest Entity

**Purpose**: Represents a request from a guest to stay at a host's property during specific dates.

**Properties**:
- `id` (string): Unique identifier for the booking request
- `hostId` (string, required): Reference to the requested host property
- `requesterId` (string, required): ID of the user making the request
- `startDate` (string, required): Requested start date (ISO date format)
- `endDate` (string, required): Requested end date (ISO date format)
- `guests` (number, required): Number of guests for the stay
- `message` (string, optional): Personal message from requester to host
- `status` (string, required): Current status of the request
- `createdAt` (string, required): When the request was created

**Relationships**:
- Many-to-One with `Host` (request is for a specific host)
- Many-to-One with `User` (request is made by a specific user)

**Business Rules**:
- Start date must be before end date
- Number of guests cannot exceed host's maxGuests limit
- Requests can only be made for available date ranges
- Only authenticated users can make booking requests
- Host reviews and responds to requests

**Valid Status Values**:
- `pending`: Awaiting host response
- `approved`: Host has accepted the request
- `declined`: Host has declined the request
- `cancelled`: Requester cancelled the request

**Database Schema**:
```sql
CREATE TABLE booking_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  requester_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  guests INTEGER NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES hosts (id),
  FOREIGN KEY (requester_id) REFERENCES users (id)
)
```

---

### 5. Connection Entity

**Purpose**: Represents friendship/social connections between users on the platform.

**Properties**:
- `id` (string): Unique identifier for the connection
- `userId` (string, required): ID of the user who initiated the connection
- `connectedUserId` (string, required): ID of the user being connected to
- `relationship` (string, optional): Type of relationship (e.g., "friend", "family", "colleague", "roommate")
- `status` (string, required): Current status of the connection
- `createdAt` (string, required): When the connection was created

**Relationships**:
- Many-to-One with `User` (for the initiating user)
- Many-to-One with `User` (for the connected user)

**Business Rules**:
- Users cannot connect to themselves
- Connections are directional but can be mutual
- Users can block unwanted connections
- Connected users have enhanced visibility of each other's listings
- Relationship type helps provide context for the connection and can be used for filtering or organization

**Valid Status Values**:
- `pending`: Connection request sent but not yet accepted
- `accepted`: Both users are connected
- `blocked`: One user has blocked the other

**Database Schema**:
```sql
CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  connected_user_id INTEGER NOT NULL,
  relationship TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (connected_user_id) REFERENCES users (id),
  UNIQUE(user_id, connected_user_id)
)
```

---

## Entity Relationships Diagram

```
User
├── hosts (1:N) → Host
├── connections (1:N) → Connection
└── booking_requests (1:N) → BookingRequest

Host
├── user (N:1) → User
├── availabilities (1:N) → Availability
└── booking_requests (1:N) → BookingRequest

Availability
└── host (N:1) → Host

BookingRequest
├── host (N:1) → Host
└── requester (N:1) → User

Connection
├── user (N:1) → User
└── connected_user (N:1) → User
```

---

## Data Flow Patterns

### 1. User Registration & Authentication
1. User provides email and basic info
2. User entity created with pending email verification
3. Email verification updates `emailVerified` field
4. User can now create hosts and make booking requests

### 2. Creating a Host Property
1. Authenticated user creates new Host entity
2. Host is linked to user via backend association
3. Host can optionally create initial Availability periods
4. Host becomes searchable by connected friends

### 3. Booking Flow
1. Guest searches for available properties
2. Guest selects dates and creates BookingRequest
3. Host receives notification of request
4. Host approves/declines request
5. If approved, Availability status may be updated to "booked"

### 4. Friend Connection Flow
1. User A sends connection request to User B (via email)
2. Connection entity created with "pending" status
3. User B accepts/declines the connection
4. If accepted, both users can see each other's listings

---

## Business Rules & Constraints

### Data Integrity
- Email addresses must be unique across users
- Host emails must be unique if provided
- Date ranges must be valid (start ≤ end)
- Guest count cannot exceed host capacity

### Privacy & Security
- Users only see listings from connected friends
- Personal information is protected
- Email verification required for full platform access

### Availability Management
- Hosts control their availability calendars
- Overlapping availabilities should be handled gracefully
- Booking requests must align with available periods

### Search & Discovery
- Search includes name and location information
- Inactive hosts are excluded from search results
- Geographic coordinates enable map-based discovery
- Connection relationships provide context for host discovery

---

## Future Considerations

### Potential Entity Extensions

**Review Entity**: Post-stay reviews and ratings
```typescript
interface Review {
  id: string
  bookingRequestId: string
  reviewerId: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: string
}
```

**Notification Entity**: System notifications and messages
```typescript
interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}
```

**Payment Entity**: Financial transactions (if monetization added)
```typescript
interface Payment {
  id: string
  bookingRequestId: string
  amount: number
  currency: string
  status: string
  createdAt: string
}
```

### Scalability Considerations
- Database indexing on frequently queried fields
- Caching for search results and availability data
- Image storage optimization for property photos
- Geographic search optimization for location-based queries

This entity specification provides a complete foundation for the Stay With Friends application, enabling trusted accommodation sharing between friends while maintaining data integrity and user privacy.