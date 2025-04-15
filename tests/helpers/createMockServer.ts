import { expressMiddleware } from '@apollo/server/express4';

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