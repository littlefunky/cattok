const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function () {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URL = uri.slice(0, uri.lastIndexOf("/"));
};
