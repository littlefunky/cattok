const MongoClient = require("mongodb").MongoClient;

// TODO
const url = process.env.MONGO_URL;
const client = new MongoClient(url);

module.exports = { client };
