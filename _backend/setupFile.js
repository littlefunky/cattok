const { client } = require("./db");

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.close();
});
