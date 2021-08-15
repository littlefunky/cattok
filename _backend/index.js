require("dotenv").config();

//Resources
const User = require("./resources/user");

const db = require("./db");

const { responser } = require("./utils");

const express = require("express");

async function server() {
  const app = express();

  //Helper middleware
  app.use(await db.middleware());
  app.use(express.json());
  app.use(responser);
  app.use(express.urlencoded({ extended: false }));

  const api = express.Router();

  User(api);

  app.use("/v1", api);

  app.use((err, req, res, next) => {
    //Error handling
  });

  app.listen(3000, () => {
    console.log("Listening on 3000");
  });
}

server();
