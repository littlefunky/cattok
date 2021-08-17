const { upload } = require("../utils");
const { ObjectId } = require("mongodb");

function isAuth(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).fail("Unauthorized");
  }
}

function required(fields) {
  const keys = Object.keys(fields);

  return keys
    .filter((key) => !fields[key])
    .map((field) => ({ [field]: "required" }));
}

module.exports = function (api) {
  api.post("/post", isAuth, upload.single("photo"), async (req, res) => {
    const missing = required({
      title: req.body.title,
      description: req.body.description,
      video: req.file,
    });

    if (missing.length > 0) return res.status(400).fail(missing);

    const result = await req.db.collection("post").insertOne({
      title: req.body.title,
      description: req.body.description,
      user: ObjectId(req.user.id),
      video: req.file.filename,
    });

    res.status(201).success({ post_id: result.insertedId });
  });
};
