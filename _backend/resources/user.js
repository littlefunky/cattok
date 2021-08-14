const bcypt = require("bcrypt");
const IsEmail = require("isemail");
const jwt = require("jwt");

function signUserJwt(user_id, callback) {
  jwt.sign(
    {
      user_id,
    },
    process.env.SECRET,
    callback
  );
}

module.exports = function (api) {
  api.post("/user", async (req, res, next) => {
    bcypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        res.status(500);
        return res.error(err);
      }

      const result = await req.db.collection("user").insertOne({
        name: req.body.name,
        email: req.body.email,
        password: hash,
      });

      signUserJwt(result.insertedId, (err, token) => {
        if (err) {
          res.status(500);
          return res.error(err);
        }
        res.success({
          jwt: token,
        });
      });
    });
  });

  function isMe(req, res, next) {
    const user_id = req.params.user_id;

    if (user_id === "me") {
      const token = req.header("Authorization").split(" ")[1];

      jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
          res.status(401);
          return res.fail("Unauthorized");
        }

        req.params.user_id = decoded.user_id;
        next();
      });
    }

    next();
  }

  //To be implement
  api.get("/user/:user_id", isMe, (req, res) => {
    const result = req.db
      .collection("user")
      .findOne({ _id: req.params.user_id });

    if (!result) {
      res.status(404);
      return res.fail("User couldn't be found");
    }

    res.success(result);
  });
  api.put("/user/:user_id", isMe, (req, res) => {
    const result = await req.db.collection("user").updateOne(
      {
        _id: req.params.user_id,
      },
      {
        name: req.body.name,
        email: req.body.email,
      }
    );

    if (result) {
      return res.success();
    }
  });
  api.get("/user/:user_id/post", isMe, (req, res, next) => {
    const result = await req.db.collection("post").findMany({
      user_id: req.params.user_id,
    });

    if (result) {
      return res.success(result);
    }
  });
  api.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    if (!IsEmail.validate(email)) {
      res.status(400);
      return res.fail({ email: "malformed" });
    }

    const result = await req.db.collection("user").findOne({
      email,
    });

    if (!result) {
      res.status(401);
      return res.fail({ email: "no email found" });
    }

    const hash = result.password;
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        res.status(401);
        return res.fail({ password: "password incorrect" });
      }

      signUserJwt(result._id, (err, token) => {
        if (err) {
          res.status(500);
          return res.error(err);
        }
        res.success({
          jwt: token,
        });
      });
    });
  });
};
