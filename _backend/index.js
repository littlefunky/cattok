require("dotenv").config();

//Resources
const User = require("./resources/user");

const DB = require("./db");

const { responser } = require("./utils");

const OpenApiValidator = require("express-openapi-validator");
const express = require("express");

async function server() {
  const app = express();

  console.log("Connecting to Mongo");
  const db = await DB.connect();
  console.log("Connected to Mongo");
  app.use(db);

  app.use(express.json());
  app.use(responser);
  app.use(express.urlencoded({ extended: true }));

  app.use(
    OpenApiValidator.middleware({
      apiSpec: "./openapi.yaml",
      validateRequests: true,
      validateResponses: true,
      fileUploader: {
        dest: process.env.UPLOAD_DEST,
      },
    })
  );

  const api = express.Router();

  User(api);

  app.use("/v1", api);

app.use((err, req, res, next) => {
  const isError = err.status < 500;

  res.status(err.status || 500).json({
    status: isError ? "fail" : "error",
    [isError ? "data" : "message"]:  err.errors || err.message,
  });
});

  app.listen(3000, () => {
    console.log("Listening on 3000");
  });
}

server();
