import express, { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { resolvers, typeDefs } from './schema';

const app = express();
const port = process.env.PORT || 4000;

// REST API
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from REST API' });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await server.start();

  app.use('/graphql', cors<cors.CorsRequest>(), express.json(), expressMiddleware(server));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
    console.log(`REST API available at http://localhost:${port}/api`);
  });
}

startServer();