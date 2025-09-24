import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { resolvers, typeDefs } from './schema';

// Initialize database by importing db.ts (tables are created on import)
console.log('Database initialized');

const app = express();
const port = process.env.PORT || 4000;

// JWT secret - in production this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT payload interface
interface JWTPayload {
  sub?: string;
  email?: string;
  name?: string;
  backendUserId?: string;
}
 
// Enable CORS for REST endpoints (GraphQL uses its own middleware)
app.use(cors());

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Ensure avatars directory exists and serve it statically
const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });
app.use('/avatars', express.static(avatarsDir));

// Authentication context interface
interface AuthContext {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// Middleware to extract user from JWT token
const getAuthContext = (req: Request): AuthContext => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {};
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      user: {
        id: decoded.backendUserId || decoded.sub || '',
        email: decoded.email || '',
        name: decoded.name,
      },
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return {};
  }
};

// Multer setup for handling multipart/form-data image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Generate UUID-based filename to prevent naming conflicts
    const uuid = uuidv4()
    // Keep original extension
    const ext = path.extname(file.originalname)
    cb(null, `${uuid}${ext}`)
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

const server = new ApolloServer<AuthContext>({
  typeDefs,
  resolvers,
});

async function startServer() {  
  await server.start();

  app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server, {
    context: async ({ req }) => getAuthContext(req as Request),
  }));

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

  // Avatar upload endpoint with image resizing
  app.post('/api/upload-avatar', upload.single('avatar'), async (req: Request, res: Response) => {
    try {
      // Check authentication
      const authContext = getAuthContext(req);
      if (!authContext.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const file: any = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: 'No avatar file uploaded' });
      }

      // Generate UUID-based filename for avatar to prevent naming conflicts
      const uuid = uuidv4()
      const avatarFilename = `avatar-${authContext.user.id}-${uuid}.jpg`;
      const avatarPath = path.join(avatarsDir, avatarFilename);

      // Process image with Sharp: resize to 256x256 and convert to JPEG
      await sharp(file.path)
        .resize(256, 256, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(avatarPath);

      // Delete the temporary uploaded file
      fs.unlinkSync(file.path);

      // Generate URL for the processed avatar
      const avatarUrl = `${req.protocol}://${req.get('host')}/avatars/${avatarFilename}`;

      res.json({ 
        url: avatarUrl,
        filename: avatarFilename,
        message: 'Avatar uploaded and resized successfully'
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      
      // Clean up temporary file if it exists
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const file: any = (req as any).file;
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (cleanupError) {
        console.error('Failed to clean up temporary file:', cleanupError);
      }

      res.status(500).json({ error: 'Failed to process avatar image' });
    }
  })

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
    console.log(`REST API available at http://localhost:${port}/api`);
  });
}

startServer();