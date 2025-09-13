import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { resolvers, typeDefs } from './schema';
import { insertPerson, getAllPeople } from './db';

const app = express();
const port = process.env.PORT || 8000;

// Seed database with sample data
const seedDatabase = () => {
  const existingPeople = getAllPeople.all();
  if (existingPeople.length === 0) {
    const samplePeople = [
      {
        name: 'Sarah Johnson',
        location: 'San Francisco',
        relationship: 'Friend',
        availability: 'Dec 15-20',
        description: 'Spacious guest room with private bath'
      },
      {
        name: 'Mike Chen',
        location: 'New York',
        relationship: 'Colleague',
        availability: 'Jan 5-12',
        description: 'Cozy apartment downtown'
      },
      {
        name: 'Emma Davis',
        location: 'Austin, TX',
        relationship: 'Friend',
        availability: 'Nov 20-25',
        description: 'Beautiful house with garden'
      },
      {
        name: 'Alex Rodriguez',
        location: 'Seattle, WA',
        relationship: 'Family',
        availability: 'Dec 1-7',
        description: 'Modern condo with city views'
      },
      {
        name: 'Lisa Wang',
        location: 'Los Angeles',
        relationship: 'Friend',
        availability: 'Jan 15-20',
        description: 'Beachfront apartment'
      }
    ];

    for (const person of samplePeople) {
      insertPerson.run(
        person.name,
        person.location,
        person.relationship,
        person.availability,
        person.description
      );
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

  // Seed database on startup
  seedDatabase();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
    console.log(`REST API available at http://localhost:${port}/api`);
  });
}

startServer();