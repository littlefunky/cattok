require("dotenv").config();

const path = require("path");

const prefix = require("supertest-prefix").default("/v1");
const request = require("supertest");

const { client } = require("../db.js");
const createApp = require("../app");

const { User } = require("../examples/examples");

const jestOpenAPI = require("jest-openapi");
jestOpenAPI(path.resolve(__dirname, "../openapi.yaml"));

let jwt;
let user_id;
let app;

beforeAll(async () => {
  const db = client.db(process.env.DB);
  app = await createApp(db);
});

describe("POST /v1/user", () => {
  test("create user with correct data", async () => {
    const res = await request(app)
      .post("/user")
      .use(prefix)
      .field("name", User[0].name)
      .field("email", User[0].email)
      .field("password", User[0].password)
      .attach("photo", User[0].photo);

    expect(res.status).toEqual(201);
    expect(res).toSatisfyApiSpec();

    jwt = res.body.data.jwt;
  });

  test("email already in use", async () => {
    const res = await request(app)
      .post("/user")
      .use(prefix)
      .field("name", User[0].name)
      .field("email", User[0].email)
      .field("password", User[0].password)
      .attach("photo", User[0].photo);

    expect(res.status).toEqual(409);
    expect(res).toSatisfyApiSpec();
  });

  test("malformed email", async () => {
    const res = await request(app)
      .post("/user")
      .use(prefix)
      .field("name", User[0].name)
      .field("email", "malformed.com")
      .field("password", User[0].password)
      .attach("photo", User[0].photo);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("missing required form data", async () => {
    const res = await request(app)
      .post("/user")
      .use(prefix)
      .field("name", User[0].name)
      .field("email", "malformed.com");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /v1/user/:user_id", () => {
  test("use 'me' alias to get authenticated user", async () => {
    const res = await request(app)
      .get("/user/me")
      .use(prefix)
      .set("Authorization", "Bearer " + jwt);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    expect(res.body.data.name).toEqual(User[0].name);
    expect(res.body.data.email).toEqual(User[0].email);

    user_id = res.body.data.id;
  });

  test("use 'me' alias but not authenticated", async () => {
    const res = await request(app).get("/user/me").use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("get user from ID", async () => {
    const res = await request(app)
      .get("/user/" + user_id)
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    expect(res.body.data.name).toEqual(User[0].name);
    expect(res.body.data.email).toEqual(User[0].email);
  });
});
describe("PUT /v1/user/:user_id", () => {
  test("update user", async () => {
    const res = await request(app)
      .put("/user/" + user_id)
      .use(prefix)
      .field("name", "Little Boy")
      .attach("photo", User[1].photo)
      .set("Authorization", "Bearer " + jwt);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("malformed email", async () => {
    const res = await request(app)
      .put("/user/" + user_id)
      .use(prefix)
      .field("email", "malformed.com")
      .attach("photo", User[1].photo)
      .set("Authorization", "Bearer " + jwt);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("not authenticated", async () => {
    const res = await request(app)
      .put("/user/" + user_id)
      .use(prefix)
      .field("name", "Little Boy")
      .attach("photo", User[1].photo);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("no permission", async () => {
    const res = await request(app)
      .put("/user/" + user_id)
      .use(prefix)
      .field("name", "Little Boy")
      .attach("photo", User[1].photo)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjExYTQ4YTU3ZWY4YjUyMTdjNjBiYWI2IiwiaWF0IjoxNjI5MTEyMDA5fQ.9zCCCi71XfCFJcr5_KqK_rSiBRaEvbVaYlJveKLmYOI"
      );

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });
});
describe("GET /v1/user/:user_id/post", () => {
  test("get post associated with user", async () => {
    const res = await request(app)
      .get("/user/" + user_id + "/post")
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });
});
describe("POST /v1/login", () => {
  test("correctly login", async () => {
    const res = await request(app)
      .post("/login")
      .use(prefix)
      .send({ email: User[0].email, password: User[0].password });

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });
  test("login with unregistered email", async () => {
    const res = await request(app)
      .post("/login")
      .use(prefix)
      .send({ email: User[1].email, password: User[0].password });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });
  test("login with incorrect password", async () => {
    const res = await request(app)
      .post("/login")
      .use(prefix)
      .send({ email: User[0].email, password: User[0].password + "s" });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });
  test("malformed email", async () => {
    const res = await request(app)
      .post("/login")
      .use(prefix)
      .send({ email: "malformed.com", password: User[0].password });

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
  test("missing required credentials", async () => {
    const res = await request(app)
      .post("/login")
      .use(prefix)
      .send({ email: User[0].email });

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});
