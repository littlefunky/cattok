import react from "react";
import Home from "./components/pages/home";
import Login from "./components/pages/login";
import Register from "./components/pages/register";
import { Route, Switch } from "react-router-dom";

import css from "./App.css";

const Routers = () => {
  return (
    <div>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/authenticate/login">
          <Login />
        </Route>
        <Route path="/authenticate/register">
          <Register />
        </Route>
        <Route path="*">
          <>404</>
        </Route>
      </Switch>
    </div>
  );
};

export default Routers;
