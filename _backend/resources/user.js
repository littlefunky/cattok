const bcrypt = require("bcrypt");
const IsEmail = require("isemail");
const jwt = require("jsonwebtoken");
const { upload } = require("../utils");
const { ObjectId } = require("mongodb");

function signUserJwt(user_id) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        user_id,
      },
      process.env.SECRET,
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}

async function isMe(req, res, next) {
  const user_id = req.params.user_id;

  if (user_id === "me") {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).fail("Missing Authorization header");

    try {
      const decoded = await verifyUserJwt(token);
      req.params.user_id = ObjectId(decoded.user_id);
      next();
    } catch (e) {
      return res.status(401).fail(e);
    }
  } else {
    try {
      req.params.user_id = ObjectId(req.params.user_id);
      next();
    } catch (e) {
      res.status(400).fail("Invalid user ID");
    }
  }
}

function verifyUserJwt(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) return reject("Unauthorized");
      resolve(decoded);
    });
  });
}

async function isAuth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) return res.status(401).fail("Unauthorized");

  try {
    const decoded = await verifyUserJwt(token);
    req.user_id = ObjectId(decoded.user_id);
    next();
  } catch (e) {
    res.status(401).fail("Unauthorized");
  }
}

module.exports = function (api) {
  api.post("/user", upload.single("photo"), async (req, res, next) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password || !req.file) {
      return res.status(400).fail("missing required data");
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        res.status(500);
        return res.error(err);
      }

      try {
        if (!IsEmail.validate(email))
          return res.status(400).fail({ email: "malformed" });
      } catch (e) {
        return next(e);
      }

      const user = await req.db.collection("user").findOne({ email });

      if (user) return res.status(409).fail({ email: "email already in use" });

      const result = await req.db.collection("user").insertOne({
        name: name,
        email: email,
        password: hash,
        photo: req.file.filename,
      });

      const token = await signUserJwt(result.insertedId);

      res.status(201).success({
        jwt: token,
      });
    });
  });

  api.get("/user/:user_id", isMe, async (req, res) => {
    const _id = req.params.user_id;

    const result = await req.db.collection("user").findOne(_id);

    if (!result) return res.status(404).fail("User couldn't be found");

    res.success({
      id: result._id,
      name: result.name,
      email: result.email,
      photo: result.photo,
    });
  });

  api.put(
    "/user/:user_id",
    isAuth,
    isMe,
    upload.single("photo"),
    async (req, res) => {
      if (req.user_id.toHexString() !== req.params.user_id.toHexString())
        return res.status(403).fail("No permission");

      const newUser = {};

      if (req.body.name) newUser.name = req.body.name;
      if (req.body.email) {
        if (!IsEmail.validate(req.body.email))
          return res.status(400).fail({ email: "malformed email" });

        newUser.email = req.body.email;
      }
      if (req.file) newUser.photo = req.file.filename;

      const result = await req.db.collection("user").updateOne(
        {
          _id: req.params.user_id,
        },
        {
          $set: newUser,
        }
      );

      if (result.modifiedCount === 1) return res.success();

      res.status(500).error("couldn't update user");
    }
  );

  api.get("/user/:user_id/post", isMe, async (req, res, next) => {
    const result = await req.db
      .collection("post")
      .find({
        user_id: req.params.user_id,
      })
      .toArray();

    if (!result) return res.status(404).fail("no post of user could be found");

    res.success(result);
  });

  api.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).fail("missing credentials");
    }

    try {
      if (!IsEmail.validate(email))
        return res.status(400).fail({ email: "malformed" });
    } catch (e) {
      return next(e);
    }

    const result = await req.db.collection("user").findOne({
      email,
    });

    if (!result) return res.status(401).fail({ email: "no email found" });

    const hash = result.password;
    bcrypt.compare(password, hash, async (err, result) => {
      if (err) return res.status(500).error(err);

      if (!result)
        return res.status(401).fail({ password: "password incorrect" });

      const token = await signUserJwt(result._id);
      res.success({
        jwt: token,
      });
    });
  });
};
