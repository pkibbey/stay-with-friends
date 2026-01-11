import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

// Use the same database as the app
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let PIXABAY_API_KEY = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/PIXABAY_API_KEY=(.+)/);
  if (match) {
    PIXABAY_API_KEY = match[1].trim();
  }
}

if (!PIXABAY_API_KEY) {
  console.warn('⚠️  PIXABAY_API_KEY not found in environment. Images will not be fetched.');
}

// Initialize tables (same as app startup)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    email_verified DATETIME,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hosts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    location TEXT,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    latitude TEXT,
    longitude TEXT,
    amenities TEXT,
    house_rules TEXT,
    check_in_time TEXT,
    check_out_time TEXT,
    max_guests INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    photos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS availabilities (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS booking_requests (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    guests INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    response_message TEXT,
    responded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    connected_user_id TEXT NOT NULL,
    relationship TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    inviter_id TEXT NOT NULL,
    invitee_email TEXT NOT NULL,
    message TEXT,
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: string;
  image: string | null;
}

interface Host {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  location: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: string;
  longitude: string;
  amenities: string;
  house_rules: string;
  check_in_time: string;
  check_out_time: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  photos: string;
}

interface Availability {
  id: string;
  host_id: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

interface BookingRequest {
  id: string;
  host_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  guests: number;
  message: string;
  status: string;
}

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  relationship: string;
  status: string;
}

// Realistic seed data
const seedUsers: User[] = [
  {
    id: randomUUID(),
    email: 'alice@example.com',
    name: 'Alice Johnson',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'bob@example.com',
    name: 'Bob Smith',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'charlie@example.com',
    name: 'Charlie Brown',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'diana@example.com',
    name: 'Diana Prince',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'evan@example.com',
    name: 'Evan Wilson',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'fiona@example.com',
    name: 'Fiona Davis',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'grace@example.com',
    name: 'Grace Lee',
    email_verified: new Date().toISOString(),
    image: null,
  },
  {
    id: randomUUID(),
    email: 'henry@example.com',
    name: 'Henry Chen',
    email_verified: new Date().toISOString(),
    image: null,
  },
];

const hostLocations = [
  { city: 'New York', state: 'NY', country: 'USA', lat: '40.7128', lon: '-74.0060' },
  { city: 'Los Angeles', state: 'CA', country: 'USA', lat: '34.0522', lon: '-118.2437' },
  { city: 'Chicago', state: 'IL', country: 'USA', lat: '41.8781', lon: '-87.6298' },
  { city: 'Houston', state: 'TX', country: 'USA', lat: '29.7604', lon: '-95.3698' },
  { city: 'Phoenix', state: 'AZ', country: 'USA', lat: '33.4484', lon: '-112.0742' },
  { city: 'San Francisco', state: 'CA', country: 'USA', lat: '37.7749', lon: '-122.4194' },
  { city: 'Seattle', state: 'WA', country: 'USA', lat: '47.6062', lon: '-122.3321' },
  { city: 'Denver', state: 'CO', country: 'USA', lat: '39.7392', lon: '-104.9903' },
];

const amenitiesOptions = [
  ['WiFi', 'Kitchen', 'Washer', 'Dryer'],
  ['WiFi', 'Pool', 'Hot Tub', 'Gym'],
  ['WiFi', 'Kitchen', 'Parking', 'TV'],
  ['WiFi', 'Air Conditioning', 'Heating', 'Kitchen'],
  ['WiFi', 'Kitchen', 'Washer', 'Garden'],
  ['WiFi', 'Pool', 'BBQ', 'Parking'],
  ['WiFi', 'Kitchen', 'Fireplace', 'Deck'],
  ['WiFi', 'Kitchen', 'Gym', 'Elevator'],
];

const houseRulesOptions = [
  'No smoking, no pets, quiet hours 10pm-8am',
  'Smoking outside only, pets welcome, be respectful of neighbors',
  'No smoking indoors, small pets allowed with approval',
  'No parties, no guests after 11pm, keep noise down',
  'Respectful guests only, clean up after yourselves',
];

// Function to fetch image from Pixabay API with comprehensive fallback queries
async function fetchPixabayImage(city: string): Promise<string> {
  if (!PIXABAY_API_KEY) {
    throw new Error('PIXABAY_API_KEY not set in environment');
  }

  // Progressively simpler queries for fallback
  const querySequences = [
    [`modern house ${city}`, `house ${city}`, `${city} architecture`],
    [`modern house`, `residential property`, `home interior`],
    [`house`, `building`, `architecture`],
    ['modern', 'home', 'interior'],
  ];

  const attemptedQueries: string[] = [];

  for (const queries of querySequences) {
    for (const queryText of queries) {
      attemptedQueries.push(queryText);
      try {
        const query = encodeURIComponent(queryText);
        const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`;

        const response = await fetch(url);
        const text = await response.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          continue; // Try next query on parse error
        }

        if (data.hits && data.hits.length > 0) {
          // Prefer webformatURL which is more stable than largeImageURL
          const hit = data.hits[0];
          const imageUrl = hit.webformatURL || hit.largeImageURL;

          if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0) {
            return imageUrl;
          }
        }
      } catch (error) {
        // Try next query on fetch error
        continue;
      }
    }
  }

  throw new Error(
    `Failed to fetch image for "${city}". Tried queries: ${attemptedQueries.join(', ')}`
  );
}

// Create seed hosts
const seedHosts: Host[] = [];
for (let i = 0; i < 16; i++) {
  const location = hostLocations[i % hostLocations.length];
  const host: Host = {
    id: randomUUID(),
    user_id: seedUsers[i % seedUsers.length].id,
    name: `Beautiful ${['Apartment', 'House', 'Loft', 'Condo', 'Villa'][i % 5]} in ${location.city}`,
    email: null,
    location: location.city,
    description: [
      'Modern, spacious apartment with stunning city views. Perfect for couples or small families. Close to public transport and local restaurants.',
      'Charming historic house with character. Large backyard, great for gatherings. Located in quiet neighborhood near parks.',
      'Contemporary loft with exposed brick and high ceilings. Pet-friendly, well-equipped kitchen. Great location for exploring the city.',
      'Cozy condo with mountain views. Fully furnished, includes all amenities. Perfect for a peaceful getaway or business stay.',
      'Luxury villa with pool and outdoor entertaining space. Multiple bedrooms, ideal for groups. Premium finishes throughout.',
    ][i % 5],
    address: `${100 + i} Main Street`,
    city: location.city,
    state: location.state,
    zip_code: `${10000 + i}`,
    country: location.country,
    latitude: location.lat,
    longitude: location.lon,
    amenities: JSON.stringify(amenitiesOptions[i % amenitiesOptions.length]),
    house_rules: houseRulesOptions[i % houseRulesOptions.length],
    check_in_time: '3:00 PM',
    check_out_time: '11:00 AM',
    max_guests: [2, 4, 6, 8][i % 4],
    bedrooms: [1, 2, 3][i % 3],
    bathrooms: [1, 1.5, 2][i % 3],
    photos: JSON.stringify([]),
  };
  seedHosts.push(host);
}

// Create seed availabilities - multiple windows for each host
const seedAvailabilities: Availability[] = [];
for (const host of seedHosts) {
  // Current month availability
  seedAvailabilities.push({
    id: randomUUID(),
    host_id: host.id,
    start_date: '2025-12-15',
    end_date: '2025-12-31',
    status: 'available',
    notes: 'Available for holiday season',
  });

  // Next month availability
  seedAvailabilities.push({
    id: randomUUID(),
    host_id: host.id,
    start_date: '2026-01-15',
    end_date: '2026-02-15',
    status: 'available',
    notes: 'Great for winter getaway',
  });

  // Some booked dates for realism
  if (seedHosts.indexOf(host) % 3 === 0) {
    seedAvailabilities.push({
      id: randomUUID(),
      host_id: host.id,
      start_date: '2025-12-01',
      end_date: '2025-12-14',
      status: 'booked',
      notes: 'Already booked',
    });
  }
}

// Create seed booking requests with mix of statuses
const seedBookingRequests: BookingRequest[] = [];
for (let i = 0; i < 10; i++) {
  const requestStatus = ['pending', 'pending', 'approved', 'approved', 'declined'][i % 5];
  const hostIndex = i % seedHosts.length;
  const requesterIndex = (i + 1) % seedUsers.length;

  seedBookingRequests.push({
    id: randomUUID(),
    host_id: seedHosts[hostIndex].id,
    requester_id: seedUsers[requesterIndex].id,
    start_date: '2026-01-15',
    end_date: '2026-01-20',
    guests: (i % 4) + 1,
    message: [
      'Looking forward to experiencing this beautiful property!',
      'Perfect for our family vacation. Can\'t wait to visit!',
      'Interested in this space for a business retreat.',
      'Would love to stay here with my friends. Looks amazing!',
      'Very interested. Please let me know about availability.',
    ][i % 5],
    status: requestStatus,
  });
}

// Create seed connections (friendships) between users
const seedConnections: Connection[] = [];
const connectionPairs = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [1, 6],
];

for (const [userIdx1, userIdx2] of connectionPairs) {
  seedConnections.push({
    id: randomUUID(),
    user_id: seedUsers[userIdx1].id,
    connected_user_id: seedUsers[userIdx2].id,
    relationship: ['friend', 'colleague', 'acquaintance'][Math.floor(Math.random() * 3)],
    status: 'accepted',
  });
}

// Clear existing data and seed
const clearAndSeed = async () => {
  console.log('Clearing existing data...');

  db.exec('DELETE FROM booking_requests');
  db.exec('DELETE FROM availabilities');
  db.exec('DELETE FROM connections');
  db.exec('DELETE FROM invitations');
  db.exec('DELETE FROM hosts');
  db.exec('DELETE FROM users');

  console.log('Seeding users...');
  const insertUser = db.prepare(
    'INSERT INTO users (id, email, name, email_verified) VALUES (?, ?, ?, ?)'
  );
  for (const user of seedUsers) {
    insertUser.run(user.id, user.email, user.name, user.email_verified);
  }

  console.log('Seeding hosts...');
  console.log('Fetching images from Pixabay...');

  // Fetch images for all hosts first
  for (const host of seedHosts) {
    process.stdout.write(`  Fetching image for ${host.name}... `);
    try {
      const imageUrl = await fetchPixabayImage(host.city);
      host.photos = JSON.stringify([imageUrl]);
      console.log('✓');
    } catch (error) {
      console.log('✗');
      console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  const insertHost = db.prepare(`
    INSERT INTO hosts (
      id, user_id, name, email, location, description, address, city, state, 
      zip_code, country, latitude, longitude, amenities, house_rules, 
      check_in_time, check_out_time, max_guests, bedrooms, bathrooms, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const host of seedHosts) {
    insertHost.run(
      host.id,
      host.user_id,
      host.name,
      host.email,
      host.location,
      host.description,
      host.address,
      host.city,
      host.state,
      host.zip_code,
      host.country,
      host.latitude,
      host.longitude,
      host.amenities,
      host.house_rules,
      host.check_in_time,
      host.check_out_time,
      host.max_guests,
      host.bedrooms,
      host.bathrooms,
      host.photos
    );
  }

  console.log('Seeding availabilities...');
  const insertAvailability = db.prepare(`
    INSERT INTO availabilities (id, host_id, start_date, end_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const availability of seedAvailabilities) {
    insertAvailability.run(
      availability.id,
      availability.host_id,
      availability.start_date,
      availability.end_date,
      availability.status,
      availability.notes
    );
  }

  console.log('Seeding booking requests...');
  const insertBookingRequest = db.prepare(`
    INSERT INTO booking_requests (
      id, host_id, requester_id, start_date, end_date, guests, message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const booking of seedBookingRequests) {
    insertBookingRequest.run(
      booking.id,
      booking.host_id,
      booking.requester_id,
      booking.start_date,
      booking.end_date,
      booking.guests,
      booking.message,
      booking.status
    );
  }

  console.log('Seeding connections...');
  const insertConnection = db.prepare(`
    INSERT INTO connections (id, user_id, connected_user_id, relationship, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const connection of seedConnections) {
    insertConnection.run(
      connection.id,
      connection.user_id,
      connection.connected_user_id,
      connection.relationship,
      connection.status
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log(`   - ${seedUsers.length} users`);
  console.log(`   - ${seedHosts.length} hosts`);
  console.log(`   - ${seedAvailabilities.length} availabilities`);
  console.log(`   - ${seedBookingRequests.length} booking requests`);
  console.log(`   - ${seedConnections.length} connections`);
};

try {
  clearAndSeed().then(() => {
    db.close();
  });
} catch (error) {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
}
