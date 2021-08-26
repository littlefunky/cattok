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

  app.use(responser);
  app.use(databaseMiddleware);
  app.use(auth);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    //TODO explicit set host
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });

  const api = express.Router();

  User(api);
  Post(api);

  app.use("/v1", api);
  app.use("/assets", express.static(process.env.UPLOAD_DEST));

  app.use(error);

  return app;
}

module.exports = app;
