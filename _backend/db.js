const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const dbName = process.env.DB;

async function middleware() {
  await client.connect();

  const db = client.db(dbName);

  return (req, _, next) => {
    req.db = db;
    next();
  };
}

const db = client.db(dbName);

module.exports = { middleware, db, client };
