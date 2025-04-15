import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

export function query(): any {
  return client
  .query({
    query: gql(`AllExpenses { expenses { id name venue amount date __typename } }`),
})
    .then((result: any) => result.data);
}

