import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

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
    expenseById: (_, { id }) => expenses.find(expense => expense.id === parseInt(id.toString())),
  },
};

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
});

async function startApolloServer() {
  await server.start().then(async () => {
    app.use(
      '/graphql',
      bodyParser.json(),
      expressMiddleware(server),
    );

    await new Promise<void>((resolve) => { httpServer.listen({ port: 4000 }, resolve); });

    app.get('/status', (_, res) => {
      res.status(200).send('OK');
    });
    console.log('🚀 Server Ready on http://localhost:4000/graphql');
  });
}

startApolloServer();
