module.exports = function (api) {
  api.post("/user", async (req, res) => {
    const result = await req.db.collection("user").insertOne({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    res.success({
      jwt: "asdsa",
    });
  });

  //To be implement
  api.get("/user/:user_id");
  api.put("/user/:user_id");
  api.get("/user/:user_id/post");
  api.post("/login");
};
