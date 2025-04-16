import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

async function createMockServer(server: any, app: any, httpServer: any) {
  await server.start().then(async () => {
    app.use(
      '/graphql',
      expressMiddleware(server),
    );

    await new Promise<void>((resolve) => { httpServer.listen({ port: 4000 }, resolve); });

    app.get('/status', (_, res) => {
      res.status(200).send('OK');
    });
    console.log('🚀 Server Ready on http://localhost:4000/graphql');
  });
}
  
export default createMockServer;

const typeDefs = `#graphql
  type Expense {
    id: ID!
    name: String
    venue: String
    amount: Float
    date: String
  }

  type Query {
    expenses: [Expense]
    expenseById(id: ID!): Expense
  }
`;

const expenses = [
  { id: 1, name: 'Lunch', venue: 'Cafe', amount: 15.5, date: '2023-10-01' },
  { id: 2, name: 'Dinner', venue: 'Restaurant', amount: 25.0, date: '2023-10-02' },
  { id: 3, name: 'Groceries', venue: 'Supermarket', amount: 50.0, date: '2023-10-03' }
];

const resolvers = {
  Query: {
    expenses: () => expenses,
    expenseById: (_, { id }) => expenses.find(expense => parseInt(expense.id.toString()) === parseInt(id.toString())),
  },
};

export const startMockServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server),
  );

  return new Promise<{ stop: () => Promise<void> }>((resolve) => {
    httpServer.listen({ port: 4000 }, () => {
      console.log('🚀 Mock Server Ready on http://localhost:4000/graphql');
      resolve({
        stop: async () => {
          await server.stop();
          await new Promise<void>((res) => httpServer.close(() => res()));
        },
      });
    });
  });
}