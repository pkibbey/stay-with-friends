import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { resolvers, typeDefs } from './schema';
import { insertHost, getAllHosts, insertAvailability } from './db';

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for REST endpoints (GraphQL uses its own middleware)
app.use(cors());

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer setup for handling multipart/form-data image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // keep original extension
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'))
    }
    cb(null, true)
  }
})

// Seed database with sample data
const seedDatabase = () => {
  const existingHosts = getAllHosts.all();
  if (existingHosts.length === 0) {
    const sampleHosts = [
      {
        name: 'Sarah Johnson',
        location: 'San Francisco',
        relationship: 'Friend',
        description: 'Spacious guest room with private bath',
        availabilities: [
          { startDate: '2025-12-15', endDate: '2025-12-20', notes: 'Holiday break' },
          { startDate: '2025-12-22', endDate: '2025-12-28', notes: 'Christmas week' }
        ]
      },
      {
        name: 'Mike Chen',
        location: 'New York',
        relationship: 'Colleague',        
        description: 'Cozy apartment downtown',
        availabilities: [
          { startDate: '2026-01-05', endDate: '2026-01-12', notes: 'New Year vacation' },
          { startDate: '2026-01-18', endDate: '2026-01-22', notes: 'Weekend stay' }
        ]
      },
      {
        name: 'Emma Davis',
        location: 'Austin, TX',
        relationship: 'Friend',        
        description: 'Beautiful house with garden',
        availabilities: [
          { startDate: '2025-11-20', endDate: '2025-11-25', notes: 'Thanksgiving week' }
        ]
      },
      {
        name: 'Alex Rodriguez',
        location: 'Seattle, WA',
        relationship: 'Family',        
        description: 'Modern condo with city views',
        availabilities: [
          { startDate: '2025-12-01', endDate: '2025-12-07', notes: 'Family visit' }
        ]
      },
      {
        name: 'Lisa Wang',
        location: 'Los Angeles',
        relationship: 'Friend',        
        description: 'Beachfront apartment',
        availabilities: [
          { startDate: '2026-01-15', endDate: '2026-01-20', notes: 'Winter getaway' },
          { startDate: '2025-12-10', endDate: '2025-12-15', notes: 'Pre-holiday visit' }
        ]
      }
    ];

    for (const host of sampleHosts) {
      const result = insertHost.run(
        host.name,
        null, // email - sample data doesn't have emails
        host.location,
        host.relationship,
        host.description,
        null, // address
        null, // city
        null, // state
        null, // zip_code
        null, // country
        null, // latitude
        null, // longitude
        JSON.stringify(['WiFi', 'Kitchen']), // amenities
        'No smoking, quiet hours after 10pm', // house_rules
        '3:00 PM', // check_in_time
        '11:00 AM', // check_out_time
        2, // max_guests
        1, // bedrooms
        1, // bathrooms
        JSON.stringify(['https://example.com/photo1.jpg']) // photos
      );
      const hostId = result.lastInsertRowid;

      // Add availability records
      for (const availability of host.availabilities) {
        insertAvailability.run(
          hostId,
          availability.startDate,
          availability.endDate,
          'available',
          availability.notes
        );
      }
    }
    console.log('Database seeded with sample data');
  }
};

// REST API
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from REST API' });
});

app.post('/api/seed', (req: Request, res: Response) => {
  try {
    seedDatabase();
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

  // Image upload endpoint
  app.post('/api/upload-image', upload.single('image'), (req: Request, res: Response) => {
    // multer adds the file to req.file
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file: any = (req as any).file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    res.json({ url })
  })

  // Seed database on startup
  seedDatabase();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
    console.log(`REST API available at http://localhost:${port}/api`);
  });
}

startServer();