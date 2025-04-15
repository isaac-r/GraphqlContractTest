import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

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

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Server ready at: ${url}`);