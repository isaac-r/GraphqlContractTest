import { GraphQLInteraction, Matchers, Pact } from "@pact-foundation/pact";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client/core";

const provider = new Pact({
    dir: "./pacts",
    port: 4000,
    consumer: "GraphQLConsumer",
    provider: "GraphQLProvider",
    logLevel: "debug",
});

const expensesExample = [
    { id: "1", name: 'Lunch', venue: 'Cafe', amount: 15.5, date: '2023-10-01', __typename: 'Expense' }
];

const expectedExpensesBody = Matchers.eachLike({
    id: Matchers.regex({ generate: '1', matcher: '^\\d+$' }), // Matches either a string or an integer
    name: Matchers.like("Lunch"),
    venue: Matchers.like("Cafe"),
    amount: Matchers.like(15.5),
    date: Matchers.like("2023-10-01"),
    __typename: Matchers.like("Expense"),
});

const GET_ALL_EXPENSES = gql`query AllExpenses { expenses { id name venue amount date __typename } }`;

const normalisedQuery = GET_ALL_EXPENSES.loc?.source.body.replace(/\s+/g, ' ').trim();

describe("GraphQL Consumer Pact Test", () => {
    beforeAll(() => provider.setup());
    afterAll(() => provider.finalize());

    afterEach(() => provider.verify());

    it("should return a list of expenses", async () => {
        await provider.addInteraction(
            new GraphQLInteraction()
            .given("A user has expenses")
                .uponReceiving("a request for expenses")
                .withRequest({
                    path: '/graphql',
                    method: 'POST',
                })
                .withOperation(`AllExpenses`)
                .withQuery(normalisedQuery)
                .withVariables({})
                .willRespondWith({
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: {
                        data: {
                            expenses: expectedExpensesBody
                        }
                    }
                })
            );
        
        const client = new ApolloClient({
            uri: 'http://localhost:4000/graphql',
            cache: new InMemoryCache(),
        });

        const result = await client.query({
            query: GET_ALL_EXPENSES,
        });

        expect(result.data).toEqual({
            expenses: expensesExample,
        });
    });
});
