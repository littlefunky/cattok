require("dotenv").config();

const path = require("path");
const { client } = require("../db.js");
const createApp = require("../app");

const prefix = require("supertest-prefix").default("/v1");
const request = require("supertest");

const { Post } = require("../examples/examples");

const jestOpenAPI = require("jest-openapi");
jestOpenAPI(path.resolve(__dirname, "../openapi.yaml"));

const TOKEN_EXAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVhIiwiaWF0IjoxNTE2MjM5MDIyfQ.a89mkcMO9bKhfMBRuVUgBotMMRFgkqUuZjiJoJBu8eA";

let app;
let createdPost;
let createdComment;

beforeAll(async () => {
  await client.connect();
  const db = client.db(process.env.DB);

  db.dropDatabase();

  app = await createApp(db);
});

afterAll(async () => await client.close());

describe("POST /post", () => {
  test("Create post", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", Post[0].title)
      .field("description", Post[0].description)
      .attach("video", Post[0].video)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(201);
    expect(res).toSatisfyApiSpec();
  });

  test("Missing required fields", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .attach("video", Post[0].video);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Empty required fields", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", "")
      .field("description", Post[0].description)
      .attach("video", Post[0].video)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Upload anything that is not video", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", Post[0].title)
      .field("description", Post[0].description)
      .attach("video", "./examples/photo.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthenticated", async () => {
    const res = await request(app)
      .post("/post")
      .use(prefix)
      .field("title", Post[0].title)
      .field("description", Post[0].description)
      .attach("video", Post[0].video);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /post", () => {
  test("Retrieve list of video", async () => {
    const res = await request(app).get("/post").use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    createdPost = res.body.data;
  });

  test("Limit result", async () => {
    const res = await request(app).get("/post").use(prefix).query("limit=3");

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    // expect(res.body.data.length).toEqual(3);
  });

  test("Set cursor", async () => {
    const res = await request(app)
      .get("/post")
      .use(prefix)
      .query("cursor=" + createdPost[0].id);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Set cursor and limit", async () => {
    const res = await request(app)
      .get("/post")
      .use(prefix)
      .query("limit=3&cursor=" + createdPost[0].id);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();

    // expect(res.body.data.length).toEqual(3);
  });

  test("Limit is not number", async () => {
    const res = await request(app).get("/post").use(prefix).query("limit=a");

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /post/:post_id", () => {
  test("Get post from ID", async () => {
    const res = await request(app)
      .get("/post/" + createdPost[0].id)
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .get("/post/" + createdPost[0].id.slice(0, -1) + "a")
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe("PUT /post/:post_id", () => {
  test("Update post", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id)
      .use(prefix)
      .field("title", Post[3].title)
      .field("description", Post[3].description)
      .attach("video", Post[3].video)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id.slice(0, -1) + "a")
      .use(prefix)
      .field("title", Post[3].title)
      .field("description", Post[3].description)
      .attach("video", Post[3].video)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id)
      .use(prefix)
      .field("title", Post[3].title)
      .field("description", Post[3].description)
      .attach("video", Post[3].video);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id)
      .use(prefix)
      .field("title", Post[3].title)
      .field("description", Post[3].description)
      .attach("video", Post[3].video)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVmIiwiaWF0IjoxNTE2MjM5MDIyfQ.Wi8rUWmIXKYZ2nyZwIhEwKfT8pNiyabaIZG2uWRFJbY"
      );

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Not video", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id)
      .use(prefix)
      .field("title", Post[3].title)
      .field("description", Post[3].description)
      .attach("video", "./examples/photo2.jpg")
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });
});

describe("POST /post/:post_id/heart", () => {
  test("Give heart to post", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id + "/heart")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id + "/heart")
      .use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id.slice(0, -1) + "a" + "/heart")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe("POST /post/:post_id/comment", () => {
  test("Create new comment", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id + "/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(201);
    expect(res).toSatisfyApiSpec();

    createdComment = res.body.data.comment_id;
  });

  test("Missing required fields", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id + "/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(400);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id + "/comment")
      .use(prefix)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .post("/post/" + createdPost[0].id.slice(0, -1) + "a" + "/comment")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE)
      .send({ comment: "COMMENT" });

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

//Comment
describe("GET /post/:post_id/comment", () => {
  test("Get list of comments from ID", async () => {
    const res = await request(app)
      .get("/post/" + createdPost[0].id + "/comment")
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .get("/post/" + createdPost[0].id.slice(0, -1) + "a" + "/comment")
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe("GET /post/:post_id/comment/:comment_id", () => {
  test("Get comment from ID", async () => {
    const res = await request(app)
      .get("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .get(
        "/post/" +
          createdPost[0].id.slice(0, -1) +
          "a" +
          "/comment/" +
          createdComment
      )
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .get(
        "/post/" +
          createdPost[0].id +
          "/comment/" +
          createdComment.slice(0, -1) +
          "a"
      )
      .use(prefix);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe("PUT /post/:post_id/comment/:comment_id", () => {
  test("Update comment", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix)
      .send({ comment: "NEW COMMENT" });

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .put("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVmIiwiaWF0IjoxNTE2MjM5MDIyfQ.Wi8rUWmIXKYZ2nyZwIhEwKfT8pNiyabaIZG2uWRFJbY"
      );

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .put(
        "/post/" +
          createdPost[0].id.slice(0, -1) +
          "a" +
          "/comment/" +
          createdComment
      )
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .put(
        "/post/" +
          createdPost[0].id +
          "/comment/" +
          createdComment.slice(0, -1) +
          "a"
      )
      .use(prefix)
      .send({ comment: "NEW COMMENT" })
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });
});

describe("DELETE /post/:post_id/comment/:comment_id", () => {
  test("Unauthorized", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVmIiwiaWF0IjoxNTE2MjM5MDIyfQ.Wi8rUWmIXKYZ2nyZwIhEwKfT8pNiyabaIZG2uWRFJbY"
      );

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Post not found", async () => {
    const res = await request(app)
      .delete(
        "/post/" +
          createdPost[0].id.slice(0, -1) +
          "a" +
          "/comment/" +
          createdComment
      )
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Comment not found", async () => {
    const res = await request(app)
      .delete(
        "/post/" +
          createdPost[0].id +
          "/comment/" +
          createdComment.slice(0, -1) +
          "a"
      )
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Delete comment", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id + "/comment/" + createdComment)
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });
});

describe("DELETE /post/:post_id", () => {
  test("Post not found", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id.slice(0, -1) + "a")
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(404);
    expect(res).toSatisfyApiSpec();
  });

  test("Unauthorized", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id)
      .use(prefix);

    expect(res.status).toEqual(401);
    expect(res).toSatisfyApiSpec();
  });

  test("No permission", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id)
      .use(prefix)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVmIiwiaWF0IjoxNTE2MjM5MDIyfQ.Wi8rUWmIXKYZ2nyZwIhEwKfT8pNiyabaIZG2uWRFJbY"
      );

    expect(res.status).toEqual(403);
    expect(res).toSatisfyApiSpec();
  });

  test("Delete post", async () => {
    const res = await request(app)
      .delete("/post/" + createdPost[0].id)
      .use(prefix)
      .set("Authorization", "Bearer " + TOKEN_EXAMPLE);

    expect(res.status).toEqual(200);
    expect(res).toSatisfyApiSpec();
  });
});
