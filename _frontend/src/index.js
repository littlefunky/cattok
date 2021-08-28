import React from "react";
import ReactDOM from "react-dom";
import Routers from "./router";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

export const queryClient = new QueryClient();

ReactDOM.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <Routers />
    </QueryClientProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
