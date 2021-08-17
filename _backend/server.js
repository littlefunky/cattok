require("dotenv").config();

const createApp = require("./app");
const { client } = require("./db");

async function server() {
  await client.connect();
  const db = client.db(process.env.DB);

  const app = await createApp(db);

  app.listen(process.env.PORT, () => {
    console.log("Listening on 3000");
  });
}

server();
