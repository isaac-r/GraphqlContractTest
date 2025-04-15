import createMockServer from "../helpers/createMockServer";
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import { Verifier } from "@pact-foundation/pact";
import express from 'express';
import { log } from "console";

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
    expenseById: (_, { id }) => expenses.find(expense => expense.id === parseInt(id)),
  },
};

const app = express();

const httpServer = http.createServer(app);

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
});

describe('Pact Verification', () => {
    beforeAll(async () => {
        await createMockServer(server, app, httpServer);
        console.log('Mock server started');
    });
    afterAll(async () => {
        await server.stop();
    });
    it('should verify the pact', async () => {
        const opts = {
            provider: 'GraphQLProvider',
            providerBaseUrl: 'http://localhost:4000/graphql',
            pactUrls: ['./pacts/GraphQLConsumer-GraphQLProvider.json'],
            timeout: 60000,
        };
        console.log('Starting Pact verification...');
        const verifier = new Verifier(opts);
        return verifier.verifyProvider().then(async () => {
            console.log('Pact verification completed');
        });
    });
});
