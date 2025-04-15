import { GraphQLInteraction, Matchers, Pact } from "@pact-foundation/pact";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client/core";

const provider = new Pact({
    dir: "./pacts", // to do: change to your desired directory
    port: 4000,
    consumer: "GraphQLConsumer",
    provider: "GraphQLProvider",
    logLevel: "debug",
});

const expensesExample = [
    { id: 1, name: 'Lunch', venue: 'Cafe', amount: 15.5, date: '2023-10-01', __typename: 'Expense' },
    { id: 2, name: 'Dinner', venue: 'Restaurant', amount: 25.0, date: '2023-10-02', __typename: 'Expense' },
    { id: 3, name: 'Groceries', venue: 'Supermarket', amount: 50.0, date: '2023-10-03', __typename: 'Expense' }
];

const expectedExpensesBody = Matchers.like(expensesExample);

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
