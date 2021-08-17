require("dotenv").config();

const path = require("path");
const { client } = require("../db.js");
const createApp = require("../app");

const prefix = require("supertest-prefix").default("/v1");
const request = require("supertest");

const jestOpenAPI = require("jest-openapi");
jestOpenAPI(path.resolve(__dirname, "../openapi.yaml"));

const TOKEN_EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZXhhbXBsZSIsImlhdCI6MTUxNjIzOTAyMn0.jflcIsBBXXCzPfBDTI4b4YWJ-YiFhItF2TzTNrEOS20";

let app;

beforeAll(async () => {
  await client.connect();
  const db = client.db(process.env.DB);

  db.dropDatabase();

  app = await createApp(db);
});

afterAll(() => client.close());

describe("POST /post", () => {
  test("Create post", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .field("title", "TITLE")
      .field("description", "DESCRIPTION")
      .attach("video", "./examples/photo.jpg");

    expect(res.status).toEqual(201);
    expect(res).toSatisfyApiSpec();
  });

  test("Missing required fields", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .attach("video", "./examples/photo.jpg");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Empty required fields", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", "")
      .field("description", "DESCRIPTION")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .attach("video", "./examples/photo.jpg");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Upload anything that is not video", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .field("title", "TITLE")
      .field("description", "DESCRIPTION")
      .attach("video", "./examples/photo.jpg");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthenticated", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", "TITLE")
      .field("description", "DESCRIPTION")
      .attach("video", "./examples/photo.jpg");

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("GET /post", () => {
  test("Retrieve list of video", async () => {
    const res = await request(app).get("/post").use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Limit result", async () => {
    const res = await request(app).get("/post").use(prefix).query("limit=3");

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    expect(res.body.data.length === 3);
  });

  test("Set cursor", async () => {
    const res = await request(app).get("/post").use(prefix).query("cursor=");

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Set cursor and limit", async () => {
    const res = await request(app)
      .get("/post")
      .use(prefix)
      .query("limit=3&cursor=");

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    expect(res.body.data.length === 3);
  });

  test("Limit is not number", async () => {
    const res = await request(app).get("/post").use(prefix).query("limit=a");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("GET /post/:post_id", () => {
  test("Get post from ID", async () => {
    const res = await request(app).get("/post/:post_id").use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app).get("/post/:post_id").use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("PUT /post/:post_id", () => {
  test("Update post", async () => {
    const res = await request(app)
      .put("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .put("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .put("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg");

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .put("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Not video", async () => {
    const res = await request(app)
      .put("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});
describe.skip("DELETE /post/:post_id", () => {
  test("Delete post", async () => {
    const res = await request(app)
      .delete("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .delete("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .delete("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg");

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .delete("/post/:post_id")
      .use(prefix)
      .field("title", "NEW TITLE")
      .field("description", "NEW DESCRIPTION")
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("POST /post/:post_id/heart", () => {
  test("Give heart to post", async () => {
    const res = await request(app)
      .post("/post/:post_id/heart")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app).post("/post/:post_id/heart").use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .post("/post/:post_id/heart")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

//Comment
describe.skip("GET /post/:post_id/comment", () => {
  test("Get list of comments from ID", async () => {
    const res = await request(app).get("/post/:post_id/comment").use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app).get("/post/:post_id/comment").use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("POST /post/:post_id/comment", () => {
  test("Create new comment", async () => {
    const res = await request(app)
      .post("/post/:post_id/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(201);
    expect(res).toSatisfyApiSpec();
  });

  test("Missing required fields", async () => {
    const res = await request(app)
      .post("/post/:post_id/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .post("/post/:post_id/comment")
      .use(prefix)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .post("/post/:post_id/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("GET /post/:post_id/comment/:comment_id", () => {
  test("Get comment from ID", async () => {
    const res = await request(app)
      .get("/post/:post_id/comment/:comment_id")
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .get("/post/:post_id/comment/:comment_id")
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .get("/post/:post_id/comment/:comment_id")
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("PUT /post/:post_id/comment/:comment_id", () => {
  test("Update comment", async () => {
    const res = await request(app)
      .put("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .put("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .send({ comment: "NEW COMMENT" });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .put("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .put("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .put("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe.skip("DELETE /post/:post_id/comment/:comment_id", () => {
  test("Delete comment", async () => {
    const res = await request(app)
      .delete("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .delete("/post/:post_id/comment/:comment_id")
      .use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .delete("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .delete("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .delete("/post/:post_id/comment/:comment_id")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});
