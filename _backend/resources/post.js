const { video, isAuth, assetsPath } = require("../utils");
const { ObjectId } = require("mongodb");
const { MulterError } = require("multer");
const { body, query, param, validationResult } = require("express-validator");

function uploadHandler(req, res, next) {
  video.single("video")(req, res, (err) => {
    if (err) {
      if (
        err instanceof MulterError ||
        err.message ===
          "Accepted video only, these format are supported mp4, webp"
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

module.exports = function (api) {
  api.post(
    "/post",
    isAuth,
    uploadHandler,
    body("title").notEmpty(),
    body("description").notEmpty(),
    async (req, res) => {
      let errors = [];

      if (!req.file)
        errors = [{ location: "file", msg: "video required", param: "video" }];

      const validate = validationResult(req);
      if (!validate.isEmpty()) errors = [...errors, ...validate.array()];

      if (errors.length > 0) return res.status(400).fail(errors);

      const result = await req.db.collection("post").insertOne({
        title: req.body.title,
        description: req.body.description,
        user: ObjectId(req.user.id),
        video: req.file.filename,
        date: new Date(),
        comment: [],
        heart: 0,
      });

      res.status(201).success({ post_id: result.insertedId });
    }
  );

  api.get(
    "/post",
    query("cursor").isMongoId().optional(),
    query("limit").isFloat().optional(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const result = await req.db
        .collection("post")
        .find(
          req.query.cursor
            ? {
                _id: {
                  $gte: ObjectId(req.query.cursor),
                },
              }
            : {}
        )
        .project({ comment: 0 })
        .limit(parseInt(req.query.limit) || 0)
        .toArray();

      const posts = result.map((post) => ({
        id: post._id,
        user_id: post.user,
        title: post.title,
        description: post.description,
        video_url: assetsPath(post.video),
        public_date: post.date,
        heart: post.heart,
      }));

      res.success(posts);
    }
  );

  api.get("/post/:post_id", param("post_id").isMongoId(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).fail(errors.array());

    const result = await req.db
      .collection("post")
      .findOne(ObjectId(req.params.post_id));
    if (!result) return res.status(404).fail("Post not found");

    const post = {
      id: result._id,
      user_id: result.user,
      title: result.title,
      description: result.description,
      video_url: assetsPath(result.video),
      public_date: result.date,
      heart: result.heart,
    };

    res.success(post);
  });

  api.put(
    "/post/:post_id",
    isAuth,
    uploadHandler,
    param("post_id").isMongoId(),
    body("title").notEmpty().optional(),
    body("description").notEmpty().optional(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const postId = ObjectId(req.params.post_id);

      const post = await req.db.collection("post").findOne(postId);

      if (!post) return res.status(404).fail("Post not found");
      if (post.user.toString() !== req.user.id)
        return res.status(403).fail("No permission");

      const newPost = {};
      if (req.body.title) newPost.title = req.body.title;
      if (req.body.description) newPost.description = req.body.description;
      if (req.file) newPost.video = req.file.filename;

      await req.db.collection("post").updateOne(
        {
          _id: postId,
        },
        {
          $set: newPost,
        }
      );

      res.success();
    }
  );

  api.delete(
    "/post/:post_id",
    isAuth,
    param("post_id").isMongoId(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const post = await req.db
        .collection("post")
        .findOne(ObjectId(req.params.post_id));
      if (!post) return res.status(404).fail("Post not found");
      if (post.user.toString() !== req.user.id)
        return res.status(403).fail("No permission");

      await req.db
        .collection("post")
        .deleteOne({ _id: ObjectId(req.params.post_id) });

      res.success();
    }
  );

  api.post(
    "/post/:post_id/heart",
    isAuth,
    param("post_id").isMongoId(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const post = await req.db
        .collection("post")
        .findOne(ObjectId(req.params.post_id));
      if (!post) return res.status(404).fail("Post not found");

      await req.db.collection("post").updateOne(
        {
          _id: ObjectId(req.params.post_id),
        },
        {
          $inc: {
            heart: 1,
          },
        }
      );

      res.success();
    }
  );

  api.get(
    "/post/:post_id/comment",
    param("post_id").isMongoId(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const post = await req.db
        .collection("post")
        .findOne(ObjectId(req.params.post_id), { projection: { comment: 1 } });
      if (!post) return res.status(404).fail("Post not found");

      const comments = post.comment.map((comment) => ({
        id: comment._id,
        user_id: comment.user,
        comment: comment.comment,
        comment_date: comment.date,
      }));

      res.success(comments);
    }
  );

  api.post(
    "/post/:post_id/comment",
    isAuth,
    param("post_id").isMongoId(),
    body("comment").notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const post = await req.db
        .collection("post")
        .findOne(ObjectId(req.params.post_id));
      if (!post) return res.status(404).fail("Post not found");

      const newComment = {
        _id: ObjectId(),
        user: ObjectId(req.user.id),
        comment: req.body.comment,
        date: new Date(),
      };

      const result = await req.db.collection("post").findOneAndUpdate(
        { _id: ObjectId(req.params.post_id) },
        {
          $push: {
            comment: {
              $each: [newComment],
              $sort: { _id: -1 },
            },
          },
        },
        {
          projection: {
            _id: 1,
            comment: {
              $slice: 1,
            },
          },
          returnDocument: "after",
        }
      );

      res
        .status(201)
        .success({ comment_id: result.value.comment[0]._id.toString() });
    }
  );

  api.get(
    "/post/:post_id/comment/:comment_id",
    param("post_id").isMongoId(),
    param("comment_id").isMongoId(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const result = await req.db.collection("post").findOne(
        {
          _id: ObjectId(req.params.post_id),
        },
        {
          projection: {
            _id: 1,
            comment: {
              $elemMatch: {
                _id: ObjectId(req.params.comment_id),
              },
            },
          },
        }
      );

      if (!result) return res.status(404).fail("Post not found");
      if (result.comment?.length !== 1)
        return res.status(404).fail("Comment not found");

      const comment = {
        id: result.comment[0]._id.toString(),
        user_id: result.comment[0].user.toString(),
        comment: result.comment[0].comment,
        comment_date: result.comment[0].date,
      };

      res.success(comment);
    }
  );

  api.put(
    "/post/:post_id/comment/:comment_id",
    isAuth,
    param("post_id").isMongoId(),
    param("comment_id").isMongoId(),
    body("comment").notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const result = await req.db.collection("post").findOne(
        {
          _id: ObjectId(req.params.post_id),
        },
        {
          projection: {
            _id: 1,
            comment: {
              $elemMatch: {
                _id: ObjectId(req.params.comment_id),
              },
            },
          },
        }
      );

      if (!result) return res.status(404).fail("Post not found");
      if (result.comment?.length !== 1)
        return res.status(404).fail("Comment not found");
      if (result.comment[0].user.toString() !== req.user.id)
        return res.status(403).fail("No permission");

      await req.db.collection("post").updateOne(
        {
          "comment._id": ObjectId(req.params.comment_id),
        },
        {
          $set: {
            "comment.$.comment": req.body.comment,
          },
        }
      );

      res.success();
    }
  );

  api.delete(
    "/post/:post_id/comment/:comment_id",
    isAuth,
    param("post_id").isMongoId(),
    param("comment_id").isMongoId(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).fail(errors.array());

      const result = await req.db.collection("post").findOne(
        {
          _id: ObjectId(req.params.post_id),
        },
        {
          projection: {
            _id: 1,
            comment: {
              $elemMatch: {
                _id: ObjectId(req.params.comment_id),
              },
            },
          },
        }
      );

      if (!result) return res.status(404).fail("Post not found");
      if (result.comment?.length !== 1)
        return res.status(404).fail("Comment not found");
      if (result.comment[0].user.toString() !== req.user.id)
        return res.status(403).fail("No permission");

      await req.db.collection("post").updateOne(
        {
          _id: ObjectId(req.params.post_id),
        },
        {
          $pull: {
            comment: {
              _id: ObjectId(req.params.comment_id),
            },
          },
        }
      );

      res.success();
    }
  );
};
