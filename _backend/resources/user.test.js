require("dotenv").config();

const axios = require("axios").default;
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const { client } = require("../db");

const jestOpenAPI = require("jest-openapi");
jestOpenAPI(path.resolve(__dirname, "../openapi.yaml"));

let jwt;
let user_id;

const NAME = "Thanawat Yodnil";
const EMAIL = "thanawat@example.com";
const PHOTO = () => fs.createReadStream("./examples/photo.jpg");
const PHOTO2 = () => fs.createReadStream("./examples/photo2.jpg");
const PASSWORD = "example";

describe("User", () => {
  describe("POST /v1/user", () => {
    test("create user with correct data", async () => {
      const form = new FormData();
      form.append("name", NAME);
      form.append("email", EMAIL);
      form.append("password", PASSWORD);
      form.append("photo", PHOTO());

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
      });

      expect(res.status).toEqual(201);
      expect(res).toSatisfyApiSpec();

      jwt = res.data.data.jwt;
    });

    test("email already in use", async () => {
      const form = new FormData();
      form.append("name", NAME);
      form.append("email", EMAIL);
      form.append("password", PASSWORD);
      form.append("photo", PHOTO());

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
        validateStatus: (status) => status === 409,
      });

      expect(res.status).toEqual(409);
      expect(res).toSatisfyApiSpec();
    });

    test("malformed email", async () => {
      const form = new FormData();
      form.append("name", NAME);
      //Malformed email
      form.append("email", "malformed.com");
      form.append("password", PASSWORD);
      form.append("photo", PHOTO());

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
        validateStatus: (status) => status === 400,
      });

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });

    test("missing required form data", async () => {
      const form = new FormData();
      form.append("name", NAME);
      form.append("email", EMAIL);

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
        validateStatus: (status) => status === 400,
      });

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe("GET /v1/user/:user_id", () => {
    test("use 'me' alias to get authenticated user", async () => {
      const res = await axios.get("http://localhost:3000/v1/user/me", {
        headers: {
          Authorization: "Bearer " + jwt,
        },
      });

      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();

      expect(res.data.data.name).toEqual(NAME);
      expect(res.data.data.email).toEqual(EMAIL);

      user_id = res.data.data.id;
    });

    test("use 'me' alias but not authenticated", async () => {
      const res = await axios.get("http://localhost:3000/v1/user/me", {
        validateStatus: (status) => status === 401,
      });

      expect(res.status).toEqual(401);
      expect(res).toSatisfyApiSpec();
    });

    test("get user from ID", async () => {
      const res = await axios.get("http://localhost:3000/v1/user/" + user_id);

      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();

      expect(res.data.data.name).toEqual(NAME);
      expect(res.data.data.email).toEqual(EMAIL);
    });
  });
  describe("PUT /v1/user/:user_id", () => {
    test("update user", async () => {
      const form = new FormData();
      form.append("name", "Little Boy");
      form.append("photo", PHOTO2());

      const res = await axios.put(
        "http://localhost:3000/v1/user/" + user_id,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: "Bearer " + jwt,
          },
        }
      );

      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });

    test("malformed email", async () => {
      const form = new FormData();
      form.append("email", "maleformed.com");

      const res = await axios.put(
        "http://localhost:3000/v1/user/" + user_id,
        form,
        {
          validateStatus: (status) => status === 400,
          headers: {
            ...form.getHeaders(),
            Authorization: "Bearer " + jwt,
          },
        }
      );

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });

    test("not authenticated", async () => {
      const form = new FormData();
      form.append("name", "Little Boy");
      form.append("email", "littleboy@example.com");
      form.append("photo", PHOTO2());

      const res = await axios.put(
        "http://localhost:3000/v1/user/" + user_id,
        form,
        {
          headers: form.getHeaders(),
          validateStatus: (status) => status === 401,
        }
      );

      expect(res.status).toEqual(401);
      expect(res).toSatisfyApiSpec();
    });

    test("no permission", async () => {
      const form = new FormData();
      form.append("name", "Little Guy");
      form.append("email", "anotherguy@example.com");
      form.append("photo", PHOTO2());

      const res = await axios.put(
        "http://localhost:3000/v1/user/" + user_id,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization:
              "Bearer " +
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjExYTQ4YTU3ZWY4YjUyMTdjNjBiYWI2IiwiaWF0IjoxNjI5MTEyMDA5fQ.9zCCCi71XfCFJcr5_KqK_rSiBRaEvbVaYlJveKLmYOI",
          },
          validateStatus: (status) => status === 403,
        }
      );

      expect(res.status).toEqual(403);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe("GET /v1/user/:user_id/post", () => {
    test("get post associated with user", async () => {
      const res = await axios.get(
        "http://localhost:3000/v1/user/" + user_id + "/post"
      );

      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
  });
  describe("POST /v1/login", () => {
    test("correctly login", async () => {
      const res = await axios.post("http://localhost:3000/v1/login", {
        email: EMAIL,
        password: PASSWORD,
      });

      expect(res.status).toEqual(200);
      expect(res).toSatisfyApiSpec();
    });
    test("login with unregistered email", async () => {
      const res = await axios.post(
        "http://localhost:3000/v1/login",
        {
          email: "kongthap@example.com",
          password: PASSWORD,
        },
        {
          validateStatus: (status) => status === 401,
        }
      );

      expect(res.status).toEqual(401);
      expect(res).toSatisfyApiSpec();
    });
    test("login with incorrect password", async () => {
      const res = await axios.post(
        "http://localhost:3000/v1/login",
        {
          email: "thanawat@example.com",
          password: PASSWORD + "s",
        },
        {
          validateStatus: (status) => status === 401,
        }
      );

      expect(res.status).toEqual(401);
      expect(res).toSatisfyApiSpec();
    });
    test("malformed email", async () => {
      const res = await axios.post(
        "http://localhost:3000/v1/login",
        {
          email: "maleformed.com",
          password: PASSWORD,
        },
        {
          validateStatus: (status) => status === 400,
        }
      );

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });
    test("missing required credentials", async () => {
      const res = await axios.post(
        "http://localhost:3000/v1/login",
        {
          email: EMAIL,
        },
        {
          validateStatus: (status) => status === 400,
        }
      );

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });
  });
});
