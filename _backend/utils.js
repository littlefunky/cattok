const jwt = require("jsonwebtoken");
const path = require("path");

function assetsPath(file) {
  return path.join("/assets", file);
}

function auth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) return next();

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer")
    return res.status(400).fail("Unsupported authentication type");
  if (!token) return res.status(400).fail("Token is not provided");

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(400).fail(err);

    const user = {
      id: decoded?.user_id,
    };

    req.user = user;
    next();
  });
}

function isAuth(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).fail("Unauthorized");
}

const multer = require("multer");
const { v4: uuid } = require("uuid");

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DEST,
  filename(req, file, cb) {
    cb(null, uuid() + "_" + file.originalname);
  },
});

const upload = multer({
  storage,
});

const video = multer({
  storage,
  fileFilter: function (_, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4" && ext !== ".webp") {
      return callback(
        new Error("Accepted video only, these format are supported mp4, webp")
      );
    }
    callback(null, true);
  },
});

const photo = multer({
  storage,
  fileFilter: function (_, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(
        new Error(
          "Accepted image only, these format are supported png, jpg, jpeg"
        )
      );
    }
    callback(null, true);
  },
});

function error(err, req, res, next) {
  if (err) {
    const code = req.status || 500;
    res.status(code);
    res.error(err?.message || "Unexpected error");
  } else {
    next();
  }
}

function responser(req, res, next) {
  const success = (data) => {
    res.json({
      status: "success",
      data: data || null,
    });
  };

  const fail = (data) => {
    res.json({
      status: "fail",
      data: data || null,
    });
  };

  const error = (message) => {
    res.json({
      status: "error",
      message: message,
    });
  };

  res.success = success;
  res.fail = fail;
  res.error = error;

  next();
}

module.exports = {
  responser,
  upload,
  video,
  photo,
  error,
  auth,
  isAuth,
  assetsPath,
};
