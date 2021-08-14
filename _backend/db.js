const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "cattok_dev";

async function connect() {
  await client.connect();
  const db = client.db(dbName);

  const middleware = (req, _, next) => {
    req.db = db
    next()
  }

  return middleware;
}

module.exports = { connect };
