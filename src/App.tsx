import React, { useState } from "react";
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import SendMessage from "./SendMessage";
import Chats from "./Chats";

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/subscriptions",
  options: {
    reconnect: true,
  },
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

function App() {
  const [name, setName] = useState<string>("");
  const [entered, setEntered] = useState<boolean>(false);

  return (
    <ApolloProvider client={client}>
      <div>
        {!entered && (
          <div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
            <button onClick={() => setEntered(true)}>Enter chat</button>
          </div>
        )}
        {name !== "" && entered && (
          <div>
            <Chats />
            <SendMessage name={name} />
          </div>
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
