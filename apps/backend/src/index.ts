import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { resolvers, typeDefs } from './schema';

// Initialize database by importing db.ts (tables are created on import)
console.log('Database initialized');

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

// REST API
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from REST API' });
});

// Reset database - FOR DEVELOPMENT ONLY
app.post('/api/reset', (req: Request, res: Response) => {
  try {
    const dbPath = path.join(__dirname, '..', 'database.db');
    
    // Delete the database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    // Delete uploaded files
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      }
    }
    
    res.json({ 
      message: 'Database and uploads cleared successfully. Restart the server to reinitialize.',
      note: 'Please restart the backend server to recreate the database schema.'
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Failed to reset database' });
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

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
    console.log(`REST API available at http://localhost:${port}/api`);
  });
}

startServer();