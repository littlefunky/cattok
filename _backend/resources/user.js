const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { photo, isAuth, assetsPath } = require("../utils");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");
const isMongoId = require("validator").default.isMongoId;
const { MulterError } = require("multer");

function uploadHandler(req, res, next) {
  photo.single("photo")(req, res, (err) => {
    if (err) {
      if (
        err instanceof MulterError ||
        err.message ===
          "Accepted image only, these format are supported png, jpg, jpeg"
      ) {
        res.status(400).fail(err.message);
      } else {
        next(err);
      }
    } else {
      next();
    }
  });
}

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
    if (!req.user) return res.status(401).fail("Unauthorized");

    req.params.user_id = ObjectId(req.user.id);
  } else {
    if (!isMongoId(req.params.user_id))
      return res.status(400).fail("Invalid ID");

    req.params.user_id = ObjectId(req.params.user_id);
  }
  next();
}

// DEPRECATED
// function verifyUserJwt(token) {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, process.env.SECRET, (err, decoded) => {
//       if (err) return reject("Unauthorized");
//       resolve(decoded);
//     });
//   });
// }

// async function _isAuth(req, res, next) {
//   const token = req.header("Authorization")?.split(" ")[1];

//   if (!token) return res.status(401).fail("Unauthorized");

//   try {
//     const decoded = await verifyUserJwt(token);
//     req.user_id = ObjectId(decoded.user_id);
//     next();
//   } catch (e) {
//     res.status(401).fail("Unauthorized");
//   }
// }

module.exports = function (api) {
  api.post(
    "/user",
    uploadHandler,
    body("email").isEmail(),
    body("name").notEmpty(),
    body("password").notEmpty(),
    async (req, res, next) => {
      if (!req.file)
        return res
          .status(400)
          .fail({ location: "file", msg: "required photo", param: "photo" });
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          res.status(500);
          return res.error(err);
        }

        const user = await req.db
          .collection("user")
          .findOne({ email: req.body.email });

        if (user)
          return res.status(409).fail({ email: "email already in use" });

        const result = await req.db.collection("user").insertOne({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          photo: req.file.filename,
        });

        const token = await signUserJwt(result.insertedId);

        res.status(201).success({
          jwt: token,
        });
      });
    }
  );

  api.get("/user/:user_id", isMe, async (req, res) => {
    const _id = req.params.user_id;

    const result = await req.db.collection("user").findOne(_id);

    if (!result) return res.status(404).fail("User couldn't be found");

    res.success({
      id: result._id,
      name: result.name,
      email: result.email,
      photo: assetsPath(result.photo),
    });
  });

  api.put(
    "/user/:user_id",
    isAuth,
    uploadHandler,
    body("email").isEmail().optional(),
    body("name").notEmpty().optional(),
    body("password").notEmpty().optional(),
    isMe,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      if (req.user.id !== req.params.user_id.toString())
        return res.status(403).fail("No permission");

      const newUser = {};

      if (req.body.name) newUser.name = req.body.name;
      if (req.body.email) newUser.email = req.body.email;
      if (req.body.password) newUser.password = req.body.password;
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
        user: req.params.user_id,
      })
      .toArray();

    if (!result) return res.status(404).fail("No post of user could be found");

    res.success(result);
  });

  api.post(
    "/login",
    body("email").isEmail(),
    body("password").notEmpty(),
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const { email, password } = req.body;

      const user = await req.db.collection("user").findOne({
        email,
      });

      if (!user) return res.status(401).fail({ email: "no email found" });

      const hash = user.password;
      bcrypt.compare(password, hash, async (err, result) => {
        if (err) return res.status(500).error(err);

        if (!result)
          return res.status(401).fail({ password: "password incorrect" });

        const token = await signUserJwt(user._id);
        res.success({
          jwt: token,
        });
      });
    }
  );
};
