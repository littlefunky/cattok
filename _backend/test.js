const axios = require("axios").default;
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const jestOpenAPI = require("jest-openapi");

jestOpenAPI(path.resolve(__dirname, "./openapi.yaml"));

let jwt;

describe("User resources", () => {
  describe("POST /v1/user", () => {
    it("should satisfy OpenAPI spec", async () => {
      const form = new FormData();
      form.append("name", "Thanawat Yodnil");
      form.append("email", "thanawat@example.com");
      form.append("password", "example");
      form.append("photo", fs.createReadStream("./.env"));

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
      });

      expect(res.status).toEqual(201);
      expect(res).toSatisfyApiSpec();

      jwt = res.data.data.jwt;
    });

    test("malformed email", async () => {
      const form = new FormData();
      form.append("name", "Thanawat Yodnil");
      //Malformed email
      form.append("email", "malformed.com");
      form.append("password", "example");
      form.append("photo", fs.createReadStream("./.env"));

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
        validateStatus: (status) => status === 400,
      });

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });

    test("missing required form data", async () => {
      const form = new FormData();
      form.append("name", "Thanawat Yodnil");
      form.append("email", "thanawat@example.com");

      const res = await axios.post("http://localhost:3000/v1/user", form, {
        headers: form.getHeaders(),
        validateStatus: (status) => status === 400,
      });

      expect(res.status).toEqual(400);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe.skip("GET /v1/user/:user_id", () => {});
  describe.skip("PUT /v1/user/:user_id", () => {});
  describe.skip("GET /v1/user/:user_id/post", () => {});
  describe.skip("POST /v1/login", () => {});
});
