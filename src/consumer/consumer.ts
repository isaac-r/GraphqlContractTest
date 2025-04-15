import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { QUERY } from '../constants';

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

export function query(): any {
  return client
  .query({
    query: gql(QUERY), // Use the minified query string
})
    .then((result: any) => result.data);
}

