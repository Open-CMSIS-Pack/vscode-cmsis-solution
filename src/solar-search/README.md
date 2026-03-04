# Solar Search client

The Solar Search client gives us an interface to the Solar GraphQL API. The API allows us to search for hardware and software in the CMSIS ecosystem.

The client code is generated from the GraphQL schema, and can be found in [./graphql/client/schema.ts](./graphql/client/schema.ts).

The configuration used to generate the client can be found in [./graphql/codegen.ts](./graphql/codegen.ts).

To generate a new version of the client, run `npm run generate-solar-search-client`.
