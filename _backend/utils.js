//JSend specification

function responser(req, res, next) {
  const success = (data) => {
    res.json({
      status: "success",
      data,
    });
  };

  const fail = (data) => {
    res.json({
      status: "fail",
      data,
    });
  };

  const error = (message) => {
    res.json({
      status: "error",
      message,
    });
  };

  res.success = success;
  res.fail = fail;
  res.error = error;

  next();
}

module.exports = { responser };
