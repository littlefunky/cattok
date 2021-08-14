require("dotenv").config();

//Resources
const User = require("./resources/user");

const DB = require("./db");

const { responser } = require("./utils");

const OpenApiValidator = require("express-openapi-validator");
const express = require("express");

async function server() {
  const app = express();

  const db = await DB.connect();
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
    console.error(err);
    if (err.status < 500) {
      res.status(err.status).json({
        status: "fail",
        data: err.errors,
      });
    } else {
      res.status(err.status).json({
        status: "error",
        message: err.message,
      });
    }
  });

  app.listen(3000, () => {
    console.log("Listening on 3000");
  });
}

server();
