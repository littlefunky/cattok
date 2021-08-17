const MongoClient = require("mongodb").MongoClient;

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

module.exports = { client };
