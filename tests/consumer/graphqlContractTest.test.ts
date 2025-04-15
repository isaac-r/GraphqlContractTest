import { GraphQLInteraction, Matchers, Pact } from "@pact-foundation/pact";
import { query } from "../../src/consumer/consumer";
import { QUERY } from "../../src/constants";

describe("GraphQL Consumer Pact Test", () => {

    const provider = new Pact({
        dir: "./pacts", // to do: change to your desired directory
        port: 4000,
        consumer: "GraphQLConsumer",
        provider: "GraphQLProvider",
        logLevel: "debug",
    });

    const expensesExample = [
        { id: 1, name: 'Lunch', venue: 'Cafe', amount: 15.5, date: '2023-10-01' },
        { id: 2, name: 'Dinner', venue: 'Restaurant', amount: 25.0, date: '2023-10-02' },
        { id: 3, name: 'Groceries', venue: 'Supermarket', amount: 50.0, date: '2023-10-03' }
    ];

    const expectedExpensesBody = Matchers.like(expensesExample);

    beforeAll(async () => {
        await provider.setup();
        console.log("Pact mock server is running on port 4000");
    });

    afterAll(() => provider.finalize())

    describe("GraphQL Consumer", () => {
        beforeAll(() => {
            const graphqlQuery = new GraphQLInteraction()
                .given("A user has expenses")
                .uponReceiving("a request for expenses")
                .withRequest({
                    path: '/graphql',
                    method: 'POST',
                    body: {
                        query: `{
    expenses {
      id
      name
      venue
      amount
      date
      __typename
    }
}`,
                        variables: {}, // Include an empty variables object
                    },
                })
                .withQuery(`{
  expenses {
    id
    name
    venue
    amount
    date
    __typename
  }
}`)
                .willRespondWith({
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: {
                        data: {
                            expenses: expectedExpensesBody
                        }
                    }
                });
            return provider.addInteraction(graphqlQuery);
        });
        it("should return a list of expenses", async () => {
            const result = await query();
            return expect(result.expenses).toEqual({
                expectedExpensesBody,
            });
        });
    });
});
