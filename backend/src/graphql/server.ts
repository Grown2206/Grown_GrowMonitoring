import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { AuthRequest } from '../middleware/auth';
import http from 'http';
import { Request, Response } from 'express';

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Context interface
export interface GraphQLContext {
  user?: {
    id: number;
    role: string;
  };
}

// Create context function
export const createContext = async (req: AuthRequest): Promise<GraphQLContext> => {
  return {
    user: req.user,
  };
};

// Initialize Apollo Server
export const createApolloServer = async (httpServer: http.Server) => {
  const server = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
      // Customize error formatting
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          ...(process.env.NODE_ENV === 'development' && {
            stacktrace: error.extensions?.stacktrace,
          }),
        },
      };
    },
  });

  await server.start();

  return server;
};

// Manual Express middleware for GraphQL
export const graphqlHandler = (server: ApolloServer<GraphQLContext>) => {
  return async (req: AuthRequest, res: Response) => {
    try {
      const context = await createContext(req);

      const result = await server.executeOperation(
        {
          query: req.body.query,
          variables: req.body.variables,
          operationName: req.body.operationName,
        },
        {
          contextValue: context,
        }
      );

      // Set CORS headers
      res.setHeader('Content-Type', 'application/json');

      if (result.body.kind === 'single') {
        res.status(200).json(result.body.singleResult);
      } else {
        res.status(200).json({ errors: [{ message: 'Unexpected result' }] });
      }
    } catch (error: any) {
      console.error('GraphQL execution error:', error);
      res.status(500).json({
        errors: [{ message: error.message || 'Internal server error' }],
      });
    }
  };
};
