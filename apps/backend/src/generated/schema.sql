-- Generated SQL - do not edit
PRAGMA foreign_keys = ON;

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
  status TEXT DEFAULT available,
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
  status TEXT DEFAULT pending,
  response_message TEXT,
  responded_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  connected_user_id TEXT NOT NULL,
  relationship TEXT,
  status TEXT DEFAULT pending,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  inviter_id TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  message TEXT,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT pending,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
