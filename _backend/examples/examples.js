const fs = require("fs");

const User = [
  {
    name: "Thanawat Yodnil",
    email: "thanawat@example.com",
    password: "example",
    photo: "./examples/photo.jpg",
  },
  {
    name: "Kongthap Phuengsang",
    email: "kongthap@example.com",
    password: "example12345",
    photo: "./examples/photo2.jpg",
  },
];

const Post = [
  {
    title: "CAT 1",
    description: "DESCRIPTION",
    video: "./examples/video.mp4",
  },
  {
    title: "CAT 2",
    description: "DESCRIPTION",
    video: "./examples/video2.mp4",
  },
  {
    title: "CAT 3",
    description: "DESCRIPTION",
    video: "./examples/video3.mp4",
  },
  {
    title: "CAT 4",
    description: "DESCRIPTION",
    video: "./examples/video4.mp4",
  },
];

module.exports = { User, Post };
