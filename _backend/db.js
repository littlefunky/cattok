const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const dbName = process.env.DB;

async function middleware() {
  console.log("Connecting to Mongo server");
  await client.connect();

  const db = client.db(dbName);

  return (req, _, next) => {
    req.db = db;
    next();
  };
}

module.exports = { middleware };
