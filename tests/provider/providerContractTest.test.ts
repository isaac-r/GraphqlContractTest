import { startMockServer } from "../helpers/createMockServer";
import { Verifier } from "@pact-foundation/pact";

describe('GraphQL Server', () => {
  let server: { stop: () => Promise<void> };

  beforeAll(async () => {
    server = await startMockServer();
  });
  afterAll(async () => {
    await server.stop();
  });
  it('should return a list of expenses', async () => {
    const opts = {
      provider: 'GraphQLProvider',
      providerBaseUrl: 'http://localhost:4000/graphql',
      pactUrls: ['./pacts/GraphQLConsumer-GraphQLProvider.json'],
      timeout: 60000,
    };
    await new Verifier(opts).verifyProvider();
  });
});
