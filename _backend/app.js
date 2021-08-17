const User = require("./resources/user");
const Post = require("./resources/post");

const { responser, error, auth } = require("./utils");

const express = require("express");

async function app(db) {
  const app = express();

  const databaseMiddleware = (req, _, next) => {
    req.db = db;
    next();
  };

  //Helper middleware
  app.use(databaseMiddleware);
  app.use(auth);
  app.use(express.json());
  app.use(responser);
  app.use(express.urlencoded({ extended: false }));

  const api = express.Router();

  User(api);
  Post(api);

  app.use("/v1", api);

  //Error handler
  app.use(error);

  // app.use((err, req, res, next) => {
  //   // Error handling
  //   res.error(req)
  // });

  return app;
}

module.exports = app;
