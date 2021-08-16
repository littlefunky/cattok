//JSend specification

const multer = require("multer");
const { v4: uuid } = require("uuid");

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DEST,
  filename(req, file, cb) {
    cb(null, uuid() + "_" + file.originalname)
  }
})

const upload = multer({
  storage
});

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

module.exports = { responser, upload };
