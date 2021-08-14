const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = process.env.DB;

async function connect() {
  await client.connect();
  const db = client.db(dbName);

  const middleware = (req, _, next) => {
    req.db = db;
    next();
  };

  return middleware;
}

module.exports = { client, connect };
