//JSend specification
const jwt = require("jsonwebtoken");

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
      id: decoded?.id,
    };

    req.user = user;
    next();
  });
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

function error(err, req, res, next) {
  const code = req.status || 500;
  res.status(code).error(err?.message || "Unexpected error");
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

module.exports = { responser, upload, error, auth };
